import { scrapeAndStore } from "./index.js";

async function run() {
  try {
    const result = await scrapeAndStore({
      videoCount: 1,
      query: "cat",
      bucketName: "fakeout-videos-dev",
    });

    console.log("\n=== Scrape Complete ===");
    console.log(`Videos found: ${result.videoCount}`);
    console.log(`Upload key: ${result.uploadResult.key}`);
  } catch (err) {
    console.error("Failed to scrape and store videos:", err);
    process.exit(1);
  }
}

run();
