import React, { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch, FaSpinner } from "react-icons/fa";
import AlertModal from "../../components/AlertModel";
import api from "../../api/axiosConfig";
import { sanitizeInput, maskAccountNumber, validateFile } from "../../utils/sanitize";

const RaisedRequest = () => {
    const [txnType, setTxnType] = useState("UPI");
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [fetchingCust, setFetchingCust] = useState(false);
    const [fetchCustError, setFetchCustError] = useState("");
    const [fetchAccError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [custResults, setCustResults] = useState([]);
    const [fetchingMid, setFetchingMid] = useState(false);
    const [midStatus, setMidStatus] = useState("");
    const [fetchingRrn, setFetchingRrn] = useState(false);
    const [rrnStatus, setRrnStatus] = useState("");
    const [rrnError, setRrnError] = useState("");
    const [CustStatus, setCustStatus] = useState("");
    const [midError, setMidError] = useState("");
    const fileRef = useRef(null);


    const [alertConfig, setAlertConfig] = useState({
        show: false,
        title: "",
        message: "",
        type: "success"
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: sanitizeInput(value) }));

        if (name === "custId") {
            setCustStatus("");
            setFetchCustError("");
            setFetchingCust(false);
            setCustResults([]);
        }
        if (name === "mid") {
            setMidStatus("");
            setMidError("");
        }
        if (name === "rrn") {
            setRrnStatus("");
            setRrnError("");
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.custId?.trim())
            newErrors.custId = "Customer ID is required";
        if (CustStatus !== "Valid")
            newErrors.custId =
                "Please validate Customer ID";
        if (!formData.accountNo)
            newErrors.accountNo =
                "Account Number is required";
        if (!formData.mid?.trim())
            newErrors.mid =
                "MID is required";
        if (midStatus !== "valid")
            newErrors.mid =
                "Please validate MID";
        if (!formData.rrn?.trim())
            newErrors.rrn =
                "RRN is required";
        if (rrnStatus !== "valid")
            newErrors.rrn =
                "Please validate RRN";
        if (!formData.dateTxn)
            newErrors.dateTxn =
                "Transaction Date is required";
        if (
            formData.dateTxn &&
            new Date(formData.dateTxn) >
            new Date()
        ) {
            newErrors.dateTxn =
                "Future transaction date is not allowed";
        }
        if (
            Number(formData.refundAmt) <= 0
        ) {
            newErrors.refundAmt =
                "Refund Amount must be greater than zero";
        }
        if (!formData.refundAmt)
            newErrors.refundAmt =
                "Refund Amount is required";
        if (
            Number(formData.refundAmt) >
            Number(formData.tranAmount)
        ) {
            newErrors.refundAmt =
                "Refund Amount cannot exceed Transaction Amount";
        }

        const fileError = validateFile(fileRef.current?.files?.[0]);
        if (fileError) newErrors.uDocument = fileError;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!validate())
            return;
        try {
            await api.post(
                "/api/refund/submit",
                formData
            );
            setAlertConfig({
                show: true,
                title: "Request Submitted",
                message:
                    "<Request ID> captured and sent for further processing.",
                type: "success"
            });
        } catch {
            setAlertConfig({
                show: true,
                title: "Submission Failed",
                message:
                    "Unable to submit request.",
                type: "error"
            });
        }
    };
    // For fetching customer details 
    const fetchCustomerDetails = async () => {
        if (!formData.custId?.trim()) {
            setFetchCustError("Customer ID is required.");
            return;
        }
        setFetchingCust(true);
        setFetchCustError("");
        try {
            const response = await api.get(
                `/api/fetchCustDetails/${sanitizeInput(formData.custId.trim())}`
            );
            const data = response.data;
            if (!data || data.length === 0) {
                setFetchCustError("The entered Cust ID is not available in CBS, please re-check the entered value.");
                setCustResults([]);
                setCustStatus("Invalid");
            } else {
                setCustStatus("Valid");
                setCustResults(data);   // store all results
                setShowModal(true);     // open modal
            }
        } catch (e) {
            setFetchCustError("Error fetching customer details");
            setCustStatus("Invalid");
        } finally {
            setFetchingCust(false);
        }
    };

    // For MID validation, we can have a separate function that gets triggered when MID field loses focus (onBlur event) or when a "Validate" button next to the MID field is clicked. This function will call an API to validate the MID and update the UI based on the response.
    const validateMid = async () => {
        if (!formData.mid?.trim()) {
            setMidError("MID is required");
            return;
        }
        setFetchingMid(true);
        setMidError("");
        setMidStatus("");
        try {
            const response = await api.get(
                `/api/merchant/${sanitizeInput(formData.mid)}`
            );
            if (response.data) {
                setMidStatus("valid");
                setFormData(prev => ({
                    ...prev,
                    tid: response.data.tid
                }));
            } else {
                setMidStatus("invalid");
            }
        } catch (error) {
            setMidStatus("invalid");
            setMidError("MID not found");
        } finally {
            setFetchingMid(false);
        }
    };

    // To Rset all fields 
    const handleReset = () => {
        setFormData({});
        setErrors({});
        setFetchCustError("");
        setMidError("");
        setMidStatus("");
        setCustResults([]);
        setShowModal(false);
        setTxnType("UPI");
        setCustStatus("");
        setRrnStatus("");
        setRrnError("");
        if (fileRef.current) {
            fileRef.current.value = "";
        }
    };

    const validateRRN = async () => {

        if (!formData.rrn?.trim()) {
            setRrnError("RRN is required");
            return;
        }

        setFetchingRrn(true);
        setRrnError("");

        try {
            const response = await api.get(
                `/api/validateRrn/${sanitizeInput(formData.rrn)}`
            );
            if (response.data) {
                setRrnStatus("valid");


                if (
                    formData.mid &&
                    formData.rrn &&
                    formData.dateTxn
                ) {
                    fetchTransactionDetails();
                }
            } else {
                setRrnStatus("invalid");
                setRrnError("RRN not found");
            }
        } catch {
            setRrnStatus("invalid");
            setRrnError("Invalid RRN");
        } finally {
            setFetchingRrn(false);
        }
    };

    const fetchTransactionDetails = async () => {
        try {
            const response = await api.post(
                "/api/transaction/validate",
                {
                    mid: formData.mid,
                    rrn: formData.rrn,
                    dateTxn: formData.dateTxn,
                    txnType
                }
            );
            setFormData(prev => ({
                ...prev,
                ...response.data
            }));

        } catch {
            setAlertConfig({
                show: true,
                title: "Validation Failed",
                message:
                    "Transaction details not found.",
                type: "error"
            });
        }
    };
    return (
        <div className="container-fluid p-2">
            {/* <h6 className="text-primary mb-1">Request Handling >> Raised Request</h6> */}
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                        Request Handling
                    </li>
                    <li className="breadcrumb-item active">
                        Raised Request
                    </li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />
            <form onSubmit={handleSubmit}>
                {/* Customer Details */}
                <div className="card shadow-sm border-0 mb-2">
                    <div className="card-body">
                        <div className="row align-items-center">
                            <div className="col-md-2">
                                <label className="form-label mb-0">
                                    Transaction Type :
                                </label>
                            </div>
                            <div className="col-md-10">
                                <div className="d-flex gap-3">
                                    <div
                                        className={`card ${txnType === "UPI"
                                            ? "border-primary bg-primary-subtle"
                                            : ""
                                            }`}
                                        style={{
                                            cursor: "pointer",
                                            width: "100px"
                                        }}
                                        onClick={() => setTxnType("UPI")}
                                    >
                                        <div className="card-body py-2 text-center ">
                                            📱 UPI
                                        </div>
                                    </div>
                                    <div
                                        className={`card ${txnType === "CARD"
                                            ? "border-primary bg-primary-subtle"
                                            : ""
                                            }`}
                                        style={{
                                            cursor: "pointer",
                                            width: "100px"
                                        }}
                                        onClick={() => setTxnType("CARD")}
                                    >
                                        <div className="card-body py-2 text-center">
                                            💳 POS
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center mb-1 p-1" >
                            <h5 className="mb-0 text-dark">

                                {txnType === "UPI"
                                    ? "UPI Refund Request"
                                    : "POS Refund Request"}
                            </h5>
                        </div>
                        <div style={{ border: "1px solid rgb(191 191 191)", padding: "10px", borderRadius: "10px" }}>
                            <div className="card-body row p-2 mb-2">
                                {/* <div className="card-header bg-light fw-bold p-1">Customer Details</div> */}
                                <div className="col-md-4 ">
                                    <label className="form-label mb-0">Customer ID</label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            name="custId"
                                            value={formData.custId || ""}
                                            // className={`form-control ${errors.custId ? "is-invalid" : ""}`}
                                            className={`form-control ${errors.custId || CustStatus === "Invalid"
                                                ? "is-invalid"
                                                : ""
                                                }`}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary fetch-btn"
                                            onClick={fetchCustomerDetails}
                                            disabled={fetchingCust || CustStatus === "Valid"}
                                            title="Fetch Customer details"
                                        >
                                            {fetchingCust ? <FaSpinner className="spin" /> : <FaSearch />}
                                            <span className="ms-1">{fetchingCust ? "" : ""}</span>
                                        </button>
                                    </div>
                                    {errors.custId && (
                                        <div className="text-danger small">
                                            {errors.custId}
                                        </div>
                                    )}
                                    {fetchCustError && (
                                        <div className="text-danger small">{fetchCustError}</div>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label mb-0">Account Number</label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            name="accountNo"
                                            value={maskAccountNumber(formData.accountNo)}
                                            className={`form-control ${errors.accountNo ? "is-invalid" : ""
                                                }`}
                                            readOnly
                                        />
                                    </div>
                                    {errors.accountNo && (
                                        <div className="text-danger small">
                                            {errors.accountNo}
                                        </div>
                                    )}
                                    {fetchAccError && (
                                        <div className="text-danger small">{fetchAccError}</div>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label mb-0">Sol</label>
                                    <input
                                        type="text"
                                        name="sol"
                                        value={formData.sol || ""}
                                        className={`form-control ${errors.sol ? "is-invalid" : ""}`}
                                        onChange={handleChange} readOnly
                                    />
                                    {errors && (
                                        <div className="invalid-feedback">{errors.sol}</div>
                                    )}
                                </div>
                            </div>

                            {/* Transaction Details */}
                            {/* <div className="card-header bg-light fw-bold p-1">Refund Details</div> */}
                            <div className="card-body row p-2 ">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label mb-0">
                                        MID
                                    </label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            name="mid"
                                            value={formData.mid || ""}
                                            className={`form-control ${midStatus === "invalid"
                                                ? "is-invalid"
                                                : ""
                                                }`}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={validateMid}
                                            disabled={fetchingMid || midStatus === "valid"}
                                            title="Validate MID"
                                        >
                                            {
                                                fetchingMid ? (
                                                    <FaSpinner className="spin" />
                                                ) : midStatus === "valid" ? (
                                                    <span className="text-success fw-bold">
                                                        ✓
                                                    </span>
                                                ) : (
                                                    <FaSearch />
                                                )
                                            }
                                        </button>
                                    </div>
                                    {midError && (
                                        <div className="text-danger small">
                                            {midError}
                                        </div>
                                    )}
                                    {midStatus === "valid" && (
                                        <div className="text-success small">
                                            MID verified successfully
                                        </div>
                                    )}
                                    {errors.mid && (
                                        <div className="text-danger small">
                                            {errors.mid}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label mb-0">TID</label>
                                    <input
                                        type="text"
                                        name="tid"
                                        value={formData.tid || ""}
                                        className="form-control"
                                        readOnly
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label mb-0">Date of Transaction</label>
                                    <input
                                        type="date"
                                        name="dateTxn"
                                        value={formData.dateTxn || ""}
                                        className="form-control"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label mb-0">
                                        RRN
                                    </label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            name="rrn"
                                            value={formData.rrn || ""}
                                            className={`form-control ${rrnStatus === "invalid"
                                                ? "is-invalid"
                                                : ""
                                                }`}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={validateRRN}
                                            disabled={
                                                fetchingRrn ||
                                                rrnStatus === "valid"
                                            }
                                        >
                                            {
                                                fetchingRrn
                                                    ? <FaSpinner className="spin" />
                                                    : rrnStatus === "valid"
                                                        ? (
                                                            <span className="text-success fw-bold">
                                                                ✓
                                                            </span>
                                                        )
                                                        : <FaSearch />
                                            }
                                        </button>
                                    </div>
                                    {
                                        rrnError &&
                                        (
                                            <div className="text-danger small">
                                                {rrnError}
                                            </div>
                                        )
                                    }
                                    {
                                        rrnStatus === "valid" &&
                                        (
                                            <div className="text-success small">
                                                RRN verified successfully
                                            </div>
                                        )
                                    }
                                </div>
                                {txnType === "UPI" && (
                                    <>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label mb-0">Gateway Transaction ID </label>
                                            <input
                                                type="text"
                                                name="gateTxnId"
                                                value={formData.gateTxnId || ""}
                                                className="form-control"
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Merchant VPA</label>
                                            <input type="text" name="merchantVPA" className="form-control" onChange={handleChange} readOnly />
                                        </div>
                                    </>
                                )}
                                {txnType === "CARD" && (
                                    <>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label mb-0">Card Number </label>
                                            <input type="text" name="cardNum" className="form-control" onChange={handleChange} readOnly />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label mb-0">Auth Code</label>
                                            <input type="text" name="authCode" className="form-control" onChange={handleChange} readOnly />
                                        </div>
                                    </>
                                )}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label mb-0">Transaction Amount</label>
                                    <input
                                        type="number"
                                        name="tranAmount"
                                        value={formData.tranAmount || ""}
                                        className="form-control"
                                        readOnly
                                    />
                                    {errors.dateTxn && (
                                        <div className="text-danger small">
                                            {errors.dateTxn}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label className="form-label mb-0">Refund Amount</label>
                                    <input type="number" name="refundAmt" className="form-control" onChange={handleChange} />
                                    {errors.refundAmt && (
                                        <div className="text-danger small">
                                            {errors.refundAmt}
                                        </div>
                                    )}
                                </div>

                                {txnType === "CARD" && (
                                    <>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label mb-0">Scheme</label>
                                            <input type="text" name="scheme" className="form-control" onChange={handleChange} readOnly />
                                        </div>
                                    </>
                                )}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label mb-0">Upload Document</label>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png" name="uDocument" className="form-control" onChange={handleChange} />
                                    {errors.uDocument && (
                                        <div className="text-danger small">
                                            {errors.uDocument}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label className="form-label mb-0">User Name</label>
                                    <input
                                        type="text"
                                        name="uName"
                                        value={formData.uName || ""}
                                        className="form-control"
                                        readOnly
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label mb-0">User Email</label>
                                    <input
                                        type="text"
                                        name="uEmail"
                                        value={formData.uEmail || ""}
                                        className="form-control"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="submit" className="btn btn-primary">Submit</button>
                                <button type="reset" className="btn btn-secondary" onClick={handleReset}>Reset</button>
                                {/* <button type="button" className="btn btn-danger">Delete</button> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
            </form >
            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-md"> {/* smaller popup */}
                        <div className="modal-content">
                            <div className="modal-header">
                                <h6 className="modal-title">Select Customer Record</h6>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <table className="table table-bordered table-sm">
                                    <thead>
                                        <tr>
                                            <th>Cust ID</th>
                                            <th>Account No</th>
                                            <th>Sol</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {custResults.length > 0 ? (
                                            custResults.map((cust, index) => (
                                                <tr key={index}>
                                                    <td>{cust.custId}</td>
                                                    <td>{maskAccountNumber(cust.acctNo)}</td>
                                                    <td>{cust.sol}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => {
                                                                setFormData(f => ({
                                                                    ...f,
                                                                    custId: cust.custId,
                                                                    accountNo: cust.acctNo,
                                                                    sol: cust.sol
                                                                }));
                                                                setShowModal(false);
                                                            }}
                                                        >
                                                            Select
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="text-center text-danger fw-semibold py-3"
                                                >
                                                    The Entered Cust ID is not available in CBS
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <AlertModal
                show={alertConfig.show}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() =>
                    setAlertConfig(prev => ({
                        ...prev,
                        show: false
                    }))
                }
            />
        </div >
        // </div>
    );
};
export default RaisedRequest;
