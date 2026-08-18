import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch, FaSpinner, FaFileAlt } from "react-icons/fa";
import AlertModal from "../../../components/AlertModel";
import api from "../../../api/axiosConfig";
import { sanitizeInput, validateFile, maskCardNumber, validateCardReference } from "../../../utils/sanitize";
import "../../../styles/main.css";
import { useAuth } from "../../../context/AuthContext";

const RaisedRequest = () => {
    const [txnType, setTxnType] = useState("UPI");
    const [searchData, setSearchData] = useState({
        custId: "",
        accountNo: "",
        rrn: "",
        mid: "",
        dateTxn: ""
    });
    const [searchErrors, setSearchErrors] = useState({});
    const [searching, setSearching] = useState(false);
    const [transactionFound, setTransactionFound] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [showSearchPanel, setShowSearchPanel] = useState(true);
    const [tidInput, setTidInput] = useState("");
    const [tidError, setTidError] = useState("");
    const [tidValid, setTidValid] = useState(false);
    const [validatingTid, setValidatingTid] = useState(false);

    const [refundData, setRefundData] = useState({ refundAmt: "", uDocument: null });
    const [refundErrors, setRefundErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [cardValidationError, setCardValidationError] = useState("");
    const { user } = useAuth();

    const [alertConfig, setAlertConfig] = useState({
        show: false,
        title: "",
        message: "",
        type: "success"
    });

    const tempData = {
        custId: "CUST001",
        accountNo: "123456789012",
        sol: "001",
        rrn: "987654321098",
        tranAmount: 1500.5,
        mid: "MID123",
        tid: "TID456",
        gateTxnId: "GATE789",
        merchantVPA: "merchant@upi",
        cardNumber: "4111 1111 1111 1111",
        authCode: "AUTH123",
        scheme: "VISA",
        dateTxn: "14-07-2026",
        entryUser: "Admin",
        uEmail: "user@example.com"
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: sanitizeInput(value) }));
    };

    const handleRefundChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "uDocument") {
            setRefundData(prev => ({ ...prev, uDocument: files?.[0] || null }));
        } else {
            setRefundData(prev => ({ ...prev, [name]: sanitizeInput(value) }));
        }
    };

    const today = new Date().toISOString().split("T")[0];

    const validateSearch = () => {
        const errors = {};
        if (!searchData.custId.trim()) errors.custId = "Customer ID is required";
        if (!searchData.accountNo.trim()) errors.accountNo = "Account Number is required";
        if (!searchData.rrn.trim()) errors.rrn = "RRN is required";
        if (!searchData.mid.trim()) errors.mid = "MID is required";
        if (!searchData.dateTxn) errors.dateTxn = "Transaction Date is required";
        if (searchData.dateTxn && new Date(searchData.dateTxn) > new Date(today)) {
            errors.dateTxn = "Future transaction date is not allowed";
        }
        setSearchErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!validateSearch()) return;

        setSearching(true);
        setTransactionFound(false);
        setTransactionDetails(null);
        setCardValidationError("");

        try {
            // const response = await api.post("/api/refund/searchTransaction", {
            //     txnType,
            //     ...searchData
            // });
            const searchedTransaction = {
                ...tempData,
                cardReference: `rrn-${searchData.rrn}|${searchData.dateTxn}|${tempData.tranAmount.toFixed(2)}`,
                maskedCardNumber: maskCardNumber(tempData.cardNumber)
            };
            setTransactionDetails(searchedTransaction);
            setTransactionFound(true);
            setShowSearchPanel(false);
            setAlertConfig({
                show: true,
                title: "Transaction Found",
                message: "Transaction details have been loaded successfully.",
                type: "success"
            });
        } catch (error) {
            setAlertConfig({
                show: true,
                title: "Search Failed",
                message: "Unable to find transaction. Please verify the inputs and try again.",
                type: "error"
            });
        } finally {
            setSearching(false);
        }
    };

    const maxRefundableAmount = transactionDetails?.tranAmount != null
        ? Number(transactionDetails.tranAmount)
        : 0;

    const remainingRefundableAmount = Math.max(
        maxRefundableAmount - (Number(refundData.refundAmt) || 0),
        0
    );

    const validateRefund = () => {
        const errors = {};
        if (!refundData.refundAmt.trim()) errors.refundAmt = "Refund Amount is required";
        if (refundData.refundAmt && Number(refundData.refundAmt) <= 0) {
            errors.refundAmt = "Refund Amount must be greater than zero";
        }
        if (refundData.refundAmt && Number(refundData.refundAmt) > maxRefundableAmount) {
            errors.refundAmt = `Refund Amount cannot exceed maximum refundable amount of ₹ ${maxRefundableAmount.toLocaleString()}`;
        }
        if (!refundData.uDocument) {
            errors.uDocument = "Reference document is required";
        } else {
            const fileError = validateFile(refundData.uDocument);
            if (fileError) errors.uDocument = fileError;
        }
        setRefundErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleTidFetch = async () => {
        setTidError("");
        if (!tidInput.trim()) {
            setTidError("TID is required to validate.");
            setTidValid(false);
            return;
        }

        setValidatingTid(true);
        try {
            const response = await api.post("/api/refund/validateTid", {
                txnType,
                rrn: searchData.rrn,
                mid: searchData.mid,
                dateTxn: searchData.dateTxn,
                tid: tidInput
            });

            if (response.data?.valid) {
                setTidValid(true);
                setTransactionDetails(prev => ({ ...prev, tid: tidInput }));
                setAlertConfig({
                    show: true,
                    title: "TID Validated",
                    message: "TID has been validated successfully.",
                    type: "success"
                });
            } else {
                setTidValid(false);
                setTidError(response.data?.message || "TID validation failed.");
            }
        } catch (error) {
            setTidValid(false);
            setTidError("Unable to validate TID. Please try again.");
        } finally {
            setValidatingTid(false);
        }
    };

    const handleEditSearch = () => {
        setShowSearchPanel(true);
        setTransactionFound(false);
        setTransactionDetails(null);
        setTidInput("");
        setTidValid(false);
        setTidError("");
    };

    const extractRequestId = (responseData) => {
        if (!responseData || typeof responseData !== "object") return null;

        const nestedData = responseData.data && typeof responseData.data === "object" ? responseData.data : null;
        const requestIdCandidates = [
            responseData.requestId,
            responseData.request_id,
            responseData.RequestId,
            responseData.requestid,
            responseData.id,
            nestedData?.requestId,
            nestedData?.request_id,
            nestedData?.RequestId,
            nestedData?.requestid,
            nestedData?.id,
        ];

        return requestIdCandidates.find((value) => value != null && String(value).trim() !== "") || null;
    };

    const handleRefundSubmit = async (e) => {
        e.preventDefault();
        if (!transactionFound || !transactionDetails) {
            setAlertConfig({
                show: true,
                title: "No Transaction Selected",
                message: "Please search and load a transaction before submitting the refund request.",
                type: "error"
            });
            return;
        }
        if (!validateRefund()) return;

        const isCardMatchValid = txnType === "CARD"
            ? validateCardReference(
                transactionDetails.cardReference,
                searchData.rrn,
                searchData.dateTxn,
                transactionDetails.tranAmount
            )
            : true;

        if (!isCardMatchValid) {
            setCardValidationError("Card reference does not match the transaction record. Please verify RRN, transaction date, and amount.");
            setAlertConfig({
                show: true,
                title: "Card Validation Failed",
                message: "Card reference does not match the transaction record.",
                type: "error"
            });
            return;
        }

        setCardValidationError("");
        setSubmitting(true);
        const formPayload = new FormData();
        formPayload.append("txnType", txnType);
        formPayload.append("custId", searchData.custId);
        formPayload.append("accountNo", searchData.accountNo);
        formPayload.append("rrn", searchData.rrn);
        formPayload.append("mid", searchData.mid);
        formPayload.append("dateTxn", searchData.dateTxn);
        formPayload.append("refundAmt", refundData.refundAmt);
        formPayload.append("tid", tidInput);
        formPayload.append("cardReference", transactionDetails.cardReference || "");
        formPayload.append("maskedCardNumber", transactionDetails.maskedCardNumber || "");
        if (refundData.uDocument) {
            formPayload.append("uDocument", refundData.uDocument);
        }

        try {
            const response = await api.post("/api/refund/submitRequest", formPayload);
            const requestId = extractRequestId(response?.data || {});
            const successMessage = requestId
                ? `Request submitted successfully. Request ID: ${requestId}`
                : response?.data?.message || "Request captured and sent for further processing.";

            setAlertConfig({
                show: true,
                title: "Request Submitted",
                message: successMessage,
                type: "success"
            });
        } catch (error) {
            const backendMessage = error?.response?.data?.message || error?.response?.data?.error || "Unable to submit refund request. Please try again.";
            setAlertConfig({
                show: true,
                title: "Submission Failed",
                message: backendMessage,
                type: "error"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const renderDetail = (label, value) => (
        <div className="col-md-4 mb-3" key={label}>
            <div className="border rounded-3 p-3 bg-white h-100">
                <div className="text-muted small mb-1">{label}</div>
                <div className="fw-semibold">{value || "-"}</div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-2 raised-request-body">
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb small">
                    <li className="breadcrumb-item">
                        Request Handling
                    </li>
                    <li className="breadcrumb-item active fw-semibold"
                        Raised Request>
                    </li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            {showSearchPanel && (
                <div className="card shadow border-0 mb-4 p-4">
                    <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-0">
                            <h6 className="fw-semibold fs-5">Search Transaction</h6>

                        </div>
                        <p className="text-muted small mb-0">
                            Search for transaction to raised Refund Request
                        </p>
                        <hr style={{ marginTop: "2px" }} />

                        {/* <div className="row g-3 mb-4">
                           
                        </div> */}

                        <form onSubmit={handleSearch}>
                            <div p-4>
                                <div className="col-md-3">
                                    <div className="row g-2 mb-3">
                                        <label className="form-label">Transaction Type *</label>
                                        <div className="d-flex gap-3">
                                            <div
                                                className={`card ${txnType === "UPI" ? "border-primary bg-primary-subtle" : ""}`}
                                                style={{ cursor: "pointer", width: "100px" }}
                                                onClick={() => setTxnType("UPI")} style={{
                                                    cursor: "pointer",

                                                }}
                                            >
                                                <div className="card-body py-2 text-center">
                                                    📱 UPI
                                                </div>
                                            </div>
                                            <div
                                                className={`card ${txnType === "CARD" ? "border-primary bg-primary-subtle" : ""}`}
                                                style={{ cursor: "pointer", width: "100px" }}
                                                onClick={() => setTxnType("CARD")}
                                            >
                                                <div className="card-body py-2 text-center">
                                                    💳 POS
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-3">
                                        <label className="form-label">Transaction Date *</label>
                                        <input
                                            type="date"
                                            name="dateTxn"
                                            value={searchData.dateTxn}
                                            max={today}
                                            className={`form-control form-control-custom ${searchErrors.dateTxn ? "is-invalid" : ""}`}
                                            onChange={handleSearchChange}
                                        />
                                        {searchErrors.dateTxn && <div className="invalid-feedback">{searchErrors.dateTxn}</div>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Customer ID *</label>
                                        <input
                                            type="text"
                                            name="custId"
                                            value={searchData.custId}
                                            className={`form-control form-control-custom ${searchErrors.custId ? "is-invalid" : ""}`}
                                            onChange={handleSearchChange}
                                        />
                                        {searchErrors.custId && <div className="invalid-feedback">{searchErrors.custId}</div>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Account Number *</label>
                                        <input
                                            type="text"
                                            name="accountNo"
                                            value={searchData.accountNo}
                                            className={`form-control form-control-custom ${searchErrors.accountNo ? "is-invalid" : ""}`}
                                            onChange={handleSearchChange}
                                        />
                                        {searchErrors.accountNo && <div className="invalid-feedback">{searchErrors.accountNo}</div>}
                                    </div>
                                </div>
                                <div className="row g-4 mt-2 align-items-end">
                                    <div className="col-md-3">
                                        <label className="form-label">RRN *</label>
                                        <input
                                            type="text"
                                            name="rrn"
                                            value={searchData.rrn}
                                            className={`form-control form-control-custom ${searchErrors.rrn ? "is-invalid" : ""}`}
                                            onChange={handleSearchChange}
                                        />
                                        {searchErrors.rrn && <div className="invalid-feedback">{searchErrors.rrn}</div>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">MID *</label>
                                        <input
                                            type="text"
                                            name="mid"
                                            value={searchData.mid}
                                            className={`form-control form-control-custom ${searchErrors.mid ? "is-invalid" : ""}`}
                                            onChange={handleSearchChange}
                                        />
                                        {searchErrors.mid && <div className="invalid-feedback">{searchErrors.mid}</div>}
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end justify-content-end">
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-75"
                                            disabled={searching}
                                        >
                                            {searching ? (
                                                <><FaSpinner className="spin me-2" />Searching</>
                                            ) : (
                                                <><FaSearch className="me-2" />Search</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {/* <div className="row g-3 mt-4 align-items-end">

                                    <div className="col-md-5 d-flex align-items-end justify-content-end">
                                        <button type="submit" className="btn btn-primary" disabled={searching}>
                                            {searching ? (
                                                <><FaSpinner className="spin me-2" />Searching</>
                                            ) : (
                                                <><FaSearch className="me-2" />Search</>
                                            )}
                                        </button>
                                    </div>
                                </div> */}
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {transactionFound && transactionDetails && (
                <div>
                    <div className="card shadow-sm border-0 mb-2">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div>
                                    <h6 className="mb-0 fw-semibold fs-5">Transaction Details</h6>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-primary fetch-btn"
                                    onClick={handleEditSearch}
                                    title="Edit search fields"
                                >
                                    <span className="ms-1">Edit Search</span>
                                </button>

                            </div>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label ">Customer ID</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control form-control-custom"
                                        value={transactionDetails.custId || searchData.custId || "-"}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Account Number</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control form-control-custom"
                                        value={transactionDetails.accountNo || searchData.accountNo || "-"}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">SOL</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control form-control-custom"
                                        value={transactionDetails.sol || "-"}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">RRN</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control form-control-custom"
                                        value={transactionDetails.rrn || searchData.rrn || "-"}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Transaction Amount</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control form-control-custom"
                                        value={transactionDetails.tranAmount ? `₹ ${transactionDetails.tranAmount.toLocaleString()}` : "-"}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">MID</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control form-control-custom"
                                        value={transactionDetails.mid || searchData.mid || "-"}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Transaction Date</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control form-control-custom"
                                        value={transactionDetails.dateTxn || searchData.dateTxn || "-"}
                                    />
                                </div>
                                {txnType === "UPI" && (
                                    <>
                                        <div className="col-md-3">
                                            <label className="form-label">Merchant VPA</label>
                                            <input
                                                type="text"
                                                readOnly
                                                className="form-control form-control-custom"
                                                value={transactionDetails.merchantVPA || "-"}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Gateway Transaction ID</label>
                                            <input
                                                type="text"
                                                readOnly
                                                className="form-control form-control-custom"
                                                value={transactionDetails.gateTxnId || "-"}
                                            />
                                        </div>
                                    </>
                                )}
                                {txnType === "CARD" && (
                                    <>
                                        <div className="col-md-3">
                                            <label className="form-label">Card Number</label>
                                            <input
                                                type="text"
                                                readOnly
                                                className="form-control form-control-custom"
                                                value={transactionDetails.maskedCardNumber || (transactionDetails.cardNumber ? maskCardNumber(transactionDetails.cardNumber) : "-")}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Auth Code</label>
                                            <input
                                                type="text"
                                                readOnly
                                                className="form-control form-control-custom"
                                                value={transactionDetails.authCode || "-"}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Scheme</label>
                                            <input
                                                type="text"
                                                readOnly
                                                className="form-control form-control-custom"
                                                value={transactionDetails.scheme || "-"}
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="col-md-3">
                                    <label className="form-label">Entry User Name</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control form-control-custom"
                                        value={user?.displayName || user?.username || "-"}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Entry User Email</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control form-control-custom"
                                        value={user?.email || "-"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card shadow-sm border-0 mb-2">
                        <div className="card-body p-4">
                            {/* <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="mb-0 fw-semibold">Refund Details</h6>
                    </div> */}
                            <form onSubmit={handleRefundSubmit}>
                                <div className="row g-3">
                                    <div className="alert alert-warning py-2 m-2" style={{ fontSize: "13px" }}>
                                        <strong>Refund amount cannot exceed transaction amount</strong>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">TID</label>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <input
                                                type="text"
                                                className={`form-control form-control-custom ${tidError ? "is-invalid" : tidValid ? "is-valid" : ""}`}
                                                value={tidInput}
                                                onChange={e => {
                                                    setTidInput(e.target.value);
                                                    setTidError("");
                                                    setTidValid(false);
                                                }}
                                                placeholder="Enter TID"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary fetch-btn"
                                                onClick={handleTidFetch}
                                                disabled={validatingTid || tidValid}
                                                title="Fetch TID"
                                            >
                                                {validatingTid ? <FaSpinner className="spin" /> : <FaSearch />}
                                                <span className="ms-1">Fetch</span>
                                            </button>
                                        </div>
                                        {tidError && <div className="invalid-feedback d-block">{tidError}</div>}
                                        {tidValid && !tidError && (
                                            <div className="valid-feedback d-block">TID validated successfully.</div>
                                        )}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Refund Amount (₹) *</label>
                                        <input
                                            type="number"
                                            name="refundAmt"
                                            value={refundData.refundAmt}
                                            className={`form-control form-control-custom ${refundErrors.refundAmt ? "is-invalid" : ""}`}
                                            onChange={handleRefundChange}
                                        />
                                        {refundErrors.refundAmt && <div className="invalid-feedback">{refundErrors.refundAmt}</div>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Maximum Refundable Amount</label>
                                        <input
                                            type="text"
                                            readOnly
                                            className="form-control form-control-custom"
                                            value={transactionDetails?.tranAmount ? `₹ ${Number(transactionDetails.tranAmount).toLocaleString()}` : "₹ 0"}
                                        />
                                        <div className="form-text">
                                            Remaining after this refund: ₹ {remainingRefundableAmount.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Reference Document</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><FaFileAlt /></span>
                                            <input
                                                type="file"
                                                name="uDocument"
                                                className={`form-control form-control-custom ${refundErrors.uDocument ? "is-invalid" : ""}`}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleRefundChange}
                                            />
                                        </div>
                                        {refundErrors.uDocument && <div className="invalid-feedback d-block">{refundErrors.uDocument}</div>}
                                    </div>
                                    {/* <div className="col-md-6">
                                <div className="alert alert-info p-3">
                                    <strong>Refund amount cannot exceed transaction amount</strong>
                                    <div className="small mt-1">Maximum Refundable Amount: {transactionDetails?.tranAmount ? `₹ ${transactionDetails.tranAmount.toLocaleString()}` : "-"}</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="alert alert-warning p-3">
                                    <strong>Note:</strong>
                                    <ul className="mb-0 small ps-3 pt-1">
                                        <li>Upload valid supporting document</li>
                                        <li>Allowed file types: PDF, JPG, PNG</li>
                                        <li>Maximum file size: 5MB</li>
                                    </ul>
                                </div>
                            </div> */}
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-3">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => {
                                        setRefundData({ refundAmt: "", uDocument: null });
                                        setRefundErrors({});
                                    }}>
                                        Reset
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? <><FaSpinner className="spin me-2" />Submitting</> : "Submit Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}



            <AlertModal
                show={alertConfig.show}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

export default RaisedRequest;
