import { searchVideos, getCuratedImages, getPopularVideos } from "./clients/pexel.js";
import { putObject } from "./clients/s3.js";

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

    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const datePrefix = now.toISOString().split('T')[0]; // YYYY-MM-DD

    if (mode === "video") {
      // Video mode: fetch popular videos
      console.log(`Fetching ${mediaCount} popular videos from Pexels...`);
      const videos = await getPopularVideos({ per_page: mediaCount });
      console.log(`Found ${videos.length} popular videos`);

      // Download and upload each video to R2
      const uploadPromises = videos.map(async (video, index) => {
        const mediaNumber = index + 1;
        const mediaNumberPadded = String(mediaNumber).padStart(3, '0');

        // Find the best quality video file (prefer HD)
        const videoFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
        const videoUrl = videoFile.link;
        const key = `${datePrefix}/pexel_videos_raw/${mediaNumberPadded}`;

        console.log(`Downloading video ${mediaNumber} from ${videoUrl}...`);

        // Fetch the video
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to download video ${mediaNumber}: ${response.statusText}`);
        }

        const videoBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(videoBuffer);

        // Upload video to R2
        console.log(`Uploading video ${mediaNumber} to ${key}...`);
        const mediaResult = await putObject({
          bucketName,
          key,
          body: buffer,
          contentType: videoFile.file_type || 'video/mp4',
        });

        // Upload metadata to R2
        const metaKey = `${datePrefix}/pexel_videos_raw/${mediaNumberPadded}_meta.json`;
        const metadata = {
          id: video.id,
          width: video.width,
          height: video.height,
          url: video.url,
          image: video.image,
          duration: video.duration,
          user: video.user,
          video_files: video.video_files,
          video_pictures: video.video_pictures,
        };

        console.log(`Uploading metadata for video ${mediaNumber} to ${metaKey}...`);
        const metaResult = await putObject({
          bucketName,
          key: metaKey,
          body: JSON.stringify(metadata, null, 2),
          contentType: 'application/json',
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
      });

      const uploadResults = await Promise.all(uploadPromises);

      console.log(`✓ Successfully uploaded ${uploadResults.length} videos to R2`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "Successfully fetched and stored popular videos",
          data: {
            mode,
            mediaCount: videos.length,
            datePrefix,
            uploads: uploadResults,
          },
        }),
      };
    } else {
      // Foto mode: fetch curated images (default)
      console.log(`Fetching ${mediaCount} curated images from Pexels...`);
      const images = await getCuratedImages({ per_page: mediaCount });
      console.log(`Found ${images.length} curated images`);

      // Download and upload each image to R2
      const uploadPromises = images.map(async (image, index) => {
        const mediaNumber = index + 1;
        const mediaNumberPadded = String(mediaNumber).padStart(3, '0');
        const imageUrl = image.src.original; // Use original quality
        const key = `${datePrefix}/pexel_images_raw/${mediaNumberPadded}`;

        console.log(`Downloading image ${mediaNumber} from ${imageUrl}...`);

        // Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image ${mediaNumber}: ${response.statusText}`);
        }

        const imageBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);

        // Upload image to R2
        console.log(`Uploading image ${mediaNumber} to ${key}...`);
        const mediaResult = await putObject({
          bucketName,
          key,
          body: buffer,
          contentType: 'image/jpeg',
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
        };

        console.log(`Uploading metadata for image ${mediaNumber} to ${metaKey}...`);
        const metaResult = await putObject({
          bucketName,
          key: metaKey,
          body: JSON.stringify(metadata, null, 2),
          contentType: 'application/json',
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

      console.log(`✓ Successfully uploaded ${uploadResults.length} images to R2`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "Successfully fetched and stored curated images",
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
        message: `Failed to fetch and store ${event.mode === 'video' ? 'videos' : 'images'}`,
        error: error.message,
      }),
    };
  }
}
