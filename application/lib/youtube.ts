"use server"
import { YouTubeTrack } from "@/types";
import axios from "axios";

const YT_API_KEYS = [process.env.YOUTUBE_API_KEY, process.env.YOUTUBE_API_KEY2];

export const searchTracks = async (query: string): Promise<YouTubeTrack[]> => {
  for (const apiKey of YT_API_KEYS) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
          query + " song"
        )}&type=video&key=${apiKey}`
      );
      return response.data.items;
    } catch (error) {
      console.warn(`API key failed: ${apiKey}, trying next...`);
    }
  }
  
  // If all API keys fail, throw an error
  throw new Error("All API keys failed. Keys or quota?.");
};


export const getSimilarTracks = async (video: YouTubeTrack): Promise<YouTubeTrack[]> => {
  const { title, channelTitle } = video.snippet;

  // Extract meaningful search terms
  const baseTitle = title.split("-")[0].split("|")[0].split("(")[0].trim();
  const artist = channelTitle;

  // 🔹 Construct a SMART query for related videos
  const searchQuery = `${artist} ${baseTitle} | similar songs | recommended | best of -lyrics -live -cover`;

  for (const apiKey of YT_API_KEYS) {
    try {
      // 🔹 YouTube Search API
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        searchQuery
      )}&type=video&maxResults=10&key=${apiKey}`;

      const response = await axios.get(url);

      // Filter & return unique results
      const uniqueTracks = response.data.items.filter(
        (track: any) => track.id.videoId !== video.id.videoId
      );

      return uniqueTracks as YouTubeTrack[];
    } catch (error) {
      console.warn(`API key failed: ${apiKey}, trying next...`);
    }
  }

  // If all API keys fail, throw an error
  throw new Error("All API keys failed. Please check your keys or quota.");
};

