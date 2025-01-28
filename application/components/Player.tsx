"use client";

import { useRef, useState } from "react";
import YouTube from "react-youtube";
let i;
export const Player = ({ videoId }) => {
  const [currentTime, setCurrentTime] = useState(0);
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

  // Handle player state change
  const onStateChange = (event) => {
    const player = event.target;
    setCurrentTime(player.getCurrentTime()); // Get current time in seconds
  };

  return (
    <div className="relative max-w-96 w-full m-auto aspect-video">
      <YouTube
        videoId={videoId}
        opts={opts}
        onStateChange={onStateChange}
        ref={playerRef}
      />
      <div className="mt-2 text-sm">
        Current Time: {Math.floor(currentTime)} seconds
      </div>
    </div>
  );
};
