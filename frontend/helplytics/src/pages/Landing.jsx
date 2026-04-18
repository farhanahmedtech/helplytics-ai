import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" />
            Helplytics
          </Link>
          <div className="topbar-actions" style={{ marginLeft: "auto" }}>
            <Link to="/auth" className="btn btn-ghost">
              Log in
            </Link>
            <Link to="/auth?mode=signup" className="btn btn-primary">
              Join the community
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="shell" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,0.85fr)", gap: 28, alignItems: "start" }}>
          <div>
            <p className="muted" style={{ margin: "0 0 10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>
              Helplytics AI · Grand Coding Night
            </p>
            <h1 className="hero-title">Community support that feels premium, fast, and human.</h1>
            <p className="hero-sub">
              Connect learners who need timely help with people who love to teach. Track contributions, build trust, and let lightweight AI assist with
              categorization, tags, and clarity — without losing the human center.
            </p>
            <div className="row" style={{ marginBottom: 18 }}>
              <Link to="/auth?mode=signup" className="btn btn-primary">
                Get started
              </Link>
              <Link to="/auth?next=/explore" className="btn">
                Browse the feed
              </Link>
            </div>
            <div className="grid cols-3">
              <div className="stat">
                <strong>12.4k</strong>
                <span className="muted small">matches made (demo stat)</span>
              </div>
              <div className="stat">
                <strong>96%</strong>
                <span className="muted small">requests get a response</span>
              </div>
              <div className="stat">
                <strong>48h</strong>
                <span className="muted small">median time to first helper</span>
              </div>
            </div>
          </div>

          <div className="preview-card">
            <div className="row spread" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>Live pulse</div>
                <div className="muted small">What the community is doing right now</div>
              </div>
              <span className="pill" style={{ marginLeft: 0 }}>
                AI-assisted
              </span>
            </div>
            <div className="stack">
              <div className="card" style={{ boxShadow: "none" }}>
                <div className="row spread">
                  <strong style={{ fontSize: 14 }}>New · Programming</strong>
                  <span className="tag" style={{ margin: 0 }}>
                    medium urgency
                  </span>
                </div>
                <p className="muted small" style={{ margin: "8px 0 0" }}>
                  “Need help debugging a React state issue — deadline this week.”
                </p>
              </div>
              <div className="card" style={{ boxShadow: "none" }}>
                <div className="row spread">
                  <strong style={{ fontSize: 14 }}>Trending · Career</strong>
                  <span className="tag" style={{ margin: 0 }}>
                    tags: resume
                  </span>
                </div>
                <p className="muted small" style={{ margin: "8px 0 0" }}>
                  “Resume review for internship applications.”
                </p>
              </div>
              <div className="card" style={{ boxShadow: "none" }}>
                <div className="row spread">
                  <strong style={{ fontSize: 14 }}>Learning · Academics</strong>
                  <span className="tag" style={{ margin: 0 }}>
                    low urgency
                  </span>
                </div>
                <p className="muted small" style={{ margin: "8px 0 0" }}>
                  “MongoDB aggregation basics — looking for a simple mental model.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page" style={{ paddingTop: 8 }}>
        <div className="shell">
          <h2 className="hero-title" style={{ fontSize: "2rem", marginBottom: 10 }}>
            Platform overview
          </h2>
          <p className="hero-sub" style={{ marginBottom: 18 }}>
            Helplytics is a multi-page community product: you can ask for structured help, offer your skills, coordinate in messages, and track trust and
            contributions — with AI assistance for categorization, tags, urgency, rewrites, and helper reply prompts.
          </p>
          <ul className="muted" style={{ lineHeight: 1.85, maxWidth: "70ch", margin: "0 0 28px", paddingLeft: 20 }}>
            <li>
              <strong>Ask:</strong> publish requests with tags, category, and urgency so the right people find you faster.
            </li>
            <li>
              <strong>Offer:</strong> explore the feed with filters (category, urgency, skills, location) and tap “I can help”.
            </li>
            <li>
              <strong>Track:</strong> notifications, leaderboard, badges, and a trust score keep collaboration accountable and rewarding.
            </li>
          </ul>
        </div>
      </section>

      <section className="page">
        <div className="shell">
          <div className="grid cols-3">
            <div className="card">
              <h3>Ask with clarity</h3>
              <p className="muted small">Structured requests, urgency, and AI-assisted rewrites help helpers respond faster.</p>
            </div>
            <div className="card">
              <h3>Offer help confidently</h3>
              <p className="muted small">Skill-aware matching, messaging, and a trust score keep quality high.</p>
            </div>
            <div className="card">
              <h3>See your impact</h3>
              <p className="muted small">Leaderboards, badges, and analytics-style insights celebrate contributors.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
