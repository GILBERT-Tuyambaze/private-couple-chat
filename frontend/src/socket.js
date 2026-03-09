import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const socket = io(SOCKET_URL, {
  autoConnect: false, // okay
});

export const connectSocket = (userId, partnerId) => {
  socket.auth = { userId };
  socket.connect();
  socket.emit("join_room", { userId, partnerId });
};