import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ArchivalEnquiry from "./pages/RequestHandling/ArchivalEnquiry";
import Report from "./pages/Report";
import ProfileManagement from "./pages/ProfileManagement";
import RaisedRequest from "./pages/RequestHandling/RaisedRequest";
import MyRequest from "./pages/RequestHandling/MyRequest";
import ApprovalQueue from "./pages/RequestHandling/ApprovalQueue";
import FinalApproval from "./pages/FinalApproval";
import SFTPFileHandling from "./pages/SFTPFileHandling";
import ReferredBRequest from "./pages/RequestHandling/ReferredBRequest";
import PullRequest from "./pages/RequestHandling/PullRequest";
import Rejected from "./pages/RequestHandling/Rejected";
import DCOApprovalQueue from "./pages/RequestHandling/DCOApprovalQueue";
import DCOCheckerApprovalQueue from "./pages/RequestHandling/DCOCheckerApprovalQueue";
import RejectionAfterTransaction from "./pages/RequestHandling/RejectionAfterTransaction";
import VendorRejectedRefund from "./pages/RequestHandling/VendorRejectedRefund";
import VendorRejectReSumbit from "./pages/RequestHandling/VendorRejectReSumbit";
import RetryTransaction from "./pages/RequestHandling/RetryTransaction";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import useSessionTimeout from "./hooks/useSessionTimeout";
import AlertModal from "./components/AlertModel";
import ARNFileHandling from "./pages/ARNFileHandling";
import api, { clearAccessToken, setAccessToken } from "./api/axiosConfig";
import "./styles/main.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Role constants — single source of truth
const ROLES = {
  BU: "BU",
  DCO: "DCO",
};

const ALL_ROLES = Object.values(ROLES);

function AppShell({ user, theme, setTheme, onLogout }) {
  const navigate = useNavigate();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Always redirect to dashboard on mount (i.e. after login)
  useEffect(() => {
    navigate("/", { replace: true });
  }, []);

  // Session timeout — auto-logout after 15 min of inactivity, with a
  // warning modal shown 1 minute beforehand so the user can stay signed in
  // by simply moving the mouse or pressing a key.
  useSessionTimeout(onLogout, () => setShowTimeoutWarning(true));

  return (
    <div className="app-shell">
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
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU]}>
                  <RaisedRequest />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor-rejected-refund"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU, ROLES.DCO]}>
                  <VendorRejectedRefund />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor-rejected-resumbit"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU, ROLES.DCO]}>
                  <VendorRejectReSumbit />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-request"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU]}>
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
              path="/rejected"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.BU, ROLES.DCO]}>
                  <Rejected />
                </ProtectedRoute>
              }
            />

            {/* Approval — SOM, BH, RH */}
            <Route
              path="/approval-queue"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={[ROLES.SOM, ROLES.BH, ROLES.RH]}
                >
                  <ApprovalQueue />
                </ProtectedRoute>
              }
            />

            {/* DCO Approval Queue */}
            <Route
              path="/dco-approval-queue"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.DCO]}>
                  <DCOApprovalQueue />
                </ProtectedRoute>
              }
            />

            {/* DCO Checker Approval Queue */}
            {/* <Route
              path="/dco-checker-approval-queue"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.DCOC]}>
                  <DCOCheckerApprovalQueue />
                </ProtectedRoute>
              }
            /> */}

            {/* Legacy route — consolidated into Profile Management */}
            <Route path="/user-approval-queue" element={<Navigate to="/profile-management" replace />} />

            {/* Rejection After Transaction — DCO + DCOC */}
            <Route
              path="/rejection-after-txn"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.DCO]}>
                  <RejectionAfterTransaction />
                </ProtectedRoute>
              }
            />

            {/* Retry Transaction — DCOC only */}
            {/* <Route
              path="/retry-transaction"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.DCOC]}>
                  <RetryTransaction />
                </ProtectedRoute>
              }
            /> */}

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
              path="/sftp-upload"
              element={
                <ProtectedRoute user={user} allowedRoles={ROLES.DCO}>
                  <SFTPFileHandling />
                </ProtectedRoute>
              }
            />

            <Route
              path="/arn-handling"
              element={
                <ProtectedRoute user={user} allowedRoles={ROLES.DCO}>
                  <ARNFileHandling />
                </ProtectedRoute>
              }
            />

            {/* Profile / User Management — DCO users (admin rights checked in page) */}
            <Route
              path="/profile-management"
              element={
                <ProtectedRoute user={user} allowedRoles={[ROLES.DCO]}>
                  <ProfileManagement user={user} />
                </ProtectedRoute>
              }
            />
            <Route path="/delete-user" element={<Navigate to="/profile-management" replace />} />
            <Route path="/activate-user" element={<Navigate to="/profile-management" replace />} />

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
  // const [restoring, setRestoring] = useState(true);

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

  // On page load/refresh, the in-memory access token is gone, but the
  // httpOnly refresh cookie may still be valid. Try to silently restore
  // the session instead of always bouncing back to the login screen.
  // Wrapped so a missing/unavailable backend just falls through to login.
  // useEffect(() => {
  //   let cancelled = false;

  //   (async () => {
  //     try {
  //       const refreshRes = await api.post("/api/refresh", {}, { withCredentials: true });
  //       const token = refreshRes?.data?.accessToken;
  //       if (!token) throw new Error("No access token returned");
  //       setAccessToken(token);

  //       const meRes = await api.get("/api/me");
  //       if (!cancelled && meRes?.data) {
  //         setUser(meRes.data);
  //       }
  //     } catch {
  //       // No valid session to restore — user will see the login screen.
  //     } finally {
  //       if (!cancelled) setRestoring(false);
  //     }
  //   })();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);

  // if (restoring) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center vh-100 bg-body-tertiary">
  //       <div className="card shadow-lg border-0 rounded-4 p-5 text-center" style={{ width: "22rem" }}>
  //         <div
  //           className="spinner-border text-primary mx-auto"
  //           style={{ width: "4rem", height: "4rem" }}
  //           role="status"
  //         >
  //           <span className="visually-hidden">Loading...</span>
  //         </div>

  //         <h4 className="mt-4 mb-2">Restoring Session</h4>

  //         <p className="text-muted mb-0">
  //           Please wait while we restore your session...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

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