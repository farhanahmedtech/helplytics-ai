import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export function Onboarding() {
  const { refreshMe } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [location, setLocation] = useState("");
  const [ai, setAi] = useState(null);
  const [error, setError] = useState("");

  const splitList = (s) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const previewAi = async () => {
    setError("");
    try {
      const data = await api("/api/ai/onboarding-suggestions", {
        method: "POST",
        body: JSON.stringify({
          skills: splitList(skills),
          interests: splitList(interests),
          location,
        }),
      });
      setAi(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api("/api/users/me/onboarding", {
        method: "PUT",
        body: JSON.stringify({
          name,
          skills: splitList(skills),
          interests: splitList(interests),
          location,
        }),
      });
      await refreshMe();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="shell narrow">
        <h1 className="hero-title" style={{ fontSize: "2.2rem" }}>
          Let’s personalize your profile
        </h1>
        <p className="hero-sub">Tell us who you are. We will suggest skills and learning areas using lightweight AI heuristics.</p>

        <div className="card">
          <form className="stack" onSubmit={save}>
            <div className="field">
              <label htmlFor="onb-name">Name</label>
              <input id="onb-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="onb-skills">Skills (comma-separated)</label>
              <input id="onb-skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="JavaScript, Teaching, Writing" />
            </div>
            <div className="field">
              <label htmlFor="onb-interests">Interests (comma-separated)</label>
              <input id="onb-interests" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Web development, Career growth" />
            </div>
            <div className="field">
              <label htmlFor="onb-loc">Location</label>
              <input id="onb-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / timezone" />
            </div>

            {error ? <div className="error">{error}</div> : null}

            <div className="row">
              <button type="button" className="btn" onClick={previewAi}>
                Get AI suggestions
              </button>
              <button className="btn btn-primary" type="submit">
                Save and continue
              </button>
            </div>
          </form>

          {ai ? (
            <div style={{ marginTop: 18 }} className="stack">
              <h3 style={{ margin: 0 }}>AI suggestions</h3>
              <div className="grid cols-2">
                <div className="card" style={{ boxShadow: "none" }}>
                  <div className="muted small" style={{ fontWeight: 700 }}>
                    Skills you could help with
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {ai.canHelpWith?.map((s) => (
                      <span key={s} className="tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card" style={{ boxShadow: "none" }}>
                  <div className="muted small" style={{ fontWeight: 700 }}>
                    Areas you may want help in
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {ai.mayNeedHelpIn?.map((s) => (
                      <span key={s} className="tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {(ai.notes || []).map((n) => (
                <div key={n} className="insight">
                  {n}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
