import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, {
  clearAccessToken,
  refreshAccessToken,
  resetSessionRestoreCache,
  restoreSession,
} from "../api/axiosConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [booting, setBooting] = useState(true);

  const applyProfile = useCallback((userData) => {
    if (!userData || typeof userData !== "object") {
      setUser(null);
      return;
    }
    const { accessToken: _ignore, ...profile } = userData;
    setUser({
      ...profile,
      isAdmin: Boolean(profile.isAdmin),
      activeApp: profile.activeApp === "MEA" ? "MEA" : "MAT",
      allowedApps: profile.allowedApps || ["MAT", "MEA"],
    });
  }, []);

  const login = useCallback((userData) => {
    applyProfile(userData);
  }, [applyProfile]);

  const refreshSession = useCallback(async () => {
    const data = await refreshAccessToken();
    applyProfile(data);
    return data;
  }, [applyProfile]);

  const logout = useCallback(() => {
    api
      .post("/api/logout", {})
      .catch(() => {})
      .finally(() => {
        clearAccessToken();
        resetSessionRestoreCache();
        setUser(null);
      });
  }, []);

  // One shared restore call (survives React StrictMode double-mount in dev)
  useEffect(() => {
    let cancelled = false;

    restoreSession()
      .then((data) => {
        if (cancelled) return;
        if (data?.accessToken) {
          applyProfile(data);
        } else {
          // No session — stay on login; do NOT call /logout (would clear a valid cookie race)
          clearAccessToken();
        }
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applyProfile]);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      refreshSession,
      booting,
      theme,
      setTheme,
    }),
    [user, login, logout, refreshSession, booting, theme]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
