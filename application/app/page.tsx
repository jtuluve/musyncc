"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchTracks, getSimilarTracks } from "@/application/lib/youtube";
import { Player } from "@/application/components/Player";
interface YouTubeTrack {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
  };
}
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [similarTracks, setSimilarTracks] = useState<YouTubeTrack[]>([]);
  const [submit, setSubmit] = useState(false);

  // Search query
  const { data: searchResults } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => {
      setSubmit(false);
      return searchTracks(searchQuery);
    },
    enabled: submit,
  });

  // Similar tracks query
  const { data: similarData } = useQuery({
    queryKey: ["similar", currentTrack?.id?.videoId],
    queryFn: () => {
      if (!currentTrack) throw new Error("No track selected");
      setCurrentTrack(null);
      return getSimilarTracks(currentTrack.snippet.title);
    },
    enabled: !!currentTrack,
  });

  // Update similar tracks when query succeeds
  useEffect(() => {
    if (similarData) setSimilarTracks(similarData);
  }, [similarData]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">YouTube Music</h1>

      {/* Search Bar */}
      <form
        action=""
        className="flex"
        onSubmit={(e) => (e.preventDefault(), setSubmit(true))}
      >
        <input
          type="text"
          placeholder="Search songs..."
          className="w-full p-2 rounded border mb-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Audio Player */}
      {currentTrack?.id?.videoId && (
        <Player videoId={currentTrack.id.videoId} />
      )}

      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          {searchResults?.map((track) => (
            <div
              key={track.id.videoId}
              onClick={() => setCurrentTrack(track)}
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
              onClick={() => setCurrentTrack(track)}
              className="p-4 border rounded cursor-pointer hover:bg-gray-50 mb-2"
            >
              {track.snippet.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
