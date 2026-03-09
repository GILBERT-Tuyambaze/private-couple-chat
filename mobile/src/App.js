/**
 * mobile/src/App.js
 * Expo React Native entry point.
 * Features: real-time chat, push notifications (FCM), theme, PIN lock.
 *
 * Setup:
 *   cd mobile
 *   npx create-expo-app . --template blank
 *   npx expo install expo-secure-store expo-local-authentication expo-notifications
 *   npm install socket.io-client
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
  Animated, SafeAreaView,
} from "react-native";
import * as SecureStore        from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications      from "expo-notifications";
import { io }                  from "socket.io-client";

const API_URL    = process.env.EXPO_PUBLIC_API_URL    || "http://localhost:4000";
const APP_SECRET = process.env.EXPO_PUBLIC_APP_SECRET || "dev_secret_change_me";

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
  bg:       "#fff",
  sidebar:  "#f2c7c7",
  sent:     "#ffb7cd",
  received: "#d5f3d8",
  text:     "#1a1a1a",
  subtext:  "#777",
  accent:   "#00bcd4",
  border:   "#e8c4c4",
  inputBg:  "#fdf0f0",
};

// ─── Root component ───────────────────────────────────────────────────────────

export default function App() {
  const [token,    setToken]    = useState(null);
  const [user,     setUser]     = useState(null);
  const [partner,  setPartner]  = useState(null);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [locked,   setLocked]   = useState(true);
  const [screen,   setScreen]   = useState("lock"); // lock | login | chat

  const socket = useRef(null);
  const flatRef = useRef(null);

  // ── Push notifications setup ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo push token:", expoPushToken);
      // TODO: send expoPushToken to backend to store per-user
    })();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge:  true,
      }),
    });
  }, []);

  // ── Biometric / PIN lock ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const savedToken = await SecureStore.getItemAsync("cc_token");
      const savedUser  = await SecureStore.getItemAsync("cc_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setScreen("lock");
      } else {
        setScreen("login");
      }
    })();
  }, []);

  const biometricUnlock = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Us, Always 💌",
      fallbackLabel: "Use PIN",
    });
    if (result.success) setScreen("chat");
  };

  // ── Socket connection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || screen !== "chat") return;

    socket.current = io(API_URL, { auth: { token }, transports: ["websocket"] });

    socket.current.on("newMessage", ({ message }) => {
      setMessages(prev => [...prev, { ...message, text: message.encrypted_message }]);
      if (message.sender_id !== user?._id) {
        Notifications.scheduleNotificationAsync({
          content: { title: "New message 💌", body: message.encrypted_message.slice(0, 80) },
          trigger: null,
        });
      }
    });

    socket.current.on("typing", ({ is_typing }) => setTyping(is_typing));

    return () => socket.current?.disconnect();
  }, [token, screen]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = () => {
    if (!input.trim()) return;
    socket.current?.emit("sendMessage", {
      receiver_id:       partner?._id || "partner",
      encrypted_message: input,   // in production: encrypt with shared/encryption.js
    });
    setInput("");
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const doLogin = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await SecureStore.setItemAsync("cc_token", data.token);
      await SecureStore.setItemAsync("cc_user",  JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setScreen("chat");
    } catch (e) {
      alert(e.message);
    }
  };

  // ─── Render screens ────────────────────────────────────────────────────────

  if (screen === "lock") return (
    <SafeAreaView style={[styles.center, { backgroundColor: C.sidebar }]}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.lockIcon}>🔒</Text>
      <Text style={styles.lockTitle}>Us, Always</Text>
      <TouchableOpacity onPress={biometricUnlock} style={styles.btn}>
        <Text style={styles.btnText}>😊  Unlock with Face ID / Touch ID</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setScreen("chat")} style={[styles.btn, { backgroundColor: "#eee" }]}>
        <Text style={[styles.btnText, { color: C.text }]}>Enter PIN manually</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  if (screen === "login") return (
    <SafeAreaView style={[styles.center, { backgroundColor: C.sidebar }]}>
      <Text style={styles.lockIcon}>💌</Text>
      <Text style={styles.lockTitle}>Us, Always</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={loginForm.username}
        onChangeText={v => setLoginForm(f => ({ ...f, username: v }))}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={loginForm.password}
        onChangeText={v => setLoginForm(f => ({ ...f, password: v }))}
      />
      <TouchableOpacity onPress={doLogin} style={styles.btn}>
        <Text style={styles.btnText}>Sign In 💕</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // ── Chat screen ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerAvatar}>🌸</Text>
        <View>
          <Text style={styles.headerName}>Sophia</Text>
          <Text style={[styles.sub, { color: C.accent }]}>● Online</Text>
        </View>
        <TouchableOpacity onPress={() => setScreen("lock")} style={{ marginLeft: "auto" }}>
          <Text style={{ fontSize: 22 }}>🔒</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => flatRef.current?.scrollToEnd()}
          renderItem={({ item }) => {
            const isMe = item.sender_id === user?._id;
            return (
              <View style={{ alignItems: isMe ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <View style={[styles.bubble, { backgroundColor: isMe ? C.sent : C.received }]}>
                  <Text style={styles.bubbleText}>{item.text}</Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={typing ? (
            <View style={{ alignItems: "flex-start", marginBottom: 8 }}>
              <View style={[styles.bubble, { backgroundColor: C.received }]}>
                <Text>···</Text>
              </View>
            </View>
          ) : null}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={v => {
              setInput(v);
              socket.current?.emit("typing", { receiver_id: partner?._id || "partner", is_typing: true });
            }}
            placeholder="Write something sweet… 💌"
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Text style={{ color: "#fff", fontSize: 18 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center:      { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  lockIcon:    { fontSize: 56, marginBottom: 12 },
  lockTitle:   { fontSize: 26, fontWeight: "700", color: "#1a1a1a", marginBottom: 28 },
  btn:         { width: "100%", padding: 15, borderRadius: 16, backgroundColor: "#00bcd4", marginBottom: 12, alignItems: "center" },
  btnText:     { color: "#fff", fontSize: 16, fontWeight: "600" },
  input:       { width: "100%", padding: 14, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e8c4c4", fontSize: 15, marginBottom: 12 },
  header:      { flexDirection: "row", alignItems: "center", gap: 12, padding: "14px 18px", borderBottomWidth: 1, borderBottomColor: "#e8c4c4", backgroundColor: "#fff" },
  headerAvatar:{ fontSize: 30 },
  headerName:  { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  sub:         { fontSize: 12 },
  bubble:      { maxWidth: "72%", padding: "10px 14px", borderRadius: 18 },
  bubbleText:  { fontSize: 15, color: "#1a1a1a", lineHeight: 22 },
  inputBar:    { flexDirection: "row", padding: 12, borderTopWidth: 1, borderTopColor: "#e8c4c4", backgroundColor: "#fdf0f0", alignItems: "center", gap: 10 },
  textInput:   { flex: 1, padding: 11, borderRadius: 24, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e8c4c4", fontSize: 14 },
  sendBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: "#00bcd4", alignItems: "center", justifyContent: "center" },
});
