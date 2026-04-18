import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/api/leaderboard");
        setRows(data.leaderboard || []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <div className="page" style={{ padding: 0 }}>
      <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
        Leaderboard
      </h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Top helpers ranked by contributions and trust — badges surface milestones.
      </p>

      {error ? <div className="error">{error}</div> : null}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table" style={{ border: "none", borderRadius: 0 }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Member</th>
              <th>Helped</th>
              <th>Trust</th>
              <th>Location</th>
              <th>Badges</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.user._id)}>
                <td style={{ fontWeight: 900 }}>#{r.rank}</td>
                <td>
                  <div style={{ fontWeight: 800 }}>{r.user.name || "Member"}</div>
                  <div className="muted small">{(r.user.skills || []).slice(0, 3).join(" · ")}</div>
                </td>
                <td>{r.user.helpedCount}</td>
                <td>{r.user.trustScore}</td>
                <td className="muted small">{r.user.location || "—"}</td>
                <td>
                  {(r.user.badges || []).map((b) => (
                    <span key={b} className="badge">
                      {b}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted small" style={{ marginTop: 12 }}>
        Want to climb? Keep helping and ask authors to mark requests solved — trust updates automatically.
      </p>
      <Link className="btn" to="/explore">
        Find someone to help
      </Link>
    </div>
  );
}
