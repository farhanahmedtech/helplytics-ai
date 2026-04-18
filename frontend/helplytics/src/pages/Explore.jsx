import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export function Explore() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [tag, setTag] = useState("");
  const [location, setLocation] = useState("");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (urgency) p.set("urgency", urgency);
    if (tag) p.set("tag", tag);
    if (location) p.set("location", location);
    const qs = p.toString();
    return qs ? `?${qs}` : "";
  }, [category, urgency, tag, location]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api(`/api/requests${query}`);
        if (!cancelled) setRows(data.requests || []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="row spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
            Explore requests
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            Filter by category, urgency, skills (tags), and location — the stack your trainer expects for Batch 16.
          </p>
        </div>
        <Link className="btn btn-primary" to="/requests/new">
          New request
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid cols-2">
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Any</option>
              <option value="general">general</option>
              <option value="programming">programming</option>
              <option value="design">design</option>
              <option value="career">career</option>
              <option value="academics">academics</option>
              <option value="language">language</option>
              <option value="business">business</option>
            </select>
          </div>
          <div className="field">
            <label>Urgency</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="">Any</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
          <div className="field">
            <label>Skills (matches request tags)</label>
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. react, debugging, interview" />
          </div>
          <div className="field">
            <label>Location contains</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Karachi, Remote…" />
          </div>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <div className="grid cols-2">
        {rows.map((r) => (
          <div key={r._id} className="card">
            <div className="row spread">
              <Link to={`/requests/${r._id}`} style={{ fontWeight: 900, fontSize: 16 }}>
                {r.title}
              </Link>
              <span className="tag" style={{ margin: 0 }}>
                {r.urgency}
              </span>
            </div>
            <p className="muted small" style={{ margin: "10px 0" }}>
              {r.description?.slice(0, 160)}
              {r.description?.length > 160 ? "…" : ""}
            </p>
            <div className="row spread">
              <div className="muted small">
                {r.category} · {r.status} · {r.author?.name || "Member"}
                {r.author?.location ? ` · ${r.author.location}` : ""}
              </div>
              <div>
                {(r.tags || []).slice(0, 4).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!rows.length ? <p className="muted">No requests match these filters.</p> : null}
    </div>
  );
}
