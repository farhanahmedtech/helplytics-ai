import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return null;
    }
    const data = await api("/api/auth/me");
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setBooting(false);
      }
    })();
  }, [refreshMe]);

  const login = async (email, password) => {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      booting,
      refreshMe,
      login,
      register,
      logout,
      isAuthed: Boolean(user),
    }),
    [user, booting, refreshMe, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
