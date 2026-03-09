/**
 * frontend/src/screens/LoginScreen.jsx
 * Authentication screen with login / register toggle.
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [mode,    setMode]    = useState("login");
  const [form,    setForm]    = useState({ username: "", password: "", display_name: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await register(form.username, form.password, form.display_name);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    borderRadius: 14, border: "1.5px solid #e8c4c4",
    background: "#fdf0f0", color: "#1a1a1a",
    fontSize: 15, outline: "none",
    fontFamily: "Georgia, serif",
    boxSizing: "border-box", marginBottom: 14,
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 60% 40%, #ffe4ec, #f2c7c7 60%, #d5f3d8)",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.96)",
        borderRadius: 28, padding: "48px 40px",
        width: 380, boxShadow: "0 32px 80px rgba(0,0,0,0.15)",
        fontFamily: "Georgia, serif",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>💌</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a" }}>Us, Always</div>
          <div style={{ fontSize: 14, color: "#777", marginTop: 6 }}>Your private little world</div>
        </div>

        {mode === "register" && (
          <input style={inputStyle}
            placeholder="Display name (e.g. Your Name)"
            value={form.display_name}
            onChange={e => update("display_name", e.target.value)}
          />
        )}
        <input style={inputStyle}
          placeholder="Username"
          value={form.username}
          onChange={e => update("username", e.target.value)}
          autoComplete="username"
        />
        <input style={inputStyle}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => update("password", e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        {error && (
          <div style={{ color: "#c62828", fontSize: 13, marginBottom: 14, textAlign: "center" }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: 14, borderRadius: 16,
          background: "#00bcd4", border: "none", color: "#fff",
          fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "Georgia, serif", fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,188,212,0.4)",
          opacity: loading ? 0.7 : 1,
          transition: "transform 0.1s",
        }}>
          {loading ? "…" : mode === "login" ? "Sign In 💕" : "Create Account ✨"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#777" }}>
          {mode === "login" ? "New here?" : "Already have an account?"}
          {" "}
          <span onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }}
            style={{ color: "#00bcd4", cursor: "pointer", fontWeight: 600 }}>
            {mode === "login" ? "Create account" : "Sign in"}
          </span>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 24, padding: "12px 16px",
          background: "#f2c7c720", border: "1px solid #e8c4c4",
          borderRadius: 12, fontSize: 12, color: "#888", textAlign: "center",
        }}>
          <strong>💫 Hearts connect, one chat at a time.</strong><br></br>
           <strong>💖 Time is sweeter when shared with you</strong>
        </div>
      </div>
    </div>
  );
}
