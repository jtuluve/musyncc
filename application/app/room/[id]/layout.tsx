import { GreatProvider } from "@/components/GreatContext";
import { PlayerProvider } from "@/components/PlayerContext";
import { SocketProvider } from "@/components/SocketContext";

export default async function RoomLayout({ children }) {
  return (
    <SocketProvider>
      <GreatProvider>{children}</GreatProvider>
    </SocketProvider>
  );
}
