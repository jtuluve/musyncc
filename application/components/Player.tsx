"use client";

import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { useSocket } from "./SocketContext";
import { useGreat } from "./GreatContext";

export const Player = () => {
  const { video, playerRef, recievedCommand, recievedTime } = useGreat();
  const { socket, roomId } = useSocket();

  const playingRef = useRef(false);
  const durationRef = useRef(0);
  const currentTimeRef = useRef(0);
  const isMutedRef = useRef(false);
  const volumeRef = useRef(1);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeSpanRef = useRef<HTMLDivElement>(null);
  const volumeButtonRef = useRef<HTMLButtonElement>(null);

  let videoId = video.current.id?.videoId;
  const opts = {
    height: "200",
    width: "100%",
    playerVars: {
      autoplay: playingRef.current ? 1 : 0,
      controls: 1,
      modestbranding: 1,
    },
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (playingRef.current && playerRef.current?.internalPlayer) {
        const time = await playerRef.current.internalPlayer.getCurrentTime();
        currentTimeRef.current = time;

        if (inputRef.current) {
          inputRef.current.value = time.toString();
        }
        if (timeSpanRef.current) {
          timeSpanRef.current.textContent = `${Math.floor(
            currentTimeRef.current / 60
          )}:${Math.floor(currentTimeRef.current % 60)} / ${Math.floor(
            durationRef.current / 60
          )}:${Math.floor(durationRef.current % 60)}`;
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStateChange: YouTubeProps["onStateChange"] = async (event) => {
    const curTime = await playerRef.current.internalPlayer.getCurrentTime();
    // Update frontend
    if (event.data === 1) {
      playingRef.current = true;
      if (buttonRef.current) buttonRef.current.textContent = "Pause";
    } else if (event.data === 2) {
      playingRef.current = false;
      if (buttonRef.current) buttonRef.current.textContent = "Play";
    }

    let dur = await playerRef.current.internalPlayer.getDuration();
    durationRef.current = dur;
    if (inputRef.current) {
      inputRef.current.max = dur.toString();
    }
    if (timeSpanRef.current) {
      timeSpanRef.current.textContent = `${Math.floor(
        currentTimeRef.current / 60
      )}:${Math.floor(currentTimeRef.current % 60)} / ${Math.floor(
        durationRef.current / 60
      )}:${Math.floor(durationRef.current % 60)}`;
    }

    // Trigger event
    if (event.data === 2 && recievedCommand.current !== "pause") {
      recievedCommand.current = "pause";
      socket.emit("pause", { roomId, time: curTime });
    } else if (
      event.data === 1 &&
      (recievedCommand.current !== "play" ||
        Math.abs(curTime - recievedTime.current) > 5)
    ) {
      recievedCommand.current = "play";
      socket.emit("play", {
        roomId,
        time: curTime,
        video: video.current,
      });
    }
  };

  const togglePlayPause = async () => {
    if (!playerRef.current?.internalPlayer) return;

    if (playingRef.current) {
      await playerRef.current.internalPlayer.pauseVideo();
      playingRef.current = false;
      if (buttonRef.current) buttonRef.current.textContent = "Play";
    } else {
      await playerRef.current.internalPlayer.playVideo();
      playingRef.current = true;
      if (buttonRef.current) buttonRef.current.textContent = "Pause";
    }
  };

  const seekTo = async (time: number) => {
    if (!playerRef.current?.internalPlayer) return;

    await playerRef.current.internalPlayer.seekTo(time);
    currentTimeRef.current = time;

    if (inputRef.current) {
      inputRef.current.value = time.toString();
    }
    if (timeSpanRef.current) {
      timeSpanRef.current.textContent = `${Math.floor(
        currentTimeRef.current / 60
      )}:${Math.floor(currentTimeRef.current % 60)} / ${Math.floor(
        durationRef.current / 60
      )}:${Math.floor(durationRef.current % 60)}`;
    }
  };

  const handlePrev = async () => {};

  const handleNext = async () => {};

  const toggleMute = async () => {
    if (playerRef.current?.internalPlayer) {
      if (isMutedRef.current) {
        await playerRef.current.internalPlayer.unMute();
        await playerRef.current.internalPlayer.setVolume(volumeRef.current);
      } else {
        volumeRef.current = await playerRef.current.internalPlayer.getVolume();
        await playerRef.current.internalPlayer.mute();
      }
      isMutedRef.current = !isMutedRef.current;

      // Update the volume button icon
      if (volumeButtonRef.current) {
        volumeButtonRef.current.innerHTML = isMutedRef.current
          ? `<img src="https://unpkg.com/lucide-react@latest/dist/icons/volume-x.svg" alt="Muted" class="w-5 h-5" />`
          : `<img src="https://unpkg.com/lucide-react@latest/dist/icons/volume-2.svg" alt="Unmuted" class="w-5 h-5" />`;
      }
    }
  };

  return (
    <>
      <div className="hidden">
        <YouTube
          videoId={videoId}
          opts={opts}
          ref={playerRef}
          onStateChange={handleStateChange}
        />
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-gray-900/95 backdrop-blur-sm">
        {/* Slider at the top */}
        <div className="w-full px-4 pt-2">
          <input
            type="range"
            min="0"
            ref={inputRef}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm"
            max={durationRef.current}
          />
        </div>

        {/* Controls container */}
        <div className="flex items-center justify-between p-3">
          {/* Left side - Video Info */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="text-sm font-medium truncate">
              {video.current?.snippet?.title || "No video playing"}
            </div>
            <div ref={timeSpanRef} className="text-xs text-gray-400">
              0:00 / 0:00
            </div>
          </div>

          {/* Center - Play controls */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 text-gray-400 hover:text-white transition-colors"
              onClick={handlePrev}
            >
              <img
                src="https://unpkg.com/lucide-react@latest/dist/icons/skip-back.svg"
                alt="Previous"
                className="w-5 h-5"
              />
            </button>

            <button
              ref={buttonRef}
              onClick={togglePlayPause}
              className="p-2 text-white bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            >
              {playingRef.current ? (
                <img
                  src="https://unpkg.com/lucide-react@latest/dist/icons/pause.svg"
                  alt="Pause"
                  className="w-6 h-6"
                />
              ) : (
                <img
                  src="https://unpkg.com/lucide-react@latest/dist/icons/play.svg"
                  alt="Play"
                  className="w-6 h-6 pl-0.5"
                />
              )}
            </button>

            <button
              className="p-2 text-gray-400 hover:text-white transition-colors"
              onClick={handleNext}
            >
              <img
                src="https://unpkg.com/lucide-react@latest/dist/icons/skip-forward.svg"
                alt="Next"
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Right side - Volume control */}
          <div className="flex-1 min-w-0 pl-4 flex justify-end">
            <button
              ref={volumeButtonRef}
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <img
                src="https://unpkg.com/lucide-react@latest/dist/icons/volume-2.svg"
                alt="Volume"
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
