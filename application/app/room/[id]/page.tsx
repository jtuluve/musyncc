"use client";

import { ChatSection } from "@/components/ChatSection";
import { MobileLayout } from "@/components/MobileLayout";
import { Player } from "@/components/Player";
import PopupNotification from "@/components/Popup";
import { SearchLists } from "@/components/SearchLists";
import { useSocket } from "@/components/SocketContext";
import { RefObject, use, useEffect, useRef } from "react";

export default function Room({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { roomId, socket, setRoomId } = useSocket();
  const joinedPopupRef = useRef<HTMLDivElement>(null);
  const leftPopupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setRoomId(id);
  }, []);

  // Connect to the socket room
  useEffect(() => {
    if (!roomId || !socket) return;
    socket.emit("join-room", roomId);

    socket.on("joined-room", ({ sender }) => {
      console.log("Triggered");
      if (sender === socket.id) return;
      showPopup(joinedPopupRef);
    });

    socket.on("left-room", (sender) => {
      if (sender === socket.id) return;
      console.log("GOt event");
      showPopup(leftPopupRef);
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.off("joined-room");
      socket.off("left-room");
    };
  }, [roomId, socket]);

  // helper
  function showPopup(ref: RefObject<HTMLDivElement>) {
    if (ref.current) {
      ref.current.style.opacity = "1";
      ref.current.style.bottom = "60px";
      ref.current.style.display = "block";
    }

    setTimeout(() => {
      if (ref.current) {
        ref.current.style.opacity = "0";
        setTimeout(() => {
          if (ref.current) {
            ref.current.style.display = "none";
            ref.current.style.bottom = "-10px";
          }
        }, 500);
      }
    }, 3000);
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex flex-col flex-1 p-8 pb-0">
          <h1 className="text-4xl font-bold mb-8 text-purple-200 flex items-center">
            <a href="/">
              <img src="/logo.png" className="w-14 h-14 inline-block mr-2" />
              Musyncc
            </a>
            <span className="text-3xl text-purple-500">&nbsp;({id})</span>
          </h1>
          <div className="hidden md:contents relative">
            <SearchLists />
          </div>
          <MobileLayout />
        </div>

        {/* Chat Section */}
        <div className="hidden md:flex">
          <ChatSection />
        </div>
      </div>

      {/* Pop ups */}
      <PopupNotification text="Someone joined the room" ref={joinedPopupRef} />
      <PopupNotification text="Someone left the room" ref={leftPopupRef} />

      {/* Music Player */}
      <Player />
    </div>
  );
}
