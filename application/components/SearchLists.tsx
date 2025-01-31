"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchTracks, getSimilarTracks } from "@/lib/youtube";
import { useSocket } from "@/components/SocketContext";
import { YouTubeTrack } from "@/types";
import { useGreat } from "@/components/GreatContext";

export function SearchLists() {
  const { video, playerRef } = useGreat();
  const searchQuery = useRef("");
  const [searchValue, setSearchValue] = useState("");
  const [submit, setSubmit] = useState(false);
  const [similarTracks, setSimilarTracks] = useState<YouTubeTrack[]>([]);

  // Search query
  const { data: searchResults } = useQuery({
    queryKey: ["search", searchQuery.current],
    queryFn: async () => {
      setSubmit(false);
      return searchTracks(searchQuery.current);
    },
    enabled: submit,
  });

  // Handle track selection
  const handleTrackSelect = async (track) => {
    video.current = track;
    await playerRef.current.internalPlayer.loadVideoById(track.id.videoId, 0);
    await playerRef.current.internalPlayer.playVideo();
  };

  // Similar tracks query
  const { data: similarData } = useQuery({
    queryKey: ["similar", video?.id?.videoId],
    queryFn: async () => {
      if (!video) throw new Error("No track selected");
      return getSimilarTracks(video.snippet.title);
    },
    enabled: !!video,
  });

  useEffect(() => {
    if (similarData) setSimilarTracks(similarData);
  }, [similarData]);

  return (
    <>
      {/* Search Bar */}
      <form
        className="flex"
        onSubmit={(e) => {
          e.preventDefault();
          searchQuery.current = searchValue;
          setSubmit(true);
        }}
      >
        <input
          type="text"
          placeholder="Search songs..."
          className="w-full p-2 rounded border mb-8"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Search Results */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          {searchResults?.map((track) => (
            <div
              key={track.id.videoId}
              onClick={() => handleTrackSelect(track)}
              className="p-4 border rounded cursor-pointer hover:bg-gray-50 mb-2"
            >
              {track.snippet.title}
            </div>
          ))}
        </div>

        {/* Similar Tracks */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Similar Songs</h2>
          {similarTracks?.map((track) => (
            <div
              key={track.id.videoId}
              onClick={() => handleTrackSelect(track)}
              className="p-4 border rounded cursor-pointer hover:bg-gray-50 mb-2"
            >
              {track.snippet.title}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
