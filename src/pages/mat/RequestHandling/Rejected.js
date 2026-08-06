import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/tableAlign.css";
import { FaSearch, FaFileAlt } from "react-icons/fa";
import RequestFormFields from "../../../components/RequestFormFields";
import RequestDetailsModal from "../../../components/RequestDetailsModal";

const SAMPLE_REJECTED = [
    {
        requestId: "REQ000001",
        txnType: "UPI",
        rrn: "123456789012",
        txnDate: "12-Jun-2026",
        txnAmount: 5000,
        refundAmount: 5000,
        custId: "C100001",
        accountNo: "1234567890123456",
        sol: "1001",
        mid: "MID12345",
        tid: "TID001",
        dateTxn: "2026-06-12",
        tranAmount: 5000,
        refundAmt: 5000,
        gateTxnId: "GTX987654",
        merchantVPA: "merchant@upi",
        documentName: "Refund_Doc.pdf",
        documentUrl: "#",
        uName: "John Doe",
        uEmail: "john@example.com",
        rejectionReason: "Duplicate Refund Request",
    },
    {
        requestId: "REQ000002",
        txnType: "CARD",
        rrn: "654321987654",
        txnDate: "11-Jun-2026",
        txnAmount: 3200,
        refundAmount: 3200,
        custId: "C100002",
        accountNo: "9876543210987654",
        sol: "1002",
        mid: "MID56789",
        tid: "TID002",
        dateTxn: "2026-06-11",
        tranAmount: 3200,
        refundAmt: 3200,
        cardNum: "XXXX-XXXX-XXXX-1234",
        authCode: "AUTH002",
        scheme: "VISA",
        documentName: "ChargeSlip.pdf",
        documentUrl: "#",
        uName: "Jane Smith",
        uEmail: "jane@example.com",
        rejectionReason: "Transaction not found",
    },
];

const PAGE_SIZE = 10;

const Rejected = () => {
    const [rejectedRequests] = useState(SAMPLE_REJECTED);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const filteredData = rejectedRequests.filter((row) => {
        if (!search.trim()) return true;
        return Object.values(row).join(" ").toLowerCase().includes(search.trim().toLowerCase());
    });

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const indexOfFirst = (currentPage - 1) * PAGE_SIZE;
    const pageData = filteredData.slice(indexOfFirst, indexOfFirst + PAGE_SIZE);

    const openViewModal = (row) => {
        setSelectedRequest(row);
        setShowDetails(true);
    };

    return (
        <div className="container-fluid p-2">
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-2 border-bottom">
                    <nav aria-label="breadcrumb" className="mb-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item text-muted">Request Handling</li>
                            <li className="breadcrumb-item active fw-semibold" aria-current="page">Rejected Requests</li>
                        </ol>
                    </nav>
                </div>
                <div className="card-body pb-2">
                    <div className="row g-3">
                        <div className="col-lg-3">
                            <label className="form-label">Search</label>
                            <div className="position-relative">
                                <FaSearch
                                    className="position-absolute"
                                    style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: "14px" }}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by any field..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                    style={{ paddingLeft: "38px" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="alert alert-warning py-2 mx-3 mb-0"
                    style={{ fontSize: "13px" }}
                >
                    <strong>Note:</strong> The following requests have been <strong>rejected</strong> within the last <strong>90 days</strong>.
                </div>

                {filteredData.length === 0 && (
                    <div className="alert alert-info mx-3 mt-2 py-2" style={{ fontSize: "13px" }}>No rejected requests found.</div>
                )}

                <div className="table-responsive">
                    <table className="table modern-table align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Request ID</th>
                                <th>RRN</th>
                                <th>Date of Txn</th>
                                <th>Txn Amount</th>
                                <th>Refund Amount</th>
                                <th>Cust ID</th>
                                <th>Account No</th>
                                <th>Gateway Txn ID</th>
                                <th>Reference Document</th>
                                <th>Rejection Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.map((row) => (
                                <tr key={row.requestId}>
                                    <td>
                                        <span
                                            className="fw-semibold text-primary"
                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                            onClick={() => openViewModal(row)}
                                        >
                                            {row.requestId}
                                        </span>
                                    </td>
                                    <td>{row.rrn}</td>
                                    <td>{row.txnDate}</td>
                                    <td>₹ {row.txnAmount.toLocaleString("en-IN")}</td>
                                    <td>₹ {row.refundAmount.toLocaleString("en-IN")}</td>
                                    <td>{row.custId}</td>
                                    <td>{row.accountNo}</td>
                                    <td>{row.gateTxnId || <span className="text-muted">—</span>}</td>
                                    <td>
                                        {row.documentName
                                            ? <a href={row.documentUrl || "#"} target="_blank" rel="noreferrer" className="text-primary d-flex align-items-center gap-1" style={{ textDecoration: "underline", fontSize: "13px" }}>
                                                <FaFileAlt size={12} />{row.documentName}
                                              </a>
                                            : <span className="text-muted">—</span>}
                                    </td>
                                    <td>
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>
                                            {row.rejectionReason}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card-footer bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Showing {filteredData.length === 0 ? 0 : indexOfFirst + 1}
                            {" – "}
                            {Math.min(indexOfFirst + PAGE_SIZE, filteredData.length)} of {filteredData.length} records
                        </small>
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
                    </div>
                </div>
            </div>

            <RequestDetailsModal
                show={showDetails}
                request={selectedRequest}
                onClose={() => { setShowDetails(false); setSelectedRequest(null); }}
                title="Rejected Request Details"
                firstDateLabel="Date of Transaction"
                firstDateValue={selectedRequest?.txnDate}
                fields={[
                    { label: "RRN", value: selectedRequest?.rrn },
                    { label: "Customer ID", value: selectedRequest?.custId },
                    { label: "Account No", value: selectedRequest?.accountNo },
                    { label: "MID", value: selectedRequest?.mid },
                    { label: "Txn Amount", value: selectedRequest ? `₹ ${selectedRequest.txnAmount?.toLocaleString("en-IN")}` : "" },
                    { label: "Refund Amount", value: selectedRequest ? `₹ ${selectedRequest.refundAmount?.toLocaleString("en-IN")}` : "" },
                    { label: "Gateway Txn ID", value: selectedRequest?.gateTxnId },
                    { label: "Rejection Reason", value: selectedRequest?.rejectionReason },
                ]}
            />
        </div>
    );
};

export default Rejected;
