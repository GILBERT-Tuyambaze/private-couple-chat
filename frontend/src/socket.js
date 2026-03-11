import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL; // use the same env variable

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = (userId, partnerId) => {
  socket.auth = { userId };
  socket.connect();
  socket.emit("join_room", { userId, partnerId });
};
