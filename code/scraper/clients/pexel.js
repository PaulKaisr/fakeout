// Helper functions for interacting with the Pexels API
import { createClient } from "pexels";
import dotenv from "dotenv";

dotenv.config();

const client = createClient(process.env.PEXELS_API_KEY);

export async function searchVideos(params = {}) {
  const defaultParams = {
    query: "cat",
    per_page: 10,
    orientation: "portrait",
    min_duration: 5,
    max_duration: 10,
  };
  const searchParams = { ...defaultParams, ...params };
  const res = await client.videos.search(searchParams);
  return res.videos;
}
