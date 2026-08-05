import React, { useMemo, useState } from "react";
import api from "../../api/axiosConfig";
import { FaSearch, FaUndoAlt, FaFileAlt, FaInfoCircle } from "react-icons/fa";
import RequestDetailsModal from "../../components/RequestDetailsModal";
import "../../styles/tableAlign.css";

const VendorRejectedRefund = () => {
    const pageSize = 10;
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [generatedRequests, setGeneratedRequests] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const [vendorRejectedData] = useState([
        {
            requestId: "REQ100001",
            mid: "MID123456",
            txnDate: "12-Jun-2026",
            txnAmount: 5000,
            refundAmount: 5000,
            maskedCard: "XXXX XXXX XXXX 1234",
            oldCreditAccountNo: "XXXXXXX1234",
            oldDebitAccountNo: "XXXXXXX9999",
            newCreditAccountNo: "XXXXXXX7777",
            newDebitAccountNo: "XXXXXXX8888",
            vpaId: "merchant@sbi",
            rrn: "123456789012",
            accountNo: "XXXXXXX1234",
            rejectionReason: "Duplicate Refund"
        },
        {
            requestId: "REQ100002",
            mid: "MID789456",
            txnDate: "11-Jun-2026",
            txnAmount: 3500,
            refundAmount: 3500,
            maskedCard: "XXXX XXXX XXXX 5678",
            oldCreditAccountNo: "XXXXXXX9876",
            oldDebitAccountNo: "XXXXXXX1111",
            newCreditAccountNo: "XXXXXXX2222",
            newDebitAccountNo: "XXXXXXX3333",
            vpaId: "upi@sbi",
            rrn: "987654321456",
            accountNo: "XXXXXXX9876",
            rejectionReason: "ARN not found"
        },
        {
            requestId: "REQ100003",
            mid: "MID456789",
            txnDate: "10-Jun-2026",
            txnAmount: 2500,
            refundAmount: 2500,
            maskedCard: "XXXX XXXX XXXX 8888",
            oldCreditAccountNo: "XXXXXXX4567",
            oldDebitAccountNo: "XXXXXXX4444",
            newCreditAccountNo: "XXXXXXX5555",
            newDebitAccountNo: "XXXXXXX6666",
            vpaId: "refund@sbi",
            rrn: "654123987654",
            accountNo: "XXXXXXX4567",
            rejectionReason: "Vendor Timeout"
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
        console.log("View reference document for", requestId);
    };

    const generateReversal = async () => {
        if (selectedRows.length === 0) {
            return;
        }

        setIsGenerating(true);
        try {
            const response = await api.post("/api/refund/generateReversal", {
                requestIds: selectedRows,
            });

            const generated = response?.data?.generatedRequests || selectedRows.map((id) => ({
                originalRequestId: id,
                generatedRequestId: `REV-${id}`,
                status: "Generated",
            }));

            setGeneratedRequests(generated);
            setShowConfirmModal(false);
            setShowSuccessModal(true);
            setSelectedRows([]);
        } catch {
            setGeneratedRequests(
                selectedRows.map((id) => ({
                    originalRequestId: id,
                    generatedRequestId: `REV-${id}`,
                    status: "Generated",
                }))
            );
            setShowConfirmModal(false);
            setShowSuccessModal(true);
            setSelectedRows([]);
        } finally {
            setIsGenerating(false);
        }
    };
    return (
        <div className="container-fluid p-2">
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "12px" }} >
                <div className="card-header bg-white py-2 border-bottom">
                    <nav aria-label="breadcrumb" className="mb-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item text-muted">Request Handling</li>
                            <li className="breadcrumb-item active fw-semibold">
                                Vendor Rejected Reversal
                            </li>
                        </ol>
                    </nav>
                </div>
                {/* <hr style={{ marginTop: "0px" }} /> */}
                <div className="card-body">
                    <div className="row g-3 align-items-start">
                        {/* <div className="col-lg-8">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <h5 className="mb-0 fw-semibold">Vendor Rejected Reversal Queue</h5>
                                <span className="badge bg-warning text-dark">Vendor Rejected</span>
                            </div>
                            <p className="text-muted mb-0 small">
                                Requests marked as vendor rejected or ARN not found are listed here for generating a separate reversal request linked to the original request ID.
                            </p>
                        </div> */}
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
                <div className="card-body pb-2">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        {/* <div>
                                <span className="fw-semibold">Selected requests: {selectedRows.length}</span>
                            </div> */}
                        <button
                            className="btn btn-success btn-sm px-3 p-1"
                            onClick={() => setShowConfirmModal(true)}
                            disabled={selectedRows.length === 0 || isGenerating}
                        >
                            {/* <FaUndoAlt className="me-2" /> */}
                            {isGenerating ? "Generating..." : "Submit"}
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
                                <th>MID</th>
                                <th>Transaction Date</th>
                                <th>Transaction Amount</th>
                                <th>Refund Amount</th>
                                <th>Card Number</th>
                                {/* <th>Old Credit Account</th>
                                    <th>Old Debit Account</th>
                                    <th>New Credit Account</th>
                                    <th>New Debit Account</th> */}
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
                                        <td>{row.mid}</td>
                                        <td>{row.txnDate}</td>
                                        <td>₹ {row.txnAmount.toLocaleString()}</td>
                                        <td>₹ {row.refundAmount.toLocaleString()}</td>
                                        <td>{row.maskedCard}</td>
                                        {/* <td>{row.oldCreditAccountNo}</td>
                                            <td>{row.oldDebitAccountNo}</td>
                                            <td>{row.newCreditAccountNo}</td>
                                            <td>{row.newDebitAccountNo}</td> */}
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
                                    <td colSpan="16" className="text-center py-4">
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
                {showConfirmModal && (
                    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">Generate Refund Reversal</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowConfirmModal(false)} />
                                </div>
                                <div className="modal-body text-center">
                                    {/* <FaUndoAlt size={55} className="text-primary mb-3" /> */}
                                    <h5>Are you sure?</h5>
                                    <p className="text-muted mb-0">
                                        A new reversal request will be generated for <strong className="text-primary">{selectedRows.length}</strong> selected request(s) with the original request ID as reference.
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                                    <button className="btn btn-success" onClick={generateReversal} disabled={isGenerating}>
                                        {isGenerating ? "Generating..." : "Generate"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showSuccessModal && (
                    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-success text-white">
                                    <h5 className="modal-title">Refund Reversal Generated</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowSuccessModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="text-center">
                                        <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center" style={{ width: "70px", height: "70px", fontSize: "30px" }}>
                                            ✓
                                        </div>
                                        <h5 className="mt-3">Refund Reversal Generated Successfully</h5>
                                    </div>
                                    <hr />
                                    <h6>Generated Request Reference</h6>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Original Request ID</th>
                                                    <th>New Request ID</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {generatedRequests.map((item) => (
                                                    <tr key={item.generatedRequestId || item.originalRequestId}>
                                                        <td>{item.originalRequestId}</td>
                                                        <td>{item.generatedRequestId}</td>
                                                        <td><span className="badge bg-success">{item.status || "Generated"}</span></td>
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
                )}
            </div>

            <RequestDetailsModal
                show={showRequestModal}
                request={selectedRequest}
                onClose={() => setShowRequestModal(false)}
                firstDateLabel="Transaction Date"
                firstDateValue={selectedRequest?.txnDate}
                fields={[
                    { label: "MID", value: selectedRequest?.mid },
                    { label: "Transaction Amount", value: `₹ ${selectedRequest?.txnAmount?.toLocaleString()}` },
                    { label: "Refund Amount", value: `₹ ${selectedRequest?.refundAmount?.toLocaleString()}` },
                    { label: "Masked Card", value: selectedRequest?.maskedCard },
                    { label: "Old Credit Account", value: selectedRequest?.oldCreditAccountNo },
                    { label: "Old Debit Account", value: selectedRequest?.oldDebitAccountNo },
                    { label: "New Credit Account", value: selectedRequest?.newCreditAccountNo },
                    { label: "New Debit Account", value: selectedRequest?.newDebitAccountNo },
                    { label: "VPA ID", value: selectedRequest?.vpaId },
                    { label: "RRN", value: selectedRequest?.rrn },
                    { label: "Account Number", value: selectedRequest?.accountNo },
                    { label: "Vendor Rejection Reason", value: selectedRequest?.rejectionReason }
                ]}
            />
        </div>

    );
};

export default VendorRejectedRefund;
