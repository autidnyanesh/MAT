import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import AppGuard from "../components/guards/AppGuard";
import { APPS } from "../context/ApplicationContext";
import { ALL_ROLES, ROLES } from "../config/roles";
import {
  MatReport,
  SFTPFileHandling,
  ARNFileHandling,
  RaisedRequest,
  MyRequest,
  ArchivalEnquiry,
  ReferredBRequest,
  Rejected,
  DCOApprovalQueue,
  VendorRejectedRefund,
  VendorRejectReSumbit,
} from "../pages/mat";

function matPage(user, allowedRoles, element) {
  return (
    <AppGuard app={APPS.MAT}>
      <ProtectedRoute user={user} allowedRoles={allowedRoles}>
        {element}
      </ProtectedRoute>
    </AppGuard>
  );
}

/** MAT-only routes wired to navbar menus. */
export function renderMatRoutes(user) {
  return (
    <>
      <Route
        path="/raiseRequest"
        element={matPage(user, [ROLES.BU], <RaisedRequest />)}
      />
      <Route
        path="/vendorRejectRefund"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <VendorRejectedRefund />)}
      />
      <Route
        path="/vendorRejectResumbit"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <VendorRejectReSumbit />)}
      />
      <Route
        path="/myRequest"
        element={matPage(user, [ROLES.BU], <MyRequest />)}
      />
      <Route
        path="/referredRequest"
        element={matPage(user, [ROLES.BU], <ReferredBRequest />)}
      />
      <Route
        path="/rejected"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <Rejected />)}
      />
      <Route
        path="/approvalQueue"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <DCOApprovalQueue />)}
      />
      <Route
        path="/archivalEnquiry"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <ArchivalEnquiry />)}
      />
      <Route
        path="/report"
        element={matPage(user, ALL_ROLES, <MatReport />)}
      />
      <Route
        path="/sftpUpload"
        element={matPage(user, [ROLES.DCO], <SFTPFileHandling />)}
      />
      <Route
        path="/arnHandling"
        element={matPage(user, [ROLES.DCO], <ARNFileHandling />)}
      />
    </>
  );
}
