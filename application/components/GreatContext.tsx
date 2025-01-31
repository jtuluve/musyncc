"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useSocket } from "./SocketContext";
import { YouTubeTrack } from "@/types";
import YouTube from "react-youtube";

const greatContext = createContext({
  playerRef: null,
  video: null,
  recievedCommand: null,
  recievedTime: null,
  recievedVideo: null,
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

  useEffect(() => {
    if (!socket || !playerRef.current) return;

    socket.on("play-client", async ({ sender, video: video2, time }) => {
      console.log("play-client");
      if (sender === socket.id) return;
      const curTime = await playerRef.current.internalPlayer.getCurrentTime();
      if (
        (await playerRef.current.internalPlayer.getPlayerState()) === 1 &&
        video.current.id.videoId === video2.id.videoId &&
        Math.abs(curTime - time) < 5
      )
        return;
      if (
        video.current.id.videoId === video2.id.videoId &&
        playerRef.current.internalPlayer.getPlayerState() === -1
      ) {
        await playerRef.current.internalPlayer.load;
      }
      if (video.current.id.videoId !== video2.id.videoId) {
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

  return (
    <greatContext.Provider
      value={{
        playerRef,
        video,
        recievedCommand,
        recievedTime,
        recievedVideo,
      }}
    >
      {children}
    </greatContext.Provider>
  );
};
