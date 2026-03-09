// ...existing code...
/**
 * frontend/src/utils/api.js
 * Thin wrapper around fetch for all REST calls to the backend.
 * Token is automatically attached from localStorage.
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("cc_token") || "";
}

/**
 * Generic request helper
 */
async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export const api = {
      // Connection requests
      sendConnectionRequest: (toUsername) => request('POST', '/api/connection/send', { toUsername }),
      getConnectionRequests: () => request('GET', '/api/connection/list'),
      acceptConnectionRequest: (requestId) => request('POST', '/api/connection/accept', { requestId }),
      declineConnectionRequest: (requestId) => request('POST', '/api/connection/decline', { requestId }),
      cancelConnectionRequest: (requestId) => request('POST', '/api/connection/cancel', { requestId }),
    // Partner
    getPartner: () => request("GET", "/api/users/me/partner"),

    // User search
    searchUsers: (query) => request("GET", `/api/users/search?q=${encodeURIComponent(query)}`),

    // Disconnect partner
    disconnectPartner: () => request("POST", "/api/users/disconnect"),
  // Auth
  register: (body) => request("POST", "/api/auth/register", body),
  login: (body) => request("POST", "/api/auth/login", body),

  // Messages
  getMessages: (partnerId) =>
    request("GET", `/api/messages?partner_id=${partnerId}`),

  sendMessage: (body) =>
    request("POST", "/api/messages/send", body),

  toggleReaction: (body) =>
    request("POST", "/api/messages/reaction", body),

  markRead: (body) =>
    request("POST", "/api/messages/read", body),

  // File/image upload
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE}/api/files/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.file;
  },
  getUser: (id) =>
    request("GET", `/api/users/${id}`),

  getProfile: () =>
    request("GET", "/api/users/me/profile"),
};