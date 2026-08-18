import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import AppGuard from "../components/guards/AppGuard";
import { APPS } from "../context/ApplicationContext";
import { ALL_ROLES, ROLES } from "../config/roles";
import {
  MatReport,
  // FinalApproval,
  SFTPFileHandling,
  ARNFileHandling,
  RaisedRequest,
  MyRequest,
  // ApprovalQueue,
  ArchivalEnquiry,
  ReferredBRequest,
  PullRequest,
  Rejected,
  DCOApprovalQueue,
  RejectionAfterTransaction,
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

/** MAT-only routes (refund / reversal / file handling). */
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
        path="/pullRequest"
        element={matPage(user, ALL_ROLES, <PullRequest />)}
      />
      <Route
        path="/rejected"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <Rejected />)}
      />
      {/* <Route
        path="/approvalQueue"
        element={matPage(user, [ROLES.BU], <ApprovalQueue />)}
      /> */}
      <Route
        path="/approvalQueue"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <DCOApprovalQueue />)}
      />
      <Route
        path="/rejection-after-txn"
        element={matPage(user, [ROLES.DCO], <RejectionAfterTransaction />)}
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
