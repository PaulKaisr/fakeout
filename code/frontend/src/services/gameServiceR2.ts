import { createR2Service } from "@/services/r2.service";
import { r2Config } from "@/config/r2.config";
import type { Round, Image as GameImage } from "@/types/game";
import type { R2Image, R2ImageMetadata } from "@/types/r2.types";

const r2Service = createR2Service(r2Config);

export const getR2GameRounds = async (): Promise<Round[]> => {
  // 1. Get today's date
  const today = new Date().toISOString().split("T")[0] || "";

  // 2. Fetch real images (Pexels) - fetch a batch
  // Iterate until we find images. We'll try to fetch 20.
  const realImages: R2Image[] = await r2Service.getImagesForDate(
    today,
    "pexels_raw",
    {
      end: 20,
      includeMetadata: true,
    }
  );

  if (realImages.length === 0) {
    console.warn(`No images found for date ${today}`);
    return [];
  }

  // 3. Extract IDs to fetch generated images
  const realImagesWithId = realImages.filter(
    (img) => img.metadata && "id" in img.metadata
  );
  const pexelsIds = realImagesWithId.map(
    (img) => (img.metadata as R2ImageMetadata).id
  );

  // 4. Fetch generated images for these IDs
  // We used 'google_generated' mode as requested
  const generatedImages = await r2Service.getGeneratedImagesForIds(
    today,
    pexelsIds,
    true
  );

  // 5. Match pairs
  const rounds: Round[] = [];

  generatedImages.forEach((genImg, index) => {
    // Find corresponding real image
    // The generated image metadata should ideally have `original_image_id` or similar,
    // or we just match by the ID we requested it with.
    // getGeneratedImagesForIds fetches by replacing {id} in path, so the order *might* be preserved
    // if we did it sequentially, but it runs in loop.
    // However, the `key` contains the ID: `google_generated_images/{id}`.

    // Let's rely on matching IDs.
    // Gen Key: .../google_generated_images/12345
    // Real Key: .../pexel_images_raw/001 -> metadata.id = 12345

    // Extract ID from generated image key or metadata
    // The simple way is to iterate our real images and try to find a gen image that matches.
    const genIdFromKey = genImg.key.split("/").pop(); // "12345"
    if (!genIdFromKey) return;

    const realImg = realImagesWithId.find(
      (r) => String((r.metadata as R2ImageMetadata).id) === genIdFromKey
    );

    if (realImg && genImg) {
      // Create Round
      // Randomize A/B positions
      const isRealA = Math.random() > 0.5;

      const realGameImage: GameImage = {
        id: `real-${genIdFromKey}`,
        url: realImg.url,
        isAiGenerated: false,
        credit: (realImg.metadata as R2ImageMetadata).photographer || "Pexels",
      };

      const genGameImage: GameImage = {
        id: `ai-${genIdFromKey}`,
        url: genImg.url,
        isAiGenerated: true,
        credit: "Google AI",
      };

      rounds.push({
        id: rounds.length + 1,
        imageA: isRealA ? realGameImage : genGameImage,
        imageB: isRealA ? genGameImage : realGameImage,
      });
    }
  });

  return rounds;
};
