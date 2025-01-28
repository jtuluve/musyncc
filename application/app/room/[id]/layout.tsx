import { SocketProvider } from "@/components/SocketContext";

export default async function RoomLayout({ children }) {
  return <SocketProvider>{children}</SocketProvider>;
}
