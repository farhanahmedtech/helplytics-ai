import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ children, requireOnboarding = true, adminOnly = false }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="page">
        <div className="shell narrow">
          <p className="muted">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireOnboarding && !user.onboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
