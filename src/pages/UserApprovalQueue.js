import React, { useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheck, FaTimes } from "react-icons/fa";
import AlertModal from "../components/AlertModel";
import api from "../api/axiosConfig";

const PAGE_SIZE = 10;

const SAMPLE_REQUESTS = [
    { reqId: "UREQ001", requestType: "ADD", ein: "100011", fullName: "Ramesh Kumar", position: "Officer", grade: "JMGS-I", supervisorEin: "100001", supervisorName: "ABC User", systemAccess: "MAT", requestedBy: "DCO001", requestedOn: "01-Jun-2026", status: "PENDING" },
    { reqId: "UREQ002", requestType: "ADD", ein: "100012", fullName: "Sunita Sharma", position: "Manager", grade: "MMGS-II", supervisorEin: "100002", supervisorName: "XYZ User", systemAccess: "MEA", requestedBy: "DCO001", requestedOn: "02-Jun-2026", status: "PENDING" },
    { reqId: "UREQ003", requestType: "DEACTIVATE", ein: "100013", fullName: "Vijay Patil", position: "Officer", grade: "JMGS-I", supervisorEin: "100001", supervisorName: "ABC User", systemAccess: "MAT", requestedBy: "DCO001", requestedOn: "03-Jun-2026", status: "PENDING" },
    { reqId: "UREQ004", requestType: "DELETE", ein: "100014", fullName: "Priya Nair", position: "Branch Head", grade: "MMGS-III", supervisorEin: "", supervisorName: "", systemAccess: "MAT", requestedBy: "DCO001", requestedOn: "04-Jun-2026", status: "PENDING" },
    { reqId: "UREQ005", requestType: "ACTIVATE", ein: "100015", fullName: "Anil Desai", position: "Officer", grade: "JMGS-I", supervisorEin: "100003", supervisorName: "PQR User", systemAccess: "MEA", requestedBy: "DCO001", requestedOn: "05-Jun-2026", status: "PENDING" },
];

const REQUEST_TYPE_BADGE = {
    ADD: "bg-primary",
    ACTIVATE: "bg-success",
    DEACTIVATE: "bg-warning text-dark",
    DELETE: "bg-danger",
};

// ── Action Remark Modal ───────────────────────────────────────────────────────
const ActionRemarkModal = ({ action, request, onConfirm, onClose }) => {
    const [remark, setRemark] = useState("");
    const [error, setError] = useState("");
    const isReject = action === "Reject";
    const actionColor = isReject ? "danger" : "success";

    const handleSubmit = () => {
        if (!remark.trim()) { setError("Remarks are compulsory."); return; }
        onConfirm(remark.trim());
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
                    <div className="modal-header py-2" style={{ borderBottom: "1px solid #e9ecef" }}>
                        <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>
                            {action} User Request — {request.reqId} ({request.fullName})
                        </span>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body p-3">
                        <label className="form-label mb-0">
                            Remarks <span className="text-danger">*</span>
                        </label>
                        <textarea
                            className={`form-control mt-1 ${error ? "is-invalid" : ""}`}
                            rows={3} maxLength={300}
                            placeholder="Enter remarks..."
                            value={remark}
                            onChange={(e) => { setRemark(e.target.value); setError(""); }}
                        />
                        <div className="d-flex justify-content-between mt-1">
                            {error ? <div className="text-danger small">{error}</div> : <span />}
                            <span className="text-muted small">{remark.length}/300</span>
                        </div>
                    </div>
                    <div className="modal-footer py-2">
                        <button className={`btn btn-${actionColor} btn-sm`} onClick={handleSubmit}>{action}</button>
                        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── View Modal ────────────────────────────────────────────────────────────────
const ViewModal = ({ request, onClose }) => (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
                <div className="modal-header py-2" style={{ borderBottom: "1px solid #e9ecef" }}>
                    <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>
                        User Request — {request.reqId}
                    </span>
                    <button className="btn-close" onClick={onClose} />
                </div>
                <div className="modal-body p-3">
                    <div style={{ border: "1px solid #dee2e6", borderRadius: "8px", padding: "12px" }}>
                        <div className="row g-3" style={{ fontSize: "13px" }}>
                            {[
                                ["Request ID", request.reqId],
                                ["Request Type", request.requestType],
                                ["EIN", request.ein],
                                ["Full Name", request.fullName],
                                ["Position", request.position],
                                ["Grade", request.grade],
                                ["System Access", request.systemAccess],
                                ["Supervisor EIN", request.supervisorEin || "—"],
                                ["Supervisor Name", request.supervisorName || "—"],
                                ["Requested By", request.requestedBy],
                                ["Requested On", request.requestedOn],
                            ].map(([label, value]) => (
                                <div className="col-md-6" key={label}>
                                    <div className="text-muted" style={{ fontSize: "11px" }}>{label}</div>
                                    <div className="fw-semibold">{value}</div>
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

// ── Main Component ────────────────────────────────────────────────────────────
const UserApprovalQueue = () => {
    const [requests, setRequests] = useState(SAMPLE_REQUESTS);
    const [search, setSearch] = useState("");
    const [searchError, setSearchError] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewRequest, setViewRequest] = useState(null);
    const [actionModal, setActionModal] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ show: false, title: "", message: "", type: "success" });

    const handleSearch = () => {
        if (!search.trim()) { setSearchError("Search value is required"); return; }
        setSearchError(""); setAppliedSearch(search.trim()); setCurrentPage(1);
    };

    const filteredData = useMemo(() =>
        requests.filter(r => r.status === "PENDING" &&
            Object.values(r).join(" ").toLowerCase().includes(appliedSearch.toLowerCase())
        ), [appliedSearch, requests]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const pageData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleConfirmAction = async (remark) => {
        const { action, request } = actionModal;
        const newStatus = action === "Approve" ? "APPROVED" : "REJECTED";
        try {
            // await api.post("/api/user-approval/action", { reqId: request.reqId, action, remark });
            setRequests(prev => prev.map(r =>
                r.reqId === request.reqId ? { ...r, status: newStatus, checkerRemark: remark } : r
            ));
            setActionModal(null);
            setAlertConfig({
                show: true,
                title: `${action} Successful`,
                message: `User creation request for ${request.fullName} (EIN: ${request.ein}) has been ${action === "Approve" ? "approved" : "rejected"} successfully.`,
                type: action === "Approve" ? "success" : "error",
            });
        } catch {
            setAlertConfig({ show: true, title: "Action Failed", message: "Unable to process request. Please try again.", type: "error" });
        }
    };

    return (
        <div className="container-fluid p-2">
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">User Management</li>
                    <li className="breadcrumb-item active">User Approval Queue</li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            {/* Search */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Search</label>
                            <input
                                type="text"
                                className={`form-control ${searchError ? "is-invalid" : ""}`}
                                placeholder="Search by EIN, name, role..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setSearchError(""); }}
                            />
                            {searchError && <div className="text-danger small">{searchError}</div>}
                        </div>
                        <div className="col-md-6 d-flex gap-2 align-items-end">
                            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                            {appliedSearch && (
                                <button className="btn btn-outline-secondary" onClick={() => { setSearch(""); setAppliedSearch(""); setSearchError(""); setCurrentPage(1); }}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm">
                <div className="alert alert-warning py-1 m-2 mb-0" style={{ fontSize: "13px" }}>
                    Displaying pending user creation, activation, deactivation and deletion requests raised by DCO Maker awaiting approval.
                </div>

                <div className="table-responsive" style={{ padding: "8px" }}>
                    <table className="table table-bordered table-hover table-sm align-middle mb-0" style={{ fontSize: "13px" }}>
                        <thead className="table-light">
                            <tr>
                                <th>Request ID</th>
                                <th>Type</th>
                                <th>EIN</th>
                                <th>Full Name</th>
                                <th>Position</th>
                                <th>Grade</th>
                                <th>System Access</th>
                                <th>Requested By</th>
                                <th>Requested On</th>
                                <th style={{ width: 80 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length > 0 ? pageData.map((row) => (
                                <tr key={row.reqId}>
                                    <td>
                                        <span
                                            className="text-primary fw-semibold"
                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                            onClick={() => setViewRequest(row)}
                                        >
                                            {row.reqId}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${REQUEST_TYPE_BADGE[row.requestType] || "bg-secondary"}`}>
                                            {row.requestType}
                                        </span>
                                    </td>
                                    <td>{row.ein}</td>
                                    <td>{row.fullName}</td>
                                    <td>{row.position}</td>
                                    <td>{row.grade}</td>
                                    <td>
                                        <span className="badge bg-primary">{row.systemAccess}</span>
                                    </td>
                                    <td>{row.requestedBy}</td>
                                    <td>{row.requestedOn}</td>
                                    <td>
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button title="Approve" className="btn btn-success btn-sm p-0" style={{ width: 26, height: 26, borderRadius: "6px" }} onClick={() => setActionModal({ action: "Approve", request: row })}>
                                                <FaCheck size={11} />
                                            </button>
                                            <button title="Reject" className="btn btn-danger btn-sm p-0" style={{ width: 26, height: 26, borderRadius: "6px" }} onClick={() => setActionModal({ action: "Reject", request: row })}>
                                                <FaTimes size={11} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-4 text-muted">No pending user creation requests.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card-footer bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredData.length)} of {filteredData.length} requests
                        </small>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            {viewRequest && <ViewModal request={viewRequest} onClose={() => setViewRequest(null)} />}

            {actionModal && (
                <ActionRemarkModal
                    action={actionModal.action}
                    request={actionModal.request}
                    onConfirm={handleConfirmAction}
                    onClose={() => setActionModal(null)}
                />
            )}

            <AlertModal
                show={alertConfig.show} title={alertConfig.title}
                message={alertConfig.message} type={alertConfig.type}
                onClose={() => setAlertConfig(p => ({ ...p, show: false }))}
            />
        </div>
    );
};

export default UserApprovalQueue;