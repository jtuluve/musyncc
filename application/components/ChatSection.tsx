"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketContext";
import { chat } from "@/types";

export function ChatSection() {
  const { socket, roomId } = useSocket();
  const [chats, setChats] = useState<chat[]>([]);
  const [name, setName] = useState<string>("");
  const messageAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!socket) return;
    socket.on(
      "chat-client",
      (data: { sender: string; name: string; message: string }) => {
        if (data.sender === socket.id) return;
        setChats((prev) => [
          ...prev,
          { name: data.name, message: data.message },
        ]);
      }
    );
    return () => {
      socket.off("chat-client");
    };
  }, []);

  useEffect(() => {
    if (!messageAreaRef.current) return;
    messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
  }, [chats]);
  return (
    <div className="md:flex md:flex-col contents md:border-l border-purple-400/20 relative">
      {!name && (
        <form
          className="absolute inset-0 flex flex-col items-center justify-center bg-purple-900/30 backdrop-blur-lg p-6 rounded-lg shadow-lg text-white"
          onSubmit={(e) => {
            e.preventDefault();
            console.log(e.currentTarget);
            setName(new FormData(e.currentTarget).get("name") as string);
          }}
        >
          <label htmlFor="name" className="text-lg font-semibold mb-2">
            Enter your name
          </label>

          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your name..."
            className="md:w-4/5 w-full p-3 rounded-lg bg-purple-800/50 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4 box-border"
            required
          />

          <button
            type="submit"
            className="w-32 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold py-2 rounded-lg transition-all duration-300"
          >
            Submit
          </button>
        </form>
      )}
      {/* Chat Header */}
      <div className="p-4 border-b border-purple-400/20 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-purple-200">Room Chat</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Message bubbles would go here */}
        <div className="flex flex-col space-y-4" ref={messageAreaRef}>
          {chats.map((chat, index) =>
            chat.name === name ? (
              <div
                key={index}
                className="bg-purple-500/20 p-3 rounded-lg max-w-[80%] self-end"
              >
                <p className="text-sm text-purple-200">{chat.message}</p>
                <span className="text-xs text-purple-400">You</span>
              </div>
            ) : (
              <div
                key={index}
                className="bg-white/10 p-3 rounded-lg max-w-[80%] self-start"
              >
                <p className="text-sm text-purple-200">{chat.message}</p>
                <span className="text-xs text-purple-400">{chat.name}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-purple-400/20">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            let fd = new FormData(e.currentTarget);
            setChats((prev) => [
              ...prev,
              {
                name,
                message: fd.get("message") as string,
              },
            ]);
            socket.emit("chat", {
              name: name,
              message: fd.get("message") as string,
              roomId,
            });
            e.currentTarget.reset();
          }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            name="message"
            className="flex-1 bg-white/10 dark:bg-gray-800/50 border border-purple-400/20 dark:border-gray-700 rounded-full px-4 py-2 text-white placeholder-purple-300 dark:placeholder-gray-500 focus:outline-none focus:border-purple-400 dark:focus:border-purple-600"
          />
          <button
            type="submit"
            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full"
          >
            <img src="/send-horizontal.svg" alt="send" />
          </button>
        </form>
      </div>
    </div>
  );
}
