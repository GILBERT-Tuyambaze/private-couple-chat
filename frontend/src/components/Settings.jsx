/**
 * frontend/src/components/Settings.jsx
 */

import { useTheme } from "../context/ThemeContext";
import { useAuth  } from "../context/AuthContext";

export default function Settings({ onClose, onLock }) {
  const { C, theme, toggle } = useTheme();
  const { logout } = useAuth();

  const rows = [
    { icon: "🌙", label: "Dark Mode",      sub: `Currently ${theme}`,              action: toggle },
    { icon: "🔒", label: "App Lock",       sub: "Set PIN / biometrics",            action: () => { onClose(); onLock(); } },
    { icon: "🔐", label: "Encryption",     sub: "End-to-end · active",             action: null },
    { icon: "🔔", label: "Notifications",  sub: "Push & badges · on",              action: null },
    { icon: "🚪", label: "Log Out",        sub: "Sign out of your account",        action: () => { onClose(); logout(); } },
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 400,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme === "dark" ? "#1e1e1e" : "#fff",
        borderRadius: 26, padding: "36px 32px",
        width: 360, boxShadow: "0 24px 72px rgba(0,0,0,0.3)",
        border: `1px solid ${C.border}`,
        fontFamily: "Georgia, serif",
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 22 }}>
          ⚙️ Settings
        </div>

        {rows.map(({ icon, label, sub, action }) => (
          <div key={label} onClick={action || undefined} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "15px 0", borderBottom: `1px solid ${C.border}`,
            cursor: action ? "pointer" : "default",
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 14, color: C.text }}>{label}</div>
                <div style={{ fontSize: 12, color: C.subtext, marginTop: 2 }}>{sub}</div>
              </div>
            </div>
            {action && <span style={{ color: C.accentHex, fontSize: 20 }}>›</span>}
          </div>
        ))}

        <button onClick={onClose} style={{
          marginTop: 24, width: "100%", padding: 13, borderRadius: 14,
          background: C.accentHex, border: "none", color: "#fff",
          fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif",
          boxShadow: `0 4px 14px rgba(0,188,212,0.35)`,
        }}>
          Done
        </button>
      </div>
    </div>
  );
}
