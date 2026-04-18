import { useEffect, useState } from "react";
import { api } from "../api.js";

export function AICenter() {
  const [trends, setTrends] = useState(null);
  const [communitySuggestions, setCommunitySuggestions] = useState([]);
  const [personal, setPersonal] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [t, p] = await Promise.all([api("/api/ai/trends"), api("/api/ai/personal-insights")]);
        setTrends(t.trends);
        setCommunitySuggestions(t.communitySuggestions || []);
        setPersonal(p.insights);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <div className="page" style={{ padding: 0 }}>
      <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
        AI center
      </h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Matches the brief: <strong>trends</strong>, community-level <strong>suggestions</strong>, and personal <strong>AI insights</strong> — powered by transparent
        heuristics.
      </p>

      {error ? <div className="error">{error}</div> : null}

      <div className="grid cols-3">
        <div className="card stack">
          <div className="row spread">
            <h3 style={{ margin: 0 }}>Trends</h3>
            <span className="pill" style={{ marginLeft: 0 }}>
              n = {trends?.sampleSize ?? "—"}
            </span>
          </div>
          <div className="muted small">Top categories</div>
          <div className="stack">
            {(trends?.topCategories || []).map((c) => (
              <div key={c.category} className="row spread card" style={{ boxShadow: "none", padding: 12 }}>
                <strong>{c.category}</strong>
                <span className="tag" style={{ margin: 0 }}>
                  {c.count}
                </span>
              </div>
            ))}
            {!trends?.topCategories?.length ? <p className="muted small">No data yet.</p> : null}
          </div>
          <div className="muted small" style={{ marginTop: 10 }}>
            Urgency mix: low {trends?.urgencyMix?.low ?? 0}, medium {trends?.urgencyMix?.medium ?? 0}, high {trends?.urgencyMix?.high ?? 0}
          </div>
        </div>

        <div className="card stack">
          <div className="row spread">
            <h3 style={{ margin: 0 }}>Suggestions</h3>
            <span className="pill" style={{ marginLeft: 0 }}>
              from trends
            </span>
          </div>
          <div className="stack">
            {(communitySuggestions || []).map((s) => (
              <div key={s} className="insight" style={{ whiteSpace: "pre-wrap" }}>
                {s.replace(/\*\*(.*?)\*\*/g, "$1")}
              </div>
            ))}
            {!communitySuggestions?.length ? <p className="muted small">Loading…</p> : null}
          </div>
        </div>

        <div className="card stack">
          <div className="row spread">
            <h3 style={{ margin: 0 }}>AI insights</h3>
            <span className="pill" style={{ marginLeft: 0 }}>
              for you
            </span>
          </div>
          <div className="stack">
            {(personal || []).map((t) => (
              <div key={t} className="insight">
                {t}
              </div>
            ))}
            {!personal?.length ? <p className="muted small">Loading…</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
