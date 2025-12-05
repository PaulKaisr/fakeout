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

export async function searchImages(params = {}) {
  const defaultParams = {
    query: "cat",
    per_page: 10,
    orientation: "portrait",
  };
  const searchParams = { ...defaultParams, ...params };
  const res = await client.photos.search(searchParams);
  return res.photos;
}

export async function getCuratedImages(params = {}) {
  const defaultParams = {
    per_page: 10,
  };
  const searchParams = { ...defaultParams, ...params };
  const res = await client.photos.curated(searchParams);
  return res.photos;
}

export async function getPopularVideos(params = {}) {
  const defaultParams = {
    per_page: 10,
    min_duration: 5,
    max_duration: 10,
  };
  const searchParams = { ...defaultParams, ...params };
  const res = await client.videos.popular(searchParams);
  return res.videos;
}
