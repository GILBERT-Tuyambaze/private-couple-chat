/**
 * frontend/src/components/LockScreen.jsx
 * PIN lock overlay. Any 4-digit PIN unlocks for demo purposes.
 * In production: store hashed PIN in localStorage.
 */

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function LockScreen({ onUnlock }) {
  const { C, theme } = useTheme();
  const [pin, setPin] = useState("");

  const press = (k) => {
    if (k === "⌫") { setPin(p => p.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      // In production: compare hash. Here any 4-digit PIN works.
      setTimeout(() => { setPin(""); onUnlock(); }, 300);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: theme === "dark"
        ? "radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f0f 100%)"
        : "radial-gradient(ellipse at center, #ffe4ec 0%, #f2c7c7 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        textAlign: "center",
        background: theme === "dark" ? "rgba(30,30,30,0.95)" : "rgba(255,255,255,0.95)",
        borderRadius: 28,
        padding: "48px 40px",
        width: 320,
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        border: `1px solid ${C.border}`,
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "Georgia, serif" }}>App Locked</div>
        <div style={{ fontSize: 13, color: C.subtext, margin: "8px 0 32px" }}>Enter your PIN to continue</div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: "50%",
              background: pin.length > i ? C.accentHex : C.border,
              transition: "background 0.2s, transform 0.2s",
              transform: pin.length > i ? "scale(1.2)" : "scale(1)",
            }} />
          ))}
        </div>

        {/* Keypad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 220, margin: "0 auto 24px" }}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
            <button key={i} onClick={() => k !== "" && press(String(k))}
              style={{
                padding: "16px 0",
                borderRadius: 14,
                border: `1.5px solid ${C.border}`,
                background: k === "" ? "transparent"
                  : theme === "dark" ? "#2a2a2a" : "#fafafa",
                color: C.text,
                fontSize: 20,
                cursor: k === "" ? "default" : "pointer",
                fontFamily: "Georgia, serif",
                transition: "background 0.1s, transform 0.1s",
                visibility: k === "" ? "hidden" : "visible",
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.94)"}
              onMouseUp={e   => e.currentTarget.style.transform = "scale(1)"}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Biometric shortcuts */}
        <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
          {[["👆", "Touch ID"], ["😊", "Face ID"]].map(([icon, label]) => (
            <button key={label} onClick={onUnlock} style={{
              background: "none", border: "none",
              color: C.accentHex, cursor: "pointer",
              fontSize: 13, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4,
            }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
