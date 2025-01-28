"use server"
import axios from "axios";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
interface YouTubeTrack {
  id: {
    videoId: string,
  };
  snippet: {
    title: string,
    channelTitle: string,
  };
}
export const searchTracks = async (query: string): Promise<YouTubeTrack[]> => {
  console.log(query, YOUTUBE_API_KEY);
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
      query + " song"
    )}&type=video&key=${YOUTUBE_API_KEY}`
  );
  return response.data.items;
};

export const getSimilarTracks = async (
  trackTitle: string
): Promise<YouTubeTrack[]> => {
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
      `${trackTitle} mix`
    )}&type=video&key=${YOUTUBE_API_KEY}`
  );
  return response.data.items;
};
