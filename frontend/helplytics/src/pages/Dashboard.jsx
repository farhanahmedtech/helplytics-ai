import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/api/users/me/stats");
        setData(res);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="row spread" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            Your dashboard blends activity, community signal, and AI nudges — tuned for real workflows.
          </p>
        </div>
        <div className="row">
          <Link className="btn btn-primary" to="/requests/new">
            Create request
          </Link>
          <Link className="btn" to="/explore">
            Explore feed
          </Link>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        <div className="card">
          <h3>Open requests</h3>
          <strong style={{ fontSize: 34, letterSpacing: "-0.03em" }}>{data?.openRequests ?? "—"}</strong>
          <p className="muted small" style={{ margin: "8px 0 0" }}>
            Requests you authored that are still active.
          </p>
        </div>
        <div className="card">
          <h3>Helping on</h3>
          <strong style={{ fontSize: 34, letterSpacing: "-0.03em" }}>{data?.helpingOn ?? "—"}</strong>
          <p className="muted small" style={{ margin: "8px 0 0" }}>
            Requests where you clicked “I can help”.
          </p>
        </div>
        <div className="card">
          <h3>Trust score</h3>
          <strong style={{ fontSize: 34, letterSpacing: "-0.03em" }}>{data?.trustScore ?? user?.trustScore ?? "—"}</strong>
          <p className="muted small" style={{ margin: "8px 0 0" }}>
            Grows when you help others and close the loop.
          </p>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <div className="row spread" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>AI insights</h3>
            <span className="pill" style={{ marginLeft: 0 }}>
              personalized
            </span>
          </div>
          <div className="stack">
            {(data?.insights || []).map((t) => (
              <div key={t} className="insight">
                {t}
              </div>
            ))}
            {!data?.insights?.length ? <p className="muted small">Loading insights…</p> : null}
          </div>
        </div>

        <div className="card">
          <div className="row spread" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Recent community requests</h3>
            <Link className="btn btn-ghost" to="/explore">
              View all
            </Link>
          </div>
          <div className="stack">
            {(data?.recentRequests || []).slice(0, 6).map((r) => (
              <div key={r._id} className="card" style={{ boxShadow: "none", padding: 12 }}>
                <div className="row spread">
                  <Link to={`/requests/${r._id}`} style={{ fontWeight: 800 }}>
                    {r.title}
                  </Link>
                  <span className="tag" style={{ margin: 0 }}>
                    {r.urgency}
                  </span>
                </div>
                <div className="muted small" style={{ marginTop: 6 }}>
                  {r.category} · by {r.author?.name || "Member"}
                </div>
              </div>
            ))}
            {!data?.recentRequests?.length ? <p className="muted small">No requests yet — seed the database or create one.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
