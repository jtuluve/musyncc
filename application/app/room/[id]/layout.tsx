import { GreatProvider } from "@/components/GreatContext";
import { SocketProvider } from "@/components/SocketContext";

export default async function RoomLayout({ children }) {
  return (
    <SocketProvider>
      <GreatProvider>{children}</GreatProvider>
    </SocketProvider>
  );
}
