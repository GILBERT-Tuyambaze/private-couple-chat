/**
 * frontend/src/utils/socket.js
 * Socket.IO client singleton.
 * Call init(token) once after login. Then import { socket } anywhere.
 */

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket = null;

export function initSocket(token) {
  if (socket) socket.disconnect();

  socket = io(SOCKET_URL, {
    auth:              { token },
    transports:        ["websocket", "polling"],
    reconnectionDelay: 1000,
  });

  socket.on("connect",          () => console.log("🔌 Socket connected", socket.id));
  socket.on("disconnect",       () => console.log("🔌 Socket disconnected"));
  socket.on("connect_error",    (e) => console.error("Socket error:", e.message));

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
