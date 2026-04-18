import { Link, NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

export function AppShell() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api("/api/notifications");
        const n = (data.notifications || []).filter((x) => !x.read).length;
        if (!cancelled) setUnread(n);
      } catch {
        if (!cancelled) setUnread(0);
      }
    })();
    const t = setInterval(async () => {
      try {
        const data = await api("/api/notifications");
        const n = (data.notifications || []).filter((x) => !x.read).length;
        if (!cancelled) setUnread(n);
      } catch {
        /* ignore */
      }
    }, 45000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const linkClass = ({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/dashboard" className="brand">
            <span className="brand-mark" />
            Helplytics
          </Link>
          <nav className="topnav">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/explore" className={linkClass}>
              Explore
            </NavLink>
            <NavLink to="/requests/new" className={linkClass}>
              New request
            </NavLink>
            <NavLink to="/messages" className={linkClass}>
              Messages
            </NavLink>
            <NavLink to="/leaderboard" className={linkClass}>
              Leaderboard
            </NavLink>
            <NavLink to="/ai-center" className={linkClass}>
              AI center
            </NavLink>
            <NavLink to="/notifications" className={linkClass}>
              Notifications
              {unread > 0 ? <span className="pill">{unread > 9 ? "9+" : unread}</span> : null}
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            {user?.isAdmin ? (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            ) : null}
          </nav>
          <div className="topbar-actions">
            <span className="muted small">{user?.name || user?.email}</span>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}
