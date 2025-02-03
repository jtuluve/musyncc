"use client";

import { ChatSection } from "@/components/ChatSection";
import { MobileLayout } from "@/components/MobileLayout";
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex flex-col flex-1 p-8 pb-0">
          <h1 className="text-4xl font-bold mb-8 text-purple-200 flex items-center">
            <img src="/logo.png" className="w-14 h-14 inline-block mr-2" />
            Musyncc
            <span className="text-3xl text-purple-500"> ({id})</span>
          </h1>
          <div className="hidden md:contents relative">
            <SearchLists/>
          </div>
          <MobileLayout />
        </div>

        {/* Chat Section */}
        <div className="hidden md:flex">
          <ChatSection />
        </div>
      </div>

      {/* Player stays at bottom */}
      <Player />
    </div>
  );
}
