import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import useSessionTimeout from "./hooks/useSessionTimeout";
import AlertModal from "./components/modals/AlertModal";
import { Login, AppSelect } from "./pages/auth";
import { MatDashboard } from "./pages/mat";
import { MeaDashboard } from "./pages/mea";
import { renderMatRoutes } from "./routes/MatRoutes";
import { renderMeaRoutes } from "./routes/MeaRoutes";
import { renderCommonRoutes } from "./routes/CommonRoutes";
import { ALL_ROLES } from "./config/roles";
import { useAuth } from "./context/AuthContext";
import { APPS, useApplication } from "./context/ApplicationContext";
import "./styles/main.css";

function AppShell() {
  const { user, logout, refreshSession } = useAuth();
  const { activeApp } = useApplication();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const onIdleWarning = useCallback(() => setShowTimeoutWarning(true), []);
  const onIdleLogout = useCallback(() => {
    setShowTimeoutWarning(false);
    logout();
  }, [logout]);

  const resetIdleTimers = useSessionTimeout(onIdleLogout, onIdleWarning, {
    warningOpen: showTimeoutWarning,
  });

  const staySignedIn = async () => {
    setShowTimeoutWarning(false);
    resetIdleTimers();
    try {
      await refreshSession();
    } catch {
      logout();
    }
  };

  return (
    <div className="app-shell" data-active-app={activeApp}>
      <AlertModal
        show={showTimeoutWarning}
        type="warning"
        title="Your session is about to expire"
        message="You've been inactive for a while. Click OK to stay signed in."
        onClose={staySignedIn}
      />
      <main className="main-panel w-100">
        <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
          <Navbar user={user} onLogout={logout} />
        </div>

        <section className="content-shell">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute user={user} allowedRoles={ALL_ROLES}>
                  {activeApp === APPS.MEA ? <MeaDashboard /> : <MatDashboard />}
                </ProtectedRoute>
              }
            />

            {renderMatRoutes(user)}
            {renderMeaRoutes(user)}
            {renderCommonRoutes(user)}

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

function App() {
  const { user, login, theme, booting } = useAuth();
  const { beginAppSelection, hydrateFromStorage, resetApplication } = useApplication();
  const pendingSelectionRef = useRef(false);

  const handleLogin = (userData) => {
    const apps =
      Array.isArray(userData?.allowedApps) && userData.allowedApps.length
        ? userData.allowedApps
        : [APPS.MAT, APPS.MEA];

    pendingSelectionRef.current = true;
    beginAppSelection(apps);
    login(userData);
  };

  // Keep ApplicationContext in sync on login, F5 restore, and logout.
  useEffect(() => {
    if (booting) return;

    if (!user) {
      pendingSelectionRef.current = false;
      resetApplication();
      return;
    }

    const apps =
      Array.isArray(user.allowedApps) && user.allowedApps.length
        ? user.allowedApps.filter((a) => a === APPS.MAT || a === APPS.MEA)
        : [APPS.MAT, APPS.MEA];

    // Fresh login always shows the picker (unless the user has only one allowed app).
    // F5 restore uses sessionStorage so the picker is not asked again.
    if (pendingSelectionRef.current) {
      pendingSelectionRef.current = false;
      if (apps.length === 1) {
        hydrateFromStorage(apps);
      }
      return;
    }

    hydrateFromStorage(apps);
  }, [user, booting, resetApplication, hydrateFromStorage]);

  return (
    <BrowserRouter>
      <div className={`app ${theme}`}>
        {booting ? (
          <div className="d-flex justify-content-center align-items-center min-vh-100 text-muted">
            loading…
          </div>
        ) : (
          <AppRoutes user={user} onLogin={handleLogin} />
        )}
      </div>
    </BrowserRouter>
  );
}

/** Inside BrowserRouter: logout → "/"; login → picker (or /home on F5). */
function AppRoutes({ user, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { appSelected } = useApplication();

  useEffect(() => {
    if (!user && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    if (!user) return;
    if (!appSelected) {
      if (location.pathname !== "/select-app") {
        navigate("/select-app", { replace: true });
      }
      return;
    }
    if (location.pathname === "/" || location.pathname === "/select-app") {
      navigate("/home", { replace: true });
    }
  }, [user, appSelected, location.pathname, navigate]);

  if (!user) {
    return (
      <Login
        onLogin={(data) => {
          onLogin(data);
          navigate("/select-app", { replace: true });
        }}
      />
    );
  }

  if (!appSelected) {
    return <AppSelect />;
  }

  return <AppShell />;
}

export default App;
