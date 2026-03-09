/**
 * frontend/src/components/MyProfile.jsx
 * Editable profile panel for the logged-in user.
 * Allows changing: display name, avatar emoji, bio, password.
 */

import { useState } from "react";
import { useAuth  } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api }      from "../utils/api";

const AVATAR_OPTIONS = [
  "💫","🌸","🦋","🌙","☀️","🌺","🍀","🌻","🦊","🐬",
  "🌈","🎀","💎","🔥","🌊","🍓","🌷","🦄","🐝","🌿",
  "🎸","🎨","🏔️","🌴","🦁","🐙","🍮","🎭","🚀","💖",
];

export default function MyProfile({ onClose, onSave }) {
  const { user }    = useAuth();
  const { C, theme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [avatar,      setAvatar]      = useState(user?.avatar || "💫");
  const [uploading,   setUploading]   = useState(false);
  const [bio,         setBio]         = useState(user?.bio || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [tab,         setTab]         = useState("profile"); // profile | security

  const save = async () => {
    setError(""); setSuccess("");

    if (tab === "security") {
      if (!newPassword) return setError("Enter a new password.");
      if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
      if (newPassword !== confirmPass) return setError("Passwords don't match.");
      // Password change would need a backend endpoint — show info for now
      setSuccess("Password change requires a backend /api/auth/change-password endpoint (not yet implemented). Other profile changes saved!");
    }

    setSaving(true);
    try {
      await api.updateProfile({ display_name: displayName, avatar, bio });
      await onSave(); // refreshUser in AuthContext
      setSuccess("Profile saved! ✨");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar image upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await api.uploadFile(file);
      setAvatar(uploaded.url);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const isAvatarUrl = typeof avatar === 'string' && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/uploads/') || avatar.match(/\.(jpg|jpeg|png|gif|webp)$/i));

  const s = {
    overlay: {
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    card: {
      background: theme === "dark" ? "#1e1e1e" : "#fff",
      borderRadius: 28, width: 420, maxHeight: "90vh",
      overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
      border: `1px solid ${C.border}`, fontFamily: "Georgia, serif",
    },
    header: {
      background: `linear-gradient(135deg, ${C.sidebar}, ${C.received})`,
      padding: "32px 28px 24px", textAlign: "center",
      borderRadius: "28px 28px 0 0", position: "relative",
    },
    avatarBig: {
      width: 88, height: 88, borderRadius: "50%", fontSize: 44,
      background: `linear-gradient(135deg, ${C.accentHex}, #ff6b9d)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 12px",
      boxShadow: `0 4px 20px rgba(0,188,212,0.4)`,
      overflow: 'hidden', position: 'relative',
    },
    avatarImg: {
      width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block',
    },
    avatarUploadBtn: {
      margin: '0 auto 12px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    closeBtn: {
      position: "absolute", top: 16, right: 16,
      background: "rgba(255,255,255,0.3)", border: "none",
      borderRadius: "50%", width: 32, height: 32,
      cursor: "pointer", fontSize: 16, color: C.text,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    body: { padding: "24px 28px 28px" },
    tabs: {
      display: "flex", gap: 4, marginBottom: 24,
      background: C.inputBg, borderRadius: 12, padding: 4,
    },
    tab: (active) => ({
      flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
      background: active ? C.accentHex : "transparent",
      color: active ? "#fff" : C.subtext,
      cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif",
      fontWeight: active ? 700 : 400,
      transition: "all 0.2s",
    }),
    label: { fontSize: 12, fontWeight: 700, color: C.subtext,
    },
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.avatarBig}>
            {isAvatarUrl ? (
              <img src={avatar} alt="avatar" style={s.avatarImg} />
            ) : (
              avatar
            )}
          </div>
          <div style={s.avatarUploadBtn}>
            <label style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1, fontSize: 13, color: C.accentHex, fontWeight: 600 }}>
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={handleAvatarUpload} />
            </label>
            <span style={{ fontSize: 11, color: C.subtext, marginTop: 2 }}>or pick an emoji below</span>
          </div>
          <button style={s.closeBtn} onClick={onClose}>×</button>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{displayName || user?.username}</div>
        </div>
        <div style={s.body}>
          <div style={s.tabs}>
            <button style={s.tab(tab === "profile")}
              onClick={() => setTab("profile")}>Profile</button>
            <button style={s.tab(tab === "security")}
              onClick={() => setTab("security")}>Security</button>
          </div>

          {tab === "profile" && (
            <>
              <div style={s.label}>Display Name</div>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }} />

              <div style={s.label}>Avatar</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {AVATAR_OPTIONS.map(opt => (
                  <button key={opt} style={{
                    width: 36, height: 36, borderRadius: "50%", border: avatar === opt ? `2px solid ${C.accentHex}` : `1px solid ${C.border}`,
                    fontSize: 20, background: avatar === opt ? C.accentHex : "#fff", color: avatar === opt ? "#fff" : C.text,
                    cursor: "pointer", margin: 0,
                  }} onClick={() => setAvatar(opt)}>{opt}</button>
                ))}
              </div>

              <div style={s.label}>Bio</div>
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                style={{ width: "100%", minHeight: 60, marginBottom: 12, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }} />
            </>
          )}

          {tab === "security" && (
            <>
              <div style={s.label}>New Password</div>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }} />

              <div style={s.label}>Confirm Password</div>
              <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }} />
            </>
          )}

          {error && <div style={{ color: "#d32f2f", marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: "#388e3c", marginBottom: 8 }}>{success}</div>}

          <button onClick={save} disabled={saving}
            style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: C.accentHex, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", marginTop: 8 }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
