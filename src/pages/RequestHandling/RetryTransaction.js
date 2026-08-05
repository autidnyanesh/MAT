import React, { useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch, FaSpinner, FaRedo } from "react-icons/fa";
import AlertModal from "../../components/AlertModel";
import ConfirmModal from "../../components/ComfirmModel";
import RequestDetailsModal from "../../components/RequestDetailsModal";
import "../../styles/tableAlign.css";

const PAGE_SIZE = 10;

// Days remaining from createdAt (30-day window)
const daysRemaining = (createdAt) => {
    const diff = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return 30 - diff;
};

const SAMPLE_DATA = [
    { requestId: "REQ0003", txnType: "UPI", reqRaisedDate: "03-Jun-2026 09:10:00", createdAt: "2026-06-03", custId: "CUST1003", accountNo: "3456789012", sol: "1003", mid: "MID99999", tid: "TID003", dateTxn: "2026-06-03", rrn: "RRN003", gateTxnId: "GTX003", merchantVPA: "store@upi", tranAmount: 7500, refundAmt: 7500, failureReason: "Finacle GL account error", uName: "Carol", uEmail: "carol@example.com", status: "FINACLE_FAILED" },
    { requestId: "REQ0004", txnType: "CARD", reqRaisedDate: "04-Jun-2026 11:20:00", createdAt: "2026-06-04", custId: "CUST1004", accountNo: "4567890123", sol: "1004", mid: "MID44444", tid: "TID004", dateTxn: "2026-06-04", rrn: "RRN004", cardNum: "XXXX-XXXX-XXXX-5678", authCode: "AUTH004", scheme: "MASTERCARD", tranAmount: 1200, refundAmt: 1200, failureReason: "Timeout at Finacle", uName: "Dave", uEmail: "dave@example.com", status: "FINACLE_FAILED" },
    { requestId: "REQ0007", txnType: "UPI", reqRaisedDate: "05-Jun-2026 14:05:00", createdAt: "2026-06-05", custId: "CUST1007", accountNo: "7890123456", sol: "1007", mid: "MID77777", tid: "TID007", dateTxn: "2026-06-05", rrn: "RRN007", gateTxnId: "GTX007", merchantVPA: "pay@upi", tranAmount: 3200, refundAmt: 3200, failureReason: "Insufficient balance in GL", uName: "Frank", uEmail: "frank@example.com", status: "FINACLE_FAILED" },
];

// ── Retry Remark Modal ────────────────────────────────────────────────────────
const RetryRemarkModal = ({ request, onConfirm, onClose }) => {
    const [remarks, setRemarks] = useState("");
    const [error, setError] = useState("");

    const remaining = daysRemaining(request.createdAt);

    const handleSubmit = () => {
        if (!remarks.trim()) { setError("Remarks are required."); return; }
        onConfirm(remarks.trim());
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
                    <div className="modal-header py-2" style={{ borderBottom: "1px solid #e9ecef" }}>
                        <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>
                            Retry Transaction — {request.requestId}
                        </span>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body p-3">
                        {remaining <= 7 && (
                            <div className="alert alert-warning py-1 mb-2" style={{ fontSize: "12px" }}>
                                ⚠️ Only <strong>{remaining} day(s)</strong> remaining to retry this request.
                            </div>
                        )}
                        <div className="mb-2" style={{ fontSize: "13px" }}>
                            <span className="text-muted">Failure Reason: </span>
                            <span className="text-danger fw-semibold">{request.failureReason}</span>
                        </div>
                        <label className="form-label mb-1">Remarks <span className="text-danger">*</span></label>
                        <textarea
                            className={`form-control ${error ? "is-invalid" : ""}`}
                            rows={3} maxLength={500}
                            placeholder="Enter reason for retry..."
                            value={remarks}
                            onChange={(e) => { setRemarks(e.target.value); setError(""); }}
                        />
                        <div className="d-flex justify-content-between mt-1">
                            {error ? <div className="text-danger small">{error}</div> : <span />}
                            <span className="text-muted small">{remarks.length}/500</span>
                        </div>
                    </div>
                    <div className="modal-footer py-2">
                        <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Retry</button>
                        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const RetryTransaction = () => {
    const [records, setRecords] = useState(SAMPLE_DATA);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewRequest, setViewRequest] = useState(null);
    const [retryModal, setRetryModal] = useState(null);   // request object
    const [submitting, setSubmitting] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, title: "", message: "", type: "success" });

    const filteredData = useMemo(() =>
        records.filter(r =>
            Object.values(r).join(" ").toLowerCase().includes(searchText.toLowerCase())
        ), [searchText, records]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const pageData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleRetryConfirm = async (remarks) => {
        const request = retryModal;
        setRetryModal(null);
        setSubmitting(true);
        try {
            // TODO: replace with real API
            // const res = await api.post("/api/retry-transaction/submit", { requestId: request.requestId, remarks });
            await new Promise(res => setTimeout(res, 600)); // mock delay

            // Mock: simulate deleted account for REQ0007
            const isDeletedAccount = request.requestId === "REQ0007";

            if (isDeletedAccount) {
                setRecords(prev => prev.map(r =>
                    r.requestId === request.requestId ? { ...r, status: "REJECTED_DELETED_ACCOUNT" } : r
                ));
                setAlertConfig({
                    show: true,
                    title: "Request Rejected",
                    message: `Request ${request.requestId} rejected — account deleted. Failure mail sent to branch and requester.`,
                    type: "error",
                });
            } else {
                setRecords(prev => prev.filter(r => r.requestId !== request.requestId));
                setAlertConfig({
                    show: true,
                    title: "Retry Submitted",
                    message: `Retry transaction for ${request.requestId} submitted successfully to Finacle.`,
                    type: "success",
                });
            }
        } catch {
            setAlertConfig({ show: true, title: "Failed", message: "Unable to submit retry. Please try again.", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    const statusBadge = (status) => {
        if (status === "FINACLE_FAILED")
            return <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>Finacle Failed</span>;
        if (status === "REJECTED_DELETED_ACCOUNT")
            return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>Rejected — Deleted Acct</span>;
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>{status}</span>;
    };

    const daysBadge = (createdAt) => {
        const rem = daysRemaining(createdAt);
        const color = rem <= 7 ? "danger" : rem <= 15 ? "warning" : "success";
        return <span className={`badge bg-${color}-subtle text-${color} border border-${color}-subtle rounded-pill px-2`} style={{ fontSize: "11px" }}>{rem}d left</span>;
    };

    return (
        <div className="container-fluid p-2">
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "12px" }}>
                <div className="card-header bg-white py-2 border-bottom">
                    <nav aria-label="breadcrumb" className="mb-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item text-muted">Request Handling</li>
                            <li className="breadcrumb-item active fw-semibold" aria-current="page">Retry Transaction</li>
                        </ol>
                    </nav>
                </div>
                <div className="card-body pb-2">
                    <div className="alert alert-info py-2 mb-3" style={{ fontSize: "13px" }}>
                        <strong>Retry Transaction:</strong> Retry Finacle-failed transactions within <strong>30 days</strong> of request creation.
                        Deleted account requests will be rejected and mail sent to branch. Requests beyond 30 days are auto-deleted with mail notification.
                    </div>
                    <div className="col-lg-3">
                        <label className="form-label">Search</label>
                        <div className="position-relative">
                            <FaSearch className="position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: "14px" }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by any field..."
                                value={searchText}
                                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                                style={{ paddingLeft: "38px" }}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table modern-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Raised Date</th>
                                <th>Txn Type</th>
                                <th>MID</th>
                                <th>Account No</th>
                                <th>Txn Amount</th>
                                <th>Refund Amount</th>
                                <th>Failure Reason</th>
                                <th>Status</th>
                                <th>Retry Window</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length > 0 ? pageData.map((row) => {
                                const rem = daysRemaining(row.createdAt);
                                const expired = rem <= 0;
                                const isRejected = row.status === "REJECTED_DELETED_ACCOUNT";
                                return (
                                    <tr key={row.requestId}>
                                        <td>
                                            <span className="request-link" onClick={() => setViewRequest(row)}>
                                                {row.requestId}
                                            </span>
                                        </td>
                                        <td>{row.reqRaisedDate}</td>
                                        <td>
                                            <span className={`badge bg-${row.txnType === "UPI" ? "info" : "secondary"}-subtle text-${row.txnType === "UPI" ? "info" : "secondary"} border border-${row.txnType === "UPI" ? "info" : "secondary"}-subtle rounded-pill px-2`} style={{ fontSize: "11px" }}>
                                                {row.txnType}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{row.mid}</td>
                                        <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{row.accountNo}</td>
                                        <td><span className="amount">₹ {row.tranAmount.toLocaleString("en-IN")}</span></td>
                                        <td><span className="amount">₹ {row.refundAmt.toLocaleString("en-IN")}</span></td>
                                        <td style={{ fontSize: "12px", color: "#dc2626", maxWidth: "160px" }}>{row.failureReason}</td>
                                        <td>{statusBadge(row.status)}</td>
                                        <td>{expired ? <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>Expired</span> : daysBadge(row.createdAt)}</td>
                                        <td>
                                            {!expired && !isRejected ? (
                                                <button
                                                    className="btn btn-primary btn-sm px-2"
                                                    style={{ fontSize: "12px" }}
                                                    disabled={submitting}
                                                    onClick={() => setRetryModal(row)}
                                                >
                                                    {submitting ? <FaSpinner className="spin" /> : <><FaRedo className="me-1" />Retry</>}
                                                </button>
                                            ) : (
                                                <span className="text-muted" style={{ fontSize: "12px" }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={11} className="text-center py-5 text-muted">No failed transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card-footer bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="text-muted small">
                            Showing <strong>{filteredData.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}</strong>–<strong>{Math.min(currentPage * PAGE_SIZE, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> records
                        </div>
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

            {/* View Modal */}
            <RequestDetailsModal
                show={!!viewRequest}
                request={viewRequest}
                onClose={() => setViewRequest(null)}
                firstDateLabel="Raised Date"
                firstDateValue={viewRequest?.reqRaisedDate}
                fields={[
                    { label: "Transaction Type", value: viewRequest?.txnType },
                    { label: "Transaction Date", value: viewRequest?.dateTxn },
                    { label: "MID", value: viewRequest?.mid },
                    { label: "TID", value: viewRequest?.tid },
                    { label: "SOL", value: viewRequest?.sol },
                    { label: "RRN", value: viewRequest?.rrn },
                    { label: "Gateway Txn ID", value: viewRequest?.gateTxnId },
                    { label: "Transaction Amount", value: viewRequest?.tranAmount ? `₹ ${Number(viewRequest.tranAmount).toLocaleString("en-IN")}` : "—" },
                    { label: "Refund Amount", value: viewRequest?.refundAmt ? `₹ ${Number(viewRequest.refundAmt).toLocaleString("en-IN")}` : "—" },
                    { label: "Account Number", value: viewRequest?.accountNo },
                    { label: "Merchant VPA", value: viewRequest?.merchantVPA },
                    { label: "Card Number", value: viewRequest?.cardNum },
                    { label: "Auth Code", value: viewRequest?.authCode },
                    { label: "Scheme", value: viewRequest?.scheme },
                    { label: "Failure Reason", value: viewRequest?.failureReason },
                    { label: "User Name", value: viewRequest?.uName },
                    { label: "User Email", value: viewRequest?.uEmail },
                ]}
            />

            {/* Retry Remark Modal */}
            {retryModal && (
                <RetryRemarkModal
                    request={retryModal}
                    onConfirm={handleRetryConfirm}
                    onClose={() => setRetryModal(null)}
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

export default RetryTransaction;
