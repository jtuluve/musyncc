"use server"
import { YouTubeTrack } from "@/types";
import axios from "axios";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export const searchTracks = async (query: string): Promise<YouTubeTrack[]> => {
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
      query + " song"
    )}&type=video&key=${YOUTUBE_API_KEY}`
  );
  return response.data.items;
};

export const getSimilarTracks = async (video: YouTubeTrack): Promise<YouTubeTrack[]> => {
  try {
    const { title, channelTitle } = video.snippet;

    // Extract meaningful search terms
    const baseTitle = title.split("-")[0].split("|")[0].split("(")[0].trim();
    const artist = channelTitle;

    // 🔹 Construct a SMART query for related videos
    const searchQuery = `${artist} ${baseTitle} | similar songs | recommended | best of -lyrics -live -cover`;

    // 🔹 YouTube Search API
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;

    const response = await axios.get(url);

    // Filter & return unique results
    const uniqueTracks = response.data.items.filter(
      (track: any) => track.id.videoId !== video.id.videoId
    );

    return uniqueTracks as YouTubeTrack[];

  } catch (error) {
    console.error("Similar tracks error:", error.response?.data || error);
    return [];
  }
};
