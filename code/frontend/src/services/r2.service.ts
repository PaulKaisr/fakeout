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
    key: string
  ): Promise<R2ImageMetadata | R2GeneratedImageMetadata> {
    const url = this.buildUrl(key);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch metadata from ${key}: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
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
    type: "pexels_raw" | "openai_generated"
  ): {
    imageKeyPattern: string;
    metaKeyPattern: string;
  } {
    return type === "pexels_raw"
      ? {
          imageKeyPattern: `${datePrefix}/pexel_images_raw/{number}`,
          metaKeyPattern: `${datePrefix}/pexel_images_raw/{number}_meta.json`,
        }
      : {
          imageKeyPattern: `${datePrefix}/openai_generated_images/{id}`,
          metaKeyPattern: `${datePrefix}/openai_generated_images/{id}_meta.json`,
        };
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
    type: "pexels_raw" | "openai_generated",
    options: {
      start?: number;
      end?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<R2Image[]> {
    const { start = 1, end = 50, includeMetadata = true } = options;
    const images: R2Image[] = [];
    const { imageKeyPattern, metaKeyPattern } = this.buildImageKeys(
      datePrefix,
      type
    );

    // For pexels_raw, try sequential numbers (001, 002, 003...)
    if (type === "pexels_raw") {
      for (let i = start; i <= end; i++) {
        const number = String(i).padStart(3, "0");
        const imageKey = imageKeyPattern.replace("{number}", number);
        const metaKey = metaKeyPattern.replace("{number}", number);

        try {
          if (includeMetadata) {
            // Fetch metadata first to check if image exists
            const metadata = await this.fetchMetadata(metaKey);
            images.push({
              key: imageKey,
              url: this.buildUrl(imageKey),
              metadata: metadata as R2ImageMetadata,
              type,
            });
          } else {
            // Just build URL without verifying
            images.push({
              key: imageKey,
              url: this.buildUrl(imageKey),
              type,
            });
          }
        } catch {
          // Stop at first missing image
          console.debug(`Image ${number} not found for ${datePrefix}/${type}`);
          break;
        }
      }
    } else {
      // For openai_generated, we need to fetch pexels images first to get IDs
      // This is a limitation - we'll need to know the IDs beforehand
      // For now, we'll try to fetch metadata files if they exist
      // In practice, you'll want to load pexels images first to get the IDs
      console.warn(
        "Loading openai_generated images requires knowing Pexels IDs. Load pexels_raw images first."
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
    includeMetadata = true
  ): Promise<R2Image[]> {
    const images: R2Image[] = [];
    const { imageKeyPattern, metaKeyPattern } = this.buildImageKeys(
      datePrefix,
      "openai_generated"
    );

    for (const id of pexelsIds) {
      const imageKey = imageKeyPattern.replace("{id}", id);
      const metaKey = metaKeyPattern.replace("{id}", id);

      try {
        if (includeMetadata) {
          const metadata = await this.fetchMetadata(metaKey);
          images.push({
            key: imageKey,
            url: this.buildUrl(imageKey),
            metadata: metadata as R2GeneratedImageMetadata,
            type: "openai_generated",
          });
        } else {
          images.push({
            key: imageKey,
            url: this.buildUrl(imageKey),
            type: "openai_generated",
          });
        }
      } catch {
        console.debug(
          `Generated image not found for Pexels ID ${id} on ${datePrefix}`
        );
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
        `Failed to load image from ${key}: ${response.status} ${response.statusText}`
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
