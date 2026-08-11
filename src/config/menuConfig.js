/**
 * Navbar / route menus keyed by application (MAT | MEA) and role.
 * User Management lives under COMMON — always available regardless of active app.
 */

export const APP_BRAND = {
  MAT: {
    short: "MAT",
    full: "Merchant Acquiring Tool",
    accent: "linear-gradient(135deg, rgb(13, 110, 253), rgb(70 134 229))",
  },
  MEA: {
    short: "MEA",
    full: "Merchant Enablement App",
    accent: "linear-gradient(135deg, #0f766e, #14b8a6)",
  },
};

/** MAT request-handling menus by role */
export const MAT_ROLE_MENUS = {
  BU: [
    { to: "/raise-request", label: "Raise Requests" },
    { to: "/approval-queue", label: "Approval Queue" },
    { to: "/vendor-rejected-resumbit", label: "Vendor Rejected Re-submit" },
    { to: "/my-request", label: "View Requests" },
    { to: "/referred-request", label: "Referred Back Requests" },
    { to: "/rejected", label: "Rejected Requests" },
    { to: "/archival-enquiry", label: "Archival Enquiry" },
  ],
  DCO: [
    { to: "/dco-approval-queue", label: "Approval Queue" },
    { to: "/vendor-rejected-refund", label: "Vendor Rejected Reversal" },
    { to: "/vendor-rejected-resumbit", label: "Vendor Rejected Re-submit" },
  ],
  DCOC: [
    { to: "/dco-checker-approval-queue", label: "Approval Queue" },
    { to: "/vendor-rejected-refund", label: "Vendor Rejected Reversal" },
    { to: "/vendor-rejected-resumbit", label: "Vendor Rejected Re-submit" },
  ],
};

export const MAT_FILE_MENUS = [
  { to: "/sftp-upload", label: "SFTP Upload" },
  { to: "/arn-handling", label: "ARN Handling" },
];

export const MAT_TOP_LINKS = [
  { to: "/", label: "Dashboard", kind: "dashboard" },
  { kind: "requestHandling" },
  { to: "/report", label: "Reports", kind: "link" },
  { kind: "fileHandling" },
];

/** MEA menus by role — stub routes until full MEA screens are built */
export const MEA_ROLE_MENUS = {
  BU: [
    { to: "/mea/enrolment", label: "Raise Enrolment" },
    { to: "/mea/my-requests", label: "My Enrolments" },
    { to: "/mea/referred", label: "Referred Back" },
    { to: "/mea/rejected", label: "Rejected Enrolments" },
  ],
  DCO: [
    { to: "/mea/approval-queue", label: "Approval Queue" },
    { to: "/mea/my-requests", label: "All Enrolments" },
  ],
  DCOC: [
    { to: "/mea/approval-queue", label: "Checker Approval Queue" },
    { to: "/mea/my-requests", label: "All Enrolments" },
  ],
  SOM: [
    { to: "/mea/approval-queue", label: "Approval Queue" },
    { to: "/mea/my-requests", label: "Enrolments" },
  ],
  BH: [
    { to: "/mea/approval-queue", label: "Approval Queue" },
    { to: "/mea/my-requests", label: "Enrolments" },
  ],
  RH: [
    { to: "/mea/approval-queue", label: "Approval Queue" },
    { to: "/mea/my-requests", label: "Enrolments" },
  ],
  AGM: [
    { to: "/mea/approval-queue", label: "Final Approval" },
    { to: "/mea/my-requests", label: "Enrolments" },
  ],
  DGM: [
    { to: "/mea/approval-queue", label: "Final Approval" },
    { to: "/mea/my-requests", label: "Enrolments" },
  ],
};

export const MEA_TOP_LINKS = [
  { to: "/", label: "Dashboard", kind: "dashboard" },
  { kind: "requestHandling", label: "Enrolment Handling" },
  { to: "/mea/reports", label: "Reports", kind: "link" },
];

export const COMMON_PROFILE_LINKS = {
  userManagement: {
    to: "/profile-management",
    label: "User Management",
    roles: ["DCO"],
  },
};

export function getAppMenus(activeApp, role) {
  if (activeApp === "MEA") {
    return {
      brand: APP_BRAND.MEA,
      roleMenus: MEA_ROLE_MENUS[role] || [],
      fileMenus: [],
      topLinks: MEA_TOP_LINKS,
      requestLabel: "Enrolment Handling",
      showFileHandling: false,
      showReports: true,
      reportsTo: "/mea/reports",
    };
  }

  // File Handling is DCO-only (SFTP / ARN).
  const isDco = role === "DCO";

  return {
    brand: APP_BRAND.MAT,
    roleMenus: MAT_ROLE_MENUS[role] || [],
    fileMenus: isDco ? MAT_FILE_MENUS : [],
    topLinks: MAT_TOP_LINKS,
    requestLabel: "Request Handling",
    showFileHandling: isDco,
    showReports: true,
    reportsTo: "/report",
  };
}
