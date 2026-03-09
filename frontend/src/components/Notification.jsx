/**
 * frontend/src/components/Notification.jsx
 * Slide-in toast notification.
 */

import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Notification({ message, onDismiss }) {
  const { C } = useTheme();

  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div onClick={onDismiss} style={{
      position: "fixed", top: 20, right: 20, zIndex: 500,
      background: C.accentHex, color: "#fff",
      padding: "14px 22px", borderRadius: 16,
      fontSize: 14, fontFamily: "Georgia, serif",
      boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
      cursor: "pointer",
      animation: "slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      display: "flex", alignItems: "center", gap: 10,
      maxWidth: 320,
    }}>
      <span style={{ fontSize: 20 }}>💌</span>
      <span>{message}</span>
    </div>
  );
}
