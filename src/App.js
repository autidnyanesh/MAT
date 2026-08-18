import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import useSessionTimeout from "./hooks/useSessionTimeout";
import AlertModal from "./components/AlertModel";
import { Login, Register } from "./pages/auth";
import { MatDashboard } from "./pages/mat";
import { MeaDashboard } from "./pages/mea";
import { renderMatRoutes } from "./routes/MatRoutes";
import { renderMeaRoutes } from "./routes/MeaRoutes";
import { renderCommonRoutes } from "./routes/CommonRoutes";
import { ALL_ROLES } from "./config/roles";
import { useAuth } from "./context/AuthContext";
import { APPS, ACTIVE_APP_STORAGE_KEY, useApplication } from "./context/ApplicationContext";
import "./styles/main.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function AppShell() {
  const { user, theme, setTheme, logout } = useAuth();
  const { activeApp } = useApplication();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useSessionTimeout(logout, () => setShowTimeoutWarning(true));

  return (
    <div className="app-shell" data-active-app={activeApp}>
      <AlertModal
        show={showTimeoutWarning}
        type="warning"
        title="Your session is about to expire"
        message="You've been inactive for a while. Move the mouse or press any key to stay signed in."
        onClose={() => setShowTimeoutWarning(false)}
      />
      <main className="main-panel w-100">
        <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
          <Navbar
            user={user}
            theme={theme}
            setTheme={setTheme}
            onLogout={logout}
          />
        </div>

        <section className="content-shell">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} allowedRoles={ALL_ROLES}>
                  {activeApp === APPS.MEA ? <MeaDashboard /> : <MatDashboard />}
                </ProtectedRoute>
              }
            />

            {renderMatRoutes(user)}
            {renderMeaRoutes(user)}
            {renderCommonRoutes(user)}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

function App() {
  const { user, login, theme, authPage, setAuthPage, booting } = useAuth();
  const { setActiveApp, setAllowedApps, resetApplication } = useApplication();

  const handleLogin = (userData) => {
    const app = userData?.activeApp === APPS.MEA ? APPS.MEA : APPS.MAT;
    const apps =
      Array.isArray(userData?.allowedApps) && userData.allowedApps.length
        ? userData.allowedApps
        : [APPS.MAT, APPS.MEA];

    setAllowedApps(apps);
    setActiveApp(app);
    login(userData);
  };

  // Keep ApplicationContext in sync on login, F5 restore, and logout.
  // Previously restore only set AuthContext.user — activeApp/allowedApps
  // could stay stale (sessionStorage vs server profile mismatch).
  useEffect(() => {
    if (booting) return;

    if (!user) {
      resetApplication();
      return;
    }

    const apps =
      Array.isArray(user.allowedApps) && user.allowedApps.length
        ? user.allowedApps.filter((a) => a === APPS.MAT || a === APPS.MEA)
        : [APPS.MAT, APPS.MEA];
    const allowed = apps.length ? apps : [APPS.MAT];
    setAllowedApps(allowed);

    let preferred = null;
    try {
      preferred = sessionStorage.getItem(ACTIVE_APP_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (preferred !== APPS.MAT && preferred !== APPS.MEA) {
      preferred = user.activeApp === APPS.MEA ? APPS.MEA : APPS.MAT;
    }
    if (!allowed.includes(preferred)) {
      preferred = allowed.includes(APPS.MAT) ? APPS.MAT : allowed[0];
    }
    setActiveApp(preferred);
  }, [user, booting, resetApplication, setAllowedApps, setActiveApp]);

  return (
    <BrowserRouter>
      <div className={`app ${theme}`}>
        {booting ? (
          <div className="d-flex justify-content-center align-items-center min-vh-100 text-muted">
            loading…
          </div>
        ) : !user ? (
          authPage === "login" ? (
            <Login
              onLogin={handleLogin}
              goToRegister={() => setAuthPage("register")}
            />
          ) : (
            <Register goToLogin={() => setAuthPage("login")} />
          )
        ) : (
          <AppShell />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
