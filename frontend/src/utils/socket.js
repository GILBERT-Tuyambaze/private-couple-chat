// frontend/src/utils/socket.js
/**
 * Socket.IO client singleton.
 * Call initSocket(token) once after login. Then import { getSocket } anywhere.
 */

import { io } from "socket.io-client";

// Remove trailing slash to prevent double slashes
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, '');

let socket = null;

/**
 * Initialize Socket.IO client with token
 * @param {string} token - JWT token for authentication
 * @returns {Socket} - Socket.IO instance
 */
export function initSocket(token) {
  if (socket) socket.disconnect();

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => console.log("🔌 Socket connected", socket.id));
  socket.on("disconnect", () => console.log("🔌 Socket disconnected"));
  socket.on("connect_error", (err) => console.error("Socket error:", err.message));

  return socket;
}

/**
 * Get the current socket instance
 */
export function getSocket() {
  return socket;
}

/**
 * Disconnect the socket and reset
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
