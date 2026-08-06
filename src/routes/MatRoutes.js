import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import AppGuard from "../components/guards/AppGuard";
import { APPS } from "../context/ApplicationContext";
import { ALL_ROLES, ROLES } from "../config/roles";
import {
  MatReport,
  FinalApproval,
  SFTPFileHandling,
  ARNFileHandling,
  RaisedRequest,
  MyRequest,
  ApprovalQueue,
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
        path="/raise-request"
        element={matPage(user, [ROLES.BU], <RaisedRequest />)}
      />
      <Route
        path="/vendor-rejected-refund"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <VendorRejectedRefund />)}
      />
      <Route
        path="/vendor-rejected-resumbit"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <VendorRejectReSumbit />)}
      />
      <Route
        path="/my-request"
        element={matPage(user, [ROLES.BU], <MyRequest />)}
      />
      <Route
        path="/referred-request"
        element={matPage(user, [ROLES.BU], <ReferredBRequest />)}
      />
      <Route
        path="/pull-request"
        element={matPage(user, ALL_ROLES, <PullRequest />)}
      />
      <Route
        path="/rejected"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <Rejected />)}
      />
      <Route
        path="/approval-queue"
        element={matPage(user, [ROLES.SOM, ROLES.BH, ROLES.RH], <ApprovalQueue />)}
      />
      <Route
        path="/dco-approval-queue"
        element={matPage(user, [ROLES.DCO], <DCOApprovalQueue />)}
      />
      <Route
        path="/rejection-after-txn"
        element={matPage(user, [ROLES.DCO], <RejectionAfterTransaction />)}
      />
      <Route
        path="/final-approval"
        element={matPage(user, [ROLES.AGM, ROLES.DGM], <FinalApproval />)}
      />
      <Route
        path="/archival-enquiry"
        element={matPage(user, [ROLES.BU, ROLES.DCO], <ArchivalEnquiry />)}
      />
      <Route
        path="/report"
        element={matPage(user, ALL_ROLES, <MatReport />)}
      />
      <Route
        path="/sftp-upload"
        element={matPage(user, [ROLES.DCO], <SFTPFileHandling />)}
      />
      <Route
        path="/arn-handling"
        element={matPage(user, [ROLES.DCO], <ARNFileHandling />)}
      />
    </>
  );
}
