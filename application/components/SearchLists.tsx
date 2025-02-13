"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchTracks, getSimilarTracks } from "@/lib/youtube";
import { YouTubeTrack } from "@/types";
import { useGreat } from "@/components/GreatContext";

export function SearchLists() {
  const {
    video,
    playerRef,
    isMyTrack,
    curIndex,
    similarTracks: similarTracksRef,
  } = useGreat();
  const searchQuery = useRef("");
  const [searchValue, setSearchValue] = useState("");
  const [submit, setSubmit] = useState(false);
  const [similarTracks, setSimilarTracks] = useState<YouTubeTrack[]>([]);
  const queryClient = useQueryClient();
  // Search query
  const { data: searchResults } = useQuery({
    queryKey: ["search"],
    queryFn: async () => {
      setSubmit(false);
      return searchTracks(searchQuery.current);
    },
    enabled: submit,
  });

  // Similar tracks query
  const { data: similarData } = useQuery({
    queryKey: ["similar"],
    queryFn: async () => {
      if (!video.current) throw new Error("No track selected");
      return getSimilarTracks(video.current);
    },
    enabled: !!video.current,
  });

  // Handle track selection
  const handleTrackSelect = async (track) => {
    video.current = track;
    curIndex.current = 0;
    await playerRef.current.internalPlayer.loadVideoById(track.id.videoId, 0);
    await playerRef.current.internalPlayer.playVideo();
    queryClient.invalidateQueries({ queryKey: ["similar"] });
    isMyTrack.current = true;
  };

  useEffect(() => {
    if (similarData) {
      setSimilarTracks(similarData);
      similarTracksRef.current = similarData;
    }
  }, [similarData]);

  return (
    <>
      <form
        className="flex relative"
        onSubmit={(e) => {
          e.preventDefault();
          searchQuery.current = searchValue;
          setSubmit(true);
        }}
      >
        <input
          type="text"
          placeholder="Search songs..."
          className="w-full p-4 rounded-full bg-white/10 border-2 border-purple-400/30 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-colors mb-8"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Search Results */}
        <div className="flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold mb-4 text-purple-200 min-h-0">
            Search Results
          </h2>
          <div className="flex-1 overflow-y-auto">
            {searchResults?.map((track) => (
              <div
                key={track.id.videoId}
                onClick={() => handleTrackSelect(track)}
                className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-purple-400/20 cursor-pointer hover:bg-white/10 transition-colors mb-2"
              >
                {track.snippet.title}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tracks */}
        <div className="flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold mb-4 text-purple-200 sticky top-0 z-10">
            Upcoming
          </h2>
          <div className="h-full overflow-auto">
            {similarTracks?.map((track) => (
              <div
                key={track.id.videoId}
                onClick={() => handleTrackSelect(track)}
                className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-purple-400/20 cursor-pointer hover:bg-white/10 transition-colors mb-2"
              >
                {track.snippet.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
