import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [req, setReq] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [responseSuggestions, setResponseSuggestions] = useState(null);

  const load = async () => {
    setError("");
    try {
      const data = await api(`/api/requests/${id}`);
      setReq(data.request);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const isAuthor = useMemo(() => req && user && String(req.author?._id) === String(user._id), [req, user]);

  useEffect(() => {
    if (!req || !user || req.status === "solved" || String(req.author?._id) === String(user._id)) {
      setResponseSuggestions(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api("/api/ai/response-suggestions", {
          method: "POST",
          body: JSON.stringify({ title: req.title, description: req.description }),
        });
        if (!cancelled) setResponseSuggestions(data.suggestions || []);
      } catch {
        if (!cancelled) setResponseSuggestions(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [req, user]);

  const offer = async () => {
    setBusy(true);
    try {
      const data = await api(`/api/requests/${id}/offer`, { method: "POST" });
      setReq(data.request);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const solve = async () => {
    setBusy(true);
    try {
      const data = await api(`/api/requests/${id}/solve`, { method: "POST" });
      setReq(data.request);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!req) {
    return (
      <div className="page" style={{ padding: 0 }}>
        {error ? <div className="error">{error}</div> : <p className="muted">Loading…</p>}
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="row spread" style={{ marginBottom: 12 }}>
        <Link className="muted small" to="/explore">
          ← Back to explore
        </Link>
        <div className="row">
          <span className="tag" style={{ margin: 0 }}>
            {req.urgency} urgency
          </span>
          <span className="tag" style={{ margin: 0 }}>
            {req.category}
          </span>
          <span className="tag" style={{ margin: 0 }}>
            {req.status}
          </span>
        </div>
      </div>

      <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
        {req.title}
      </h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Posted by <strong>{req.author?.name || "Member"}</strong>
        {req.author?.location ? ` · ${req.author.location}` : ""} · trust {req.author?.trustScore ?? "—"}
      </p>

      {error ? <div className="error">{error}</div> : null}

      <div className="grid cols-2">
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Description</h3>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{req.description}</p>
          <div>
            {(req.tags || []).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="card stack">
          <div className="row spread">
            <h3 style={{ margin: 0 }}>AI summary</h3>
            <span className="pill" style={{ marginLeft: 0 }}>
              on-server
            </span>
          </div>
          <div className="insight" style={{ whiteSpace: "pre-wrap" }}>
            {req.aiSummary}
          </div>

          <h3 style={{ margin: "10px 0 0" }}>Helpers</h3>
          <div className="stack">
            {(req.helpers || []).length ? (
              req.helpers.map((h) => (
                <div key={String(h.user?._id || h.user)} className="row spread">
                  <div>
                    <div style={{ fontWeight: 800 }}>{h.user?.name || "Helper"}</div>
                    <div className="muted small">Trust {h.user?.trustScore ?? "—"}</div>
                  </div>
                  <div className="row">
                    {(h.user?.badges || []).slice(0, 2).map((b) => (
                      <span key={b} className="badge">
                        {b}
                      </span>
                    ))}
                    {user && h.user?._id && String(h.user._id) !== String(user._id) ? (
                      <button type="button" className="btn" onClick={() => navigate(`/messages/${h.user._id}`)}>
                        Message
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="muted small">No helpers yet — be the first.</p>
            )}
          </div>

          {responseSuggestions?.length ? (
            <div className="card stack" style={{ boxShadow: "none", background: "var(--surface-2)" }}>
              <div className="row spread">
                <h3 style={{ margin: 0 }}>AI response suggestions</h3>
                <span className="pill" style={{ marginLeft: 0 }}>
                  helper prompts
                </span>
              </div>
              <p className="muted small" style={{ margin: 0 }}>
                Starter replies you can paste into Messages and adapt (PDF “response suggestions”).
              </p>
              <ol className="muted small" style={{ margin: 0, paddingLeft: 18 }}>
                {responseSuggestions.map((s, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className="row" style={{ marginTop: 10 }}>
            {!isAuthor ? (
              <button type="button" className="btn btn-primary" onClick={offer} disabled={busy || req.status === "solved"}>
                I can help
              </button>
            ) : null}
            {isAuthor ? (
              <button type="button" className="btn btn-primary" onClick={solve} disabled={busy || req.status === "solved"}>
                Mark as solved
              </button>
            ) : null}
            {!isAuthor && req.status !== "solved" ? (
              <button type="button" className="btn" onClick={() => navigate(`/messages/${req.author._id}`)}>
                Message author
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
