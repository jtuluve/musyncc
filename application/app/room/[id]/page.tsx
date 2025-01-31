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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">YouTube Music</h1>
      <SearchLists/>
      <Player />
    </div>
  );
}
