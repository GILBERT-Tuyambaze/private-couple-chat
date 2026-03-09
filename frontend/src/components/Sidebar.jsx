/**
 * frontend/src/components/Sidebar.jsx
 */

import { useTheme } from "../context/ThemeContext";
import { useAuth  } from "../context/AuthContext";

export default function Sidebar({ partner, onLock, onSettingsOpen, onConnectionClick, pendingCount }) {
  const { C, theme, toggle } = useTheme();
  const { user } = useAuth();
  // Helper to check if avatar is a URL
  const isAvatarUrl = (val) => typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads/') || val.match(/\.(jpg|jpeg|png|gif|webp)$/i));

  const s = {
    root: {
      width: 280, flexShrink: 0,
      background: C.sidebar,
      display: "flex", flexDirection: "column",
      borderRight: `1px solid ${C.border}`,
    },
    header: {
      padding: "22px 18px 14px",
      borderBottom: `1px solid ${C.border}`,
    },
    title: {
      fontSize: 19, fontWeight: "bold",
      color: C.text, fontFamily: "Georgia, serif",
      display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
    },
    search: {
      width: "100%", padding: "9px 14px", borderRadius: 22,
      border: `1px solid ${C.border}`, background: C.inputBg,
      color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box",
    },
    contact: {
      margin: "10px 12px", borderRadius: 16,
      background: "rgba(255,255,255,0.55)",
      border: `1px solid ${C.border}`,
      padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer",
    },
    avatar: {
      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${C.accentHex}, #ff6b9d)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, position: "relative",
      boxShadow: `0 2px 10px rgba(0,188,212,0.3)`,
    },
    onlineDot: {
      width: 11, height: 11, borderRadius: "50%",
      background: "#4caf50",
      border: `2.5px solid ${C.sidebar}`,
      position: "absolute", bottom: 0, right: 0,
    },
    footer: {
      marginTop: "auto", padding: "16px 12px",
      borderTop: `1px solid ${C.border}`,
      display: "flex", justifyContent: "space-around",
    },
    iconBtn: {
      width: 38, height: 38, borderRadius: "50%",
      border: "none", background: "transparent",
      cursor: "pointer", fontSize: 18, color: C.subtext,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.15s",
    },
  };

  // Responsive: show only footer (icon bar) on mobile, hide header/profile/contact
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  return (
    <div
      style={{
        ...s.root,
        ...(isMobile
          ? {
              width: '100vw',
              minHeight: 'unset',
              borderRight: 'none',
              borderBottom: `1px solid ${C.border}`,
              flexDirection: 'row',
              position: 'fixed',
              bottom: 0,
              left: 0,
              zIndex: 100,
              background: C.sidebar,
              height: 60,
              boxShadow: '0 -2px 10px #0001',
            }
          : {})
      }}
      role="navigation"
      aria-label="Sidebar"
      className={isMobile ? 'sidebar-mobile' : ''}
    >
      {/* Desktop: header, contact, profile */}
      {!isMobile && (
        <>
          <div style={s.header}>
            <div style={s.title}>
              <span aria-hidden="true">💌</span>
              <span>Us, Always</span>
            </div>
            <input style={s.search} placeholder="🔍  Search messages…" readOnly aria-label="Search messages" />
          </div>
          {/* Partner contact card */}
          {partner && (
            <div style={s.contact} tabIndex={0} role="button" aria-label={`Chat with ${partner.display_name || partner.username}`}> 
              <div style={s.avatar} aria-label="Partner avatar">
                {isAvatarUrl(partner.avatar) ? (
                  <img src={partner.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  partner.avatar || "🌸"
                )}
                <div style={s.onlineDot} aria-label={"Online status"} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
                    {partner.display_name || partner.username}
                  </span>
                  <span style={{ fontSize: 11, color: C.subtext }}>now</span>
                </div>
                <div style={{ fontSize: 12, color: C.subtext, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Tap to chat 💕
                </div>
              </div>
            </div>
          )}
          {/* My mini-profile */}
          {user && (
            <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ ...s.avatar, width: 32, height: 32, fontSize: 15 }} aria-label="My avatar">
                {isAvatarUrl(user.avatar) ? (
                  <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  user.avatar || "💫"
                )}
              </div>
              <div style={{ fontSize: 12, color: C.subtext }}>
                Logged in as <strong style={{ color: C.text }}>{user.display_name || user.username}</strong>
              </div>
            </div>
          )}
        </>
      )}
      {/* Footer: icon bar (always visible, mobile = only this) */}
      <div
        style={{
          ...s.footer,
          ...(isMobile
            ? {
                flex: 1,
                margin: 0,
                padding: 0,
                borderTop: 'none',
                borderRight: `1px solid ${C.border}`,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: C.sidebar,
                height: 60,
              }
            : {}),
        }}
      >
        <button
          style={{ ...s.iconBtn, ...(isMobile ? { width: 44, height: 44, fontSize: 22 } : {}) }}
          onClick={onConnectionClick}
          title="Connection Requests"
          aria-label="Connection Requests"
        >
          <span style={{ fontSize: 20, position: 'relative' }}>➕
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, background: '#d81b60', color: '#fff', borderRadius: '50%', fontSize: 11, padding: '2px 6px', fontWeight: 700
              }}>{pendingCount}</span>
            )}
          </span>
        </button>
        <button
          style={{ ...s.iconBtn, ...(isMobile ? { width: 44, height: 44, fontSize: 22 } : {}) }}
          onClick={onSettingsOpen}
          title="Settings"
          aria-label="Open settings"
        >
          ⚙️
        </button>
        <button
          style={{ ...s.iconBtn, ...(isMobile ? { width: 44, height: 44, fontSize: 22 } : {}) }}
          onClick={toggle}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button
          style={{ ...s.iconBtn, ...(isMobile ? { width: 44, height: 44, fontSize: 22 } : {}) }}
          onClick={onLock}
          title="Lock app"
          aria-label="Lock app"
        >
          🔒
        </button>
      </div>
    </div>
  );
}
