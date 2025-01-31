"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { YouTubeTrack } from "@/types";
import { useSocket } from "./SocketContext";

const playerContext = createContext<{
  video: YouTubeTrack;
  setVideo: (s: YouTubeTrack) => any;
  time: number;
  setTime: (s: number) => any;
  lastRecievedVideo: YouTubeTrack;
  setLastRecievedVideo: (s: YouTubeTrack) => any;
  autoplay: 1 | 0;
  setAutoplay: (s: 1 | 0) => any;
  lastRecievedTime: number;
  setLastRecievedTime: (s: number) => any;
  playing: boolean;
  setPlaying: (s: boolean) => any;
  isSyncing: boolean;
  setIsSyncing: (b: boolean) => void;
}>({
  video: null,
  setVideo: null,
  time: 0,
  setTime: null,
  lastRecievedVideo: null,
  setLastRecievedVideo: null,
  autoplay: 1,
  setAutoplay: null,
  lastRecievedTime: 0,
  setLastRecievedTime: null,
  playing: false,
  setPlaying: null,
  isSyncing: false,
  setIsSyncing: null
});
export const usePlayer = () => useContext(playerContext);
export const PlayerProvider = ({ children }) => {
  const [lastRecievedVideo, setLastRecievedVideo] =
    useState<YouTubeTrack>(null);
  const [video, setVideo] = useState<YouTubeTrack>(null);
  const [time, setTime] = useState(0);
  const [lastRecievedTime, setLastRecievedTime] = useState(0);
  const [autoplay, setAutoplay] = useState<1 | 0>(1);
  const [playing, setPlaying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { socket, roomId } = useSocket();


  useEffect(() => {
    if (!socket) return;
  
    const handlePlayClient = ({ sender, time: time2, video: video2 }) => {
      if (sender === socket.id) return;
      
      setIsSyncing(true);
      // Only update if video is different or time difference is significant
      if (video2?.id?.videoId !== video?.id?.videoId || Math.abs(time2 - time) > 0.5) {
        setVideo(video2);
        setTime(time2);
      }
      setAutoplay(1);
      setTimeout(() => setIsSyncing(false), 100); // Reset sync flag
    };
  
    const handlePauseClient = ({ sender, time: time2 }) => {
      if (sender === socket.id) return;
      
      setIsSyncing(true);
      if (Math.abs(time2 - time) > 0.5) {
        setTime(time2);
      }
      setAutoplay(0);
      setTimeout(() => setIsSyncing(false), 100);
    };
  
    socket.on("play-client", handlePlayClient);
    socket.on("pause-client", handlePauseClient);
  
    return () => {
      socket.off("play-client", handlePlayClient);
      socket.off("pause-client", handlePauseClient);
    };
  }, [socket, video, time]);
  

  return (
    <playerContext.Provider
      value={{
        video,
        setVideo,
        time,
        setTime,
        lastRecievedVideo,
        setLastRecievedVideo,
        autoplay,
        setAutoplay,
        lastRecievedTime,
        setLastRecievedTime,
        playing,
        setPlaying,
        isSyncing,
        setIsSyncing
      }}
    >
      {children}
    </playerContext.Provider>
  );
};
