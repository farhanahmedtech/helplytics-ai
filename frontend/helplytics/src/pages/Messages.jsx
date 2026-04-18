import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/api/messages/conversations");
        setConversations(data.conversations || []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId) {
      setPeer(null);
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api(`/api/messages/with/${userId}`);
        if (!cancelled) {
          setPeer(data.peer);
          setMessages(data.messages || []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const send = async (e) => {
    e.preventDefault();
    if (!userId || !draft.trim()) return;
    setError("");
    try {
      await api("/api/messages", {
        method: "POST",
        body: JSON.stringify({ to: userId, body: draft.trim() }),
      });
      setDraft("");
      const data = await api(`/api/messages/with/${userId}`);
      setMessages(data.messages || []);
      const conv = await api("/api/messages/conversations");
      setConversations(conv.conversations || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const title = useMemo(() => {
    if (!userId) return "Messages";
    return peer?.name ? `Thread · ${peer.name}` : "Thread";
  }, [userId, peer]);

  return (
    <div className="page" style={{ padding: 0 }}>
      <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
        {title}
      </h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Basic user-to-user messaging — enough to coordinate help without leaving the platform.
      </p>

      {error ? <div className="error">{error}</div> : null}

      <div className="grid cols-2">
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Conversations</h3>
          {!conversations.length ? <p className="muted small">No conversations yet.</p> : null}
          <div className="stack">
            {conversations.map((c) => (
              <Link key={c.conversationKey} to={`/messages/${c.peer._id}`} className="card" style={{ boxShadow: "none", textDecoration: "none" }}>
                <div className="row spread">
                  <div style={{ fontWeight: 900 }}>{c.peer.name || "Member"}</div>
                  {c.unread ? <span className="pill" style={{ marginLeft: 0 }}>{c.unread} new</span> : null}
                </div>
                <div className="muted small" style={{ marginTop: 6 }}>
                  {c.lastMessage?.body?.slice(0, 120)}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card stack">
          {!userId ? <p className="muted small">Select a conversation on the left (or start from a request detail page).</p> : null}
          {userId ? (
            <>
              <div className="stack" style={{ maxHeight: 420, overflow: "auto" }}>
                {messages.map((m) => {
                  const mine = String(m.from) === String(user?._id);
                  return (
                    <div key={m._id} className="card" style={{ boxShadow: "none", alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "92%" }}>
                      <div className="muted small" style={{ marginBottom: 6 }}>
                        {mine ? "You" : peer?.name || "Peer"}
                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
                    </div>
                  );
                })}
              </div>
              <form className="row" onSubmit={send}>
                <input style={{ flex: 1 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" />
                <button className="btn btn-primary" type="submit">
                  Send
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
