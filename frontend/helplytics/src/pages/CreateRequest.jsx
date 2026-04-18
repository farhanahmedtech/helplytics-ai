import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export function CreateRequest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [aiPanel, setAiPanel] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const textBlob = `${title}\n${description}`;

  const runAi = async () => {
    setError("");
    setBusy(true);
    try {
      const [cat, urg, tagz, rewrite] = await Promise.all([
        api("/api/ai/categorize", { method: "POST", body: JSON.stringify({ text: textBlob }) }),
        api("/api/ai/urgency", { method: "POST", body: JSON.stringify({ text: textBlob }) }),
        api("/api/ai/tags", { method: "POST", body: JSON.stringify({ text: textBlob }) }),
        api("/api/ai/rewrite", { method: "POST", body: JSON.stringify({ text: description }) }),
      ]);
      setAiPanel({ cat, urg, tagz, rewrite });
      if (!category) setCategory(cat.category);
      setUrgency(urg.urgency);
      if (!tags.trim() && tagz.tags?.length) setTags(tagz.tags.join(", "));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = {
        title,
        description,
        tags: tagList,
        useAiAssist: true,
      };
      if (category) payload.category = category;
      if (urgency) payload.urgency = urgency;

      const data = await api("/api/requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      navigate(`/requests/${data.request._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page" style={{ padding: 0 }}>
      <h1 className="hero-title" style={{ fontSize: "2.1rem" }}>
        Create a help request
      </h1>
      <p className="muted" style={{ marginTop: 0 }}>
        AI assists with categorization, tags, urgency, and rewrite suggestions — you stay in control.
      </p>

      <div className="grid cols-2">
        <form className="card stack" onSubmit={submit}>
          <div className="field">
            <label htmlFor="t">Title</label>
            <input id="t" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
          </div>
          <div className="field">
            <label htmlFor="d">Description</label>
            <textarea id="d" value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} />
          </div>
          <div className="field">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, debugging, …" />
          </div>
          <div className="grid cols-2">
            <div className="field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Auto (AI)</option>
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
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div className="row">
            <button type="button" className="btn" onClick={runAi} disabled={busy}>
              Run AI assist
            </button>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              Publish request
            </button>
          </div>
        </form>

        <div className="card stack">
          <div className="row spread">
            <h3 style={{ margin: 0 }}>AI suggestions</h3>
            <span className="pill" style={{ marginLeft: 0 }}>
              keyword + heuristics
            </span>
          </div>
          {!aiPanel ? <p className="muted small">Click “Run AI assist” to populate this panel.</p> : null}
          {aiPanel ? (
            <div className="stack">
              <div className="insight">
                Suggested category: <strong>{aiPanel.cat.category}</strong>
              </div>
              <div className="insight">
                Detected urgency: <strong>{aiPanel.urg.urgency}</strong>
              </div>
              <div>
                <div className="muted small" style={{ fontWeight: 700 }}>
                  Suggested tags
                </div>
                <div style={{ marginTop: 8 }}>
                  {aiPanel.tagz.tags?.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="muted small" style={{ fontWeight: 700 }}>
                  Rewrite suggestions
                </div>
                <pre className="mono" style={{ whiteSpace: "pre-wrap", margin: "10px 0 0", background: "#0b1020", color: "#e7e9f2", padding: 12, borderRadius: 12 }}>
                  {JSON.stringify(aiPanel.rewrite, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
