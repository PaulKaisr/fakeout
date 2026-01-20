/**
 * R2 Service Layer
 *
 * Framework-agnostic business logic for interacting with Cloudflare R2
 * All methods are parameterized with config for testability
 */

import type {
  R2Config,
  R2GeneratedImageMetadata,
  R2Image,
  R2ImageMetadata,
  GameManifest,
} from "@/types/r2.types";

/**
 * R2 Service - Core layer for R2 bucket interaction
 */
export class R2Service {
  constructor(private config: R2Config) {}

  /**
   * Build full URL for an R2 object key
   *
   * @param key - R2 object key (e.g., "2025-12-10/pexel_images_raw/001")
   * @returns Full URL to the object
   */
  buildUrl(key: string): string {
    // Ensure baseUrl doesn't end with slash and key doesn't start with slash
    const baseUrl = this.config.baseUrl.replace(/\/$/, "");
    const cleanKey = key.replace(/^\//, "");
    return `${baseUrl}/${cleanKey}`;
  }

  /**
   * Fetch image metadata from R2
   *
   * @param key - R2 object key for metadata file
   * @returns Parsed JSON metadata
   * @throws Error if fetch fails or response is not ok
   */
  async fetchMetadata(
    key: string,
  ): Promise<R2ImageMetadata | R2GeneratedImageMetadata> {
    const url = this.buildUrl(key);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch metadata from ${key}: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Fetch the games manifest file listing available dates.
   * @param mediaType - Type of media manifest to fetch (default: "images")
   * @returns List of available dates (YYYY-MM-DD)
   */
  async fetchManifest(
    mediaType: "images" | "videos" = "images",
  ): Promise<GameManifest> {
    const manifestKey =
      mediaType === "videos"
        ? "games_manifest_videos.json"
        : "games_manifest_images.json";
    const url = this.buildUrl(manifestKey);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return { dates: [], updated_at: new Date().toISOString() };
      }
      const data = await response.json();
      // Ensure backwards compatibility if prompts are missing
      return {
        dates: data.dates || [],
        prompts: data.prompts || {},
        updated_at: data.updated_at || new Date().toISOString(),
      };
    } catch {
      return { dates: [], updated_at: new Date().toISOString() };
    }
  }

  /**
   * Construct R2 key patterns for a given date and type
   *
   * @param datePrefix - Date in YYYY-MM-DD format
   * @param type - Image type (pexels_raw or openai_generated)
   * @returns Object with image and metadata key patterns
   */
  buildImageKeys(
    datePrefix: string,
    type:
      | "pexels_raw"
      | "openai_generated"
      | "google_generated"
      | "pexels_video_raw"
      | "google_generated_video",
  ): {
    imageKeyPattern: string;
    metaKeyPattern: string;
  } {
    if (type === "pexels_raw") {
      return {
        imageKeyPattern: `${datePrefix}/pexel_images_raw/{number}`,
        metaKeyPattern: `${datePrefix}/pexel_images_raw/{number}_meta.json`,
      };
    } else if (type === "pexels_video_raw") {
      return {
        imageKeyPattern: `${datePrefix}/pexel_videos_raw/{number}`,
        metaKeyPattern: `${datePrefix}/pexel_videos_raw/{number}_meta.json`,
      };
    } else if (type === "google_generated") {
      return {
        imageKeyPattern: `${datePrefix}/google_generated_images/{id}`,
        metaKeyPattern: `${datePrefix}/google_generated_images/{id}_meta.json`,
      };
    } else if (type === "google_generated_video") {
      return {
        imageKeyPattern: `${datePrefix}/google_generated_videos/{id}`,
        metaKeyPattern: `${datePrefix}/google_generated_videos/{id}_meta.json`,
      };
    } else {
      return {
        imageKeyPattern: `${datePrefix}/openai_generated_images/{id}`,
        metaKeyPattern: `${datePrefix}/openai_generated_images/{id}_meta.json`,
      };
    }
  }

  /**
   * Get images for a specific date and type
   *
   * Note: Since public buckets don't expose S3 ListObjects API,
   * we use sequential fetching (001, 002, 003...) until we hit a 404
   *
   * @param datePrefix - Date in YYYY-MM-DD format
   * @param type - Image type to fetch
   * @param options - Query options
   * @returns Array of R2Image objects
   */
  async getImagesForDate(
    datePrefix: string,
    type:
      | "pexels_raw"
      | "openai_generated"
      | "google_generated"
      | "pexels_video_raw"
      | "google_generated_video",
    options: {
      start?: number;
      end?: number;
      includeMetadata?: boolean;
    } = {},
  ): Promise<R2Image[]> {
    const { start = 1, end = 50, includeMetadata = true } = options;
    const images: R2Image[] = [];
    const { imageKeyPattern, metaKeyPattern } = this.buildImageKeys(
      datePrefix,
      type,
    );

    // For pexels_raw and pexels_video_raw, try sequential numbers (001, 002, 003...)
    if (type === "pexels_raw" || type === "pexels_video_raw") {
      if (includeMetadata) {
        // Parallel fetch: Build all requests upfront and fetch in parallel
        const fetchPromises: Promise<{
          imageKey: string;
          metadata: R2ImageMetadata | null;
        }>[] = [];

        for (let i = start; i <= end; i++) {
          const number = String(i).padStart(3, "0");
          const imageKey = imageKeyPattern.replace("{number}", number);
          const metaKey = metaKeyPattern.replace("{number}", number);

          fetchPromises.push(
            this.fetchMetadata(metaKey)
              .then((metadata) => ({
                imageKey,
                metadata: metadata as R2ImageMetadata,
              }))
              .catch(() => ({ imageKey, metadata: null })),
          );
        }

        const results = await Promise.all(fetchPromises);

        // Filter out failed fetches and build image array
        for (const result of results) {
          if (result.metadata) {
            images.push({
              key: result.imageKey,
              url: this.buildUrl(result.imageKey),
              metadata: result.metadata,
              type,
            });
          }
        }
      } else {
        // Just build URLs without verifying
        for (let i = start; i <= end; i++) {
          const number = String(i).padStart(3, "0");
          const imageKey = imageKeyPattern.replace("{number}", number);
          images.push({
            key: imageKey,
            url: this.buildUrl(imageKey),
            type,
          });
        }
      }
    } else {
      // For openai_generated, we need to fetch pexels images first to get IDs
      // This is a limitation - we'll need to know the IDs beforehand
      // For now, we'll try to fetch metadata files if they exist
      // In practice, you'll want to load pexels images first to get the IDs
      console.warn(
        "Loading generated images requires knowing Pexels IDs. Load pexels_raw images first.",
      );
    }

    return images;
  }

  /**
   * Get generated images for a list of Pexels image IDs
   *
   * @param datePrefix - Date in YYYY-MM-DD format
   * @param pexelsIds - Array of Pexels image IDs
   * @param includeMetadata - Whether to fetch metadata
   * @returns Array of R2Image objects for generated images
   */
  async getGeneratedImagesForIds(
    datePrefix: string,
    pexelsIds: string[],
    includeMetadata = true,
    type: "google_generated" | "google_generated_video" = "google_generated",
  ): Promise<R2Image[]> {
    const images: R2Image[] = [];
    const { imageKeyPattern, metaKeyPattern } = this.buildImageKeys(
      datePrefix,
      type,
    );

    if (includeMetadata) {
      // Parallel fetch all metadata
      const fetchPromises = pexelsIds.map((id) => {
        const imageKey = imageKeyPattern.replace("{id}", id);
        const metaKey = metaKeyPattern.replace("{id}", id);

        return this.fetchMetadata(metaKey)
          .then((metadata) => ({
            imageKey,
            metadata: metadata as R2GeneratedImageMetadata,
          }))
          .catch(() => {
            console.debug(
              `Generated image not found for Pexels ID ${id} on ${datePrefix}`,
            );
            return { imageKey, metadata: null };
          });
      });

      const results = await Promise.all(fetchPromises);

      for (const result of results) {
        if (result.metadata) {
          images.push({
            key: result.imageKey,
            url: this.buildUrl(result.imageKey),
            metadata: result.metadata,
            type: type,
          });
        }
      }
    } else {
      // Just build URLs without fetching metadata
      for (const id of pexelsIds) {
        const imageKey = imageKeyPattern.replace("{id}", id);
        images.push({
          key: imageKey,
          url: this.buildUrl(imageKey),
          type: type,
        });
      }
    }

    return images;
  }

  /**
   * Load image blob data
   *
   * @param key - R2 object key
   * @returns Blob containing image data
   * @throws Error if fetch fails
   */
  async loadImageBlob(key: string): Promise<Blob> {
    const url = this.buildUrl(key);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to load image from ${key}: ${response.status} ${response.statusText}`,
      );
    }

    return response.blob();
  }

  /**
   * Prefetch image for browser caching
   *
   * Uses Image() constructor to trigger browser preload
   * Does not block or throw errors
   *
   * @param key - R2 object key
   */
  prefetchImage(key: string): void {
    const img = new Image();
    img.src = this.buildUrl(key);
    // Image loads in background, no need to handle completion
  }
  /**
   * Check if data exists for a given date by probing the first image's metadata
   *
   * @param datePrefix - Date in YYYY-MM-DD format
   * @returns True if data exists, false otherwise
   */
  async checkDataExistsForDate(datePrefix: string): Promise<boolean> {
    // Probe for images (default) - this might need update if we only have video games?
    // But usually we have images. If not, this check might fail for video-only dates.
    // Let's check for either.
    const { metaKeyPattern: imageMetaPattern } = this.buildImageKeys(
      datePrefix,
      "pexels_raw",
    );
    const { metaKeyPattern: videoMetaPattern } = this.buildImageKeys(
      datePrefix,
      "pexels_video_raw",
    );

    try {
      // Try image first
      const probeKey = imageMetaPattern.replace("{number}", "001");
      await this.fetchMetadata(probeKey);
      return true;
    } catch {
      // Try video
      try {
        const probeKey = videoMetaPattern.replace("{number}", "001");
        await this.fetchMetadata(probeKey);
        return true;
      } catch {
        return false;
      }
    }
  }
}

/**
 * Factory function for creating R2Service instances
 *
 * @param config - R2 configuration
 * @returns New R2Service instance
 */
export function createR2Service(config: R2Config): R2Service {
  return new R2Service(config);
}
