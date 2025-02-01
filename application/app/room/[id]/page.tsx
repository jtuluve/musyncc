"use client";

import { Player } from "@/components/Player";
import { SearchLists } from "@/components/SearchLists";
import { useSocket } from "@/components/SocketContext";
import { use, useEffect } from "react";

export default function Room({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { roomId, socket, setRoomId } = useSocket();
  useEffect(() => {
    setRoomId(id);
  }, []);

  // Connect to the socket room
  useEffect(() => {
    if (!roomId || !socket) return;
    socket.emit("join-room", roomId);

    return () => {
      socket.emit("leave-room", roomId);
    };
  }, [roomId, socket]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 dark:bg-black">
      <div className="p-8 pb-0 max-w-4xl mx-auto min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-purple-200">Room - {id}</h1>
        <SearchLists />
      </div>
      <Player />
    </div>
  );
}
