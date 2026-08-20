import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Wraps a route so only users with an allowed role (and optional admin) can access it.
 *
 * Props:
 *  - user         : current user object (null = not logged in)
 *  - allowedRoles : array of role strings that may access this route
 *  - requireAdmin : if true, user.isAdmin must be true
 *  - children     : the page component to render
 */
const ProtectedRoute = ({ user, allowedRoles, requireAdmin = false, children }) => {
  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/home" replace />;
    }
  }

  if (requireAdmin && user.isAdmin !== true) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
