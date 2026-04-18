import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export function Profile() {
  const { user, refreshMe } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [skills, setSkills] = useState((user?.skills || []).join(", "));
  const [interests, setInterests] = useState((user?.interests || []).join(", "));
  const [location, setLocation] = useState(user?.location || "");
  const [role, setRole] = useState(user?.role || "both");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [contributions, setContributions] = useState({ authored: [], helping: [] });

  const badges = useMemo(() => user?.badges || [], [user]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setSkills((user.skills || []).join(", "));
    setInterests((user.interests || []).join(", "));
    setLocation(user.location || "");
    setRole(user.role || "both");
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/api/users/me/contributions");
        setContributions({ authored: data.authored || [], helping: data.helping || [] });
      } catch {
        setContributions({ authored: [], helping: [] });
      }
    })();
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    try {
      await api("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          name,
          role,
          location,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          interests: interests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      await refreshMe();
      setOk("Saved.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page" style={{ padding: 0 }}>
      <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
        Profile
      </h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Identity, skills, contributions, trust score, and badges — the social layer of Helplytics.
      </p>

      <div className="grid cols-2">
        <form className="card stack" onSubmit={save}>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="needHelp">Need help</option>
              <option value="canHelp">Can help</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="field">
            <label>Skills (comma-separated)</label>
            <input value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
          <div className="field">
            <label>Interests (comma-separated)</label>
            <input value={interests} onChange={(e) => setInterests(e.target.value)} />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          {error ? <div className="error">{error}</div> : null}
          {ok ? <div className="muted small">{ok}</div> : null}
          <button className="btn btn-primary" type="submit">
            Save changes
          </button>
        </form>

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Trust & contributions</h3>
          <div className="grid cols-3">
            <div className="stat">
              <strong>{user?.trustScore ?? "—"}</strong>
              <span className="muted small">trust score</span>
            </div>
            <div className="stat">
              <strong>{user?.helpedCount ?? "—"}</strong>
              <span className="muted small">times helped</span>
            </div>
            <div className="stat">
              <strong>{user?.requestsSolvedAsAuthor ?? "—"}</strong>
              <span className="muted small">solved as author</span>
            </div>
          </div>
          <div>
            <div className="muted small" style={{ fontWeight: 700 }}>
              Badges
            </div>
            <div style={{ marginTop: 8 }}>
              {badges.length ? badges.map((b) => <span key={b} className="badge">{b}</span>) : <span className="muted small">No badges yet.</span>}
            </div>
          </div>
          <div className="insight">
            Trust increases when your help leads to solved requests. Authors get a smaller bump for closing the loop — keeps incentives balanced.
          </div>

          <h3 style={{ margin: "18px 0 0" }}>Contributions</h3>
          <p className="muted small" style={{ margin: "0 0 10px" }}>
            Requests you authored and threads where you offered help (PDF profile scope).
          </p>
          <div className="grid cols-2">
            <div className="card stack" style={{ boxShadow: "none" }}>
              <div className="muted small" style={{ fontWeight: 700 }}>
                Authored
              </div>
              {(contributions.authored || []).length ? (
                <ul style={{ margin: 0, paddingLeft: 18 }} className="small">
                  {contributions.authored.map((r) => (
                    <li key={r._id} style={{ marginBottom: 8 }}>
                      <Link to={`/requests/${r._id}`}>{r.title}</Link>
                      <span className="muted small"> · {r.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted small">No authored requests yet.</p>
              )}
            </div>
            <div className="card stack" style={{ boxShadow: "none" }}>
              <div className="muted small" style={{ fontWeight: 700 }}>
                Helping on
              </div>
              {(contributions.helping || []).length ? (
                <ul style={{ margin: 0, paddingLeft: 18 }} className="small">
                  {contributions.helping.map((r) => (
                    <li key={r._id} style={{ marginBottom: 8 }}>
                      <Link to={`/requests/${r._id}`}>{r.title}</Link>
                      <span className="muted small">
                        {" "}
                        · {r.status} · by {r.author?.name || "member"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted small">You have not tapped “I can help” yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
