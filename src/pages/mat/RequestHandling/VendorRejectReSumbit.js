import React, { useMemo, useState } from "react";
import api from "../../../api/axiosConfig";
import { FaSearch, FaRedoAlt, FaFileAlt, FaInfoCircle } from "react-icons/fa";
import "../../../styles/tableAlign.css";
import RequestDetailsModal from "../../../components/RequestDetailsModal";

const VendorRejectReSumbit = () => {
    const pageSize = 10;
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [generatedRequests, setGeneratedRequests] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [vendorRejectedData] = useState([
        {
            requestId: "REQ200001",
            rejectedDate: "12-Jun-2026 10:30:45",
            mid: "MID123456",
            txnDate: "12-Jun-2026",
            txnAmount: 5000,
            refundAmount: 5000,
            maskedCard: "XXXX XXXX XXXX 1234",
            vpaId: "merchant@sbi",
            rrn: "123456789012",
            accountNo: "XXXXXXX1234",
            rejectionReason: "Out of time frame for processing refund"
        },
        {
            requestId: "REQ200002",
            rejectedDate: "12-Jun-2026 10:30:45",
            mid: "MID789456",
            txnDate: "11-Jun-2026",
            txnAmount: 3500,
            refundAmount: 3500,
            maskedCard: "XXXX XXXX XXXX 5678",
            vpaId: "upi@sbi",
            rrn: "987654321456",
            accountNo: "XXXXXXX9876",
            rejectionReason: "Any other technical reason"
        },
        {
            requestId: "REQ200003",
            rejectedDate: "12-Jun-2026 10:30:45",
            mid: "MID456789",
            txnDate: "10-Jun-2026",
            txnAmount: 2500,
            refundAmount: 2500,
            maskedCard: "XXXX XXXX XXXX 8888",
            vpaId: "refund@sbi",
            rrn: "654123987654",
            accountNo: "XXXXXXX4567",
            rejectionReason: "Out of time frame for processing refund"
        }
    ]);

    const filteredData = useMemo(() => {
        return vendorRejectedData.filter((row) =>
            Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(searchText.toLowerCase())
        );
    }, [searchText, vendorRejectedData]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const pageData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleRow = (requestId) => {
        setSelectedRows((prev) =>
            prev.includes(requestId)
                ? prev.filter((id) => id !== requestId)
                : [...prev, requestId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === pageData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(pageData.map((row) => row.requestId));
        }
    };

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    const openRequest = (request) => {
        setSelectedRequest(request);
        setShowRequestModal(true);
    };

    const openDocument = (requestId) => {
        void requestId; // wire authenticated document download API later
    };

    const submitReResubmit = async () => {
        if (selectedRows.length === 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post("/api/refund/resubmit", {
                requestIds: selectedRows,
            });

            const generated = response?.data?.generatedRequests || selectedRows.map((id) => ({
                originalRequestId: id,
                generatedRequestId: `RS-${id}`,
                status: "Submitted",
            }));

            setGeneratedRequests(generated);
            setShowConfirmModal(false);
            setShowSuccessModal(true);
            setSelectedRows([]);
        } catch {
            setGeneratedRequests(
                selectedRows.map((id) => ({
                    originalRequestId: id,
                    generatedRequestId: `RS-${id}`,
                    status: "Submitted",
                }))
            );
            setShowConfirmModal(false);
            setShowSuccessModal(true);
            setSelectedRows([]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const DetailItem = ({ label, value }) => (
        <div className="col-lg-4 col-md-6">
            <div
                className="border rounded h-100 p-2"
                style={{
                    background: "#fafafa",
                    borderColor: "#e9ecef"
                }}
            >
                <div
                    className="text-muted mb-1"
                    style={{
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: ".4px"
                    }}
                >
                    {label}
                </div>

                <div
                    className="fw-semibold"
                    style={{
                        fontSize: "14px",
                        wordBreak: "break-word"
                    }}
                >
                    {value || "—"}
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-2">
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "12px" }} >
                <div className="card-header bg-white py-2 border-bottom">
                    <nav aria-label="breadcrumb" className="mb-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item text-muted">Request Handling</li>
                            <li className="breadcrumb-item active fw-semibold">Vendor Rejected Re-submit</li>
                        </ol>
                    </nav>
                </div>
                <div className="card-body">
                    <div className="row g-3 align-items-start">
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
                <div className="alert alert-warning py-2 m-2 mb-0" style={{ fontSize: "13px" }}>
                    Displays requests that were rejected by the vendor and subsequently resubmitted for processing.
                </div>
                <div className="card-body pb-2">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
                        {/* <div>
                                <span className="fw-semibold">Selected requests: {selectedRows.length}</span>
                            </div> */}
                        <button
                            className="btn btn-success btn-sm px-3 p-1"
                            onClick={() => setShowConfirmModal(true)}
                            disabled={selectedRows.length === 0 || isSubmitting}
                        >
                            {/* <FaRedoAlt className="me-2" /> */}
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table modern-table align-middle mb-0">

                        <thead>
                            <tr>
                                <th width="45">
                                    <input
                                        type="checkbox" style={{ border: "1px solid #bebebe" }}
                                        className="form-check-input"
                                        checked={pageData.length > 0 && selectedRows.length === pageData.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>Request ID</th>
                                <th>Request Raised Date</th>
                                <th>MID</th>
                                {/* <th>Transaction Date</th> */}
                                <th>Transaction Amount</th>
                                <th>Refund Amount</th>
                                <th>Card Number</th>
                                <th>VPA ID</th>
                                <th>RRN</th>
                                <th>Account Number</th>
                                <th>Vendor Rejection Reason</th>
                                <th width="120">Reference Document</th>
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
                                                checked={selectedRows.includes(row.requestId)}
                                                onChange={() => toggleRow(row.requestId)}
                                            />
                                        </td>
                                        <td>
                                            <span
                                                className="text-primary fw-semibold"
                                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                                onClick={() => openRequest(row)}
                                            >
                                                {row.requestId}
                                            </span>
                                        </td>
                                        <td>{row.rejectedDate}</td>
                                        <td>{row.mid}</td>
                                        {/* <td>{row.txnDate}</td> */}
                                        <td>₹ {row.txnAmount.toLocaleString()}</td>
                                        <td>₹ {row.refundAmount.toLocaleString()}</td>
                                        <td>{row.maskedCard}</td>
                                        <td>{row.vpaId}</td>
                                        <td>{row.rrn}</td>
                                        <td>{row.accountNo}</td>
                                        <td className="text-danger fw-semibold">{row.rejectionReason}</td>
                                        <td>
                                            <a
                                                href="/"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    openDocument(row.requestId);
                                                }}
                                            >
                                                <FaFileAlt className="me-1" /> View
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="text-center py-4">
                                        No Vendor Rejected Requests Found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card-footer bg-white">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <small className="text-muted">
                            {filteredData.length === 0
                                ? "Showing 0 of 0 Records"
                                : `Showing ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length} Records`}
                        </small>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                    Previous
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, index) => (
                                <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                    Next
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {
                showConfirmModal && (
                    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header text-white" style={{ backgroundColor: "#001b33" }} >
                                    <h5 className="modal-title">Submit</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowConfirmModal(false)} />
                                </div>
                                <div className="modal-body text-center">
                                    {/* <FaRedoAlt size={55} className="text-primary mb-3" /> */}
                                    <h5>Are you sure?</h5>
                                    <p className="text-muted mb-0">
                                        The selected request(s) will be submitted for re-submission processing.
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                                    <button className="btn btn-success" onClick={submitReResubmit} disabled={isSubmitting}>
                                        {isSubmitting ? "Submitting..." : "Submit"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showSuccessModal && (
                    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-success text-white">
                                    <h5 className="modal-title">Re-submit Submitted</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowSuccessModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="text-center">
                                        <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center" style={{ width: "70px", height: "70px", fontSize: "30px" }}>
                                            ✓
                                        </div>
                                        <h5 className="mt-3">Selected requests were submitted successfully</h5>
                                    </div>
                                    <hr />
                                    <h6>Submission Reference</h6>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Original Request ID</th>
                                                    <th>New Reference</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {generatedRequests.map((item) => (
                                                    <tr key={item.generatedRequestId || item.originalRequestId}>
                                                        <td>{item.originalRequestId}</td>
                                                        <td>{item.generatedRequestId}</td>
                                                        <td><span className="badge bg-success">{item.status || "Submitted"}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-primary" onClick={() => setShowSuccessModal(false)}>OK</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <RequestDetailsModal
                show={showRequestModal}
                request={selectedRequest}
                onClose={() => setShowRequestModal(false)}
                title="Request Details"
                firstDateLabel="Request Raised Date"
                firstDateValue={selectedRequest?.rejectedDate}
                fields={[
                    { label: "MID", value: selectedRequest?.mid },
                    { label: "Transaction Date", value: selectedRequest?.txnDate },
                    { label: "Transaction Amount", value: selectedRequest?.txnAmount ? `₹ ${selectedRequest.txnAmount.toLocaleString()}` : "—" },
                    { label: "Refund Amount", value: selectedRequest?.refundAmount ? `₹ ${selectedRequest.refundAmount.toLocaleString()}` : "—" },
                    { label: "Masked Card Number", value: selectedRequest?.maskedCard },
                    { label: "VPA ID", value: selectedRequest?.vpaId },
                    { label: "RRN", value: selectedRequest?.rrn },
                    { label: "Account Number", value: selectedRequest?.accountNo },
                    { label: "Vendor Rejection Reason", value: selectedRequest?.rejectionReason }
                ]}
            />
        </div >
    );
};

export default VendorRejectReSumbit;
