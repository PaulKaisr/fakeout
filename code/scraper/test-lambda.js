import dotenv from "dotenv";
import { handler } from "./index.js";

dotenv.config();

async function testLambda() {
  // Mock Lambda event
  const event = {
    videoCount: 2,
    query: "cat",
    bucketName: process.env.R2_BUCKET_NAME || "fakeout-videos-dev",
  };

  // Mock Lambda context (minimal)
  const context = {
    functionName: "scraper",
    requestId: "local-test-" + Date.now(),
  };

  console.log("Testing Lambda handler locally...\n");
  const result = await handler(event, context);
  console.log("\nLambda Response:");
  console.log(JSON.stringify(JSON.parse(result.body), null, 2));
}

testLambda().catch(console.error);
