import { createR2Service } from "@/services/r2.service";
import { r2Config } from "@/config/r2.config";
import type { Round, Image as GameImage } from "@/types/game";
import type { R2Image, R2ImageMetadata } from "@/types/r2.types";

const r2Service = createR2Service(r2Config);

export const getR2GameRounds = async (date?: string): Promise<Round[]> => {
  // 1. Determine which date to use
  let validDate = "";

  if (date) {
    // If specific date requested, verify it exists (optional, or just try to load)
    const exists = await r2Service.checkDataExistsForDate(date);
    if (exists) {
      validDate = date;
    } else {
      console.warn(`No game data found for requested date: ${date}`);
      return [];
    }
  } else {
    // Find the latest date with data (lookback 7 days)
    let targetDate = new Date();
    const MAX_LOOKBACK = 7;

    for (let i = 0; i <= MAX_LOOKBACK; i++) {
      const dateStr = targetDate.toISOString().split("T")[0] || "";
      // Check if data exists for this date
      const exists = await r2Service.checkDataExistsForDate(dateStr);

      if (exists) {
        validDate = dateStr;
        console.debug(`Found latest game data for date: ${validDate}`);
        break;
      }

      // Go back one day
      targetDate.setDate(targetDate.getDate() - 1);
    }

    if (!validDate) {
      console.warn(`No game data found within the last ${MAX_LOOKBACK} days.`);
      return [];
    }
  }

  // 2. Fetch real images (Pexels) - fetch up to 5 images
  const realImages: R2Image[] = await r2Service.getImagesForDate(
    validDate,
    "pexels_raw",
    {
      end: 5,
      includeMetadata: true,
    }
  );

  if (realImages.length === 0) {
    console.warn(`No images found for date ${validDate}`);
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
    validDate,
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
