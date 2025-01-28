"use client";

import { useState, useEffect, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchTracks, getSimilarTracks } from "@/lib/youtube";
import { Player } from "@/components/Player";
import { useSocket } from "@/components/SocketContext";

interface YouTubeTrack {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
  };
}

export default function Room({ params }: { params: Promise<{ id: string }> }) {
  // Handle room ID
  const { id } = use(params);
  const { socket, setRoomId } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [similarTracks, setSimilarTracks] = useState<YouTubeTrack[]>([]);
  const [submit, setSubmit] = useState(false);

  // Fetch the room ID from params
  useEffect(() => {
    setRoomId(id);
  }, []);

  // Connect to the socket room once the ID is ready
  useEffect(() => {
    if (!id || !socket) return;

    socket.emit("join-room", id);

    // Handle server response for joining a room
    socket.on("joined-room", (roomId) => {
      console.log("Joined room:", roomId);
    });

    // Cleanup on component unmount
    return () => {
      socket.emit("leave-room", { roomId: id });
      socket.off("joined-room");
    };
  }, [id, socket]);

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
      console.log("Called similar");
      if (!currentTrack) throw new Error("No track selected");
      return getSimilarTracks(currentTrack.snippet.title);
    },
    enabled: submit && !!currentTrack,
  });

  // Update similar tracks when query succeeds
  useEffect(() => {
    if (similarData) setSimilarTracks(similarData);
  }, [similarData]);

  if (!id) {
    return <div>Loading...</div>;
  }

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
