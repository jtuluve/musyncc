"use client";
import { io, Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";
const ioContext = createContext<{
  socket: Socket;
  roomId: string;
  setRoomId: (s: string) => any;
}>({ socket: null, roomId: "", setRoomId: null });
export const useSocket = () => useContext(ioContext);
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState("");
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <ioContext.Provider value={{ socket, roomId, setRoomId }}>
      {children}
    </ioContext.Provider>
  );
};
