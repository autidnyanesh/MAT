import React, { useState, useMemo, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUserPlus, FaUserSlash, FaUserCheck, FaTrash, FaSpinner, FaSearch, FaCheck, FaTimes,
  FaUserShield, FaUserMinus,
} from "react-icons/fa";
import AlertModal from "../../components/AlertModel";
import "../../styles/tableAlign.css";
import api from "../../api/axiosConfig";

// ── New-user type options (SRS: Add User dropdown) ─────────────────────────
const NEW_USER_TYPES = [
  { value: "DCO_USER", label: "DCO User" },
  { value: "INTERNAL_AUDITOR", label: "Internal Auditor" },
  { value: "EXTERNAL_AUDITOR", label: "External Auditor" },
  { value: "TEMP_USER", label: "Temp User BOA" },
  { value: "HO_DBD", label: "Temp User HO/DBD/RO/ZO/BU/Other Business Units/HO-FAD" },
];

// Role label shown in the table for each new-user type
const ROLE_LABELS = {
  DCO_USER: "DCO User",
  INTERNAL_AUDITOR: "Internal Auditor",
  EXTERNAL_AUDITOR: "External Auditor",
  HO_DBD: "Temp User HO/DBD/RO/ZO/BU/Other Business Units/HO-FAD",
  TEMP_USER: "Temp User BOA",
};

// ── Status labels (pending until another DCO admin approves) ─────────────────
const getStatusDisplay = (user) => {
  const requestType = user.pendingRequest?.requestType;
  if (requestType === "ADD" || requestType === "ACTIVATE") {
    return { label: "Pending Activation", className: "bg-warning text-dark" };
  }
  if (requestType === "DEACTIVATE") {
    return { label: "Pending Deactivation", className: "bg-warning text-dark" };
  }
  if (requestType === "DELETE") {
    return { label: "Pending Deletion", className: "bg-warning text-dark" };
  }
  if (requestType === "MAKE_ADMIN") {
    return { label: "Pending Admin Assignment", className: "bg-warning text-dark" };
  }
  if (requestType === "REVOKE_ADMIN") {
    return { label: "Pending Admin Revocation", className: "bg-warning text-dark" };
  }
  return user.status === "ACTIVE"
    ? { label: "Active", className: "bg-success" }
    : { label: "Inactive", className: "bg-danger" };
};

// Convert an <input type="date"> value ("2027-01-31") to the table's
// display format ("31-Jan-2027").
const formatDisplayDate = (iso) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, "-");
};

// Mock request-ID generator — the real backend will assign this.
const generateReqId = () => `UREQ${Date.now().toString().slice(-6)}`;

/** True if pending request was raised by the logged-in admin (cannot self-approve). */
const isRaisedByCurrentAdmin = (pendingRequest, currentEin) => {
  if (!pendingRequest || !currentEin) return false;
  const by = String(pendingRequest.requestedByEin || pendingRequest.requestedBy || "").trim();
  if (!by) return false;
  return by === currentEin || by.startsWith(`${currentEin} `) || by.startsWith(`${currentEin}-`);
};

/**
 * User Management — DCO admins only.
 * Any DCO admin can raise Add/Activate/Deactivate/Delete/Admin requests.
 * Another DCO admin approves via Approve/Reject in the same User List Action column.
 */
function ProfileManagement({ user }) {

  const role = user?.role;
  const ein = user?.ein;
  const isAdmin = user?.isAdmin === true;
  const canAccess = role === "DCO" && isAdmin;

  // ── Single source of truth ────────────────────────────────────────────────
  // Every user row optionally carries a `pendingRequest`. Approve/Reject appear
  // in Action when pending was raised by another admin (no self-approval).

  // const [users, setUsers] = useState([]);
  const [users, setUsers] = useState([
    {
      ein: "100001",
      aDate: "01-Jan-2026",
      name: "ABC User",
      role: "DCO",
      sol: "1234",
      validDate: "31-Jan-2099",
      status: "ACTIVE",
      isAdmin: true,
      pendingRequest: null
    },
    {
      ein: "100002",
      aDate: "01-Jan-2026",
      name: "XYZ User",
      role: "DCO",
      sol: "1234",
      validDate: "31-Jan-2099",
      status: "INACTIVE",
      isAdmin: false,
      pendingRequest: {
        reqId: "UREQ0001",
        requestType: "ACTIVATE",
        requestedBy: "DCO001 - DCO User",
        requestedOn: "02-Jun-2026",
        makerRemark: "Rejoined from leave, please reactivate.",
      },
    },
    {
      ein: "100003",
      aDate: "01-Jan-2026",
      name: "PQR User",
      role: "BOA",
      sol: "5678",
      validDate: "31-Jan-2027",
      status: "ACTIVE",
      isAdmin: false,
      pendingRequest: null
    },
    {
      ein: "100004",
      aDate: "01-Jan-2026",
      name: "Test User",
      role: "DBD",
      sol: "7890",
      validDate: "31-Jan-2027",
      status: "ACTIVE",
      pendingRequest: {
        reqId: "UREQ0002",
        requestType: "DEACTIVATE",
        requestedBy: "DCO001 - DCO User",
        requestedOn: "03-Jun-2026",
        makerRemark: "User has been transferred out of this SOL.",
      },
    },
    {
      ein: "100005",
      aDate: "01-Jan-2026",
      name: "Demo User",
      role: "DCO",
      sol: "1234",
      validDate: "31-Jan-2027",
      status: "ACTIVE",
      pendingRequest: null
    }
  ]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUser();
    setSearch("");
    setCurrentPage(1);
  }, [role, ein]);

  // ── Action modals ──────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkerAction, setCheckerAction] = useState(null); // { decision, user }
  const [viewRequestUser, setViewRequestUser] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ show: false, title: "", message: "", type: "success" });

  const recordsPerPage = 5;

  async function loadUser(params) {
    let cancelled = false;
    setLoading(true);
    try {
      const res = await api.get("/api/userManagement");
      const data = res.data?.users ?? res.data;
      if (!cancelled) {
        console.log("res data", data);
        setUsers(Array.isArray(data) ? data : []);
      }
    }
    catch (err) {
      console.warn("[MAT] menus API failed", err?.res?.status || err?.message);
      if (!cancelled) {
        setUsers([]);
      }
    }
    finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  // ── Maker: raise a request (Add / Activate / Deactivate / Delete) ────────
  const submitMakerRequest = async (type, targetUser) => {
    setSubmitting(true);
    try {
      // await api.post("/api/user-management/request", {
      //   requestType: type,       // ADD | ACTIVATE | DEACTIVATE | DELETE
      //   ein: targetUser.ein,
      //   userType: targetUser.userType, // only present for ADD
      //   fromDate: targetUser.fromDate,
      //   toDate: targetUser.toDate,
      // });

      await new Promise((resolve) => setTimeout(resolve, 600));

      const requestedOn = formatDisplayDate(new Date().toISOString().slice(0, 10));
      const pendingRequest = {
        reqId: generateReqId(),
        requestType: type,
        requestedBy: ein || user?.username || "",
        requestedByEin: ein || "",
        requestedOn,
        makerRemark: "",
      };

      if (type === "ADD") {
        setUsers((prev) => [
          ...prev,
          {
            ein: targetUser.ein,
            aDate: requestedOn,
            name: targetUser.name,
            role: ROLE_LABELS[targetUser.userType] || targetUser.userType,
            sol: targetUser.sol || "-",
            validDate: targetUser.toDate ? formatDisplayDate(targetUser.toDate) : "Permanent",
            status: "INACTIVE", // live only after another admin approves
            pendingRequest,
          },
        ]);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.ein === targetUser.ein ? { ...u, pendingRequest } : u))
        );
      }

      setConfirmAction(null);
      setShowAddUserModal(false);
      setAlertConfig({
        show: true,
        title: "Request Submitted",
        message: `${type.charAt(0) + type.slice(1).toLowerCase()} request for EIN ${targetUser.ein} has been sent for approval by another DCO admin.`,
        type: "success",
      });
    } catch {
      setAlertConfig({
        show: true,
        title: "Submission Failed",
        message: "Unable to submit the request. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Checker: approve or reject a pending request ──────────────────────────
  const resolveCheckerRequest = async (decision, targetUser) => {
    setSubmitting(true);
    try {
      // await api.post("/api/user-approval/action", {
      //   reqId: targetUser.pendingRequest.reqId,
      //   decision,   // APPROVE | REJECT
      // });

      await new Promise((resolve) => setTimeout(resolve, 500));

      const requestType = targetUser.pendingRequest?.requestType;

      setUsers((prev) => {
        if (decision === "REJECT") {
          // A rejected ADD never really existed — drop the provisional row.
          if (requestType === "ADD") {
            return prev.filter((u) => u.ein !== targetUser.ein);
          }
          // Any other rejected request just clears the flag — status is
          // untouched, since nothing was ever approved.
          return prev.map((u) => (u.ein === targetUser.ein ? { ...u, pendingRequest: null } : u));
        }

        // APPROVE
        if (requestType === "DELETE") {
          return prev.filter((u) => u.ein !== targetUser.ein);
        }
        if (requestType === "MAKE_ADMIN") {
          return prev.map((u) =>
            u.ein === targetUser.ein ? { ...u, isAdmin: true, pendingRequest: null } : u
          );
        }
        if (requestType === "REVOKE_ADMIN") {
          return prev.map((u) =>
            u.ein === targetUser.ein ? { ...u, isAdmin: false, pendingRequest: null } : u
          );
        }
        const newStatus = requestType === "DEACTIVATE" ? "INACTIVE" : "ACTIVE";
        return prev.map((u) =>
          u.ein === targetUser.ein ? { ...u, status: newStatus, pendingRequest: null } : u
        );
      });

      setCheckerAction(null);
      setAlertConfig({
        show: true,
        title: decision === "APPROVE" ? "Request Approved" : "Request Rejected",
        message: `${requestType} request for ${targetUser.name} (EIN: ${targetUser.ein}) has been ${decision === "APPROVE" ? "approved" : "rejected"
          }.`,
        type: decision === "APPROVE" ? "success" : "error",
      });
    } catch {
      setAlertConfig({
        show: true,
        title: "Action Failed",
        message: "Unable to process the request. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Single user list (no Approval Queue tab)
  const filteredUsers = useMemo(() => {
    if (search.trim() === "") return users;
    return users.filter((u) =>
      [u.ein, u.aDate, u.name, u.role, u.sol, u.validDate, getStatusDisplay(u).label]
        .some((value) => String(value ?? "").toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, search]);

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage) || 1;
  const pageData = filteredUsers.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  if (!canAccess) {
    return null;
  }

  return (
    <div className="container-fluid p-2">
      <div className="card shadow-sm border-0 mb-1">
        <div className="card-header bg-white py-2 border-bottom">
          <nav aria-label="breadcrumb" className="mb-0">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item text-muted">User Management</li>
              <li className="breadcrumb-item active fw-semibold" aria-current="page">
                Profile Management
              </li>
            </ol>
          </nav>
        </div>
        <div className="card-body pb-2">
          <div className="row align-items-end">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <div className="position-relative">
                <FaSearch
                  className="position-absolute"
                  style={{
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6c757d",
                    fontSize: "14px"
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search any field..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ paddingLeft: "38px" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
            <span>User List</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUserModal(true)}>
              <FaUserPlus className="me-2" />
              Add New User
            </button>
          </div>

          <div className="table-responsive">
            <table className="table modern-table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>EIN</th>
                  <th>Added Date</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>SOL</th>
                  <th>Valid Till</th>
                  <th>Admin</th>
                  <th>Status</th>
                  <th width="140">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length > 0 ? pageData.map((u) => {
                  const statusDisplay = getStatusDisplay(u);
                  const hasPendingRequest = Boolean(u.pendingRequest);
                  const canApproveOthers =
                    hasPendingRequest && !isRaisedByCurrentAdmin(u.pendingRequest, ein);

                  return (
                    <tr key={u.ein}>
                      <td>{u.ein}</td>
                      <td>{u.aDate}</td>
                      <td>{u.name}</td>
                      <td>{u.role}</td>
                      <td>{u.sol}</td>
                      <td>{u.validDate}</td>
                      <td>
                        {u.isAdmin
                          ? <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2" style={{ fontSize: 11 }}>Admin</span>
                          : <span className="text-muted" style={{ fontSize: 12 }}>—</span>}
                      </td>
                      <td>
                        <span className={`badge ${statusDisplay.className}`}>{statusDisplay.label}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {canApproveOthers ? (
                            <>
                              <button
                                title={`Approve ${u.pendingRequest.requestType}`}
                                className="btn btn-success btn-sm p-0"
                                style={{ width: 30, height: 30, borderRadius: "6px" }}
                                onClick={() => setCheckerAction({ decision: "APPROVE", user: u })}
                              >
                                <FaCheck size={11} />
                              </button>
                              <button
                                title={`Reject ${u.pendingRequest.requestType}`}
                                className="btn btn-danger btn-sm p-0"
                                style={{ width: 30, height: 30, borderRadius: "6px" }}
                                onClick={() => setCheckerAction({ decision: "REJECT", user: u })}
                              >
                                <FaTimes size={11} />
                              </button>
                            </>
                          ) : (
                            <>
                              {u.status === "ACTIVE" ? (
                                <button
                                  className="btn btn-outline-danger btn-sm p-0"
                                  title={hasPendingRequest ? "Pending approval (your request)" : "Deactivate"}
                                  style={{ width: 30, height: 30, borderRadius: "6px" }}
                                  disabled={hasPendingRequest}
                                  onClick={() => setConfirmAction({ type: "DEACTIVATE", user: u })}
                                >
                                  <FaUserSlash size={11} />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-success btn-sm p-0"
                                  title={hasPendingRequest ? "Pending approval (your request)" : "Activate"}
                                  style={{ width: 30, height: 30, borderRadius: "6px" }}
                                  disabled={hasPendingRequest}
                                  onClick={() => setConfirmAction({ type: "ACTIVATE", user: u })}
                                >
                                  <FaUserCheck size={11} />
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger btn-sm p-0"
                                title={hasPendingRequest ? "Pending approval (your request)" : "Delete"}
                                style={{ width: 30, height: 30, borderRadius: "6px" }}
                                disabled={hasPendingRequest}
                                onClick={() => setConfirmAction({ type: "DELETE", user: u })}
                              >
                                <FaTrash size={11} />
                              </button>
                              {u.role === "DCO" && (
                                u.isAdmin ? (
                                  <button
                                    className="btn btn-outline-secondary btn-sm p-0"
                                    title={hasPendingRequest ? "Pending approval (your request)" : "Revoke Admin"}
                                    style={{ width: 30, height: 30, borderRadius: "6px" }}
                                    disabled={hasPendingRequest}
                                    onClick={() => setConfirmAction({ type: "REVOKE_ADMIN", user: u })}
                                  >
                                    <FaUserMinus size={11} />
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-outline-info btn-sm p-0"
                                    title={hasPendingRequest ? "Pending approval (your request)" : "Make Admin"}
                                    style={{ width: 30, height: 30, borderRadius: "6px" }}
                                    disabled={hasPendingRequest}
                                    onClick={() => setConfirmAction({ type: "MAKE_ADMIN", user: u })}
                                  >
                                    <FaUserShield size={11} />
                                  </button>
                                )
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex flex-wrap gap-3" style={{ fontSize: "12px", color: "#6c757d" }}>
                <span className="d-flex align-items-center gap-1">
                  <span className="btn btn-outline-success btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: "4px", pointerEvents: "none" }}><FaUserCheck size={10} /></span> Activate
                </span>
                <span className="d-flex align-items-center gap-1">
                  <span className="btn btn-outline-danger btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: "4px", pointerEvents: "none" }}><FaUserSlash size={10} /></span> Deactivate
                </span>
                <span className="d-flex align-items-center gap-1">
                  <span className="btn btn-outline-danger btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: "4px", pointerEvents: "none" }}><FaTrash size={10} /></span> Delete
                </span>
                <span className="d-flex align-items-center gap-1">
                  <span className="btn btn-outline-info btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: "4px", pointerEvents: "none" }}><FaUserShield size={10} /></span> Make Admin
                </span>
                <span className="d-flex align-items-center gap-1">
                  <span className="btn btn-outline-secondary btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: "4px", pointerEvents: "none" }}><FaUserMinus size={10} /></span> Revoke Admin
                </span>
                <span className="d-flex align-items-center gap-1">
                  <span className="btn btn-success btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: "4px", pointerEvents: "none" }}><FaCheck size={10} /></span> Approve
                </span>
                <span className="d-flex align-items-center gap-1">
                  <span className="btn btn-danger btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: "4px", pointerEvents: "none" }}><FaTimes size={10} /></span> Reject
                </span>
              </div>
              <nav>
                <ul className="pagination pagination-sm justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Maker: confirm before raising a request */}
      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.type === "MAKE_ADMIN"
              ? "Make Admin"
              : confirmAction.type === "REVOKE_ADMIN"
                ? "Revoke Admin"
                : `${confirmAction.type.charAt(0) + confirmAction.type.slice(1).toLowerCase()} User`
          }
          description={
            <>
              This will send a <strong>{confirmAction.type.toLowerCase()}</strong> request for EIN{" "}
              <strong>{confirmAction.user.ein}</strong> for approval by another DCO admin.
            </>
          }
          confirmLabel="Submit"
          confirmVariant="primary"
          submitting={submitting}
          onConfirm={() => submitMakerRequest(confirmAction.type, confirmAction.user)}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {/* Maker: Add New User */}
      {showAddUserModal && (
        <AddNewUserModal
          submitting={submitting}
          onConfirm={(newUser) => submitMakerRequest("ADD", newUser)}
          onClose={() => setShowAddUserModal(false)}
        />
      )}

      {/* Checker: approve / reject */}
      {checkerAction && (
        <ConfirmModal
          title={`${checkerAction.decision === "APPROVE" ? "Approve" : "Reject"} Request — ${checkerAction.user.pendingRequest.reqId}`}
          description={
            <>
              This will <strong>{checkerAction.decision === "APPROVE" ? "approve" : "reject"}</strong> the{" "}
              <strong>{checkerAction.user.pendingRequest.requestType.toLowerCase()}</strong> request for{" "}
              <strong>{checkerAction.user.name}</strong> (EIN: {checkerAction.user.ein}).
            </>
          }
          confirmLabel={checkerAction.decision === "APPROVE" ? "Approve" : "Reject"}
          confirmVariant={checkerAction.decision === "APPROVE" ? "success" : "danger"}
          submitting={submitting}
          onConfirm={() => resolveCheckerRequest(checkerAction.decision, checkerAction.user)}
          onClose={() => setCheckerAction(null)}
        />
      )}

      {/* Checker: view full request detail */}
      {viewRequestUser && (
        <RequestViewModal user={viewRequestUser} onClose={() => setViewRequestUser(null)} />
      )}

      <AlertModal
        show={alertConfig.show}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((p) => ({ ...p, show: false }))}
      />

    </div>
  );
}

// ── Shared confirm modal (no remark) ────────────────────────────────────────
const ConfirmModal = ({ title, description, confirmLabel, confirmVariant, submitting, onConfirm, onClose }) => (
  <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content border-0 shadow" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>
        <div className="modal-body">
          {description && <p className="mb-0">{description}</p>}
        </div>
        <div className="modal-footer">
          <button className={`btn btn-${confirmVariant}`} disabled={submitting} onClick={onConfirm}>
            {submitting ? <FaSpinner className="spin me-1" /> : null} {confirmLabel}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
);

// ── Checker: full request detail ────────────────────────────────────────────
const RequestViewModal = ({ user, onClose }) => {
  const req = user.pendingRequest;
  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
          <div className="modal-header py-2" style={{ borderBottom: "1px solid #e9ecef" }}>
            <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>
              User Request — {req.reqId}
            </span>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body p-3">
            <div style={{ border: "1px solid #dee2e6", borderRadius: "8px", padding: "12px" }}>
              <div className="row g-3" style={{ fontSize: "13px" }}>
                {[
                  ["Request ID", req.reqId],
                  ["Request Type", req.requestType],
                  ["EIN", user.ein],
                  ["Name", user.name],
                  ["Role", user.role],
                  ["SOL", user.sol],
                  ["Valid Till", user.validDate],
                  ["Requested By", req.requestedBy],
                  ["Requested On", req.requestedOn],
                ].map(([label, value]) => (
                  <div className="col-md-6" key={label}>
                    <div className="text-muted" style={{ fontSize: "11px" }}>{label}</div>
                    <div className="fw-semibold">{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer py-2">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Maker: Add New User modal ───────────────────────────────────────────────
// Flow: select type → EIN + Fetch (HRMS) → fill name/email/sol/agency
// Valid From/To only for Internal / External Auditor.
const AddNewUserModal = ({ submitting, onConfirm, onClose }) => {
  const [form, setForm] = useState({
    userType: "",
    ein: "",
    name: "",
    sol: "",
    email: "",
    agency: "",
    fromDate: "",
    toDate: "",
  });
  const [errors, setErrors] = useState({});
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);

  const isAuditor =
    form.userType === "INTERNAL_AUDITOR" || form.userType === "EXTERNAL_AUDITOR";
  const showDetails = form.userType !== "";

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setErrors((p) => ({ ...p, [field]: "", fetch: "" }));

    if (field === "userType") {
      setFetched(false);
      setForm({
        userType: value,
        ein: "",
        name: "",
        sol: "",
        email: "",
        agency: "",
        fromDate: "",
        toDate: "",
      });
      return;
    }
    if (field === "ein") {
      setFetched(false);
      setForm((p) => ({
        ...p,
        ein: value,
        name: "",
        sol: "",
        email: "",
        agency: "",
      }));
      return;
    }
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleFetchHrms = async () => {
    const ein = form.ein.trim();
    if (!ein) {
      setErrors((p) => ({ ...p, ein: "Enter EIN to fetch." }));
      return;
    }
    if (!form.userType) {
      setErrors((p) => ({ ...p, userType: "Please select a user type first." }));
      return;
    }
    setFetching(true);
    setErrors((p) => ({ ...p, ein: "", fetch: "" }));
    try {
      const res = await api.get("/api/userManagement/hrms", { params: { ein } });
      const data = res.data || {};
      setForm((p) => ({
        ...p,
        ein: data.ein || ein,
        name: data.name || "",
        email: data.email || "",
        sol: data.sol || "",
        agency: data.agency || "",
      }));
      setFetched(true);
    } catch (err) {
      setFetched(false);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "HRMS fetch failed";
      setErrors((p) => ({ ...p, fetch: String(msg) }));
      setForm((p) => ({ ...p, name: "", email: "", sol: "", agency: "" }));
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!form.userType) next.userType = "Please select a user type.";
    if (!form.ein.trim()) next.ein = "EIN is required.";
    if (!fetched) next.fetch = "Fetch HRMS details before submit.";
    if (!form.name.trim()) next.name = "Name is required (fetch from HRMS).";

    if (isAuditor) {
      if (!form.fromDate) next.fromDate = "From date is required.";
      if (!form.toDate) next.toDate = "To date is required.";
      if (form.fromDate && form.toDate && form.toDate < form.fromDate) {
        next.toDate = "To date cannot be before From date.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onConfirm({
      ein: form.ein.trim(),
      name: form.name.trim(),
      sol: form.sol.trim(),
      email: form.email.trim(),
      agency: form.agency.trim(),
      userType: form.userType,
      fromDate: isAuditor ? form.fromDate : "",
      toDate: isAuditor ? form.toDate : "",
    });
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow" style={{ borderRadius: "10px", overflow: "hidden" }}>
          <div className="modal-header">
            <h5 className="modal-title">Add New User</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">
                User Type <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.userType ? "is-invalid" : ""}`}
                value={form.userType}
                onChange={handleChange("userType")}
              >
                <option value="">-- Select Type --</option>
                {NEW_USER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.userType && <div className="invalid-feedback">{errors.userType}</div>}
            </div>

            {showDetails && (
              <>
                <div className="mb-3">
                  <label className="form-label">
                    EIN <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className={`form-control ${errors.ein ? "is-invalid" : ""}`}
                      value={form.ein}
                      onChange={handleChange("ein")}
                      placeholder="Enter EIN"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary text-nowrap"
                      disabled={fetching || !form.ein.trim()}
                      onClick={handleFetchHrms}
                    >
                      {fetching ? <FaSpinner className="spin" /> : "Fetch"}
                    </button>
                  </div>
                  {errors.ein && <div className="text-danger small mt-1">{errors.ein}</div>}
                  {errors.fetch && <div className="text-danger small mt-1">{errors.fetch}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">User Name</label>
                    <input type="text" className="form-control" value={form.name} readOnly />
                    {errors.name && <div className="text-danger small">{errors.name}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} readOnly />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">SOL</label>
                    <input type="text" className="form-control" value={form.sol} readOnly />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Agency</label>
                    <input type="text" className="form-control" value={form.agency} readOnly />
                  </div>
                </div>

                {isAuditor && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        From Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fromDate ? "is-invalid" : ""}`}
                        value={form.fromDate}
                        onChange={handleChange("fromDate")}
                      />
                      {errors.fromDate && <div className="invalid-feedback">{errors.fromDate}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        To Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.toDate ? "is-invalid" : ""}`}
                        value={form.toDate}
                        min={form.fromDate || undefined}
                        onChange={handleChange("toDate")}
                      />
                      {errors.toDate && <div className="invalid-feedback">{errors.toDate}</div>}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-primary"
              disabled={submitting || !showDetails}
              onClick={handleSubmit}
            >
              {submitting ? <FaSpinner className="spin me-1" /> : null} Submit
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;