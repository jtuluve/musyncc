"use client";

import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { useSocket } from "./SocketContext";
export const Player = ({ videoId }) => {
  const { roomId, socket } = useSocket();
  const playerRef = useRef(null);
  // Player options
  const opts = {
    height: "200",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      showinfo: 0,
    },
  };

  useEffect(() => {
    console.log("Player mounted");
    if (!socket) return;
    socket.on("play-client", ({ sender, time }) => {
      console.log("play-client", sender, time);
      if (sender === socket.id) return;
      playerRef.current.internalPlayer.seekTo(time);
      playerRef.current.internalPlayer.playVideo();
    });
    socket.on("pause-client", ({ sender, time }) => {
      console.log("pause-client", sender, time);
      if (sender === socket.id) return;
      playerRef.current.internalPlayer.seekTo(time);
      playerRef.current.internalPlayer.pauseVideo();
    });
    return () => {
      socket.off("play-client");
      socket.off("pause-client");
    };
  }, [socket]);
  // Handle player state change
  const onStateChange = (event: YouTubeEvent<number>) => {
    if (!roomId) return;
    const player = event.target;
    console.log("onStateChange", event.data, player.getCurrentTime());
    if (event.data === 1) {
      socket.emit("play", { roomId, time: player.getCurrentTime() });
    } else if (event.data === 2) {
      socket.emit("pause", { roomId, time: player.getCurrentTime() });
    }
  };

  return (
    <div className="relative max-w-96 w-full m-auto aspect-video">
      <YouTube
        videoId={videoId}
        opts={opts}
        onStateChange={onStateChange}
        ref={playerRef}
      />
    </div>
  );
};
