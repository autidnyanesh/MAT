import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUserPlus, FaUserSlash, FaUserCheck, FaTrash, FaSpinner, FaSearch, FaCheck, FaTimes,
  FaUserShield, FaUserMinus,
} from "react-icons/fa";
import AlertModal from "../../components/modals/AlertModal";
import "../../styles/tableAlign.css";
import api from "../../api/axiosConfig";
import useTableSort from "../../hooks/useTableSort";
import SortableTh from "../../components/table/SortableTh";

const NEW_USER_TYPES = [
  { value: "DCO_USER", label: "DCO User" },
  { value: "INTERNAL_AUDITOR", label: "Internal Auditor" },
  { value: "EXTERNAL_AUDITOR", label: "External Auditor" },
  { value: "TEMP_USER", label: "Temp User BOA" },
  { value: "REGIONAL_ZONAL_OFFICER", label: "Zonal/Regional Officer" },
  { value: "HO_DBD", label: "Temp User HO/DBD/BU/Other Business Units/HO-FAD" },
];

const PAGE_SIZE = 5;
const BTN = { width: 30, height: 30, borderRadius: "6px" };

const HARDCODED_ZONES = [
  { zoneId: "ZN01", zoneName: "North Zone" },
  { zoneId: "ZN02", zoneName: "North East Zone" },
  { zoneId: "ZN03", zoneName: "East Zone" },
  { zoneId: "ZN04", zoneName: "West Zone" },
  { zoneId: "ZN05", zoneName: "South Zone" },
  { zoneId: "ZN06", zoneName: "Central Zone" },
  { zoneId: "ZN07", zoneName: "Mumbai Zone" },
  { zoneId: "ZN08", zoneName: "Delhi Zone" },
  { zoneId: "ZN09", zoneName: "Kolkata Zone" },
  { zoneId: "ZN10", zoneName: "Chennai Zone" },
  { zoneId: "ZN11", zoneName: "Hyderabad Zone" },
  { zoneId: "ZN12", zoneName: "Ahmedabad Zone" },
];

const HARDCODED_REGIONS = [
  { regionId: "RG01", regionName: "Delhi Region" },
  { regionId: "RG02", regionName: "Chandigarh Region" },
  { regionId: "RG03", regionName: "Lucknow Region" },
  { regionId: "RG04", regionName: "Jaipur Region" },
  { regionId: "RG05", regionName: "Patna Region" },
  { regionId: "RG06", regionName: "Guwahati Region" },
  { regionId: "RG07", regionName: "Kolkata Region" },
  { regionId: "RG08", regionName: "Bhubaneswar Region" },
  { regionId: "RG09", regionName: "Mumbai Region" },
  { regionId: "RG10", regionName: "Pune Region" },
  { regionId: "RG11", regionName: "Ahmedabad Region" },
  { regionId: "RG12", regionName: "Nagpur Region" },
  { regionId: "RG13", regionName: "Chennai Region" },
  { regionId: "RG14", regionName: "Bengaluru Region" },
  { regionId: "RG15", regionName: "Hyderabad Region" },
  { regionId: "RG16", regionName: "Kochi Region" },
  { regionId: "RG17", regionName: "Bhopal Region" },
  { regionId: "RG18", regionName: "Raipur Region" },
];

function getStatusDisplay(user) {
  const type = user.pendingRequest?.requestType;
  if (type === "ADD" || type === "ACTIVATE") return { label: "Pending Activation", className: "bg-warning text-dark" };
  if (type === "DEACTIVATE") return { label: "Pending Deactivation", className: "bg-warning text-dark" };
  if (type === "DELETE") return { label: "Pending Deletion", className: "bg-warning text-dark" };
  if (type === "MAKE_ADMIN") return { label: "Pending Admin Assignment", className: "bg-warning text-dark" };
  if (type === "REVOKE_ADMIN") return { label: "Pending Admin Revocation", className: "bg-warning text-dark" };
  return user.status === "ACTIVE"
    ? { label: "Active", className: "bg-success" }
    : { label: "Inactive", className: "bg-danger" };
}

function sameEin(a, b) {
  return String(a || "").trim().toUpperCase() === String(b || "").trim().toUpperCase();
}

function isOwnRequest(pendingRequest, currentEin) {
  if (!pendingRequest || !currentEin) return false;
  const by = String(pendingRequest.requestedByEin || pendingRequest.requestedBy || "").trim();
  return by === currentEin || by.startsWith(`${currentEin} `) || by.startsWith(`${currentEin}-`);
}

function apiError(err, fallback) {
  return String(err?.response?.data?.message || err?.response?.data?.error || fallback);
}

function asOptionList(payload, listKeys) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    for (const key of listKeys) {
      if (Array.isArray(payload[key])) return payload[key];
    }
  }
  return [];
}

function optionValue(item, keys) {
  if (item == null) return "";
  if (typeof item === "string" || typeof item === "number") return String(item);
  for (const key of keys) {
    if (item[key] != null && String(item[key]).trim() !== "") return String(item[key]);
  }
  return "";
}

function TypeaheadSelect({
  items,
  value,
  onChange,
  loading,
  emptyText,
  error,
  invalid,
  idKeys,
  labelKeys,
  placeholder,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = useMemo(
    () =>
      (items || []).map((item, index) => {
        const id = optionValue(item, idKeys) || String(index);
        const label = optionValue(item, labelKeys) || id;

        return {
          id,
          label,
        };
      }),
    [items, idKeys, labelKeys]
  );

  const selected = options.find((o) => o.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return options;

    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleInputChange = (e) => {
    const next = e.target.value;

    setQuery(next);
    setOpen(true);

    if (selected && next !== selected.label) {
      onChange("");
    }
  };

  const handleSelect = (option) => {
    onChange(option.id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="position-relative"
    >
      {/* Search / Select input */}
      <div className="position-relative">
        <FaSearch
          className="position-absolute"
          style={{
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6c757d",
            fontSize: 13,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        <input
          type="text"
          className={`form-control pe-5 ${invalid ? "is-invalid" : ""
            }`}
          value={
            selected && query === ""
              ? selected.label
              : query
          }
          placeholder={
            loading
              ? "Loading..."
              : placeholder
          }
          disabled={loading}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={handleInputChange}
          style={{
            height: 40,
            paddingLeft: 38,
            fontSize: 14,
            borderRadius: 7,
            cursor: loading ? "not-allowed" : "text",
          }}
        />

        {/* Dropdown arrow */}
        {!loading && (
          <span
            className="position-absolute"
            style={{
              right: 14,
              top: "50%",
              transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"
                })`,
              transition: "transform 0.15s ease",
              color: "#6c757d",
              pointerEvents: "none",
              fontSize: 12,
            }}
          >
            ▼
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && !loading && (
        <div
          className="position-absolute bg-white border shadow-sm w-100 mt-1"
          style={{
            zIndex: 1055,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {/* Search result count */}
          {filtered.length > 0 && (
            <div
              className="px-3 py-2 border-bottom text-muted"
              style={{
                fontSize: 11,
                backgroundColor: "#f8f9fa",
              }}
            >
              {filtered.length}{" "}
              {filtered.length === 1
                ? "option"
                : "options"}{" "}
              available
            </div>
          )}

          {/* Scrollable options */}
          <div
            style={{
              maxHeight: 148,
              overflowY: "auto",
            }}
          >
            {error ? (
              <div className="px-3 py-3 text-danger small">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-3 text-muted small text-center">
                {emptyText}
              </div>
            ) : (
              filtered.map((option) => {
                const isSelected =
                  value === option.id;

                return (
                  <button
                    type="button"
                    key={option.id}
                    className="w-100 border-0 text-start"
                    onClick={() =>
                      handleSelect(option)
                    }
                    style={{
                      padding: "4px 14px",
                      backgroundColor: isSelected
                        ? "#eaf2ff"
                        : "#fff",
                      color: isSelected
                        ? "#0d6efd"
                        : "#212529",
                      fontSize: 14,
                      cursor: "pointer",
                      transition:
                        "background-color 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          "#f5f7fa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          "#fff";
                      }
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        {option.label}
                      </span>

                      {isSelected && (
                        <FaCheck
                          size={12}
                          className="text-primary"
                        />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileManagement({ user }) {
  const ein = user?.ein;
  const canAccess = user?.role === "DCO" && user?.isAdmin === true;
  const location = useLocation();
  const loadGen = useRef(0);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }
  const [checkerAction, setCheckerAction] = useState(null); // { decision, user }
  const [alertConfig, setAlertConfig] = useState({ show: false, title: "", message: "", type: "success" });

  const loadUsers = useCallback(async () => {
    const gen = ++loadGen.current;
    setLoading(true);
    try {
      const res = await api.get("/api/userManagement");
      if (gen !== loadGen.current) return;
      const data = res.data?.users ?? res.data;
      setUsers(Array.isArray(data) ? data.map((row) => ({
        ...row,
        adate: row.adate ?? row.aDate ?? "",
        admin: Boolean(row.admin ?? row.isAdmin ?? row.Admin),
      })) : []);
    } catch (err) {
      if (gen !== loadGen.current) return;
      console.warn("[MAT] userManagement API failed", err?.response?.status || err?.message);
      setUsers([]);
    } finally {
      if (gen === loadGen.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canAccess)
      return;
    setSearch("");
    setCurrentPage(1);
    loadUsers();
  }, [canAccess, location.pathname, location.state?.reloadAt, loadUsers]);

  const submitRequest = async (type, targetUser, remark = "") => {
    setSubmitting(true);
    try {
      await api.post("/api/userManagement/request", {
        requestType: type,
        ein: targetUser.ein,
        name: targetUser.name,
        email: targetUser.email,
        userType: targetUser.userType,
        sol: targetUser.sol,
        agency: targetUser.agency,
        fromDate: targetUser.fromDate,
        toDate: targetUser.toDate,
        officerType: targetUser.officerType || "",
        zone: targetUser.zone || "",
        region: targetUser.region || "",
        makerRemark: String(targetUser.makerRemark ?? remark ?? "").trim(),
      });
      await loadUsers();
      setConfirmAction(null);
      setShowAddUser(false);
      setAlertConfig({
        show: true,
        title: "Request Submitted",
        message: `${type.charAt(0) + type.slice(1).toLowerCase()} request for EIN ${targetUser.ein} has been sent for approval by another DCO admin.`,
        type: "success",
      });
    } catch (err) {
      setAlertConfig({
        show: true,
        title: "Submission Failed",
        message: apiError(err, "Unable to submit the request. Please try again."),
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resolveRequest = async (decision, targetUser) => {
    setSubmitting(true);
    const requestType = targetUser.pendingRequest?.requestType;
    try {
      await loadUsers();
      setCheckerAction(null);
      setAlertConfig({
        show: true,
        title: decision === "APPROVE" ? "Request Approved" : "Request Rejected",
        message: `${requestType} request for ${targetUser.name} (EIN: ${targetUser.ein}) has been ${decision === "APPROVE" ? "approved" : "rejected"}.`,
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

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.ein, u.adate, u.name, u.role, u.sol, u.validDate, getStatusDisplay(u).label, u.pendingRequest?.makerRemark, sameEin(u.ein, ein) ? "logged-in user" : ""]
        .some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [users, search, ein]);

  const { sortedRows, getSortProps } = useTableSort(filteredUsers, {
    accessors: {
      status: (u) => getStatusDisplay(u).label,
      remark: (u) => u.pendingRequest?.makerRemark,
    },
  });
  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE) || 1;
  const pageData = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!canAccess)
    return null;



  return (
    <div className="container-fluid p-2">
      <div className="card shadow-sm border-0 mb-1">
        <div className="card-header bg-white py-2 border-bottom">
          <nav aria-label="breadcrumb" className="mb-0">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item text-muted">User Management</li>
              <li className="breadcrumb-item active fw-semibold" aria-current="page">Profile Management</li>
            </ol>
          </nav>
        </div>
        <div className="card-body pb-2">
          <div className="row align-items-end">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <div className="position-relative">
                <FaSearch className="position-absolute" style={{ left: 12, top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: 14 }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search any field..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
            <span>User List</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUser(true)}>
              <FaUserPlus className="me-2" /> Add New User
            </button>
          </div>

          <div className="table-responsive">
            <table className="table modern-table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <SortableTh label="EIN" {...getSortProps("ein")} />
                  <SortableTh label="Added Date" {...getSortProps("adate")} />
                  <SortableTh label="Name" {...getSortProps("name")} />
                  <SortableTh label="Email" {...getSortProps("email")} />
                  <SortableTh label="Role" {...getSortProps("role")} />
                  <SortableTh label="SOL" {...getSortProps("sol")} />
                  <SortableTh label="Valid Till" {...getSortProps("validDate")} />
                  <SortableTh label="Admin" {...getSortProps("admin")} />
                  <SortableTh label="Status" {...getSortProps("status")} />
                  <SortableTh label="Remark" {...getSortProps("remark")} style={{ minWidth: 160 }} />
                  <th width="140">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="text-center py-4 text-muted">
                      <span className="spinner-border spinner-border-sm me-2" /> Loading users…
                    </td>
                  </tr>
                ) : pageData.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-4 text-muted">No users found.</td>
                  </tr>
                ) : pageData.map((u) => {
                  const status = getStatusDisplay(u);
                  const pending = Boolean(u.pendingRequest);
                  const isLoginUser = sameEin(u.ein, ein);
                  const canApprove = !isLoginUser && pending && !isOwnRequest(u.pendingRequest, ein);
                  const remark = u.pendingRequest?.makerRemark?.trim() || "";
                  const pendingTitle = pending ? "Pending approval (your request)" : undefined;

                  return (
                    <tr key={u.ein}>
                      <td>{u.ein}</td>
                      <td>{u.adate}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.sol}</td>
                      <td>{u.validDate}</td>
                      <td>
                        {u.admin
                          ? <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2" style={{ fontSize: 11 }}>Admin</span>
                          : <span className="text-muted" style={{ fontSize: 12 }}>—</span>}
                      </td>
                      <td><span className={`badge ${status.className}`}>{status.label}</span></td>
                      <td style={{ maxWidth: 220, whiteSpace: "normal", fontSize: 12 }}>
                        {remark ? <span title={remark}>{remark}</span> : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {isLoginUser ? (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2" style={{ fontSize: 11 }}>
                            Logged-in user
                          </span>
                        ) : (
                          <div className="d-flex gap-1 flex-wrap">
                            {canApprove ? (
                              <>
                                <button className="btn btn-success btn-sm p-0" style={BTN} title={`Approve ${u.pendingRequest.requestType}`} onClick={() => setCheckerAction({ decision: "APPROVE", user: u })}>
                                  <FaCheck size={11} />
                                </button>
                                <button className="btn btn-danger btn-sm p-0" style={BTN} title={`Reject ${u.pendingRequest.requestType}`} onClick={() => setCheckerAction({ decision: "REJECT", user: u })}>
                                  <FaTimes size={11} />
                                </button>
                              </>
                            ) : (
                              <>
                                {u.status === "ACTIVE" ? (
                                  <button className="btn btn-outline-danger btn-sm p-0" style={BTN} title={pendingTitle || "Deactivate"} disabled={pending} onClick={() => setConfirmAction({ type: "DEACTIVATE", user: u })}>
                                    <FaUserSlash size={11} />
                                  </button>
                                ) : (
                                  <button className="btn btn-outline-success btn-sm p-0" style={BTN} title={pendingTitle || "Activate"} disabled={pending} onClick={() => setConfirmAction({ type: "ACTIVATE", user: u })}>
                                    <FaUserCheck size={11} />
                                  </button>
                                )}
                                <button className="btn btn-outline-danger btn-sm p-0" style={BTN} title={pendingTitle || "Delete"} disabled={pending} onClick={() => setConfirmAction({ type: "DELETE", user: u })}>
                                  <FaTrash size={11} />
                                </button>
                                {u.role === "DCO" && (
                                  u.admin ? (
                                    <button className="btn btn-outline-secondary btn-sm p-0" style={BTN} title={pendingTitle || "Revoke Admin"} disabled={pending} onClick={() => setConfirmAction({ type: "REVOKE_ADMIN", user: u })}>
                                      <FaUserMinus size={11} />
                                    </button>
                                  ) : (
                                    <button className="btn btn-outline-info btn-sm p-0" style={BTN} title={pendingTitle || "Make Admin"} disabled={pending} onClick={() => setConfirmAction({ type: "MAKE_ADMIN", user: u })}>
                                      <FaUserShield size={11} />
                                    </button>
                                  )
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex flex-wrap gap-3" style={{ fontSize: 12, color: "#6c757d" }}>
                <span className="d-flex align-items-center gap-1"><span className="btn btn-outline-success btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: 4, pointerEvents: "none" }}><FaUserCheck size={10} /></span> Activate</span>
                <span className="d-flex align-items-center gap-1"><span className="btn btn-outline-danger btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: 4, pointerEvents: "none" }}><FaUserSlash size={10} /></span> Deactivate</span>
                <span className="d-flex align-items-center gap-1"><span className="btn btn-outline-danger btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: 4, pointerEvents: "none" }}><FaTrash size={10} /></span> Delete</span>
                <span className="d-flex align-items-center gap-1"><span className="btn btn-outline-info btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: 4, pointerEvents: "none" }}><FaUserShield size={10} /></span> Make Admin</span>
                <span className="d-flex align-items-center gap-1"><span className="btn btn-outline-secondary btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: 4, pointerEvents: "none" }}><FaUserMinus size={10} /></span> Revoke Admin</span>
                <span className="d-flex align-items-center gap-1"><span className="btn btn-success btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: 4, pointerEvents: "none" }}><FaCheck size={10} /></span> Approve</span>
                <span className="d-flex align-items-center gap-1"><span className="btn btn-danger btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, borderRadius: 4, pointerEvents: "none" }}><FaTimes size={10} /></span> Reject</span>
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

      {confirmAction && (
        <ConfirmBox
          title={
            confirmAction.type === "MAKE_ADMIN" ? "Make Admin"
              : confirmAction.type === "REVOKE_ADMIN" ? "Revoke Admin"
                : `${confirmAction.type.charAt(0) + confirmAction.type.slice(1).toLowerCase()} User`
          }
          description={
            <>This will send a <strong>{confirmAction.type.toLowerCase()}</strong> request for EIN <strong>{confirmAction.user.ein}</strong> for approval by another DCO admin.</>
          }
          requireRemark={["ACTIVATE", "DEACTIVATE", "DELETE"].includes(confirmAction.type)}
          confirmLabel="Submit"
          confirmVariant="primary"
          submitting={submitting}
          onConfirm={(remark) => submitRequest(confirmAction.type, confirmAction.user, remark)}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {showAddUser && (
        <AddNewUserModal
          submitting={submitting}
          onConfirm={(newUser) => submitRequest("ADD", newUser)}
          onClose={() => setShowAddUser(false)}
        />
      )}

      {checkerAction && (
        <ConfirmBox
          title={`${checkerAction.decision === "APPROVE" ? "Approve" : "Reject"} Request — ${checkerAction.user.pendingRequest.reqId}`}
          description={
            <>
              This will <strong>{checkerAction.decision === "APPROVE" ? "approve" : "reject"}</strong> the{" "}
              <strong>{checkerAction.user.pendingRequest.requestType.toLowerCase()}</strong> request for{" "}
              <strong>{checkerAction.user.name}</strong> (EIN: {checkerAction.user.ein}).
              {checkerAction.user.pendingRequest?.makerRemark?.trim() ? (
                <><br /><br /><span className="text-muted">Maker remark:</span><br /><strong>{checkerAction.user.pendingRequest.makerRemark.trim()}</strong></>
              ) : null}
            </>
          }
          confirmLabel={checkerAction.decision === "APPROVE" ? "Approve" : "Reject"}
          confirmVariant={checkerAction.decision === "APPROVE" ? "success" : "danger"}
          submitting={submitting}
          onConfirm={() => resolveRequest(checkerAction.decision, checkerAction.user)}
          onClose={() => setCheckerAction(null)}
        />
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

function ConfirmBox({ title, description, confirmLabel, confirmVariant, submitting, onConfirm, onClose, requireRemark = false }) {
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");

  const handleConfirm = () => {
    if (requireRemark && !remark.trim()) {
      setRemarkError("Remark is required.");
      return;
    }
    onConfirm(requireRemark ? remark.trim() : "");
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow" style={{ borderRadius: 10, overflow: "hidden" }}>
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {description && <p className={requireRemark ? "mb-3" : "mb-0"}>{description}</p>}
            {requireRemark && (
              <div>
                <label className="form-label">Remark <span className="text-danger">*</span></label>
                <textarea
                  className={`form-control ${remarkError ? "is-invalid" : ""}`}
                  rows={3}
                  value={remark}
                  placeholder="Enter reason for this request"
                  onChange={(e) => { setRemark(e.target.value); setRemarkError(""); }}
                />
                {remarkError && <div className="invalid-feedback">{remarkError}</div>}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className={`btn btn-${confirmVariant}`} disabled={submitting} onClick={handleConfirm}>
              {submitting ? <FaSpinner className="spin me-1" /> : null} {confirmLabel}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddNewUserModal({ submitting, onConfirm, onClose }) {
  const blank = {
    userType: "", ein: "", name: "", sol: "", email: "", agency: "",
    zone: "", region: "", officerType: "", fromDate: "", toDate: "", remark: ""
  };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);

  //This is for zone/region selection for DCO user
  const [zones, setZones] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [listError, setListError] = useState("");
  const listFetchGen = useRef(0);

  const isAuditor = form.userType === "INTERNAL_AUDITOR" || form.userType === "EXTERNAL_AUDITOR";
  const NotInHRMS = form.userType === "EXTERNAL_AUDITOR" || form.userType === "TEMP_USER" || form.userType === "HO_DBD";
  const isRzo = form.userType === "REGIONAL_ZONAL_OFFICER";

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setErrors((p) => ({ ...p, [field]: "", fetch: "" }));
    if (field === "userType") {
      listFetchGen.current += 1;
      setFetched(false);
      setZones([]);
      setRegions([]);
      setListError("");
      setLoadingZones(false);
      setLoadingRegions(false);
      setForm({ ...blank, userType: value });
      return;
    }
    if (field === "ein") {
      setFetched(false);
      setForm((p) => ({ ...p, ein: value, name: "", sol: "", email: "", agency: "" }));
      return;
    }
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleFetchHrms = async () => {
    const ein = form.ein.trim();
    if (!ein) { setErrors((p) => ({ ...p, ein: "Enter EIN to fetch." })); return; }
    if (!form.userType) { setErrors((p) => ({ ...p, userType: "Please select a user type first." })); return; }

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
      setErrors((p) => ({ ...p, fetch: apiError(err, "HRMS fetch failed") }));
      setForm((p) => ({ ...p, name: "", email: "", sol: "", agency: "" }));
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = () => {
    const next = {};
    if (!form.userType) {
      next.userType = "Please select a user type.";
    }
    if (!form.ein.trim()) {
      next.ein = "EIN is required.";
    }
    if (!form.email.trim()) {
      next.email = "Email is required.";
    }
    // HRMS users must fetch details
    if (!NotInHRMS && !fetched) {
      next.fetch = "Fetch HRMS details before submit.";
    }
    if (!form.name.trim()) {
      next.name = "Name is required.";
    }
    if (!form.sol.trim()) {
      next.sol = "Sol is Required.";
    }
    if (!form.agency.trim()) {
      next.agency = "Agency is Required.";
    }
    if (!form.remark.trim()) {
      next.remark = "Remark is required.";
    }
    if (isAuditor) {
      if (!form.fromDate) {
        next.fromDate = "From date is required.";
      }
      if (!form.toDate) {
        next.toDate = "To date is required.";
      }
      if (
        form.fromDate &&
        form.toDate &&
        form.toDate < form.fromDate
      ) {
        next.toDate = "To date cannot be before From date.";
      }
    }
    if (isRzo) {
      if (!form.officerType) next.officerType = "Select Zonal Head or Regional Head.";
      if (form.officerType === "ZONAL_HEAD" && !form.zone) next.zone = "Select one zone.";
      if (form.officerType === "REGIONAL_HEAD" && !form.region) next.region = "Select one region.";
    }
    setErrors(next);
    if (Object.keys(next).length)
      return;

    onConfirm({
      ein: form.ein.trim(),
      name: form.name.trim(),
      sol: form.sol.trim(),
      email: form.email.trim(),
      agency: form.agency.trim(),
      userType: form.userType,
      fromDate: isAuditor ? form.fromDate : "",
      toDate: isAuditor ? form.toDate : "",
      officerType: isRzo ? form.officerType : "",
      zone: form.officerType === "ZONAL_HEAD" ? form.zone : "",
      region: form.officerType === "REGIONAL_HEAD" ? form.region : "",
      makerRemark: form.remark.trim(),
    });
  };

  const handleOfficerTypeChange = async (type) => {
    const gen = ++listFetchGen.current;
    setForm((prev) => ({ ...prev, officerType: type, zone: "", region: "" }));
    setErrors((prev) => ({ ...prev, officerType: "", zone: "", region: "" }));
    setZones([]);
    setRegions([]);
    setListError("");

    const isZone = type === "ZONAL_HEAD";
    try {
      if (isZone) setLoadingZones(true);
      else setLoadingRegions(true);

      let rows = [];
      try {
        const res = await api.get(isZone ? "/api/userManagement/zones" : "/api/userManagement/regions");
        rows = asOptionList(res.data, isZone ? ["zones", "data"] : ["regions", "data"]);
      } catch {
        rows = [];
      }
      if (gen !== listFetchGen.current) return;
      if (!rows.length) rows = isZone ? HARDCODED_ZONES : HARDCODED_REGIONS;
      if (isZone) setZones(rows);
      else setRegions(rows);
    } finally {
      if (gen === listFetchGen.current) {
        setLoadingZones(false);
        setLoadingRegions(false);
      }
    }
  };


  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 560 }}>
        <div
          className="modal-content border-0 shadow"
          style={{ borderRadius: "10px", overflow: "hidden" }}
        >
          {/* Header */}
          <div className="modal-header px-4 py-2">
            <h5 className="modal-title fw-semibold mb-0">
              Add New User
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />
          </div>

          {/* Body */}
          <div className="modal-body px-4 py-3">

            <div className="row g-3">
              <div className="col-6">
                <label className="form-label mb-1">
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

              {form.userType && (
                <div className="col-6">
                  <label className="form-label mb-1">
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
                    {!NotInHRMS && (
                      <button
                        type="button"
                        className="btn btn-outline-primary px-3"
                        disabled={fetching || !form.ein.trim()}
                        onClick={handleFetchHrms}
                      >
                        {fetching ? <FaSpinner className="spin" /> : "Fetch"}
                      </button>
                    )}
                  </div>
                  {errors.ein && <div className="text-danger small mt-1">{errors.ein}</div>}
                  {errors.fetch && <div className="text-danger small mt-1">{errors.fetch}</div>}
                </div>
              )}
            </div>

            {form.userType && (
              <>
                <div className="row g-3 mt-0">
                  <div className="col-6">
                    <label className="form-label mb-1">
                      User Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={handleChange("name")}
                      readOnly={!NotInHRMS}
                    />
                    {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                  </div>
                  <div className="col-6">
                    <label className="form-label mb-1">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange("email")}
                      readOnly={!NotInHRMS}
                    />
                    {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                  </div>
                </div>

                <div className="row g-3 mt-0">
                  <div className="col-6">
                    <label className="form-label mb-1">
                      SOL <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.sol}
                      onChange={handleChange("sol")}
                      readOnly={!NotInHRMS}
                    />
                    {errors.sol && <div className="text-danger small mt-1">{errors.sol}</div>}
                  </div>
                  <div className="col-6">
                    <label className="form-label mb-1">
                      Agency <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.agency}
                      onChange={handleChange("agency")}
                      readOnly={!NotInHRMS}
                    />
                    {errors.agency && <div className="text-danger small mt-1">{errors.agency}</div>}
                  </div>
                </div>

                {isAuditor && (
                  <div className="row g-3 mt-0">
                    <div className="col-6">
                      <label className="form-label mb-1">
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
                    <div className="col-6">
                      <label className="form-label mb-1">
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

                {isRzo && (
                  <div
                    className="mt-2 p-2 border rounded-3"
                    style={{
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <label className="form-label fw-semibold mb-2">
                      Officer Type{" "}
                      <span className="text-danger">*</span>
                    </label>

                    <div className="row g-2">
                      <div className="col-6">
                        <label
                          className={`w-100 border rounded-2 p-2 d-flex align-items-center ${form.officerType === "ZONAL_HEAD"
                            ? "border-primary bg-white"
                            : "bg-white"
                            }`}
                          style={{
                            cursor: "pointer",
                            minHeight: 42,
                          }}
                        >
                          <input
                            className="form-check-input mt-0 me-2"
                            type="radio"
                            name="officerType"
                            checked={
                              form.officerType === "ZONAL_HEAD"
                            }
                            onChange={() =>
                              handleOfficerTypeChange(
                                "ZONAL_HEAD"
                              )
                            }
                          />

                          <span
                            className={
                              form.officerType === "ZONAL_HEAD"
                                ? "fw-semibold text-primary"
                                : ""
                            }
                            style={{ fontSize: 14 }}
                          >
                            Zonal Head
                          </span>
                        </label>
                      </div>

                      <div className="col-6">
                        <label
                          className={`w-100 border rounded-2 p-2 d-flex align-items-center ${form.officerType === "REGIONAL_HEAD"
                            ? "border-primary bg-white"
                            : "bg-white"
                            }`}
                          style={{
                            cursor: "pointer",
                            minHeight: 42,
                          }}
                        >
                          <input
                            className="form-check-input mt-0 me-2"
                            type="radio"
                            name="officerType"
                            checked={
                              form.officerType === "REGIONAL_HEAD"
                            }
                            onChange={() =>
                              handleOfficerTypeChange(
                                "REGIONAL_HEAD"
                              )
                            }
                          />

                          <span
                            className={
                              form.officerType === "REGIONAL_HEAD"
                                ? "fw-semibold text-primary"
                                : ""
                            }
                            style={{ fontSize: 14 }}
                          >
                            Regional Head
                          </span>
                        </label>
                      </div>
                    </div>

                    {errors.officerType && (
                      <div className="text-danger small mt-2">
                        {errors.officerType}
                      </div>
                    )}

                    {/* Zone */}
                    {form.officerType === "ZONAL_HEAD" && (
                      <div className="mt-3">
                        <label className="form-label mb-1">
                          Select Zone{" "}
                          <span className="text-danger">*</span>
                        </label>

                        <TypeaheadSelect
                          items={zones}
                          value={form.zone}
                          onChange={(id) => {
                            setForm((p) => ({
                              ...p,
                              zone: id,
                            }));

                            setErrors((p) => ({
                              ...p,
                              zone: "",
                            }));
                          }}
                          loading={loadingZones}
                          emptyText="No matching zone."
                          error={listError}
                          invalid={Boolean(errors.zone)}
                          placeholder="Search and select zone"
                          idKeys={[
                            "zoneId",
                            "id",
                            "zoneCode",
                            "code",
                            "zone",
                          ]}
                          labelKeys={[
                            "zoneName",
                            "name",
                            "zone",
                            "zoneId",
                          ]}
                        />

                        {errors.zone && (
                          <div className="text-danger small mt-1">
                            {errors.zone}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Region */}
                    {form.officerType === "REGIONAL_HEAD" && (
                      <div className="mt-3">
                        <label className="form-label mb-1">
                          Select Region{" "}
                          <span className="text-danger">*</span>
                        </label>

                        <TypeaheadSelect
                          items={regions}
                          value={form.region}
                          onChange={(id) => {
                            setForm((p) => ({
                              ...p,
                              region: id,
                            }));

                            setErrors((p) => ({
                              ...p,
                              region: "",
                            }));
                          }}
                          loading={loadingRegions}
                          emptyText="No matching region."
                          error={listError}
                          invalid={Boolean(errors.region)}
                          placeholder="Search and select region"
                          idKeys={[
                            "regionId",
                            "id",
                            "regionCode",
                            "code",
                            "region",
                          ]}
                          labelKeys={[
                            "regionName",
                            "name",
                            "region",
                            "regionId",
                          ]}
                        />

                        {errors.region && (
                          <div className="text-danger small mt-1">
                            {errors.region}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3">
                  <label className="form-label mb-1">
                    Remark <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${errors.remark ? "is-invalid" : ""}`}
                    rows={2}
                    value={form.remark}
                    placeholder="Enter reason for adding this user"
                    onChange={handleChange("remark")}
                  />
                  {errors.remark && <div className="invalid-feedback">{errors.remark}</div>}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer px-4 py-2">

            <button
              type="button"
              className="btn btn-primary px-4"
              disabled={submitting || !form.userType}
              onClick={handleSubmit}
            >
              {submitting && (
                <FaSpinner className="spin me-1" />
              )}
              Submit
            </button>

            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={onClose}
            >
              Cancel
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileManagement;
