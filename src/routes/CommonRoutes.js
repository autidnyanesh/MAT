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
        element={<Navigate to="/profile-management" replace />}
      />
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
    </>
  );
}
