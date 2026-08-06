import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { clearAccessToken } from "../api/axiosConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [authPage, setAuthPage] = useState("login");

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setAuthPage("login");
  }, []);

  // Axios interceptor fires this when the session expires (401).
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
      theme,
      setTheme,
      authPage,
      setAuthPage,
    }),
    [user, login, logout, theme, authPage]
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
