import dotenv from "dotenv";
import { handler } from "./index.js";

dotenv.config();

async function testLambda() {
  // Mock Lambda event
  const event = {
    mode: process.env.TEST_MODE || "video", // "foto" or "video"
    mediaCount: parseInt(process.env.TEST_MEDIA_COUNT) || 5,
    bucketName: process.env.R2_BUCKET_NAME || "fakeout-videos-dev",
    search_prompt: process.env.TEST_SEARCH_PROMPT,
  };

  // Mock Lambda context (minimal)
  const context = {
    functionName: "scraper",
    requestId: "local-test-" + Date.now(),
  };

  console.log("Testing Lambda handler locally...");
  console.log(`Mode: ${event.mode}`);
  console.log(`Media Count: ${event.mediaCount}`);
  console.log(`Bucket: ${event.bucketName}\n`);

  const result = await handler(event, context);
  console.log("\nLambda Response:");
  console.log(JSON.stringify(JSON.parse(result.body), null, 2));
}

testLambda().catch(console.error);
