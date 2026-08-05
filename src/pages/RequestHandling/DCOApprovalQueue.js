import React, { useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaFileAlt, FaCheck, FaUndo, FaTimes, FaSearch } from "react-icons/fa";
import AlertModal from "../../components/AlertModel";
import RequestFormFields from "../../components/RequestFormFields";
import "../../styles/tableAlign.css";
import RequestDetailsModal from "../../components/RequestDetailsModal";

const SAMPLE_REQUESTS = [
    { requestId: "REQ0001", txnType: "UPI", rrn: "RRN001", reqRaisedDate: "02-Jun-2026 10:30:45", dateTxn: "2026-06-01", txnDate: "01-Jun-2026", tranAmount: 5000, refundAmt: 5000, custId: "CUST1001", accountNo: "1234567890", gateTxnId: "GTX001", documentName: "Doc1.pdf", mid: "MID12345", tid: "TID001", sol: "1001", merchantVPA: "merchant@upi", uName: "Alice", uEmail: "alice@example.com", status: "ERROR occured" },
    { requestId: "REQ0002", txnType: "CARD", rrn: "RRN002", reqRaisedDate: "02-Jun-2026 10:30:45", dateTxn: "2026-06-02", txnDate: "02-Jun-2026", tranAmount: 2500, refundAmt: 2500, custId: "CUST1002", accountNo: "2345678901", gateTxnId: null, documentName: null, mid: "MID56789", tid: "TID002", sol: "1002", cardNum: "XXXX-XXXX-XXXX-1234", authCode: "AUTH002", scheme: "VISA", uName: "Bob", uEmail: "bob@example.com", status: "" },
    { requestId: "REQ0003", txnType: "UPI", rrn: "RRN003", reqRaisedDate: "02-Jun-2026 10:30:45", dateTxn: "2026-06-03", txnDate: "03-Jun-2026", tranAmount: 7500, refundAmt: 7500, custId: "CUST1003", accountNo: "3456789012", gateTxnId: "GTX003", documentName: "Doc3.pdf", mid: "MID99999", tid: "TID003", sol: "1003", merchantVPA: "store@upi", uName: "Carol", uEmail: "carol@example.com", status: "" },
    { requestId: "REQ0004", txnType: "CARD", rrn: "RRN004", reqRaisedDate: "02-Jun-2026 10:30:45", dateTxn: "2026-06-04", txnDate: "04-Jun-2026", tranAmount: 1200, refundAmt: 1200, custId: "CUST1004", accountNo: "4567890123", gateTxnId: null, documentName: "Doc4.pdf", mid: "MID44444", tid: "TID004", sol: "1004", cardNum: "XXXX-XXXX-XXXX-5678", authCode: "AUTH004", scheme: "MASTERCARD", uName: "Dave", uEmail: "dave@example.com", status: "" },
    { requestId: "REQ0005", txnType: "UPI", rrn: "RRN005", reqRaisedDate: "02-Jun-2026 10:30:45", dateTxn: "2026-06-05", txnDate: "05-Jun-2026", tranAmount: 4500, refundAmt: 4500, custId: "CUST1005", accountNo: "5678901234", gateTxnId: "GTX005", documentName: null, mid: "MID55555", tid: "TID005", sol: "1005", merchantVPA: "shop@upi", uName: "Eve", uEmail: "eve@example.com", status: "Pending" },

];

const REJECT_REASONS = [
    "Amount mismatch in letter & details submitted",
    "Date mismatch in letter & details submitted",
    "MID mismatch in letter & details submitted",
    "RRN mismatch in letter & details submitted",
    "Other",
];

// ── Action Remark Modal ───────────────────────────────────────────────────────
const ActionRemarkModal = ({ action, requestIds, onConfirm, onClose }) => {
    const [selected, setSelected] = useState("");
    const [otherText, setOtherText] = useState("");
    const [freeText, setFreeText] = useState("");
    const [error, setError] = useState("");

    const isReject = action === "Reject";
    const needsRemark = action === "Reject" || action === "Refer Back" || action === "Approve";
    const actionColor = action === "Approve" ? "success" : action === "Reject" ? "danger" : "warning";

    const handleSubmit = () => {
        if (isReject) {
            if (!selected) { setError("Please select a rejection reason."); return; }
            if (selected === "Other" && !otherText.trim()) { setError("Please enter rejection details."); return; }
        } else if (action === "Refer Back" || action === "Approve") {
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

                        {/* Reject — dropdown with predefined reasons */}
                        {isReject && (
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
                                            rows={6}
                                            maxLength={300}
                                            placeholder="Enter rejection details (max 300 characters)..."
                                            value={otherText}
                                            onChange={(e) => { setOtherText(e.target.value); setError(""); }}
                                        />
                                        <div className="text-muted small text-end mt-1">{otherText.length}/300</div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Approve / Refer Back — plain textarea */}
                        {!isReject && (
                            <textarea
                                className={`form-control mt-1 ${error ? "is-invalid" : ""}`}
                                rows={6}
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
const DCOApprovalQueue = () => {
    const [requests, setRequests] = useState(SAMPLE_REQUESTS);
    const [search, setSearch] = useState("");
    const [searchError, setSearchError] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const pageSize = 10;
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [viewRequest, setViewRequest] = useState(null);
    const [actionModal, setActionModal] = useState(null);
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

    const filteredData = useMemo(() => {
        return SAMPLE_REQUESTS.filter((row) =>
            Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(searchText.toLowerCase())
        );
    }, [searchText, SAMPLE_REQUESTS]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const pageData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);


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
        setRequests(prev => prev.map(r =>
            requestIds.includes(r.requestId) ? { ...r, status: newStatus, dcoRemark: remark } : r
        ));
        setCheckedIds(prev => prev.filter(id => !requestIds.includes(id)));
        setActionModal(null);
        setAlertConfig({
            show: true,
            title: `${action} Successful`,
            message: `${requestIds.length} request(s) ${action === "Refer Back" ? "referred back" : action.toLowerCase() + "ed"} successfully.`,
            type: action === "Approve" ? "success" : action === "Reject" ? "error" : "warning",
        });
    };

    const handleDocumentDownload = (fileName) => {
        if (!fileName) return;

        const fileUrl = `${process.env.REACT_APP_API_URL}/documents/${fileName}`;

        window.open(fileUrl, "_blank");
    };

    const DetailItem = ({ label, value }) => (
        <div className="col-md-4">
            <div
                className="h-100 p- rounded"
                style={{
                    background: "#fafafa",
                    border: "1px solid #e8edf3"
                }}
            >
                <div
                    className="text-muted"
                    style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: ".5px"
                    }}
                >
                    {label}
                </div>

                <div
                    className="fw-semibold mt-1"
                    style={{
                        fontSize: "14px",
                        color: "#2c3e50",
                        wordBreak: "break-word"
                    }}
                >
                    {value || "—"}
                </div>
            </div>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="container-fluid p-2">
            {/* Search */}
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "12px" }} >
                <div className="card-header bg-white py-2 border-bottom">
                    <nav aria-label="breadcrumb" className="mb-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item text-muted">Request Handling</li>
                            <li className="breadcrumb-item active fw-semibold" aria-current="page">Approval Queue</li>
                        </ol>
                    </nav>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-lg-3">
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
                                    placeholder="Search by any field..."
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    style={{ paddingLeft: "38px" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="alert alert-warning py-2 m-2 mb-2" style={{ fontSize: "13px" }}>
                    Displaying requests are less than  <strong> 90 days</strong> old pending DCO User action.
                </div>

                {checkedIds.length > 0 && (
                    <div>
                        {checkedIds.length > 0 && (
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="text-muted small">{checkedIds.length} selected</span>
                                <button className="btn btn-success btn-sm px-3" onClick={() => openAction("Approve", checkedIds)}> Approve</button>
                                <button className="btn btn-warning btn-sm px-3" onClick={() => openAction("Refer Back", checkedIds)}>Refer Back </button>
                                <button className="btn btn-danger btn-sm px-3" onClick={() => openAction("Reject", checkedIds)} > Reject </button>
                            </div>
                        )}
                    </div>
                )}
                {/* </div> */}

                <div className="table-responsive">
                    <table className="table modern-table align-middle mb-0">

                        <thead>
                            <tr>
                                <th style={{ width: "50px" }}>
                                    <input
                                        type="checkbox" style={{ border: "1px solid #bebebe" }}
                                        className="form-check-input"
                                        checked={allPageChecked}
                                        onChange={toggleAll}
                                    />
                                </th>

                                <th>Request ID</th>
                                <th>Raised Date</th>
                                <th>MID</th>
                                <th>Txn Date</th>
                                <th>Txn Amount</th>
                                <th>Refund Amount</th>
                                <th>Account Number</th>
                                <th>VPA ID</th>
                                <th>Card Number</th>
                                <th>RRN</th>
                                <th>Document</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length > 0 ? (
                                pageData.map((row) => (
                                    <tr key={row.requestId}>
                                        <td>
                                            <input
                                                type="checkbox" style={{ border: "1px solid #bebebe" }}
                                                className="form-check-input"
                                                checked={checkedIds.includes(row.requestId)}
                                                onChange={() => toggleOne(row.requestId)}
                                            />
                                        </td>
                                        <td>
                                            <span
                                                className="request-link"
                                                onClick={() => setViewRequest(row)}
                                            >
                                                {row.requestId}
                                            </span>
                                        </td>
                                        <td>{row.reqRaisedDate}</td>
                                        <td>{row.mid}</td>
                                        <td>{row.txnDate}</td>
                                        <td>
                                            <span className="amount">
                                                ₹ {row.tranAmount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="amount">
                                                ₹ {row.refundAmt.toLocaleString()}
                                            </span>
                                        </td>
                                        <td>{row.accountNo}</td>
                                        <td>{row.vpaId || "—"}</td>
                                        <td>{row.maskedCard || "—"}</td>
                                        <td>{row.rrn || "—"}</td>
                                        <td>
                                            {row.documentName ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-link btn-sm p-0 document-link"
                                                    onClick={() => handleDocumentDownload(row.documentName)}
                                                >
                                                    <FaFileAlt className="me-1" />
                                                    View
                                                </button>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </td>
                                        <td className="text-danger">{row.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={11} className="text-center py-5 text-muted">No records found. </td>

                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="card-footer bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        {/* Bulk action bar */}
                        <div className="text-muted small">
                            Showing{" "}
                            <strong>
                                {filteredData.length === 0
                                    ? 0
                                    : (currentPage - 1) * pageSize + 1}
                            </strong>
                            -
                            <strong>
                                {Math.min(currentPage * pageSize, filteredData.length)}
                            </strong>

                            {" "}of{" "}
                            <strong>{filteredData.length}</strong>
                            {" "}requests
                        </div>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(p => p - 1)}
                                    >
                                        Previous
                                    </button>
                                </li>

                                {[...Array(totalPages)].map((_, i) => (
                                    <li
                                        key={i}
                                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`} >
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}

                                <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(p => p + 1)} >
                                        Next
                                    </button>
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

export default DCOApprovalQueue;
