import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const reload = async () => {
    try {
      const [a, r, u] = await Promise.all([api("/api/admin/analytics"), api("/api/admin/requests"), api("/api/admin/users")]);
      setAnalytics(a);
      setRequests(r.requests || []);
      setUsers(u.users || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const moderate = async (id, payload) => {
    setError("");
    try {
      await api(`/api/admin/requests/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
      await reload();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="page" style={{ padding: 0 }}>
      <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
        Admin panel
      </h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Manage requests, moderate content, and view analytics — bonus scope from the official brief.
      </p>

      {error ? <div className="error">{error}</div> : null}

      {analytics ? (
        <div className="grid cols-3" style={{ marginBottom: 16 }}>
          <div className="card">
            <h3>Users</h3>
            <strong style={{ fontSize: 30 }}>{analytics.totals.users}</strong>
          </div>
          <div className="card">
            <h3>Requests</h3>
            <strong style={{ fontSize: 30 }}>{analytics.totals.requests}</strong>
            <div className="muted small" style={{ marginTop: 8 }}>
              Open: {analytics.totals.open} · Solved: {analytics.totals.solved}
            </div>
          </div>
          <div className="card">
            <h3>Top categories</h3>
            <div className="stack">
              {(analytics.byCategory || []).slice(0, 5).map((c) => (
                <div key={c.category} className="row spread">
                  <span className="muted small">{c.category}</span>
                  <span className="tag" style={{ margin: 0 }}>
                    {c.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
          <strong>Requests moderation</strong>
          <div className="muted small">Flag, annotate, or force status for safety and quality.</div>
        </div>
        <table className="table" style={{ border: "none" }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>
                  <Link to={`/requests/${r._id}`} style={{ fontWeight: 800 }}>
                    {r.title}
                  </Link>
                  <div className="muted small">{r.category}</div>
                </td>
                <td className="muted small">{r.author?.name || r.author?.email}</td>
                <td>{r.status}</td>
                <td className="muted small">{r.moderated ? `moderated${r.moderationNote ? `: ${r.moderationNote}` : ""}` : "—"}</td>
                <td>
                  <div className="row">
                    <button type="button" className="btn" onClick={() => moderate(r._id, { moderated: true, moderationNote: "Reviewed" })}>
                      Mark moderated
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => moderate(r._id, { status: "solved" })}>
                      Force solved
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
          <strong>Users</strong>
        </div>
        <table className="table" style={{ border: "none" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Trust</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name || "—"}</td>
                <td className="muted small">{u.email}</td>
                <td>{u.role}</td>
                <td>{u.trustScore}</td>
                <td>{u.isAdmin ? "yes" : "no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
