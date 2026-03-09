/**
 * frontend/src/components/ChatArea.jsx
 * The central chat panel with messages, typing indicator, emoji picker, and input.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import { useTheme    } from "../context/ThemeContext";
import { useAuth     } from "../context/AuthContext";
import { useMessages } from "../context/MessagesContext";

const EMOJIS = ["❤️","😘","🥰","😍","💕","✨","🌸","🥺","😊","💫","🌙","☀️","🌊","🦋","🌺","🎉","😂","🫶"];
const QUICK_REACTIONS = ["❤️","😍","😂","😢","👍"];

export default function ChatArea({ partner, onToggleProfile }) {
  const { C, theme }         = useTheme();
  const { user }             = useAuth();
  const { messages, typing, partnerOnline, sendMessage, emitTyping, toggleReaction } = useMessages();

  const [input,    setInput]    = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [uploading, setUploading] = useState(false);

  const typingTimer = useRef(null);
  const endRef      = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleInput = (val) => {
    setInput(val);
    emitTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(false), 2000);
  };


  const handleSend = useCallback(async () => {
    if (!input.trim() || !user) return;
    await sendMessage(input.trim(), user._id);
    setInput("");
    setShowEmoji(false);
    emitTyping(false);
  }, [input, sendMessage, user && user._id, emitTyping]);

  // Handle file/image upload and send as message
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await api.uploadFile(file);
      // Send as a message with fileUrl and fileType
      await sendMessage("", user._id, uploaded.url, uploaded.mimetype);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const s = {
    root: { flex: 1, display: "flex", flexDirection: "column", background: C.bg, minWidth: 0, minHeight: 0 },
    header: {
      padding: "16px 20px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", gap: 12,
      background: C.bg,
    },
    avatar: {
      width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${C.accentHex}, #ff6b9d)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18, position: "relative",
    },
    onlineDot: {
      width: 10, height: 10, borderRadius: "50%",
      background: "#4caf50", border: `2px solid ${C.bg}`,
      position: "absolute", bottom: 0, right: 0,
    },
    messages: {
      flex: 1, overflowY: "auto",
      padding: "20px 16px",
      display: "flex", flexDirection: "column", gap: 6,
      minHeight: 0,
      maxHeight: 'calc(100vh - 180px)',
    },
    inputArea: {
      padding: "12px 16px",
      borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", gap: 10,
      background: C.inputBg,
    },
    input: {
      flex: 1, padding: "11px 18px", borderRadius: 26,
      border: `1px solid ${C.border}`,
      background: C.bg, color: C.text,
      fontSize: 14, outline: "none",
      fontFamily: "Georgia, serif",
    },
    sendBtn: {
      width: 44, height: 44, borderRadius: "50%",
      background: C.accentHex, border: "none",
      cursor: "pointer", fontSize: 18, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 2px 14px rgba(0,188,212,0.45)`,
      transition: "transform 0.15s",
    },
    iconBtn: {
      width: 36, height: 36, borderRadius: "50%",
      border: "none", background: "transparent",
      cursor: "pointer", fontSize: 18, color: C.subtext,
    },
  };

  const renderMessage = (msg, idx) => {
    const isMe = msg.sender_id === user._id;
    return (
      <div key={msg._id || idx}
        onMouseEnter={() => setHoveredMsg(msg._id)}
        onMouseLeave={() => setHoveredMsg(null)}
        style={{
          display: "flex",
          flexDirection: isMe ? "row-reverse" : "row",
          alignItems: "flex-end", gap: 8,
          marginBottom: 2,
          animation: idx === messages.length - 1 ? "msgPop 0.3s ease" : "none",
          position: "relative",
        }}
      >
        {/* Partner avatar */}
        {!isMe && (
          <div style={{ ...s.avatar, width: 28, height: 28, fontSize: 14, flexShrink: 0 }}>
            {partner?.avatar || "🌸"}
          </div>
        )}

        <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
          {/* Bubble */}
          <div style={{
            background:   isMe ? C.sent : C.received,
            color:        "#1a1a1a",
            padding:      "10px 15px",
            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            fontSize:     14, lineHeight: 1.55,
            wordBreak:    "break-word",
            boxShadow:    "0 1px 4px rgba(0,0,0,0.09)",
            position:     "relative",
          }}>
            {/* Show image/file if present */}
            {msg.fileUrl && msg.fileType && msg.fileType.startsWith("image/") && (
              <img src={msg.fileUrl} alt="sent" style={{ maxWidth: 220, maxHeight: 220, borderRadius: 12, marginBottom: 6 }} />
            )}
            {msg.fileUrl && msg.fileType && !msg.fileType.startsWith("image/") && (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.accentHex, textDecoration: 'underline', marginBottom: 6, display: 'block' }}>
                📎 {msg.fileUrl.split('/').pop()}
              </a>
            )}
            {msg.text}

            {/* Hover reaction bar */}
            {hoveredMsg === msg._id && (
              <div style={{
                position: "absolute",
                [isMe ? "left" : "right"]: "calc(100% + 8px)",
                top: "50%", transform: "translateY(-50%)",
                background: theme === "dark" ? "#2a2a2a" : "#fff",
                border: `1px solid ${C.border}`,
                borderRadius: 22,
                padding: "5px 10px",
                display: "flex", gap: 4,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                zIndex: 10, whiteSpace: "nowrap",
              }}>
                {QUICK_REACTIONS.map(e => (
                  <span key={e} onClick={() => toggleReaction(msg._id, e)}
                    style={{ cursor: "pointer", fontSize: 17, padding: "1px 3px" }}>
                    {e}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reactions */}
          {msg.reactions?.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              {msg.reactions.map((r, i) => (
                <span key={i} style={{
                  background: theme === "dark" ? "#2a2a2a" : "#fff",
                  border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "2px 7px", fontSize: 13,
                }}>
                  {r.emoji || r}
                </span>
              ))}
            </div>
          )}

          {/* Timestamp + read receipt */}
          <div style={{ fontSize: 11, color: C.subtext, marginTop: 3, display: "flex", gap: 4, alignItems: "center" }}>
            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {isMe && <span style={{ color: msg.read ? C.accentHex : C.subtext }}>✓✓</span>}
          </div>
        </div>
      </div>
    );
  };

  // Loading skeleton for messages
  const loadingSkeleton = (
    <div style={{ padding: "20px 16px" }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          height: 22,
          width: `${60 + Math.random() * 40}%`,
          background: C.inputBg,
          borderRadius: 14,
          marginBottom: 10,
          animation: "pulse 1.2s infinite",
        }} />
      ))}
      <style>{`@keyframes pulse { 0%{opacity:0.5} 50%{opacity:1} 100%{opacity:0.5} }`}</style>
    </div>
  );

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  return (
    <div style={{
      ...s.root,
      ...(isMobile ? { minHeight: 'calc(100vh - 60px)', paddingBottom: 60 } : {})
    }} className={isMobile ? 'chatarea-mobile' : ''}>
      {/* Header */}
      <div style={{ ...s.header, ...(isMobile ? { padding: '10px 8px', fontSize: 13, gap: 6 } : {}) }}>
        <div style={s.avatar}>
          {partner?.avatar || "🌸"}
          {partner?.is_online && <div style={s.onlineDot} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.text, fontFamily: "Georgia, serif" }}>
            {partner?.display_name || partner?.username || "Partner"}
          </div>
          <div style={{ fontSize: 12, color: partner?.is_online ? '#4caf50' : '#bdbdbd', fontWeight: 600, marginTop: 2 }}>
            ● {partner?.is_online ? 'Online now' : `Away${partner?.last_seen ? ` · Last seen ${new Date(partner.last_seen).toLocaleString()}` : ''}`}
          </div>
        </div>
        <button style={s.iconBtn} title="Voice call">📞</button>
        <button style={{ ...s.iconBtn, color: C.accentHex }} title="Video call">🎥</button>
        <button style={s.iconBtn} onClick={onToggleProfile} title="Profile">👤</button>
      </div>

      {/* Messages */}
      <div style={{
        ...s.messages,
        ...(isMobile
          ? {
              padding: '10px 4px', fontSize: 13, gap: 3,
              maxHeight: 'calc(100vh - 210px)',
              minHeight: 0,
            }
          : {})
      }}>
        <div style={{ textAlign: "center", margin: "0 0 18px" }}>
          <span style={{ fontSize: 12, color: C.subtext, background: C.inputBg, padding: "4px 16px", borderRadius: 20 }}>Today</span>
        </div>
        {messages.length === 0 ? loadingSkeleton : messages.map((msg, idx) => renderMessage(msg, idx))}
        {/* Typing indicator */}
        {typing && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ ...s.avatar, width: 28, height: 28, fontSize: 14, flexShrink: 0 }}>
              {partner?.avatar || "🌸"}
            </div>
            <div style={{
              background: C.received, padding: "12px 16px",
              borderRadius: "18px 18px 18px 4px",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#666",
                  animation: "blink 1.4s infinite", animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{ padding: "10px 16px", background: C.inputBg, borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EMOJIS.map(e => (
            <span key={e} onClick={() => setInput(v => v + e)} style={{ fontSize: 22, cursor: "pointer" }}>{e}</span>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ ...s.inputArea, ...(isMobile ? { padding: '8px 4px', gap: 6 } : {}) }}>
        <label style={{ ...s.iconBtn, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }} title="Attach file/image">
          📎
          <input type="file" style={{ display: 'none' }} disabled={uploading} onChange={handleFileUpload} />
        </label>
        <button style={{ ...s.iconBtn, color: showEmoji ? C.accentHex : C.subtext }}
          onClick={() => setShowEmoji(v => !v)} title="Emoji">😊</button>
        <input
          style={{ ...s.input, ...(isMobile ? { fontSize: 13, padding: '8px 10px' } : {}) }}
          value={input}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={uploading ? "Uploading..." : "Write something sweet… 💌"}
          disabled={uploading}
        />
        <button style={{ ...s.sendBtn, ...(isMobile ? { width: 38, height: 38, fontSize: 16 } : {}) }} onClick={handleSend} disabled={uploading}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
          onMouseUp={e   => e.currentTarget.style.transform = "scale(1)"}>
          ➤
        </button>
      </div>
    </div>
  );
}
