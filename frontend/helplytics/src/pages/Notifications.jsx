import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api("/api/notifications");
      setItems(data.notifications || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await api(`/api/notifications/${id}/read`, { method: "PATCH" });
    await load();
  };

  const markAll = async () => {
    await api("/api/notifications/read-all", { method: "POST" });
    await load();
  };

  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="row spread" style={{ marginBottom: 12 }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
            Notifications
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            New requests (skill-matched), help offers, messages, and status updates.
          </p>
        </div>
        <button type="button" className="btn" onClick={markAll}>
          Mark all read
        </button>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <div className="stack">
        {items.map((n) => (
          <div key={n._id} className="card row spread" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div className="row">
                <strong>{n.title}</strong>
                {!n.read ? <span className="pill" style={{ marginLeft: 0 }}>new</span> : null}
              </div>
              {n.body ? <div className="muted small" style={{ marginTop: 6 }}>{n.body}</div> : null}
              <div className="muted small" style={{ marginTop: 8 }}>
                {new Date(n.createdAt).toLocaleString()} · {n.type}
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                {n.meta?.requestId ? (
                  <Link className="btn btn-ghost" to={`/requests/${n.meta.requestId}`}>
                    Open request
                  </Link>
                ) : null}
                {n.meta?.from && n.type === "message" ? (
                  <Link className="btn btn-ghost" to={`/messages/${n.meta.from}`}>
                    Open chat
                  </Link>
                ) : null}
              </div>
            </div>
            {!n.read ? (
              <button type="button" className="btn" onClick={() => markRead(n._id)}>
                Mark read
              </button>
            ) : null}
          </div>
        ))}
        {!items.length ? <p className="muted">You’re all caught up.</p> : null}
      </div>
    </div>
  );
}
