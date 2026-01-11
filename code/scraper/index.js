import {
  searchVideos,
  searchImages,
  getCuratedImages,
  getPopularVideos,
} from "./clients/pexel.js";
import { putObject } from "./clients/s3.js";
import { getNextPrompt, markPromptAsUsed } from "./clients/supabase.js";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ffmpegPath = path.join(__dirname, "ffmpeg");

// Only set custom path if the binary exists (e.g. in Lambda)
if (fs.existsSync(ffmpegPath)) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

/**
 * Main scraping logic that fetches videos and uploads them to R2
 * @param {Object} options - Configuration options
 * @param {number} options.videoCount - Number of videos to fetch
 * @param {string} options.query - Search query for videos
 * @param {string} options.bucketName - R2 bucket name
 * @returns {Promise<Object>} Results of the scraping operation
 */
export async function scrapeAndStore(options = {}) {
  const {
    videoCount = 1,
    query = "cat",
    bucketName = "fakeout-videos-dev",
  } = options;

  console.log(`Fetching ${videoCount} videos for query: "${query}"`);
  const videos = await searchVideos({ query, per_page: videoCount });
  console.log(`Found ${videos.length} videos`);

  // Test R2 upload with metadata
  console.log("\n--- Uploading metadata to R2 ---");
  const testData = JSON.stringify({
    message: "Video scrape results",
    timestamp: new Date().toISOString(),
    videoCount: videos.length,
    videos: videos.map((v) => ({
      id: v.id,
      url: v.url,
      duration: v.duration,
      width: v.width,
      height: v.height,
    })),
  });

  const result = await putObject({
    bucketName,
    key: `scrapes/${Date.now()}.json`,
    body: testData,
    contentType: "application/json",
  });

  console.log("✓ Successfully uploaded to R2:");
  console.log(`  Bucket: ${bucketName}`);
  console.log(`  Key: ${result.key}`);
  console.log(`  ETag: ${result.etag}`);

  return {
    videoCount: videos.length,
    videos,
    uploadResult: result,
  };
}

/**
 * Downloads a file from a URL to a local path
 * @param {string} url - URL to download from
 * @param {string} outputPath - Local path to save to
 */
async function downloadToFile(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

/**
 * Processes a video: cuts it if longer than maxDuration
 * @param {string} inputPath - Input video path
 * @param {string} outputPath - Output video path
 * @param {number} maxDuration - Max duration in seconds
 * @returns {Promise<boolean>} - True if processed/copied, False on error
 */
function processVideo(inputPath, outputPath, maxDuration = 10) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        console.warn("ffprobe failed, copying original:", err);
        fs.copyFileSync(inputPath, outputPath);
        resolve(false);
        return;
      }

      const duration = metadata.format.duration;
      if (duration > maxDuration) {
        console.log(
          `Video duration ${duration}s > ${maxDuration}s. Cutting...`
        );
        ffmpeg(inputPath)
          .setStartTime(0)
          .setDuration(maxDuration)
          .output(outputPath)
          .on("end", () => resolve(true))
          .on("error", (err) => {
            console.error("Error cutting video:", err);
            reject(err);
          })
          .run();
      } else {
        console.log(
          `Video duration ${duration}s <= ${maxDuration}s. Keeping original.`
        );
        fs.copyFileSync(inputPath, outputPath);
        resolve(true);
      }
    });
  });
}

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Promise<Object>} Lambda response
 */
export async function handler(event, context) {
  console.log("Lambda invoked with event:", JSON.stringify(event, null, 2));

  try {
    const bucketName = event.bucketName || "fakeout-videos-dev";
    const mode = event.mode || "foto";
    const mediaCount = event.mediaCount || 10;

    // Check for search prompt in executionInput (from Step Function) or directly in event
    const searchPrompt =
      event.executionInput?.search_prompt || event.search_prompt;

    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const datePrefix = now.toISOString().split("T")[0]; // YYYY-MM-DD

    if (mode === "video") {
      let videos;
      let effectiveSearchPrompt = searchPrompt;
      let usedSupabasePrompt = false;

      // If no prompt provided, try to get one from Supabase
      if (!effectiveSearchPrompt) {
        console.log("No search prompt provided. Fetching from Supabase...");
        const dbPrompt = await getNextPrompt("video");
        if (dbPrompt) {
          effectiveSearchPrompt = dbPrompt;
          usedSupabasePrompt = true;
          console.log(`Fetched usage prompt: '${effectiveSearchPrompt}'`);
        } else {
          console.log(
            "No prompt available from Supabase (or connection failed). Falling back to popular videos."
          );
        }
      }

      if (effectiveSearchPrompt) {
        console.log(
          `Fetching ${mediaCount} videos for query "${effectiveSearchPrompt}"...`
        );
        videos = await searchVideos({
          query: effectiveSearchPrompt,
          per_page: mediaCount,
        });
      } else {
        // Video mode: fetch popular videos (Fallback)
        console.log(`Fetching ${mediaCount} popular videos from Pexels...`);
        videos = await getPopularVideos({ per_page: mediaCount });
      }
      console.log(`Found ${videos.length} videos`);

      // Download and upload each video to R2
      const uploadPromises = videos.map(async (video, index) => {
        const mediaNumber = index + 1;
        const mediaNumberPadded = String(mediaNumber).padStart(3, "0");

        // Find the best quality video file (prefer HD)
        const videoFile =
          video.video_files.find((f) => f.quality === "hd") ||
          video.video_files[0];
        const videoUrl = videoFile.link;
        const key = `${datePrefix}/pexel_videos_raw/${mediaNumberPadded}`;

        console.log(`Processing video ${mediaNumber} from ${videoUrl}...`);

        const tempInput = path.join(
          "/tmp",
          `input_${mediaNumber}_${Date.now()}.mp4`
        );
        const tempOutput = path.join(
          "/tmp",
          `output_${mediaNumber}_${Date.now()}.mp4`
        );

        try {
          await downloadToFile(videoUrl, tempInput);
          await processVideo(tempInput, tempOutput, 10);

          const buffer = fs.readFileSync(tempOutput);

          // Upload video to R2
          console.log(`Uploading video ${mediaNumber} to ${key}...`);
          const mediaResult = await putObject({
            bucketName,
            key,
            body: buffer,
            contentType: videoFile.file_type || "video/mp4",
          });

          // Upload metadata to R2
          const metaKey = `${datePrefix}/pexel_videos_raw/${mediaNumberPadded}_meta.json`;
          const metadata = {
            id: video.id,
            width: video.width,
            height: video.height,
            url: video.url,
            image: video.image,
            duration: Math.min(video.duration, 10), // Update duration in metadata
            original_duration: video.duration,
            user: video.user,
            video_files: video.video_files,
            video_pictures: video.video_pictures,
            search_prompt: effectiveSearchPrompt || "popular",
          };

          console.log(
            `Uploading metadata for video ${mediaNumber} to ${metaKey}...`
          );
          const metaResult = await putObject({
            bucketName,
            key: metaKey,
            body: JSON.stringify(metadata, null, 2),
            contentType: "application/json",
          });

          return {
            mediaNumber,
            mediaId: video.id,
            user: video.user.name,
            mediaKey: mediaResult.key,
            mediaEtag: mediaResult.etag,
            metaKey: metaResult.key,
            metaEtag: metaResult.etag,
          };
        } catch (err) {
          console.error(`Error processing video ${mediaNumber}:`, err);
          // Fallback: avoid failing the whole batch, maybe simplify return or filter nulls later
          return {
            mediaNumber,
            error: err.message,
            status: "failed",
          };
        } finally {
          // Clean up
          if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
          if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
        }
      });

      const uploadResults = await Promise.all(uploadPromises);

      // Successfully uploaded? Mark prompt as used
      if (
        usedSupabasePrompt &&
        uploadResults.some((r) => r.status !== "failed")
      ) {
        await markPromptAsUsed(effectiveSearchPrompt, "video");
      }

      console.log(
        `✓ Successfully uploaded ${uploadResults.length} videos to R2`
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: `Successfully fetched and stored ${
            effectiveSearchPrompt ? "searched" : "popular"
          } videos`,
          data: {
            mode,
            mediaCount: videos.length,
            datePrefix,
            uploads: uploadResults,
          },
        }),
      };
    } else {
      let images;
      let effectiveSearchPrompt = searchPrompt;
      let usedSupabasePrompt = false;

      // If no prompt provided, try to get one from Supabase (Image Mode)
      if (!effectiveSearchPrompt) {
        console.log(
          "No search prompt provided for images. Fetching from Supabase..."
        );
        const dbPrompt = await getNextPrompt("image");
        if (dbPrompt) {
          effectiveSearchPrompt = dbPrompt;
          usedSupabasePrompt = true;
          console.log(
            `Fetched usage prompt for images: '${effectiveSearchPrompt}'`
          );
        } else {
          console.log(
            "No prompt available from Supabase. Falling back to curated images."
          );
        }
      }

      if (effectiveSearchPrompt) {
        console.log(
          `Fetching ${mediaCount} images for query "${effectiveSearchPrompt}"...`
        );
        images = await searchImages({
          query: effectiveSearchPrompt,
          per_page: mediaCount,
        });
      } else {
        // Foto mode: fetch curated images (default)
        console.log(`Fetching ${mediaCount} curated images from Pexels...`);
        images = await getCuratedImages({ per_page: mediaCount });
      }
      console.log(`Found ${images.length} images`);

      // Download and upload each image to R2
      const uploadPromises = images.map(async (image, index) => {
        const mediaNumber = index + 1;
        const mediaNumberPadded = String(mediaNumber).padStart(3, "0");
        const imageUrl = image.src.original; // Use original quality
        const key = `${datePrefix}/pexel_images_raw/${mediaNumberPadded}`;

        console.log(`Downloading image ${mediaNumber} from ${imageUrl}...`);

        // Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(
            `Failed to download image ${mediaNumber}: ${response.statusText}`
          );
        }

        const imageBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);

        // Upload image to R2
        console.log(`Uploading image ${mediaNumber} to ${key}...`);
        const mediaResult = await putObject({
          bucketName,
          key,
          body: buffer,
          contentType: "image/jpeg",
        });

        // Upload metadata to R2
        const metaKey = `${datePrefix}/pexel_images_raw/${mediaNumberPadded}_meta.json`;
        const metadata = {
          id: image.id,
          width: image.width,
          height: image.height,
          url: image.url,
          photographer: image.photographer,
          photographer_url: image.photographer_url,
          photographer_id: image.photographer_id,
          avg_color: image.avg_color,
          alt: image.alt,
          liked: image.liked,
          src: image.src,
          search_prompt: effectiveSearchPrompt || "curated",
        };

        console.log(
          `Uploading metadata for image ${mediaNumber} to ${metaKey}...`
        );
        const metaResult = await putObject({
          bucketName,
          key: metaKey,
          body: JSON.stringify(metadata, null, 2),
          contentType: "application/json",
        });

        return {
          mediaNumber,
          mediaId: image.id,
          photographer: image.photographer,
          mediaKey: mediaResult.key,
          mediaEtag: mediaResult.etag,
          metaKey: metaResult.key,
          metaEtag: metaResult.etag,
        };
      });

      const uploadResults = await Promise.all(uploadPromises);

      // Successfully uploaded? Mark prompt as used for images
      if (
        usedSupabasePrompt &&
        uploadResults.some((r) => r.status !== "failed")
      ) {
        await markPromptAsUsed(effectiveSearchPrompt, "image");
      }

      console.log(
        `✓ Successfully uploaded ${uploadResults.length} images to R2`
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: `Successfully fetched and stored ${
            effectiveSearchPrompt ? "searched" : "curated"
          } images`,
          data: {
            mode,
            mediaCount: images.length,
            datePrefix,
            uploads: uploadResults,
          },
        }),
      };
    }
  } catch (error) {
    console.error("Error in Lambda handler:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: `Failed to fetch and store ${
          event.mode === "video" ? "videos" : "images"
        }`,
        error: error.message,
      }),
    };
  }
}
