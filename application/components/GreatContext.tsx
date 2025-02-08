"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useSocket } from "./SocketContext";
import { YouTubeTrack } from "@/types";
import YouTube from "react-youtube";

const greatContext = createContext<{
  playerRef: React.RefObject<YouTube>;
  video: React.RefObject<YouTubeTrack>;
  recievedCommand: React.RefObject<"play" | "pause">;
  recievedTime: React.RefObject<number>;
  recievedVideo: React.RefObject<YouTubeTrack>;
  similarTracks: React.RefObject<YouTubeTrack[]>;
  curIndex: React.RefObject<number>;
  isMyTrack: React.RefObject<boolean>;
  shouldPlay: React.RefObject<boolean>;
}>({
  playerRef: null,
  video: null,
  recievedCommand: null,
  recievedTime: null,
  recievedVideo: null,
  similarTracks: null,
  curIndex: null,
  isMyTrack: null,
  shouldPlay: null,
});
export const useGreat = () => useContext(greatContext);
export const GreatProvider = ({ children }) => {
  const { socket } = useSocket();
  const video = useRef<YouTubeTrack>({
    id: { videoId: "dQw4w9WgXcQ" },
    snippet: {
      title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
      channelTitle: "Rick Astley",
    },
  });
  const recievedVideo = useRef<YouTubeTrack>({
    id: { videoId: "dQw4w9WgXcQ" },
    snippet: {
      title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
      channelTitle: "Rick Astley",
    },
  });
  const recievedTime = useRef<number>(null);
  const playerRef = useRef<YouTube>(null);
  const recievedCommand = useRef<"play" | "pause">(null);
  const similarTracks = useRef<YouTubeTrack[]>([]);
  const curIndex = useRef<number>(0);
  const isMyTrack = useRef<boolean>(true);
  const shouldPlay = useRef<boolean>(false);

  useEffect(() => {
    if (!socket || !playerRef.current) return;

    socket.on("play-client", async ({ sender, video: video2, time }) => {
      console.log("play-client");
      if (sender === socket.id) return;
      const curTime = await playerRef.current.internalPlayer.getCurrentTime();
      if (
        (await playerRef.current.internalPlayer.getPlayerState()) === 1 &&
        video.current.id.videoId === video2.id.videoId &&
        curTime &&
        Math.abs(curTime - time) < 5
      )
        return;
      if (
        video.current.id.videoId === video2.id.videoId &&
        playerRef.current.internalPlayer.getPlayerState() === -1
      ) {
        await playerRef.current.internalPlayer.loadVideoById(
          video.current.id.videoId,
          time
        );
      }
      if (video.current.id.videoId !== video2.id.videoId) {
        isMyTrack.current = false;
        video.current = video2;
        recievedVideo.current = video2;
        await playerRef.current.internalPlayer.loadVideoById(
          video.current.id.videoId,
          time
        );
      } else if (Math.abs(curTime - time) > 5) {
        await playerRef.current.internalPlayer.seekTo(time);
      }
      await playerRef.current.internalPlayer.playVideo();
      recievedTime.current = time;
      recievedCommand.current = "play";
      shouldPlay.current = true;
    });

    socket.on("pause-client", async ({ sender, time }) => {
      if (sender === socket.id) return;
      await playerRef.current.internalPlayer.seekTo(time);
      await playerRef.current.internalPlayer.pauseVideo();
      recievedTime.current = time;
      recievedCommand.current = "pause";
    });

    socket.on("joined-room", async ({ roomId, sender }) => {
      if (sender === socket.id) return;
      let curTime = await playerRef.current.internalPlayer.getCurrentTime();
      if ((await playerRef.current.internalPlayer.getPlayerState()) === 1) {
        socket.emit("play", {
          roomId,
          time: curTime,
          video: video.current,
          to: sender,
        });
      } else {
        socket.emit("pause", {
          roomId,
          time: curTime,
          to: sender,
        });
      }
    });
    return () => {
      socket.off("play-client");
      socket.off("pause-client");
      socket.off("joined-room");
    };
  }, [socket, playerRef.current]);

  function setSimilarTracks(tracks) {
    similarTracks.current = tracks;
  }

  return (
    <greatContext.Provider
      value={{
        playerRef,
        video,
        recievedCommand,
        recievedTime,
        recievedVideo,
        similarTracks,
        curIndex,
        isMyTrack,
        shouldPlay,
      }}
    >
      {children}
    </greatContext.Provider>
  );
};
