import React from "react";
import { FaSearch, FaSpinner, FaFileAlt } from "react-icons/fa";
import { maskAccountNumber } from "../../utils/sanitize";

// ── Shared label style matching RaisedRequest ─────────────────────────────────
const Lbl = ({ children }) => (
    <label className="form-label mb-0">{children}</label>
);

const Err = ({ msg }) => msg ? <div className="text-danger small">{msg}</div> : null;
const Ok = ({ msg }) => msg ? <div className="text-success small">{msg}</div> : null;

const ValidateBtn = ({ loading, status, onClick }) => (
    <button type="button" className="btn btn-outline-primary"
        onClick={onClick} disabled={loading || status === "valid"} title="Validate">
        {loading ? <FaSpinner className="spin" />
            : status === "valid" ? <span className="text-success fw-bold">✓</span>
                : <FaSearch />}
    </button>
);

// ── View mode field ───────────────────────────────────────────────────────────
const ViewField = ({ label, value, mono = false }) => (
    <div className="col-md-4 mb-3">
        <Lbl>{label}</Lbl>
        <input
            className="form-control"
            value={value || ""}
            readOnly
            style={{ fontFamily: mono ? "monospace" : "inherit", background: "#f8f9fa" }}
        />
    </div>
);

const RequestFormFields = ({
    mode = "view", formData = {}, errors = {}, onChange,
    tidStatus = "", tidError = "", fetchingTid = false, onValidateTid,
    fileRef, onFileChange,
}) => {
    const ro = mode === "view";

    // ── VIEW MODE ─────────────────────────────────────────────────────────────
    if (ro) return (
        <div style={{ border: "1px solid rgb(191 191 191)", padding: "10px", borderRadius: "10px" }}>
            <div className="row p-2 mb-2">
                <ViewField label="Customer ID" value={formData.custId} />
                <ViewField label="Account Number" value={maskAccountNumber(formData.accountNo)} mono />
                <ViewField label="SOL" value={formData.sol} />
            </div>
            <hr className="my-1" />
            <div className="row p-2">
                <ViewField label="MID" value={formData.mid} mono />
                <ViewField label="TID" value={formData.tid} mono />
                <ViewField label="Date of Transaction" value={formData.dateTxn} />
                <ViewField label="RRN" value={formData.rrn} mono />
                {formData.txnType === "UPI" && <>
                    <ViewField label="Gateway Transaction ID" value={formData.gateTxnId} mono />
                    <ViewField label="Merchant VPA" value={formData.merchantVPA} />
                </>}
                {formData.txnType === "CARD" && <>
                    <ViewField label="Card Number" value={formData.cardNum} mono />
                    <ViewField label="Auth Code" value={formData.authCode} mono />
                    <ViewField label="Scheme" value={formData.scheme} />
                </>}
                <ViewField label="Transaction Amount" value={formData.tranAmount ? `₹ ${Number(formData.tranAmount).toLocaleString("en-IN")}` : ""} />
                <ViewField label="Refund Amount" value={formData.refundAmt ? `₹ ${Number(formData.refundAmt).toLocaleString("en-IN")}` : ""} />
                <div className="col-md-4 mb-3">
                    <Lbl>Document</Lbl>
                    <div className="form-control" style={{ background: "#f8f9fa", minHeight: "38px" }}>
                        {formData.documentName
                            ? <a href={formData.documentUrl || "#"} target="_blank" rel="noreferrer" className="d-flex align-items-center gap-1 text-primary" style={{ fontSize: "13px" }}>
                                <FaFileAlt size={12} /> {formData.documentName}
                            </a>
                            : <span className="text-muted">—</span>}
                    </div>
                </div>
            </div>
            <hr className="my-1" />
            <div className="row p-2">
                <ViewField label="User Name" value={formData.uName} />
                <ViewField label="User Email" value={formData.uEmail} />
            </div>
        </div>
    );

    // ── EDIT MODE — styled to match the Raise Request page's post-search
    // view exactly (same two-card layout). Only TID, Refund Amount and
    // Reference Document are editable; everything else was fixed when the
    // request was first raised and is shown read-only for context.
    const maxRefundableAmount = formData.tranAmount != null ? Number(formData.tranAmount) : 0;
    const remainingRefundableAmount = Math.max(
        maxRefundableAmount - (Number(formData.refundAmt) || 0),
        0
    );

    return (
        <>
            {/* Transaction Details — read only */}
            <div className="card shadow-sm border-0 mb-2">
                <div className="card-body p-4">
                    <h6 className="mb-3 fw-semibold fs-5">Transaction Details</h6>
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Customer ID</label>
                            <input type="text" readOnly className="form-control" value={formData.custId || "-"} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Account Number</label>
                            <input type="text" readOnly className="form-control" value={maskAccountNumber(formData.accountNo) || "-"} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">SOL</label>
                            <input type="text" readOnly className="form-control" value={formData.sol || "-"} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">RRN</label>
                            <input type="text" readOnly className="form-control" value={formData.rrn || "-"} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Transaction Amount</label>
                            <input type="text" readOnly className="form-control" value={formData.tranAmount ? `₹ ${Number(formData.tranAmount).toLocaleString("en-IN")}` : "-"} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">MID</label>
                            <input type="text" readOnly className="form-control" value={formData.mid || "-"} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Transaction Date</label>
                            <input type="text" readOnly className="form-control" value={formData.dateTxn || "-"} />
                        </div>
                        {formData.txnType === "UPI" && (
                            <>
                                <div className="col-md-3">
                                    <label className="form-label">Merchant VPA</label>
                                    <input type="text" readOnly className="form-control" value={formData.merchantVPA || "-"} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Gateway Transaction ID</label>
                                    <input type="text" readOnly className="form-control" value={formData.gateTxnId || "-"} />
                                </div>
                            </>
                        )}
                        {formData.txnType === "CARD" && (
                            <>
                                <div className="col-md-3">
                                    <label className="form-label">Card Number</label>
                                    <input type="text" readOnly className="form-control" value={formData.cardNum || "-"} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Auth Code</label>
                                    <input type="text" readOnly className="form-control" value={formData.authCode || "-"} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Scheme</label>
                                    <input type="text" readOnly className="form-control" value={formData.scheme || "-"} />
                                </div>
                            </>
                        )}
                        <div className="col-md-3">
                            <label className="form-label">Entry User Name</label>
                            <input type="text" readOnly className="form-control" value={formData.uName || "-"} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Entry User Email</label>
                            <input type="text" readOnly className="form-control" value={formData.uEmail || "-"} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Refund Details — the 3 editable fields */}
            <div className="card shadow-sm border-0 mb-2">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="alert alert-warning py-2 m-2" style={{ fontSize: "13px" }}>
                            <strong>Refund amount cannot exceed transaction amount</strong>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">TID</label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <input type="text" name="tid" value={formData.tid || ""}
                                    className={`form-control ${tidStatus === "invalid" || errors.tid ? "is-invalid" : ""}`}
                                    onChange={onChange} placeholder="Enter TID" />
                                <ValidateBtn loading={fetchingTid} status={tidStatus} onClick={onValidateTid} />
                            </div>
                            <Err msg={tidError || errors.tid} />
                            <Ok msg={tidStatus === "valid" ? "TID validated successfully." : ""} />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Refund Amount (₹) *</label>
                            <input type="number" name="refundAmt" value={formData.refundAmt || ""}
                                className={`form-control ${errors.refundAmt ? "is-invalid" : ""}`} onChange={onChange} />
                            <Err msg={errors.refundAmt} />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Maximum Refundable Amount</label>
                            <input type="text" readOnly className="form-control"
                                value={formData.tranAmount ? `₹ ${Number(formData.tranAmount).toLocaleString()}` : "₹ 0"} />
                            <div className="form-text">
                                Remaining after this refund: ₹ {remainingRefundableAmount.toLocaleString()}
                            </div>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Reference Document</label>
                            <div className="input-group">
                                <span className="input-group-text"><FaFileAlt /></span>
                                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                                    name="uDocument" className={`form-control ${errors.uDocument ? "is-invalid" : ""}`}
                                    onChange={onFileChange} />
                            </div>
                            {formData.documentName && <div className="text-success small mt-1"><FaFileAlt size={11} className="me-1" />Existing: {formData.documentName}</div>}
                            <Err msg={errors.uDocument} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RequestFormFields;