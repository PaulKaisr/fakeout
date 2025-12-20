/**
 * R2 Images Composable
 *
 * Vue composable for loading and managing R2 images with reactive state
 */

import { ref, computed, type Ref } from "vue";
import { createR2Service } from "@/services/r2.service";
import type { R2Config, R2Image, R2ImageQueryOptions } from "@/types/r2.types";
import { r2Config } from "@/config/r2.config";

/**
 * Composable for loading and managing R2 images
 *
 * Usage:
 * ```ts
 * const { images, loading, error, loadImages } = useR2Images()
 * await loadImages({ datePrefix: '2025-12-10', type: 'pexels_raw' })
 * ```
 *
 * @param config - Optional R2 configuration (defaults to environment config)
 * @returns Image loading interface with reactive state
 */
export function useR2Images(config: R2Config = r2Config) {
  const r2Service = createR2Service(config);

  const images: Ref<R2Image[]> = ref([]);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);

  /**
   * Load images for a given date and type
   *
   * @param options - Query options including datePrefix, type, limit, etc.
   */
  async function loadImages(options: R2ImageQueryOptions): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const {
        datePrefix,
        type = "both",
        limit = 50,
        includeMetadata = true,
      } = options;

      if (type === "both") {
        // Load pexels images first
        const pexelsImages = await r2Service.getImagesForDate(
          datePrefix,
          "pexels_raw",
          { end: limit, includeMetadata }
        );

        // Extract Pexels IDs from metadata
        const pexelsIds = pexelsImages
          .filter((img) => img.metadata && "id" in img.metadata)
          .map((img) => (img.metadata as any).id);

        // Load generated images for those IDs
        const generatedImages = await r2Service.getGeneratedImagesForIds(
          datePrefix,
          pexelsIds,
          includeMetadata
        );

        images.value = [...pexelsImages, ...generatedImages];
      } else if (type === "pexels_raw") {
        images.value = await r2Service.getImagesForDate(datePrefix, type, {
          end: limit,
          includeMetadata,
        });
      } else {
        // For openai_generated only, load pexels first to get IDs
        const pexelsImages = await r2Service.getImagesForDate(
          datePrefix,
          "pexels_raw",
          { end: limit, includeMetadata: true }
        );

        const pexelsIds = pexelsImages
          .filter((img) => img.metadata && "id" in img.metadata)
          .map((img) => (img.metadata as any).id);

        images.value = await r2Service.getGeneratedImagesForIds(
          datePrefix,
          pexelsIds,
          includeMetadata
        );
      }
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error("Unknown error loading images");
      console.error("Failed to load images:", e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Prefetch images for better UX
   *
   * @param imageKeys - Array of R2 object keys to prefetch
   */
  function prefetchImages(imageKeys: string[]): void {
    imageKeys.forEach((key) => r2Service.prefetchImage(key));
  }

  /**
   * Get images filtered by type
   */
  const pexelsImages = computed(() =>
    images.value.filter((img) => img.type === "pexels_raw")
  );

  const generatedImages = computed(() =>
    images.value.filter(
      (img) =>
        img.type === "openai_generated" || img.type === "google_generated"
    )
  );

  /**
   * Clear loaded images and reset state
   */
  function clear(): void {
    images.value = [];
    error.value = null;
  }

  return {
    images,
    pexelsImages,
    generatedImages,
    loading,
    error,
    loadImages,
    prefetchImages,
    clear,
  };
}
