import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaFileAlt, FaCheck, FaUndo, FaTimes, FaSearch, FaSpinner } from "react-icons/fa";
import AlertModal from "../../../components/AlertModel";
import RequestFormFields from "../../../components/RequestFormFields";
import "../../../styles/tableAlign.css";

const SAMPLE_REQUESTS = [
    { requestId: "REQ0001", txnType: "UPI", rrn: "RRN001", dateTxn: "2026-06-01", txnDate: "01-Jun-2026", tranAmount: 5000, refundAmt: 5000, custId: "CUST1001", accountNo: "1234567890", gateTxnId: "GTX001", documentName: "Doc1.pdf", mid: "MID12345", tid: "TID001", sol: "1001", merchantVPA: "merchant@upi", uName: "Alice", uEmail: "alice@example.com", dcoRemark: "Verified" },
    { requestId: "REQ0002", txnType: "CARD", rrn: "RRN002", dateTxn: "2026-06-02", txnDate: "02-Jun-2026", tranAmount: 2500, refundAmt: 2500, custId: "CUST1002", accountNo: "2345678901", gateTxnId: null, documentName: null, mid: "MID56789", tid: "TID002", sol: "1002", cardNum: "XXXX-XXXX-XXXX-1234", authCode: "AUTH002", scheme: "VISA", uName: "Bob", uEmail: "bob@example.com", dcoRemark: "" },
    { requestId: "REQ0003", txnType: "UPI", rrn: "RRN003", dateTxn: "2026-06-03", txnDate: "03-Jun-2026", tranAmount: 7500, refundAmt: 7500, custId: "CUST1003", accountNo: "3456789012", gateTxnId: "GTX003", documentName: "Doc3.pdf", mid: "MID99999", tid: "TID003", sol: "1003", merchantVPA: "store@upi", uName: "Carol", uEmail: "carol@example.com", dcoRemark: "Checked" },
    { requestId: "REQ0004", txnType: "CARD", rrn: "RRN004", dateTxn: "2026-06-04", txnDate: "04-Jun-2026", tranAmount: 1200, refundAmt: 1200, custId: "CUST1004", accountNo: "4567890123", gateTxnId: null, documentName: "Doc4.pdf", mid: "MID44444", tid: "TID004", sol: "1004", cardNum: "XXXX-XXXX-XXXX-5678", authCode: "AUTH004", scheme: "MASTERCARD", uName: "Dave", uEmail: "dave@example.com", dcoRemark: "" },
    { requestId: "REQ0005", txnType: "UPI", rrn: "RRN005", dateTxn: "2026-06-05", txnDate: "05-Jun-2026", tranAmount: 4500, refundAmt: 4500, custId: "CUST1005", accountNo: "5678901234", gateTxnId: "GTX005", documentName: null, mid: "MID55555", tid: "TID005", sol: "1005", merchantVPA: "shop@upi", uName: "Eve", uEmail: "eve@example.com", dcoRemark: "Pending" },
];

const REJECT_REASONS = [
    "Amount mismatch in letter & details submitted",
    "Date mismatch in letter & details submitted",
    "MID mismatch in letter & details submitted",
    "RRN mismatch in letter & details submitted",
    "Other",
];

const PAGE_SIZE = 10;

// ── Action Remark Modal ───────────────────────────────────────────────────────
const ActionRemarkModal = ({ action, requestIds, onConfirm, onClose }) => {
    const [selected, setSelected] = useState("");
    const [otherText, setOtherText] = useState("");
    const [freeText, setFreeText] = useState("");
    const [error, setError] = useState("");

    const isReject = action === "Reject";
    const actionColor = action === "Approve" ? "success" : action === "Reject" ? "danger" : "warning";

    const handleSubmit = () => {
        if (isReject) {
            if (!selected) { setError("Please select a rejection reason."); return; }
            if (selected === "Other" && !otherText.trim()) { setError("Please enter rejection details."); return; }
        } else {
            if (!freeText.trim()) { setError(`Remarks are compulsory for ${action}.`); return; }
        }
        const finalRemark = isReject
            ? (selected === "Other" ? otherText.trim() : selected)
            : freeText.trim();
        onConfirm(finalRemark);
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
                    <div className="modal-header py-2" style={{ borderBottom: "1px solid #e9ecef" }}>
                        <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>
                            {action} — {requestIds.length === 1 ? requestIds[0] : `${requestIds.length} requests`}
                        </span>
                        <button className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body p-3">
                        <label className="form-label mb-0">
                            Remarks <span className="text-danger">*</span>
                        </label>

                        {isReject ? (
                            <>
                                <select
                                    className={`form-select mt-1 ${error && !selected ? "is-invalid" : ""}`}
                                    value={selected}
                                    onChange={(e) => { setSelected(e.target.value); setOtherText(""); setError(""); }}
                                >
                                    <option value="">— Select rejection reason —</option>
                                    {REJECT_REASONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                {selected === "Other" && (
                                    <div className="mt-2">
                                        <textarea
                                            className={`form-control ${error && !otherText.trim() ? "is-invalid" : ""}`}
                                            rows={3}
                                            maxLength={300}
                                            placeholder="Enter rejection details (max 300 characters)..."
                                            value={otherText}
                                            onChange={(e) => { setOtherText(e.target.value); setError(""); }}
                                        />
                                        <div className="text-muted small text-end mt-1">{otherText.length}/300</div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <textarea
                                className={`form-control mt-1 ${error ? "is-invalid" : ""}`}
                                rows={3}
                                placeholder="Enter remarks..."
                                value={freeText}
                                onChange={(e) => { setFreeText(e.target.value); setError(""); }}
                            />
                        )}

                        {error && <div className="text-danger small mt-1">{error}</div>}
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

// ── Main Component ────────────────────────────────────────────────────────────
const DCOCheckerApprovalQueue = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState(SAMPLE_REQUESTS);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewRequest, setViewRequest] = useState(null);
    const [actionModal, setActionModal] = useState(null);
    const [checkedIds, setCheckedIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, title: "", message: "", type: "success" });

    const filteredData = useMemo(() =>
        requests.filter((row) =>
            Object.values(row).join(" ").toLowerCase().includes(searchText.toLowerCase())
        ), [searchText, requests]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const pageData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const allPageChecked = pageData.length > 0 && pageData.every(r => checkedIds.includes(r.requestId));

    const toggleAll = () => {
        if (allPageChecked) setCheckedIds(prev => prev.filter(id => !pageData.find(r => r.requestId === id)));
        else setCheckedIds(prev => [...new Set([...prev, ...pageData.map(r => r.requestId)])]);
    };

    const toggleOne = (id) =>
        setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const openAction = (action, ids) => setActionModal({ action, requestIds: ids });

    // Simulate Finacle FIAPI call per request
    const callFinacleAPI = async (request, remark) => {
        // TODO: replace with real API call
        // await api.post("/api/finacle/process", { requestId: request.requestId, remark })
        await new Promise(res => setTimeout(res, 300)); // simulate network
        // Mock: fail every 5th request for demo
        const fail = request.requestId.endsWith("5");
        return {
            requestId: request.requestId,
            accountNo: request.accountNo,
            txnType: request.txnType,
            refundAmt: request.refundAmt,
            finacleStatus: fail ? "FAILED" : "SUCCESS",
            finacleRefNo: fail ? null : `FIN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            errorMessage: fail ? "Finacle: Insufficient balance in GL account" : null,
        };
    };

    const handleConfirmAction = async (remark) => {
        const { action, requestIds } = actionModal;
        setActionModal(null);

        if (action === "Approve") {
            setSubmitting(true);
            try {
                const approvedRequests = requests.filter(r => requestIds.includes(r.requestId));
                const results = await Promise.all(approvedRequests.map(r => callFinacleAPI(r, remark)));

                // Update status based on Finacle response
                setRequests(prev => prev.map(r => {
                    if (!requestIds.includes(r.requestId)) return r;
                    const res = results.find(x => x.requestId === r.requestId);
                    return { ...r, status: res.finacleStatus === "SUCCESS" ? "Approved" : "Finacle Failed", checkerRemark: remark };
                }));
                setCheckedIds(prev => prev.filter(id => !requestIds.includes(id)));

                navigate("/finacle-txn-result", {
                    state: {
                        results,
                        submittedAt: new Date().toLocaleString("en-IN"),
                    }
                });
            } catch {
                setAlertConfig({ show: true, title: "Submission Failed", message: "Unable to process Finacle API call. Please try again.", type: "error" });
            } finally {
                setSubmitting(false);
            }
        } else {
            const newStatus = action === "Reject" ? "Rejected" : "Referred Back";
            setRequests(prev => prev.map(r =>
                requestIds.includes(r.requestId) ? { ...r, status: newStatus, checkerRemark: remark } : r
            ));
            setCheckedIds(prev => prev.filter(id => !requestIds.includes(id)));
            setAlertConfig({
                show: true,
                title: `${action} Successful`,
                message: `${requestIds.length} request(s) ${action === "Refer Back" ? "referred back" : "rejected"} successfully.`,
                type: action === "Reject" ? "error" : "warning",
            });
        }
    };

    return (
        <div className="container-fluid p-2">
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">Request Handling</li>
                    <li className="breadcrumb-item active">Approval Queue</li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            {/* Search + Bulk Actions */}
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "12px" }}>
                <div className="card-body pb-2">
                    <div className="row g-3 align-items-end">
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
                        {checkedIds.length > 0 && (
                            <div className="col d-flex align-items-center gap-2">
                                <span className="text-muted small">{checkedIds.length} selected</span>
                                <button className="btn btn-success btn-sm px-3" onClick={() => openAction("Approve", checkedIds)} disabled={submitting}>
                                    {submitting ? <><FaSpinner className="spin me-1" />Processing...</> : "Approve"}
                                </button>
                                <button className="btn btn-warning btn-sm px-3" onClick={() => openAction("Refer Back", checkedIds)} disabled={submitting}>Refer Back</button>
                                <button className="btn btn-danger btn-sm px-3" onClick={() => openAction("Reject", checkedIds)} disabled={submitting}>Reject</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="alert alert-warning py-2 mx-3 mb-2" style={{ fontSize: "13px" }}>
                    Displaying requests less than <strong>90 days</strong> old pending DCO Checker action.
                </div>

                <div className="table-responsive">
                    <table className="table modern-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th style={{ width: 36 }}>
                                    <input type="checkbox" style={{ border: "1px solid #bebebe" }} className="form-check-input" checked={allPageChecked} onChange={toggleAll} />
                                </th>
                                <th>Request ID</th>
                                <th>Raised Date</th>
                                <th>MID</th>
                                <th>Txn Date</th>
                                <th>Txn Amount</th>
                                <th>Refund Amount</th>
                                <th>Account No</th>
                                <th>RRN</th>
                                <th>Document</th>
                                <th>DCO Remark</th>
                                <th style={{ width: 90 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length > 0 ? pageData.map((row) => (
                                <tr key={row.requestId}>
                                    <td>
                                        <input type="checkbox" style={{ border: "1px solid #bebebe" }}
                                            className="form-check-input"
                                            checked={checkedIds.includes(row.requestId)}
                                            onChange={() => toggleOne(row.requestId)}
                                        />
                                    </td>
                                    <td>
                                        <span className="request-link" onClick={() => setViewRequest(row)}>
                                            {row.requestId}
                                        </span>
                                    </td>
                                    <td>{row.reqRaisedDate || "—"}</td>
                                    <td>{row.mid}</td>
                                    <td>{row.txnDate}</td>
                                    <td><span className="amount">₹ {row.tranAmount.toLocaleString()}</span></td>
                                    <td><span className="amount">₹ {row.refundAmt.toLocaleString()}</span></td>
                                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{row.accountNo}</td>
                                    <td>{row.rrn || "—"}</td>
                                    <td>
                                        {row.documentName
                                            ? <a href={`${process.env.REACT_APP_API_URL}/documents/${row.documentName}`} target="_blank" rel="noreferrer" className="text-primary" style={{ fontSize: "12px" }}>
                                                <FaFileAlt className="me-1" />{row.documentName}
                                            </a>
                                            : <span className="text-muted">—</span>}
                                    </td>
                                    <td style={{ fontSize: "12px", color: "#6c757d" }}>{row.dcoRemark || "—"}</td>
                                    <td>
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button title="Approve" className="btn btn-success btn-sm p-0" style={{ width: 26, height: 26, borderRadius: "6px" }} disabled={submitting} onClick={() => openAction("Approve", [row.requestId])}><FaCheck size={11} /></button>
                                            <button title="Refer Back" className="btn btn-warning btn-sm p-0" style={{ width: 26, height: 26, borderRadius: "6px" }} disabled={submitting} onClick={() => openAction("Refer Back", [row.requestId])}><FaUndo size={11} /></button>
                                            <button title="Reject" className="btn btn-danger btn-sm p-0" style={{ width: 26, height: 26, borderRadius: "6px" }} disabled={submitting} onClick={() => openAction("Reject", [row.requestId])}><FaTimes size={11} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="12" className="text-center py-5 text-muted">No records found.</td>
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

            {/* View Modal */}
            {viewRequest && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
                            <div className="modal-header py-2" style={{ borderBottom: "1px solid #e9ecef" }}>
                                <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>{viewRequest.requestId}</span>
                                <button className="btn-close" onClick={() => setViewRequest(null)} />
                            </div>
                            <div className="modal-body p-3">
                                <RequestFormFields mode="view" formData={viewRequest} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Remark Modal */}
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

export default DCOCheckerApprovalQueue;
