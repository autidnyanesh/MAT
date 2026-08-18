import React, { useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaFileAlt, FaCheck, FaUndo, FaTimes } from "react-icons/fa";
import AlertModal from "../../../components/AlertModel";
import ConfirmModal from "../../../components/ComfirmModel";
import RequestFormFields from "../../../components/RequestFormFields";
import RequestDetailsModal from "../../../components/RequestDetailsModal";

const SAMPLE_REQUESTS = [
    { requestId: "REQ0001", txnType: "UPI", rrn: "RRN001", dateTxn: "2026-06-01", txnDate: "01-Jun-2026", tranAmount: 5000, refundAmt: 5000, custId: "CUST1001", accountNo: "1234567890", gateTxnId: "GTX001", documentName: "Doc1.pdf", mid: "MID12345", tid: "TID001", sol: "1001", merchantVPA: "merchant@upi", uName: "Alice", uEmail: "alice@example.com", buRemark: "Verified by BU" },
    { requestId: "REQ0002", txnType: "CARD", rrn: "RRN002", dateTxn: "2026-06-02", txnDate: "02-Jun-2026", tranAmount: 2500, refundAmt: 2500, custId: "CUST1002", accountNo: "2345678901", gateTxnId: null, documentName: null, mid: "MID56789", tid: "TID002", sol: "1002", cardNum: "XXXX-XXXX-XXXX-1234", authCode: "AUTH002", scheme: "VISA", uName: "Bob", uEmail: "bob@example.com", buRemark: "" },
    { requestId: "REQ0003", txnType: "UPI", rrn: "RRN003", dateTxn: "2026-06-03", txnDate: "03-Jun-2026", tranAmount: 7500, refundAmt: 7500, custId: "CUST1003", accountNo: "3456789012", gateTxnId: "GTX003", documentName: "Doc3.pdf", mid: "MID99999", tid: "TID003", sol: "1003", merchantVPA: "store@upi", uName: "Carol", uEmail: "carol@example.com", buRemark: "Checked OK" },
    { requestId: "REQ0004", txnType: "CARD", rrn: "RRN004", dateTxn: "2026-06-04", txnDate: "04-Jun-2026", tranAmount: 1200, refundAmt: 1200, custId: "CUST1004", accountNo: "4567890123", gateTxnId: null, documentName: "Doc4.pdf", mid: "MID44444", tid: "TID004", sol: "1004", cardNum: "XXXX-XXXX-XXXX-5678", authCode: "AUTH004", scheme: "MASTERCARD", uName: "Dave", uEmail: "dave@example.com", buRemark: "" },
    { requestId: "REQ0005", txnType: "UPI", rrn: "RRN005", dateTxn: "2026-06-05", txnDate: "05-Jun-2026", tranAmount: 4500, refundAmt: 4500, custId: "CUST1005", accountNo: "5678901234", gateTxnId: "GTX005", documentName: null, mid: "MID55555", tid: "TID005", sol: "1005", merchantVPA: "shop@upi", uName: "Eve", uEmail: "eve@example.com", buRemark: "Pending review" },
];

const PAGE_SIZE = 10;

// ── Action Remark Modal ───────────────────────────────────────────────────────
const ActionRemarkModal = ({ action, requestIds, onConfirm, onClose }) => {
    const [remark, setRemark] = useState("");
    const [error, setError] = useState("");

    const needsRemark = action === "Reject" || action === "Refer Back";

    const handleSubmit = () => {
        if (needsRemark && !remark.trim()) { setError("Remarks are compulsory for this action."); return; }
        onConfirm(remark.trim());
    };

    const actionColor = action === "Approve" ? "success" : action === "Reject" ? "danger" : "warning";
    const actionLabel = action === "Refer Back" ? "Refer Back" : action;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
                    <div className="modal-header py-2" style={{ borderBottom: "1px solid #e9ecef" }}>
                        <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>
                            {actionLabel} — {requestIds.length === 1 ? requestIds[0] : `${requestIds.length} requests`}
                        </span>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body p-3">
                        <label className="form-label mb-0">
                            Approval Remarks {needsRemark && <span className="text-danger">*</span>}
                            {!needsRemark && <span className="text-muted small ms-1">(optional)</span>}
                        </label>
                        <textarea
                            className={`form-control mt-1 ${error ? "is-invalid" : ""}`}
                            rows={3}
                            placeholder="Enter remarks..."
                            value={remark}
                            onChange={(e) => { setRemark(e.target.value); setError(""); }}
                        />
                        {error && <div className="text-danger small mt-1">{error}</div>}
                    </div>
                    <div className="modal-footer py-2">
                        <button className={`btn btn-${actionColor} btn-sm`} onClick={handleSubmit}>{actionLabel}</button>
                        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ApprovalQueue = () => {
    const [requests, setRequests] = useState(SAMPLE_REQUESTS);
    const [search, setSearch] = useState("");
    const [searchError, setSearchError] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // view modal
    const [viewRequest, setViewRequest] = useState(null);

    // action modal
    const [actionModal, setActionModal] = useState(null); // { action, requestIds[] }

    // checkboxes
    const [checkedIds, setCheckedIds] = useState([]);

    const [alertConfig, setAlertConfig] = useState({ show: false, title: "", message: "", type: "success" });

    // ── Search ────────────────────────────────────────────────────────────────
    const handleSearch = () => {
        if (!search.trim()) { setSearchError("Search value is required"); return; }
        setSearchError("");
        setAppliedSearch(search.trim());
        setCurrentPage(1);
        setCheckedIds([]);
    };

    const filteredData = useMemo(() =>
        requests.filter((row) =>
            Object.values(row).join(" ").toLowerCase().includes(appliedSearch.toLowerCase())
        ), [appliedSearch, requests]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const pageData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // ── Checkboxes ────────────────────────────────────────────────────────────
    const allPageChecked = pageData.length > 0 && pageData.every(r => checkedIds.includes(r.requestId));

    const toggleAll = () => {
        if (allPageChecked) setCheckedIds(prev => prev.filter(id => !pageData.find(r => r.requestId === id)));
        else setCheckedIds(prev => [...new Set([...prev, ...pageData.map(r => r.requestId)])]);
    };

    const toggleOne = (id) =>
        setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    // ── Action ────────────────────────────────────────────────────────────────
    const openAction = (action, ids) => setActionModal({ action, requestIds: ids });

    const handleConfirmAction = (remark) => {
        const { action, requestIds } = actionModal;
        const newStatus = action === "Approve" ? "Approved" : action === "Reject" ? "Rejected" : "Referred Back";
        setRequests(prev => prev.map(r => requestIds.includes(r.requestId) ? { ...r, status: newStatus } : r));
        setCheckedIds(prev => prev.filter(id => !requestIds.includes(id)));
        setActionModal(null);
        setAlertConfig({
            show: true,
            title: `${action} Successful`,
            message: `${requestIds.length} request(s) ${action.toLowerCase()}${action === "Refer Back" ? "red" : "ed"} successfully.`,
            type: action === "Approve" ? "success" : action === "Reject" ? "error" : "warning",
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="container-fluid p-2">
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">Request Handling</li>
                    <li className="breadcrumb-item active">Approval Queue as</li>
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
                                placeholder="Search any field..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setSearchError(""); }}
                            />
                            {searchError && <div className="text-danger small">{searchError}</div>}
                        </div>
                        <div className="col-md-6 d-flex gap-2 align-items-end">
                            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                            {appliedSearch && (
                                <button className="btn btn-outline-secondary" onClick={() => { setSearch(""); setAppliedSearch(""); setSearchError(""); setCurrentPage(1); setCheckedIds([]); }}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk action bar */}
            {checkedIds.length > 0 && (
                <div className="d-flex align-items-center gap-2 mb-2 px-1">
                    <span className="text-muted small">{checkedIds.length} selected</span>
                    <button className="btn btn-success btn-sm" onClick={() => openAction("Approve", checkedIds)}>Approve</button>
                    <button className="btn btn-warning btn-sm text-dark" onClick={() => openAction("Refer Back", checkedIds)}>Refer Back</button>
                    <button className="btn btn-danger btn-sm" onClick={() => openAction("Reject", checkedIds)}>Reject</button>
                </div>
            )}

            {/* Table */}
            <div className="card border-0 shadow-sm">
                <div className="alert alert-warning py-1 m-2 mb-0" style={{ fontSize: "13px" }}>
                    Displaying requests less than 90 days old pending DCO User action.
                </div>

                <div className="table-responsive" style={{ padding: "8px" }}>
                    <table className="table table-bordered table-hover table-sm align-middle mb-0" style={{ fontSize: "13px" }}>
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: 36 }}>
                                    <input type="checkbox" className="form-check-input" checked={allPageChecked} onChange={toggleAll} />
                                </th>
                                <th>Request ID</th>
                                <th>MID</th>
                                <th>RRN</th>
                                <th>Transaction Date</th>
                                <th>Transaction Amount</th>
                                <th>Refund Amount</th>
                                <th>Card Number</th>
                                <th>VPA ID</th>
                                <th>Account Number</th>
                                <th>Reference Document</th>
                                {/* <th>Branch User Remark</th> */}
                                {/* <th style={{ width: 90 }}>Action</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length > 0 ? pageData.map((row) => (
                                <tr key={row.requestId}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={checkedIds.includes(row.requestId)}
                                            onChange={() => toggleOne(row.requestId)}
                                        />
                                    </td>
                                    <td>
                                        <span
                                            className="text-primary fw-semibold"
                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                            onClick={() => setViewRequest(row)}
                                        >
                                            {row.requestId}
                                        </span>
                                    </td>
                                    <td>{row.mid}</td>
                                    <td>{row.rrn}</td>
                                    <td>{row.txnDate}</td>
                                    <td>₹ {row.tranAmount.toLocaleString()}</td>
                                    <td>₹ {row.refundAmt.toLocaleString()}</td>
                                    <td>{row.custId}</td>
                                    <td>{row.accountNo}</td>
                                    <td>{row.gateTxnId || "—"}</td>
                                    <td>
                                        {row.documentName
                                            ? <span className="text-primary" style={{ cursor: "pointer" }} onClick={() => { /* download via authenticated API later */ }}>
                                                <FaFileAlt className="me-1" />View
                                            </span>
                                            : <span className="text-muted">—</span>}
                                    </td>
                                    {/* <td>
                                        {row.buRemark
                                            ? <span className="text-muted" style={{ fontSize: "12px" }}>{row.buRemark}</span>
                                            : <span className="text-muted">—</span>}
                                    </td> */}
                                    <td>
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button title="Approve" className="btn btn-success btn-sm p-0" style={{ width: 28, height: 26, borderRadius: "6px" }} onClick={() => openAction("Approve", [row.requestId])}><FaCheck size={11} /></button>
                                            <button title="Refer Back" className="btn btn-warning btn-sm p-0" style={{ width: 28, height: 26, borderRadius: "6px" }} onClick={() => openAction("Refer Back", [row.requestId])}><FaUndo size={11} /></button>
                                            <button title="Reject" className="btn btn-danger btn-sm p-0" style={{ width: 28, height: 26, borderRadius: "6px" }} onClick={() => openAction("Reject", [row.requestId])}><FaTimes size={11} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="12" className="text-center py-4 text-muted">No records found.</td>
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

            {/* ── View Modal (read-only) ── */}
            <RequestDetailsModal
                show={!!viewRequest}
                request={viewRequest}
                onClose={() => setViewRequest(null)}
                firstDateLabel="Raised Date"
                firstDateValue={viewRequest?.reqRaisedDate}
                fields={[
                    { label: "Transaction Type", value: viewRequest?.txnType },
                    { label: "Transaction Date", value: viewRequest?.txnDate },
                    { label: "MID", value: viewRequest?.mid },
                    { label: "TID", value: viewRequest?.tid },
                    { label: "SOL", value: viewRequest?.sol },
                    { label: "RRN", value: viewRequest?.rrn },
                    { label: "Gateway Txn ID", value: viewRequest?.gateTxnId },
                    { label: "Transaction Amount", value: viewRequest?.tranAmount ? `₹ ${viewRequest.tranAmount.toLocaleString()}` : "—" },
                    { label: "Refund Amount", value: viewRequest?.refundAmt ? `₹ ${viewRequest.refundAmt.toLocaleString()}` : "—" },
                    { label: "Account Number", value: viewRequest?.accountNo },
                    { label: "Merchant VPA", value: viewRequest?.merchantVPA },
                    { label: "Customer ID", value: viewRequest?.custId },
                    { label: "Card Number", value: viewRequest?.cardNum },
                    { label: "Auth Code", value: viewRequest?.authCode },
                    { label: "Scheme", value: viewRequest?.scheme },
                    { label: "Document", value: viewRequest?.documentName },
                    { label: "Remark", value: viewRequest?.dcoRemark },
                    { label: "User Name", value: viewRequest?.uName },
                    { label: "User Email", value: viewRequest?.uEmail }
                ]}
            />

            {/* ── Action Remark Modal ── */}
            {actionModal && (
                <ActionRemarkModal
                    action={actionModal.action}
                    requestIds={actionModal.requestIds}
                    onConfirm={handleConfirmAction}
                    onClose={() => setActionModal(null)}
                />
            )}

            <AlertModal
                show={alertConfig.show}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(p => ({ ...p, show: false }))}
            />
        </div>
    );
};

export default ApprovalQueue;
