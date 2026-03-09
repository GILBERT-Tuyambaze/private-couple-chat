import { useState, useEffect } from "react";
import { useAuth }          from "./context/AuthContext";
import { useTheme }         from "./context/ThemeContext";
import { MessagesProvider } from "./context/MessagesContext";
import { api }              from "./utils/api";
import { getSocket }        from "./utils/socket";

import LoginScreen  from "./screens/LoginScreen";
import Sidebar      from "./components/Sidebar";
import ChatArea     from "./components/ChatArea";
import RightPanel   from "./components/RightPanel";
import ConnectionEstablishment from "./components/ConnectionEstablishment";
import LockScreen   from "./components/LockScreen";
import Settings     from "./components/Settings";
import Notification from "./components/Notification";

// Message search bar
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  return (
    <div style={{ padding: 8 }}>
      <input
        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e8c4c4" }}
        placeholder="🔍 Search messages..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSearch(query)}
      />
    </div>
  );
}

export default ChatApp;

// File/image upload UI stub
function FileUpload({ onUpload }) {
  return (
    <div style={{ padding: 8 }}>
      <input type="file" multiple onChange={e => onUpload(e.target.files)} />
    </div>
  );
}

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Georgia', 'Times New Roman', serif; }
  ::-webkit-scrollbar { width: 4px }
  ::-webkit-scrollbar-track { background: transparent }
  ::-webkit-scrollbar-thumb { background: #e0cece; border-radius: 4px }
  @keyframes slideIn  { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
  @keyframes msgPop   { from { opacity:0; transform:translateY(10px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
  @keyframes blink    { 0%,80%,100%{opacity:0} 40%{opacity:1} }

  /* Responsive layout for mobile */
  @media (max-width: 900px) {
    .main-app-layout {
      flex-direction: column !important;
      height: 100dvh !important;
    }
    .sidebar-mobile-hide {
      display: none !important;
    }
    .sidebar-mobile-show {
      display: flex !important;
    }
    .rightpanel-mobile-hide {
      display: none !important;
    }
    .rightpanel-mobile-show {
      display: flex !important;
    }
  }
`;

// Service worker registration for offline support (stub)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(() => {});
}


function ChatApp() {
  const { user } = useAuth();
  const { C }    = useTheme();

  const [partner, setPartner] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("not_connected");
  const [pendingTo, setPendingTo] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [partnerError, setPartnerError] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  // Fetch connection requests and partner info
  useEffect(() => {
    if (!user) return;
    api.getConnectionRequests()
      .then(({ incoming, outgoing }) => {
        setIncomingRequests(incoming || []);
        setOutgoingRequests(outgoing || []);
      });
    api.getPartner()
      .then(({ user: p }) => {
        setPartner(p);
        if (p && p._id) {
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("not_connected");
        }
      })
      .catch(err => setPartnerError(err.message));
  }, [user]);

  // Connection request actions
  const handleRequestConnection = async (input) => {
    try {
      await api.sendConnectionRequest(input);
      setNotification("Request sent!");
      // Refresh requests
      const { incoming, outgoing } = await api.getConnectionRequests();
      setIncomingRequests(incoming || []);
      setOutgoingRequests(outgoing || []);
    } catch (e) {
      setNotification(e.message);
    }
  };
  const handleCancelRequest = async (requestId) => {
    try {
      await api.cancelConnectionRequest(requestId);
      setNotification("Request canceled.");
      const { incoming, outgoing } = await api.getConnectionRequests();
      setIncomingRequests(incoming || []);
      setOutgoingRequests(outgoing || []);
    } catch (e) {
      setNotification(e.message);
    }
  };
  const handleAcceptRequest = async (requestId) => {
    try {
      await api.acceptConnectionRequest(requestId);
      setNotification("Connection accepted!");
      // Refresh partner and requests
      const { user: p } = await api.getPartner();
      setPartner(p);
      setConnectionStatus("connected");
      const { incoming, outgoing } = await api.getConnectionRequests();
      setIncomingRequests(incoming || []);
      setOutgoingRequests(outgoing || []);
      setShowConnectionModal(false);
    } catch (e) {
      setNotification(e.message);
    }
  };
  const handleDeclineRequest = async (requestId) => {
    try {
      await api.declineConnectionRequest(requestId);
      setNotification("Request declined.");
      const { incoming, outgoing } = await api.getConnectionRequests();
      setIncomingRequests(incoming || []);
      setOutgoingRequests(outgoing || []);
    } catch (e) {
      setNotification(e.message);
    }
  };

  // New message toast
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;
    const onNew = ({ message }) => {
      if (message.sender_id !== user._id) {
        setNotification(`New message from ${partner?.display_name || "them"} 💌`);
        if (Notification.permission === 'granted') {
          new Notification('Us, Always', {
            body: message.encrypted_message.slice(0, 80),
            icon: '/favicon.ico',
          });
        }
      }
    };
    socket.on("newMessage", onNew);
    return () => socket.off("newMessage", onNew);
  }, [user && user._id, partner]);

  // Message search handler
  const handleSearch = async (query) => {
    // Backend endpoint not implemented; stub
    setSearchResults([{ text: `Search for: ${query} (backend not implemented)` }]);
  };

  // File/image upload handler
  const handleUpload = async (files) => {
    // Backend endpoint not implemented; stub
    setNotification(`Uploaded ${files.length} file(s) (backend not implemented)`);
    setShowUpload(false);
  };

  // Password change handler
  const handlePasswordChange = async (newPassword) => {
    // Backend endpoint not implemented; stub
    setNotification("Password change endpoint not implemented");
    setShowPassword(false);
  };


  if (!user) return <LoginScreen />;
  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;



  return (
    <MessagesProvider partnerId={partner?._id}>
      <style>{GLOBAL_CSS}</style>
      <div className="main-app-layout" style={{ display: "flex", height: "100vh", width: "100%", background: C.bg, overflow: "hidden" }}>
        <Sidebar
          partner={partner}
          onLock={() => setLocked(true)}
          onSettingsOpen={() => setShowSettings(true)}
          onConnectionClick={() => setShowConnectionModal(true)}
          pendingCount={incomingRequests.length}
          className="sidebar-mobile-show"
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <SearchBar onSearch={handleSearch} />
          {searchResults.length > 0 && (
            <div style={{ padding: 8, background: C.inputBg }}>
              {searchResults.map((r, i) => <div key={i}>{r.text}</div>)}
            </div>
          )}
          {/* Connection Establishment modal */}
          {showConnectionModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #0002', maxWidth: 500, width: '95vw', padding: 0, position: 'relative' }}>
                <button onClick={() => setShowConnectionModal(false)} style={{ position: 'absolute', top: 8, right: 12, fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', color: '#d81b60' }} title="Close">×</button>
                {/* Show partner info and disconnect if connected and not self */}
                {connectionStatus === "connected" && partner && user && partner._id !== user._id && (
                  <div style={{ padding: 20, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 32 }}>{partner.avatar || '💑'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{partner.username}</div>
                      {partner.display_name && <div style={{ color: '#888', fontSize: 14 }}>{partner.display_name}</div>}
                    </div>
                    <button
                      style={{ background: '#eee', color: '#c62828', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}
                      onClick={async () => {
                        await api.disconnectPartner();
                        setPartner(null);
                        setConnectionStatus('not_connected');
                        setNotification('Disconnected from partner.');
                        setShowConnectionModal(false);
                      }}
                    >Disconnect</button>
                  </div>
                )}
                <ConnectionEstablishment
                  status={connectionStatus}
                  onRequest={handleRequestConnection}
                  onCancel={handleCancelRequest}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                  incoming={incomingRequests}
                  outgoing={outgoingRequests}
                  pendingTo={pendingTo}
                />
              </div>
            </div>
          )}
          {/* Only show chat if connected */}
          {connectionStatus === "connected" ? (
            <ChatArea partner={partner} onToggleProfile={() => setShowProfile(v => !v)} />
          ) : (
            <div style={{ textAlign: 'center', color: '#d81b60', margin: '40px auto', fontSize: 18, fontWeight: 600 }}>
              Connect with a partner to start chatting.
            </div>
          )}
          {showUpload && <FileUpload onUpload={handleUpload} />}
        </div>
        {showProfile && <RightPanel partner={partner} />}
      </div>
      {notification && <Notification message={notification} onDismiss={() => setNotification(null)} />}
      {showSettings && <Settings onClose={() => setShowSettings(false)} onLock={() => setLocked(true)} />}
      {showPassword && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Change Password</div>
            <input type="password" placeholder="New password" style={{ width: "100%", marginBottom: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #e8c4c4" }} />
            <button style={{ width: "100%", padding: "10px 0", borderRadius: 8, background: "#00bcd4", color: "#fff", fontWeight: 700, border: "none" }} onClick={() => handlePasswordChange("demo")}>Change (stub)</button>
            <button style={{ width: "100%", marginTop: 8, padding: "10px 0", borderRadius: 8, background: "#eee", color: "#333", fontWeight: 700, border: "none" }} onClick={() => setShowPassword(false)}>Cancel</button>
          </div>
        </div>
      )}
    </MessagesProvider>
  );
}




