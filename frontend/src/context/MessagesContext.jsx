/**
 * frontend/src/context/MessagesContext.jsx
 * Manages message state + listens to Socket.IO events.
 */

import {
  createContext, useContext, useState, useEffect, useCallback,
} from "react";
import { api }        from "../utils/api";
import { getSocket }  from "../utils/socket";
import { encryptMessage, decryptMessage } from "../../../shared/encryption";

const PASSPHRASE = import.meta.env.VITE_APP_SECRET || "dev_secret_change_me";

const MessagesContext = createContext(null);

export function MessagesProvider({ children, partnerId }) {
  const [messages,      setMessages]      = useState([]);
  const [typing,        setTyping]        = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);

  const decrypt = useCallback(async (msg) => {
    try {
      const text = await decryptMessage(msg.encrypted_message, PASSPHRASE);
      return { ...msg, text };
    } catch {
      return { ...msg, text: "[encrypted]" };
    }
  }, []);

  useEffect(() => {
    if (!partnerId) return;
    api.getMessages(partnerId).then(async ({ messages: raw }) => {
      const decrypted = await Promise.all(raw.map(decrypt));
      setMessages(decrypted);
    });
  }, [partnerId, decrypt]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewMessage = async ({ message }) => {
      const decrypted = await decrypt(message);
      setMessages(prev => {
        if (decrypted._id && prev.some(m => m._id === decrypted._id)) return prev;
        const filtered = prev.filter(m => !String(m._id).startsWith("opt_"));
        return [...filtered, decrypted];
      });
    };

    const onTyping = ({ from_user_id, is_typing }) => {
      if (from_user_id === partnerId) setTyping(is_typing);
    };

    const onReactionUpdate = async ({ message }) => {
      const decrypted = await decrypt(message);
      setMessages(prev =>
        prev.map(m => m._id === decrypted._id ? { ...m, reactions: decrypted.reactions } : m)
      );
    };

    const onUserStatus = ({ user_id, is_online }) => {
      if (user_id === partnerId) setPartnerOnline(is_online);
    };

    socket.on("newMessage",     onNewMessage);
    socket.on("typing",         onTyping);
    socket.on("reactionUpdate", onReactionUpdate);
    socket.on("userStatus",     onUserStatus);

    return () => {
      socket.off("newMessage",     onNewMessage);
      socket.off("typing",         onTyping);
      socket.off("reactionUpdate", onReactionUpdate);
      socket.off("userStatus",     onUserStatus);
    };
  }, [partnerId, decrypt]);

  // Optimistic UI for sent messages
  const sendMessage = useCallback(async (text, _userId, fileUrl = null, fileType = null) => {
    const socket = getSocket();
    const encrypted_message = await encryptMessage(text, PASSPHRASE);
    // Generate a temporary optimistic message
    const optimisticMsg = {
      _id: `opt_${Date.now()}`,
      sender_id: null, // will be filled by backend
      receiver_id: partnerId,
      encrypted_message,
      text,
      fileUrl,
      fileType,
      createdAt: new Date(),
      reactions: [],
      read: false,
      optimistic: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    if (socket?.connected) {
      socket.emit("sendMessage", { receiver_id: partnerId, encrypted_message, fileUrl, fileType });
    } else {
      const { message } = await api.sendMessage({ receiver_id: partnerId, encrypted_message, fileUrl, fileType });
      const decrypted = await decrypt(message);
      setMessages(prev => prev.filter(m => !String(m._id).startsWith("opt_")));
      setMessages(prev => [...prev, decrypted]);
    }
  }, [partnerId, decrypt]);

  const emitTyping = useCallback((is_typing) => {
    const socket = getSocket();
    socket?.emit("typing", { receiver_id: partnerId, is_typing });
  }, [partnerId]);

  const toggleReaction = useCallback((messageId, emoji) => {
    const socket = getSocket();
    socket?.emit("toggleReaction", { message_id: messageId, emoji });
  }, []);

  return (
    <MessagesContext.Provider value={{
      messages, typing, partnerOnline,
      sendMessage, emitTyping, toggleReaction,
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  return useContext(MessagesContext);
}
