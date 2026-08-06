import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
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
import { APPS, useApplication } from "./context/ApplicationContext";
import "./styles/main.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function AppShell() {
  const navigate = useNavigate();
  const { user, theme, setTheme, logout } = useAuth();
  const { activeApp } = useApplication();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const { user, login, theme, authPage, setAuthPage } = useAuth();
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

  useEffect(() => {
    if (!user) resetApplication();
  }, [user, resetApplication]);

  return (
    <BrowserRouter>
      <div className={`app ${theme}`}>
        {!user ? (
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
