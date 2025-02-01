"use client";

import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { useSocket } from "./SocketContext";
import { useGreat } from "./GreatContext";

export const Player = () => {
  const {
    video,
    playerRef,
    recievedCommand,
    recievedTime,
    curIndex,
    similarTracks,
    isMyTrack,
    recievedVideo,
  } = useGreat();
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
  const videoTitleRef = useRef<HTMLDivElement>(null);

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
          inputRef.current.value = time?.toString() || 0;
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
    console.log(event.data);
    const curTime = await playerRef.current.internalPlayer.getCurrentTime();
    // Update frontend
    if (event.data === 1) {
      playingRef.current = true;
      if (buttonRef.current)
        buttonRef.current.innerHTML =
          '<img src="/pause.svg" className="h-6 w-6" alt="pause" />';
      if (videoTitleRef.current)
        videoTitleRef.current.textContent = video.current.snippet.title;
      //update ui of volume button
      let isMuted = await playerRef.current.internalPlayer.isMuted();
      if (isMuted && volumeButtonRef.current) {
        volumeButtonRef.current.innerHTML =
          '<img src="/volume-off.svg" className="h-6 w-6" alt="mute" />';
      } else if (!isMuted && volumeButtonRef.current) {
        volumeButtonRef.current.innerHTML =
          '<img src="/volume-2.svg" className="h-6 w-6" alt="volume" />';
      }
    } else if (event.data === 2) {
      playingRef.current = false;
      if (buttonRef.current)
        buttonRef.current.innerHTML =
          '<img src="/play.svg" className="h-6 w-6" alt="play" />';
    } else if (event.data === 0 && isMyTrack.current) {
      handleNext();
    } else if (event.data === 5) {
      await playerRef.current.internalPlayer.playVideo();
    }

    let dur = await playerRef.current.internalPlayer.getDuration();
    durationRef.current = dur;
    if (inputRef.current) {
      inputRef.current.max = dur?.toString() || 0;
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
        Math.abs(curTime - recievedTime.current) > 5 ||
        recievedVideo.current?.id.videoId !== video.current.id.videoId)
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
      if (buttonRef.current)
        buttonRef.current.innerHTML =
          '<img src="/pause.svg" className="h-6 w-6" alt="pause" />';
    } else {
      await playerRef.current.internalPlayer.playVideo();
      playingRef.current = true;
      if (buttonRef.current)
        buttonRef.current.innerHTML =
          '<img src="/play.svg" className="h-6 w-6" alt="play" />';
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

  const handlePrev = async () => {
    if (!playerRef.current?.internalPlayer || !isMyTrack.current) return;
    video.current =
      similarTracks.current[
        (curIndex.current == 0
          ? similarTracks.current?.length - 1
          : curIndex.current--) % similarTracks.current?.length
      ];
    await playerRef.current.internalPlayer.loadVideoById(
      video.current.id.videoId
    );
    await playerRef.current.internalPlayer.playVideo();
    if (videoTitleRef.current)
      videoTitleRef.current.innerText = video.current.snippet.title;
  };

  const handleNext = async () => {
    if (!similarTracks.current?.length || !isMyTrack.current) return;
    console.log(similarTracks);
    video.current =
      similarTracks.current[curIndex.current++ % similarTracks.current?.length];
    await playerRef.current.internalPlayer.loadVideoById(
      video.current.id.videoId
    );
    if (videoTitleRef.current)
      videoTitleRef.current.innerText = video.current.snippet.title;
  };

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
          ? `<img src="/volume-off.svg" alt="Muted" class="w-5 h-5" />`
          : `<img src="/volume-2.svg" alt="Unmuted" class="w-5 h-5" />`;
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
      <div className="sticky bottom-0 left-0 w-full bg-indigo-900/95 backdrop-blur-md border-t border-purple-400/20">
        {/* Slider at the top */}
        <div className="w-full px-4 pt-2">
          <input
            type="range"
            min="0"
            ref={inputRef}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-purple-300/20 rounded-lg appearance-none cursor-pointer"
            max={durationRef.current}
          />
        </div>

        {/* Controls container */}
        <div className="flex items-center justify-between p-4">
          {/* Left side - Video Info */}
          <div className="flex-1 min-w-0 pr-4">
            <div
              ref={videoTitleRef}
              className="text-sm font-medium text-purple-200 truncate"
            >
              {video.current?.snippet?.title || "No video playing"}
            </div>
            <div ref={timeSpanRef} className="text-xs text-purple-400">
              0:00 / 0:00
            </div>
          </div>

          {/* Center - Play controls */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 text-purple-300 hover:text-white transition-colors"
              onClick={handlePrev}
            >
              <img src="/skip-back.svg" alt="prev" className="h-6 w-6" />
            </button>

            <button
              ref={buttonRef}
              onClick={togglePlayPause}
              className="p-3 text-white bg-purple-500 hover:bg-purple-600 rounded-full transition-colors"
            >
              {playingRef.current ? (
                <img src="/pause.svg" className="h-6 w-6" alt="pause" />
              ) : (
                <img src="/play.svg" className="h-6 w-6" alt="play" />
              )}
            </button>

            <button
              className="p-2 text-purple-300 hover:text-white transition-colors"
              onClick={handleNext}
            >
              <img src="/skip-forward.svg" className="h-6 w-6" alt="next" />
            </button>
          </div>

          {/* Right side - Volume control */}
          <div className="flex-1 min-w-0 pl-4 flex justify-end">
            <button
              ref={volumeButtonRef}
              onClick={toggleMute}
              className="p-2 text-purple-300 hover:text-white transition-colors"
            >
              <img src="/volume-2.svg" alt="Volume" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
