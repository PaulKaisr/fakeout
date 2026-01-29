// Helper functions for interacting with the Pexels API
import { createClient } from "pexels";
import dotenv from "dotenv";

dotenv.config();

const client = createClient(process.env.PEXELS_API_KEY);

export async function searchVideos(params = {}) {
  const defaultParams = {
    query: "cat",
    per_page: 10,
    min_duration: 5,
    orientation: "landscape",
    size: "medium", // Request at least Full HD videos for best quality
  };
  const searchParams = { ...defaultParams, ...params };
  const res = await client.videos.search(searchParams);
  return res.videos;
}

export async function searchImages(params = {}) {
  const defaultParams = {
    query: "cat",
    per_page: 10,
    orientation: "landscape",
  };
  const searchParams = { ...defaultParams, ...params };
  const res = await client.photos.search(searchParams);
  return res.photos;
}

export async function getCuratedImages(params = {}) {
  const defaultParams = {
    per_page: 10,
    orientation: "landscape",
  };
  const searchParams = { ...defaultParams, ...params };
  const res = await client.photos.curated(searchParams);
  return res.photos;
}

export async function getPopularVideos(params = {}) {
  const defaultParams = {
    per_page: 10,
    min_duration: 5,
    orientation: "landscape",
    size: "medium", // Request at least Full HD videos for best quality
  };
  const searchParams = { ...defaultParams, ...params };

  try {
    const res = await client.videos.popular(searchParams);
    return res.videos;
  } catch (error) {
    // Fallback to video search if popular endpoint fails (known Pexels API issue)
    console.warn(
      `Popular videos endpoint failed: ${error.message}. Falling back to video search.`,
    );
    const { min_duration, ...searchOnlyParams } = searchParams;
    const res = await client.videos.search({
      ...searchOnlyParams,
      query: "nature",
    });
    return res.videos;
  }
}
