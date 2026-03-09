/**
 * frontend/src/context/AuthContext.jsx
 * Provides current user, login, logout, and token management.
 */

import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";
import { initSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    const saved = localStorage.getItem("cc_user");
    if (token && saved) {
      setUser(JSON.parse(saved));
      initSocket(token);
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    const saved = localStorage.getItem("cc_user");
    if (token && saved) {
      setUser(JSON.parse(saved));
      initSocket(token);  // reconnect socket
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { token, user } = await api.login({ username, password });
    localStorage.setItem("cc_token", token);
    localStorage.setItem("cc_user",  JSON.stringify(user));
    setUser(user);
    initSocket(token);
    return user;
  };

  const register = async (username, password, display_name) => {
    const { token, user } = await api.register({ username, password, display_name });
    localStorage.setItem("cc_token", token);
    localStorage.setItem("cc_user",  JSON.stringify(user));
    setUser(user);
    initSocket(token);
    return user;
  // Call this after updating profile to sync latest data
  const refreshUser = useCallback(async () => {
    try {
      const { user: fresh } = await api.getProfile();
      localStorage.setItem("cc_user", JSON.stringify(fresh));
      setUser(fresh);
    } catch (e) {
      console.error("refreshUser failed:", e);
    }
  }, []);

  };

  const logout = () => {
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_user");
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
