import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function Auth() {
  const { user, booting, login, register } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get("mode") === "signup" ? "signup" : "login";
  const next = params.get("next") || "";

  const [tab, setTab] = useState(mode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("both");
  const [error, setError] = useState("");

  const destination = useMemo(() => {
    if (next && next.startsWith("/")) return next;
    return "/dashboard";
  }, [next]);

  if (!booting && user) {
    if (!user.onboardingComplete) return <Navigate to="/onboarding" replace />;
    return <Navigate to={destination} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (tab === "login") {
        const u = await login(email, password);
        navigate(!u.onboardingComplete ? "/onboarding" : destination, { replace: true });
      } else {
        const u = await register({ email, password, name, role });
        navigate(!u.onboardingComplete ? "/onboarding" : destination, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="page">
      <div className="shell narrow">
        <div className="row spread" style={{ marginBottom: 18 }}>
          <Link to="/" className="brand">
            <span className="brand-mark" />
            Helplytics
          </Link>
          <Link className="muted small" to="/">
            Back to home
          </Link>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 16 }}>
            <button type="button" className={`btn ${tab === "login" ? "btn-primary" : ""}`} onClick={() => setTab("login")}>
              Log in
            </button>
            <button type="button" className={`btn ${tab === "signup" ? "btn-primary" : ""}`} onClick={() => setTab("signup")}>
              Sign up
            </button>
          </div>

          <form className="stack" onSubmit={onSubmit}>
            {tab === "signup" ? (
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            ) : null}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {tab === "signup" ? (
              <div className="field">
                <label>I am joining as</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="needHelp">Need help</option>
                  <option value="canHelp">Can help</option>
                  <option value="both">Both</option>
                </select>
                <p className="muted small" style={{ margin: "8px 0 0" }}>
                  You can change this later in your profile.
                </p>
              </div>
            ) : null}

            {error ? <div className="error">{error}</div> : null}

            <button className="btn btn-primary" type="submit">
              {tab === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
