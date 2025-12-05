import { searchVideos, getCuratedImages } from "./clients/pexel.js";
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
    const imageCount = event.imageCount || 10;

    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const datePrefix = now.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Fetching ${imageCount} curated images from Pexels...`);
    const images = await getCuratedImages({ per_page: imageCount });
    console.log(`Found ${images.length} curated images`);

    // Download and upload each image to R2
    const uploadPromises = images.map(async (image, index) => {
      const imageNumber = index + 1;
      const imageNumberPadded = String(imageNumber).padStart(3, '0');
      const imageUrl = image.src.original; // Use original quality
      const key = `${datePrefix}/pexel_images_raw/${imageNumberPadded}`;

      console.log(`Downloading image ${imageNumber} from ${imageUrl}...`);

      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image ${imageNumber}: ${response.statusText}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);

      // Upload image to R2
      console.log(`Uploading image ${imageNumber} to ${key}...`);
      const imageResult = await putObject({
        bucketName,
        key,
        body: buffer,
        contentType: 'image/jpeg',
      });

      // Upload metadata to R2
      const metaKey = `${datePrefix}/pexel_images_raw/${imageNumberPadded}_meta.json`;
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

      console.log(`Uploading metadata for image ${imageNumber} to ${metaKey}...`);
      const metaResult = await putObject({
        bucketName,
        key: metaKey,
        body: JSON.stringify(metadata, null, 2),
        contentType: 'application/json',
      });

      return {
        imageNumber,
        imageId: image.id,
        photographer: image.photographer,
        imageKey: imageResult.key,
        imageEtag: imageResult.etag,
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
          imageCount: images.length,
          datePrefix,
          uploads: uploadResults,
        },
      }),
    };
  } catch (error) {
    console.error("Error in Lambda handler:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to fetch and store images",
        error: error.message,
      }),
    };
  }
}
