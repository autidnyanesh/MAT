import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Wraps a route so only users with an allowed role can access it.
 *
 * Props:
 *  - user        : current user object (null = not logged in)
 *  - allowedRoles: array of role strings that may access this route
 *  - children    : the page component to render
 *
 * Redirects to "/" if the user's role is not permitted.
 */
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
