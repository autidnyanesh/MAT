import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import AppGuard from "../components/guards/AppGuard";
import { APPS } from "../context/ApplicationContext";
import { ALL_ROLES, ROLES } from "../config/roles";
import {
  MeaEnrolment,
  MeaMyRequests,
  MeaApprovalQueue,
  MeaReferred,
  MeaRejected,
  MeaReports,
} from "../pages/mea";

function meaPage(user, allowedRoles, element) {
  return (
    <AppGuard app={APPS.MEA}>
      <ProtectedRoute user={user} allowedRoles={allowedRoles}>
        {element}
      </ProtectedRoute>
    </AppGuard>
  );
}

const APPROVER_ROLES = [
  ROLES.DCO,
  ROLES.DCOC,
  ROLES.SOM,
  ROLES.BH,
  ROLES.RH,
  ROLES.AGM,
  ROLES.DGM,
];

/** MEA-only routes (merchant enablement / enrolment). */
export function renderMeaRoutes(user) {
  return (
    <>
      <Route
        path="/mea/enrolment"
        element={meaPage(user, [ROLES.BU], <MeaEnrolment />)}
      />
      <Route
        path="/mea/my-requests"
        element={meaPage(user, ALL_ROLES, <MeaMyRequests />)}
      />
      <Route
        path="/mea/approval-queue"
        element={meaPage(user, APPROVER_ROLES, <MeaApprovalQueue />)}
      />
      <Route
        path="/mea/referred"
        element={meaPage(user, [ROLES.BU], <MeaReferred />)}
      />
      <Route
        path="/mea/rejected"
        element={meaPage(user, [ROLES.BU], <MeaRejected />)}
      />
      <Route
        path="/mea/reports"
        element={meaPage(user, ALL_ROLES, <MeaReports />)}
      />
    </>
  );
}
