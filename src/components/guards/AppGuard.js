import React from "react";
import { Navigate } from "react-router-dom";
import { useApplication } from "../../context/ApplicationContext";

/**
 * Ensures the current active application matches the route group.
 * Prevents MAT URLs from rendering while MEA is active (and vice versa).
 */
function AppGuard({ app, children }) {
  const { activeApp } = useApplication();
  if (activeApp !== app) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default AppGuard;
