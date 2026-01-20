import { createR2Service } from "@/services/r2.service";
import { r2Config } from "@/config/r2.config";
import type { Round, Image as GameImage } from "@/types/game";
import type { R2Image, R2ImageMetadata, GameManifest } from "@/types/r2.types";

const r2Service = createR2Service(r2Config);

export const getR2GameRounds = async (
  date?: string,
  mode: "image" | "video" = "image",
): Promise<{ rounds: Round[]; date: string; prompt?: string }> => {
  // 1. Fetch manifest once and reuse for date lookup and prompt extraction
  let manifest: GameManifest | null = null;
  let validDate = "";
  let prompt: string | undefined;

  // Fetch manifest early - we'll need it for both date lookup and prompt
  try {
    manifest = await r2Service.fetchManifest(
      mode === "video" ? "videos" : "images",
    );
  } catch (e) {
    console.warn("Failed to fetch manifest", e);
  }

  if (date) {
    // If specific date requested, verify it exists
    const exists = await r2Service.checkDataExistsForDate(date);
    if (exists) {
      validDate = date;
    } else {
      console.warn(`No game data found for requested date: ${date}`);
      return { rounds: [], date: "" };
    }
  } else if (manifest && manifest.dates.length > 0) {
    // Find the latest date from manifest
    const dates = [...manifest.dates];
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    validDate = dates[0]!;
    console.debug(`Found latest game data from manifest: ${validDate}`);
  } else {
    // Fallback: finding the latest date with data (lookback 7 days)
    let targetDate = new Date();
    const MAX_LOOKBACK = 7;

    for (let i = 0; i <= MAX_LOOKBACK; i++) {
      const dateStr = targetDate.toISOString().split("T")[0] || "";
      const exists = await r2Service.checkDataExistsForDate(dateStr);

      if (exists) {
        validDate = dateStr;
        console.debug(
          `Found latest game data (via probe) for date: ${validDate}`,
        );
        break;
      }

      targetDate.setDate(targetDate.getDate() - 1);
    }
  }

  if (!validDate) {
    console.warn(`No game data found.`);
    return { rounds: [], date: "" };
  }

  // Extract prompt from the already-fetched manifest
  if (manifest?.prompts && manifest.prompts[validDate]) {
    prompt = manifest.prompts[validDate];
  }

  // 2. Fetch real images (Pexels) - fetch up to 5 images
  const itemType = mode === "video" ? "pexels_video_raw" : "pexels_raw";
  const realImages: R2Image[] = await r2Service.getImagesForDate(
    validDate,
    itemType,
    {
      end: 5,
      includeMetadata: true,
    },
  );

  if (realImages.length === 0) {
    console.warn(`No images found for date ${validDate}`);
    return { rounds: [], date: "" };
  }

  // 3. Extract IDs to fetch generated images
  const realImagesWithId = realImages.filter(
    (img) => img.metadata && "id" in img.metadata,
  );
  const pexelsIds = realImagesWithId.map(
    (img) => (img.metadata as R2ImageMetadata).id,
  );

  // 4. Fetch generated images for these IDs
  // We used 'google_generated' or 'google_generated_video' mode as requested
  const generatedImages = await r2Service.getGeneratedImagesForIds(
    validDate,
    pexelsIds,
    true,
    mode === "video" ? "google_generated_video" : "google_generated",
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
      (r) => String((r.metadata as R2ImageMetadata).id) === genIdFromKey,
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
        creditUrl: (realImg.metadata as R2ImageMetadata).photographer_url,
        sourceUrl: (realImg.metadata as R2ImageMetadata).url,
        mediaType: mode,
      };

      const genGameImage: GameImage = {
        id: `ai-${genIdFromKey}`,
        url: genImg.url,
        isAiGenerated: true,
        credit: "Google AI",
        mediaType: mode,
        prompt: (genImg.metadata as any)?.generation_prompt,
      };

      rounds.push({
        id: rounds.length + 1,
        imageA: isRealA ? realGameImage : genGameImage,
        imageB: isRealA ? genGameImage : realGameImage,
      });
    }
  });

  // 6. Preload first round images for faster LCP
  if (rounds.length > 0) {
    preloadFirstRoundImages(rounds[0]!);
  }

  return { rounds, date: validDate, prompt };
};

/**
 * Preload images for the first round to improve LCP.
 * Injects <link rel="preload"> tags into the document head.
 */
function preloadFirstRoundImages(round: Round): void {
  const urls = [round.imageA.url, round.imageB.url];

  for (const url of urls) {
    // Check if preload link already exists
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) continue;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    link.fetchPriority = "high";
    document.head.appendChild(link);
  }
}
