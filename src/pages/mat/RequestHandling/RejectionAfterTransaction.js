import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch, FaSpinner } from "react-icons/fa";
import AlertModal from "../../../components/AlertModel";
import api from "../../../api/axiosConfig";
import { sanitizeInput, maskAccountNumber } from "../../../utils/sanitize";

const Lbl = ({ children }) => <label className="form-label mb-0">{children}</label>;
const Err = ({ msg }) => msg ? <div className="text-danger small">{msg}</div> : null;

const ViewField = ({ label, value, mono = false }) => (
    <div className="col-md-4 mb-3">
        <Lbl>{label}</Lbl>
        <input className="form-control" value={value || ""} readOnly
            style={{ fontFamily: mono ? "monospace" : "inherit", background: "#f8f9fa" }} />
    </div>
);

const INITIAL_TXN = null;

const RejectionAfterTransaction = () => {
    const [requestId, setRequestId] = useState("");
    const [reqError, setReqError] = useState("");
    const [fetching, setFetching] = useState(false);
    const [txn, setTxn] = useState(INITIAL_TXN);

    const [remarks, setRemarks] = useState("");
    const [remarkError, setRemarkError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, title: "", message: "", type: "success" });

    // ── DUMMY DATA (remove before production) ────────────────────────────────
    const DUMMY_REQUESTS = {
        "REQ0001": { requestId: "REQ0001", txnType: "UPI", status: "TXN_COMPLETED_ARN_PENDING", custId: "CUST1001", accountNo: "1234567890", sol: "1001", mid: "MID12345", tid: "TID001", dateTxn: "2026-06-01", rrn: "RRN001", gateTxnId: "GTX001", merchantVPA: "merchant@upi", tranAmount: 5000, refundAmt: 5000, uName: "Alice", uEmail: "alice@example.com" },
        "REQ0002": { requestId: "REQ0002", txnType: "CARD", status: "TXN_COMPLETED_ARN_PENDING", custId: "CUST1002", accountNo: "2345678901", sol: "1002", mid: "MID56789", tid: "TID002", dateTxn: "2026-06-02", rrn: "RRN002", cardNum: "XXXX-XXXX-XXXX-1234", authCode: "AUTH002", scheme: "VISA", tranAmount: 2500, refundAmt: 2500, uName: "Bob", uEmail: "bob@example.com" },
    };

    const fetchRequest = async () => {
        const id = sanitizeInput(requestId.trim());
        if (!id) { setReqError("Request ID is required."); return; }
        setFetching(true); setReqError(""); setTxn(null); setRemarks("");
        try {
            // ── DUMMY (remove before production) ──
            const dummy = DUMMY_REQUESTS[id.toUpperCase()];
            if (dummy) { setTxn(dummy); return; }
            // ── END DUMMY ──
            const res = await api.get(`/api/request/${id}`);
            if (!res.data) { setReqError("Request ID not found."); return; }
            if (res.data.status !== "TXN_COMPLETED_ARN_PENDING") {
                setReqError("This request is not eligible for rejection after transaction.");
                return;
            }
            setTxn(res.data);
        } catch { setReqError("Request ID not found."); }
        finally { setFetching(false); }
    };

    const handleSubmit = async () => {
        if (!remarks.trim()) { setRemarkError("Remarks are required."); return; }
        setRemarkError("");
        setSubmitting(true);
        try {
            await api.post("/api/rejection-after-txn/submit", { requestId: txn.requestId, remarks: remarks.trim() });
            setAlertConfig({ show: true, title: "Request Submitted", message: "Rejection after transaction request submitted successfully. Transaction will be reversed and failure mail sent to branch.", type: "success" });
            handleReset();
        } catch {
            setAlertConfig({ show: true, title: "Submission Failed", message: "Unable to submit request. Please try again.", type: "error" });
        } finally { setSubmitting(false); }
    };

    const handleReset = () => {
        setRequestId(""); setReqError(""); setTxn(null);
        setRemarks(""); setRemarkError("");
    };

    return (
        <div className="container-fluid p-2">
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">Request Handling</li>
                    <li className="breadcrumb-item active">Rejection After Transaction</li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            <div className="alert alert-info py-2 mb-3" style={{ fontSize: "13px" }}>
                <strong>Rejection After Transaction:</strong> Used to reject an already completed transaction where ARN has not been received. Upon approval, the transaction will be reversed and a failure mail will be sent to the branch.
            </div>

            <div className="card shadow-sm border-0 mb-3">
                <div className="card-body">
                    {/* Request ID Lookup */}
                    <div className="row align-items-end g-3 mb-2">
                        <div className="col-md-4">
                            <Lbl>Request ID <span className="text-danger">*</span></Lbl>
                            <div className="d-flex gap-2">
                                <input
                                    type="text"
                                    className={`form-control ${reqError ? "is-invalid" : txn ? "is-valid" : ""}`}
                                    placeholder="Enter Request ID"
                                    value={requestId}
                                    onChange={(e) => { setRequestId(e.target.value); setReqError(""); setTxn(null); }}
                                />
                                <button type="button" className="btn btn-outline-primary"
                                    onClick={fetchRequest} disabled={fetching || !!txn} title="Fetch Request">
                                    {fetching ? <FaSpinner className="spin" /> : txn ? <span className="text-success fw-bold">✓</span> : <FaSearch />}
                                </button>
                            </div>
                            <Err msg={reqError} />
                            {txn && <div className="text-success small">Transaction details loaded.</div>}
                        </div>
                    </div>

                    {/* Transaction Details — read only */}
                    {txn && (
                        <>
                            <div className="text-center mb-2">
                                <h6 className="mb-0 text-dark">
                                    {txn.txnType === "UPI" ? "📱 UPI Refund Request" : "💳 POS Refund Request"}
                                </h6>
                            </div>

                            <div style={{ border: "1px solid rgb(191 191 191)", padding: "10px", borderRadius: "10px" }}>
                                {/* Customer */}
                                <div className="row p-2 mb-2">
                                    <ViewField label="Customer ID" value={txn.custId} />
                                    <ViewField label="Account Number" value={maskAccountNumber(txn.accountNo)} mono />
                                    <ViewField label="SOL" value={txn.sol} />
                                </div>
                                <hr className="my-1" />

                                {/* Transaction */}
                                <div className="row p-2">
                                    <ViewField label="MID" value={txn.mid} mono />
                                    <ViewField label="TID" value={txn.tid} mono />
                                    <ViewField label="Date of Transaction" value={txn.dateTxn} />
                                    <ViewField label="RRN" value={txn.rrn} mono />

                                    {txn.txnType === "UPI" && <>
                                        <ViewField label="Gateway Transaction ID" value={txn.gateTxnId} mono />
                                        <ViewField label="Merchant VPA" value={txn.merchantVPA} />
                                    </>}
                                    {txn.txnType === "CARD" && <>
                                        <ViewField label="Card Number" value={txn.cardNum} mono />
                                        <ViewField label="Auth Code" value={txn.authCode} mono />
                                        <ViewField label="Scheme" value={txn.scheme} />
                                    </>}

                                    <ViewField label="Transaction Amount (₹)" value={txn.tranAmount ? Number(txn.tranAmount).toLocaleString("en-IN") : ""} />
                                    <ViewField label="Refund Amount (₹)" value={txn.refundAmt ? Number(txn.refundAmt).toLocaleString("en-IN") : ""} />
                                    <ViewField label="User Name" value={txn.uName} />
                                    <ViewField label="User Email" value={txn.uEmail} />
                                </div>
                                <hr className="my-1" />

                                {/* Remarks */}
                                <div className="row p-2">
                                    <div className="col-md-8">
                                        <Lbl>Remarks <span className="text-danger">*</span></Lbl>
                                        <textarea
                                            className={`form-control mt-1 ${remarkError ? "is-invalid" : ""}`}
                                            rows={2} maxLength={500}
                                            placeholder="Enter reason for rejection after transaction..."
                                            value={remarks}
                                            onChange={(e) => { setRemarks(e.target.value); setRemarkError(""); }}
                                        />
                                        <div className="d-flex justify-content-between">
                                            <Err msg={remarkError} />
                                            <span className="text-muted small">{remarks.length}/500</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-1" />
                                <div className="d-flex justify-content-end gap-2 p-2">
                                    <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? <><FaSpinner className="spin me-1" />Submitting...</> : "Submit Request"}
                                    </button>
                                    <button className="btn btn-outline-secondary" onClick={handleReset} disabled={submitting}>Reset</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <AlertModal
                show={alertConfig.show} title={alertConfig.title}
                message={alertConfig.message} type={alertConfig.type}
                onClose={() => setAlertConfig(p => ({ ...p, show: false }))}
            />
        </div>
    );
};

export default RejectionAfterTransaction;
