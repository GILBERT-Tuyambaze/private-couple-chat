import { useState } from "react";
import { api } from "../utils/api";

export default function ConnectionEstablishment({
  status,
  onRequest,
  onCancel,
  onAccept,
  onDecline,
  incoming = [],
  outgoing = [],
  pendingTo
}) {
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleUserSearch = async () => {
    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const res = await api.searchUsers(searchTerm);
      setSearchResults(res.users || []);
      if ((res.users || []).length === 0) setSearchError("No users found.");
    } catch (e) {
      setSearchError(e.message);
    } finally {
      setSearchLoading(false);
    }
  };
  return (
    <div className="connection-establishment-modal-overlay">
      <div className="connection-establishment-root">
        <button className="connection-establishment-close" aria-label="Close" onClick={() => window.history.back && window.history.back()}>&times;</button>
        <style>{`
          .connection-establishment-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.32);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
          }
          .connection-establishment-root {
            background: #fff;
            border: 1.5px solid #e8c4c4;
            border-radius: 18px;
            padding: 24px 18px 18px 18px;
            margin: 0 auto;
            max-width: 98vw;
            width: 100%;
            font-family: Georgia, serif;
            box-shadow: 0 4px 32px #0002;
            display: flex;
            flex-direction: column;
            gap: 18px;
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
          }
          .connection-establishment-close {
            position: absolute;
            top: 12px;
            right: 16px;
            background: none;
            border: none;
            font-size: 2.1rem;
            color: #b71c1c;
            cursor: pointer;
            z-index: 2;
            padding: 0 8px;
            line-height: 1;
          }
          .connection-establishment-label {
            font-size: 21px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #d81b60;
            text-align: center;
          }
          .connection-establishment-section {
            background: #f9e6ef;
            border-radius: 12px;
            padding: 14px 10px;
            margin-bottom: 8px;
            font-size: 15px;
          }
          .connection-establishment-title {
            font-weight: 600;
            color: #b71c1c;
            margin-bottom: 6px;
            font-size: 15px;
          }
          .connection-establishment-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .connection-establishment-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
          }
          .connection-establishment-btn {
            font-size: 13px;
            border: none;
            border-radius: 6px;
            padding: 4px 10px;
            cursor: pointer;
          }
          .connection-establishment-input {
            padding: 12px 16px;
            border-radius: 10px;
            border: 1.5px solid #e8c4c4;
            font-size: 16px;
            width: 100%;
            margin-bottom: 10px;
            box-sizing: border-box;
          }
          .connection-establishment-send {
            padding: 12px 0;
            border-radius: 10px;
            background: #00bcd4;
            color: #fff;
            border: none;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
          }
          .connection-establishment-cancel {
            background: #eee;
            color: #c62828;
            margin-top: 8px;
          }
          @media (max-width: 600px) {
            .connection-establishment-modal-overlay {
              align-items: flex-end;
              background: rgba(0,0,0,0.22);
            }
            .connection-establishment-root {
              padding: max(18px, env(safe-area-inset-top, 0)) 2vw 18px 2vw;
              margin: 0 auto;
              max-width: 100vw;
              border-radius: 18px 18px 0 0;
              border: none;
              box-shadow: 0 -2px 24px #0002;
              gap: 22px;
              min-height: 60vh;
              max-height: 92vh;
              background: #fff;
              position: relative;
              overflow-y: auto;
            }
            .connection-establishment-close {
              top: 10px;
              right: 10px;
              font-size: 2rem;
            }
            .connection-establishment-label {
              font-size: 19px;
              margin-top: 0;
              padding-top: 0;
            }
            .connection-establishment-section {
              padding: 14px 6px;
              font-size: 15px;
              border-radius: 14px;
              margin-bottom: 12px;
            }
            .connection-establishment-title {
              font-size: 14px;
              margin-bottom: 8px;
            }
            .connection-establishment-input {
              font-size: 15px;
              padding: 10px 12px;
              border-radius: 8px;
            }
            .connection-establishment-send {
              font-size: 15px;
              padding: 12px 0;
              border-radius: 8px;
            }
            .connection-establishment-btn {
              font-size: 13px;
              padding: 5px 12px;
              border-radius: 7px;
            }
          }
        `}</style>
        <div className="connection-establishment-label">Connection Establishment</div>
      {/* Dashboard Section */}
      <div className="connection-establishment-section">
        <div className="connection-establishment-title">Incoming Requests</div>
        <ul className="connection-establishment-list">
          {incoming.length === 0 && <li style={{ color: "#888" }}>No incoming requests</li>}
          {incoming.map(req => (
            <li key={req._id} className="connection-establishment-item">
              <span><b>{req.fromUser?.username || req.fromUser?.email || req.fromUser?._id}</b> <span style={{ color: "#888", fontSize: 13 }}>({new Date(req.createdAt).toLocaleDateString()})</span></span>
              <span>
                <button className="connection-establishment-btn" style={{ background: "#4caf50", color: "#fff", marginRight: 4 }} onClick={() => onAccept(req._id)}>Accept</button>
                <button className="connection-establishment-btn" style={{ background: "#eee", color: "#c62828" }} onClick={() => onDecline(req._id)}>Decline</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="connection-establishment-section">
        <div className="connection-establishment-title">Outgoing Requests</div>
        <ul className="connection-establishment-list">
          {outgoing.length === 0 && <li style={{ color: "#888" }}>No outgoing requests</li>}
          {outgoing.map(req => (
            <li key={req._id} className="connection-establishment-item">
              <span><b>{req.toUser?.username || req.toUser?.email || req.toUser?._id}</b> <span style={{ color: "#888", fontSize: 13 }}>({new Date(req.createdAt).toLocaleDateString()})</span></span>
              <button className="connection-establishment-btn" style={{ background: "#eee", color: "#c62828" }} onClick={() => onCancel(req._id)}>Cancel</button>
            </li>
          ))}
        </ul>
      </div>
      {/* Request UI */}
      {status === "not_connected" && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 15, marginBottom: 10 }}>
            Enter your partner's username or connection key to send a request.
          </div>
          <input
            className="connection-establishment-input"
            placeholder="Username or connection key"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            className="connection-establishment-send"
            onClick={() => onRequest(input)}
            disabled={!input.trim()}
          >
            Send Request
          </button>

          {/* User Search Section */}
          <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Search for users</div>
            <input
              className="connection-establishment-input"
              placeholder="Search by username or email"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <button
              className="connection-establishment-btn"
              style={{ background: '#00bcd4', color: '#fff', marginBottom: 8 }}
              onClick={handleUserSearch}
              disabled={!searchTerm.trim() || searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
            {searchError && <div style={{ color: '#d81b60', marginBottom: 8 }}>{searchError}</div>}
            <ul className="connection-establishment-list">
              {searchResults.map(user => (
                <li key={user._id} className="connection-establishment-item">
                  <span><b>{user.username}</b> {user.display_name && <span style={{ color: '#888', fontSize: 13 }}>({user.display_name})</span>}</span>
                  <button
                    className="connection-establishment-btn"
                    style={{ background: '#4caf50', color: '#fff' }}
                    onClick={() => onRequest(user.username)}
                  >
                    Send Request
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {status === "pending" && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 15, marginBottom: 10 }}>
            Connection request sent to <b>{pendingTo}</b>.<br />
            Waiting for them to accept.
          </div>
          <button
            className="connection-establishment-send connection-establishment-cancel"
            onClick={onCancel}
          >
            Cancel Request
          </button>
        </div>
      )}
      {status === "connected" && (
        <div style={{ fontSize: 15, color: "#4caf50", marginTop: 8 }}>
          You are connected with your partner! 💕
        </div>
      )}
      </div>
    </div>
  );
}
