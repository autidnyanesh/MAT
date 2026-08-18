import React from "react";
import { Navigate, Route } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import { ROLES } from "../config/roles";
import { ProfileManagement } from "../pages/common";

/**
 * Routes shared by MAT and MEA (no AppGuard).
 * User Management stays available after app toggle.
 */
export function renderCommonRoutes(user) {
  return (
    <>
      <Route
        path="/user-approval-queue"
        element={<Navigate to="/profileManagement" replace />}
      />
      <Route
        path="/profileManagement"
        element={
          <ProtectedRoute user={user} allowedRoles={[ROLES.DCO]}>
            <ProfileManagement user={user} />
          </ProtectedRoute>
        }
      />
      <Route path="/profile-management" element={<Navigate to="/profileManagement" replace />} />
      <Route path="/delete-user" element={<Navigate to="/profileManagement" replace />} />
      <Route path="/activate-user" element={<Navigate to="/profileManagement" replace />} />
    </>
  );
}
