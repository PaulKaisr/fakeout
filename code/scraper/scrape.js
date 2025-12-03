import { searchVideos } from "./clients/pexel.js";
import { putObject } from "./clients/s3.js";

async function run() {
  const videos = await searchVideos({ per_page: 1 });
  console.log(videos);

  // Test S3 upload
  console.log("\n--- Testing R2 Upload ---");
  try {
    const testData = JSON.stringify({
      message: "Test upload from scraper",
      timestamp: new Date().toISOString(),
      videoCount: videos.length,
    });

    const result = await putObject({
      bucketName: "fakeout-videos-dev",
      key: "test/test-upload.json",
      body: testData,
      contentType: "application/json",
    });

    console.log("✓ Successfully uploaded test object to R2:");
    console.log(`  Bucket: fakeout-videos-dev`);
    console.log(`  Key: test/test-upload.json`);
    console.log(`  ETag: ${result.etag}`);
  } catch (err) {
    console.error("✗ Failed to upload test object to R2:", err.message);
  }
}

run().catch((err) => {
  console.error("Failed to fetch videos", err);
});
