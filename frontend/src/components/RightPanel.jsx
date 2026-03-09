/**
 * frontend/src/components/RightPanel.jsx
 * Shows partner profile, shared memories and files.
 */

import { useTheme } from "../context/ThemeContext";

const PHOTOS = [
  { id: 1, emoji: "🌅", label: "Sunset walk" },
  { id: 2, emoji: "🍰", label: "Our cake"    },
  { id: 3, emoji: "🌸", label: "Cherry blossom" },
  { id: 4, emoji: "🏖️", label: "Beach day"   },
  { id: 5, emoji: "☕", label: "Morning coffee" },
  { id: 6, emoji: "🌃", label: "City lights"  },
];

export default function RightPanel({ partner }) {
  const { C } = useTheme();
  // Helper to check if avatar is a URL
  const isAvatarUrl = (val) => typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/') || val.match(/\.(jpg|jpeg|png|gif|webp)$/i));

  const s = {
    root: {
      width: 260, flexShrink: 0,
      background: C.panelBg,
      borderLeft: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      padding: "24px 18px",
      overflowY: "auto",
      ...(typeof window !== 'undefined' && window.innerWidth <= 600 ? {
        width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 200, minHeight: '100vh', borderLeft: 'none', borderTop: `1px solid ${C.border}`, padding: '16px 4vw', background: C.panelBg,
      } : {})
    },
    avatar: {
      width: 72, height: 72, borderRadius: "50%",
      background: `linear-gradient(135deg, ${C.accentHex}, #ff6b9d)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 36, margin: "0 auto 14px",
      boxShadow: `0 4px 16px rgba(0,188,212,0.3)`,
    },
    callBtn: {
      flex: 1, padding: "10px 0",
      borderRadius: 12, border: "none",
      background: C.accentHex, color: "#fff",
      fontSize: 13, cursor: "pointer",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 4,
      fontFamily: "Georgia, serif",
      boxShadow: `0 2px 10px rgba(0,188,212,0.3)`,
    },
    sectionLabel: {
      fontSize: 12, fontWeight: 700,
      color: C.text, marginBottom: 10,
      textTransform: "uppercase", letterSpacing: "0.08em",
    },
    fileRow: {
      display: "flex", gap: 8, alignItems: "center",
      padding: "9px 11px", background: C.inputBg,
      borderRadius: 10, marginBottom: 6,
      border: `1px solid ${C.border}`,
      cursor: "pointer", fontSize: 13, color: C.text,
    },
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  return (
    <div style={s.root} className={isMobile ? 'rightpanel-mobile' : ''}>
      {/* Partner info */}
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={s.avatar}>
          {isAvatarUrl(partner?.avatar) ? (
            <img src={partner.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            partner?.avatar || "🌸"
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.text, fontFamily: "Georgia, serif" }}>
          {partner?.display_name || partner?.username || "Partner"}
        </div>
        <div style={{ fontSize: 13, color: C.subtext, marginTop: 2 }}>
          @{partner?.username}
        </div>
        <div style={{ fontSize: 12, color: partner?.is_online ? '#4caf50' : '#bdbdbd', marginTop: 4, fontWeight: 600 }}>
          ● {partner?.is_online ? 'Online now' : `Away${partner?.last_seen ? ` · Last seen ${new Date(partner.last_seen).toLocaleString()}` : ''}`}
        </div>
        {partner?.bio && (
          <div style={{ fontSize: 12, color: C.subtext, marginTop: 6, fontStyle: "italic" }}>
            {partner.bio}
          </div>
        )}
      </div>

      {/* Call buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 26 }}>
        {[["📞","Voice"],["🎥","Video"]].map(([icon, label]) => (
          <button key={label} style={s.callBtn}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Shared memories */}
      <div style={{ marginBottom: 22 }}>
        <div style={s.sectionLabel}>Shared Memories</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
          {PHOTOS.map(p => (
            <div key={p.id} style={{
              aspectRatio: "1",
              background: `linear-gradient(135deg,${C.sent}70,${C.received}70)`,
              borderRadius: 10,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              fontSize: 22, cursor: "pointer",
              border: `1px solid ${C.border}`,
            }}>
              {p.emoji}
              <div style={{ fontSize: 9, color: C.subtext, marginTop: 2 }}>{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared files */}
      <div style={{ marginBottom: 20 }}>
        <div style={s.sectionLabel}>Shared Files</div>
        {[["📄","Anniversary Plans.pdf"],["🎵","Our Playlist.m3u"]].map(([icon, name]) => (
          <div key={name} style={s.fileRow}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
          </div>
        ))}
      </div>

      {/* Security badge */}
      <div style={{
        padding: "10px 14px",
        background: `${C.accentHex}18`,
        border: `1px solid ${C.accentHex}40`,
        borderRadius: 12, fontSize: 12, color: C.subtext,
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <span style={{ fontSize: 16 }}>🔐</span>
        <span>End-to-end encrypted · Only you two can read this</span>
      </div>
    </div>
  );
}
