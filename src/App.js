import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ArchivalEnquiry from "./pages/RequestHandling/ArchivalEnquiry";
import Report from "./pages/Report";
import ProfileManagement from "./pages/ProfileManagement";
import DeleteUser from "./pages/DeleteUser";
import ActivateUser from "./pages/ActivateUser";
import RaisedRequest from "./pages/RequestHandling/RaisedRequest";
import MyRequest from "./pages/RequestHandling/MyRequest";
import ApprovalQueue from "./pages/RequestHandling/ApprovalQueue";
import FinalApproval from "./pages/FinalApproval";
import FileHandling from "./pages/FileHandling";
import ReferredBRequest from "./pages/RequestHandling/ReferredBRequest";
import PullRequest from "./pages/RequestHandling/PullRequest";
import Enquiry from "./pages/RequestHandling/Enquiry";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import useSessionTimeout from "./hooks/useSessionTimeout";
import { clearAccessToken } from "./api/axiosConfig";
import "./styles/main.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Role constants — single source of truth
const ROLES = {
  BU: "BU",
  SOM: "SOM",
  BH: "BH",
  RH: "RH",
  DCO: "DCO",
  AGM: "AGM",
  DGM: "DGM",
};

const ALL_ROLES = Object.values(ROLES);

function AppShell({ user, theme, setTheme, onLogout }) {
  const navigate = useNavigate();

  // Always redirect to dashboard on mount (i.e. after login)
  useEffect(() => {
    navigate("/", { replace: true });
  }, []);

  // Session timeout — auto-logout after 15 min of inactivity
  // useSessionTimeout(onLogout);

  return (
    <div className="app-shell">
      <main className="main-panel w-100">
        <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
          <Navbar
            user={user}
            theme={theme}
            setTheme={setTheme}
            onLogout={onLogout}
          />
        </div>

        <section className="content-shell">
          <Routes>

            {/* Dashboard — all authenticated roles */}
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} allowedRoles={ALL_ROLES}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Request Handling — BU, SOM */}
            <Route
              path="/raise-request"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU, ROLES.SOM]}>
                  <RaisedRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-request"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU, ROLES.SOM]}>
                  <MyRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referred-request"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU]}>
                  <ReferredBRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pull-request"
              element={
                <ProtectedRoute user={user} allowedRoles={ALL_ROLES}>
                  <PullRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enquiry"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU, ROLES.DCO]}>
                  <Enquiry />
                </ProtectedRoute>
              }
            />

            {/* Approval — SOM, BH, RH, DCO */}
            <Route
              path="/approval-queue"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={[ROLES.SOM, ROLES.BH, ROLES.RH, ROLES.DCO]}
                >
                  <ApprovalQueue />
                </ProtectedRoute>
              }
            />

            {/* Final Approval — AGM, DGM */}
            <Route
              path="/final-approval"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.AGM, ROLES.DGM]}>
                  <FinalApproval />
                </ProtectedRoute>
              }
            />

            {/* Archival Enquiry — BU, DCO */}
            <Route
              path="/archival-enquiry"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU, ROLES.DCO]}>
                  <ArchivalEnquiry />
                </ProtectedRoute>
              }
            />

            {/* Reports — all roles */}
            <Route
              path="/report"
              element={
                <ProtectedRoute user={user} allowedRoles={ALL_ROLES}>
                  <Report />
                </ProtectedRoute>
              }
            />

            {/* File Handling — all roles */}
            <Route
              path="/file-handling"
              element={
                <ProtectedRoute user={user} allowedRoles={ALL_ROLES}>
                  <FileHandling />
                </ProtectedRoute>
              }
            />

            {/* Profile / User Management — DCO only */}
            <Route
              path="/profile-management"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.DCO]}>
                  <ProfileManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delete-user"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.DCO]}>
                  <DeleteUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activate-user"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.DCO]}>
                  <ActivateUser />
                </ProtectedRoute>
              }
            />

            {/* Catch-all — redirect any unknown route to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [page, setPage] = useState("login");

  const handleLogin = useCallback((userData) => {
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setPage("login");
  }, []);

  // Listen for 401 session-expired events fired by axiosConfig interceptor
  useEffect(() => {
    const handler = () => handleLogout();
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, [handleLogout]);

  return (
    <BrowserRouter>
      <div className={`app ${theme}`}>
        {!user ? (
          page === "login" ? (
            <Login
              onLogin={handleLogin}
              goToRegister={() => setPage("register")}
            />
          ) : (
            <Register goToLogin={() => setPage("login")} />
          )
        ) : (
          <AppShell
            user={user}
            theme={theme}
            setTheme={setTheme}
            onLogout={handleLogout}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
