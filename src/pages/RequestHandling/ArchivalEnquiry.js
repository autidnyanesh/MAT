import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/tableAlign.css";
import { FaSearch, FaFileAlt } from "react-icons/fa";
import RequestDetailsModal from "../../components/RequestDetailsModal";

const SAMPLE_ARCHIVAL = [
    {
        requestId: "REQ0001",
        txnType: "UPI",
        rrn: "123456789012",
        txnDate: "10-Mar-2026",
        txnAmount: 1500,
        refundAmount: 1500,
        custId: "CUST1001",
        accountNo: "1234567890123456",
        mid: "MID12345",
        gateTxnId: "GTX001",
        documentName: "Refund_Doc.pdf",
        documentUrl: "#",
    },
    {
        requestId: "REQ0002",
        txnType: "CARD",
        rrn: "223456789012",
        txnDate: "09-Mar-2026",
        txnAmount: 2500,
        refundAmount: 2500,
        custId: "CUST1002",
        accountNo: "9876543210987654",
        mid: "MID56789",
        gateTxnId: "GTX002",
        documentName: "ChargeSlip.pdf",
        documentUrl: "#",
    },
    {
        requestId: "REQ0003",
        txnType: "UPI",
        rrn: "323456789012",
        txnDate: "08-Mar-2026",
        txnAmount: 5000,
        refundAmount: 5000,
        custId: "CUST1003",
        accountNo: "1122334455667788",
        mid: "MID99999",
        gateTxnId: "GTX003",
        documentName: null,
        documentUrl: null,
    },
    {
        requestId: "REQ0004",
        txnType: "UPI",
        rrn: "423456789012",
        txnDate: "07-Mar-2026",
        txnAmount: 1800,
        refundAmount: 1800,
        custId: "CUST1004",
        accountNo: "2233445566778899",
        mid: "MID44444",
        gateTxnId: "GTX004",
        documentName: "Invoice.pdf",
        documentUrl: "#",
    },
];

const PAGE_SIZE = 10;

const ArchivalEnquiry = () => {
    const [criteria, setCriteria] = useState({ fromDate: "", toDate: "", rrn: "", accountNo: "" });
    const [criteriaErrors, setCriteriaErrors] = useState({});
    const [results, setResults] = useState(null); // null = not searched yet
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const handleCriteriaChange = (e) => {
        const { name, value } = e.target;
        setCriteria(prev => ({ ...prev, [name]: value }));
        setCriteriaErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!criteria.fromDate) e.fromDate = "From Date is required.";
        if (!criteria.toDate) e.toDate = "To Date is required.";
        if (criteria.fromDate && criteria.toDate && criteria.fromDate > criteria.toDate)
            e.toDate = "To Date must be on or after From Date.";
        if (!criteria.rrn.trim() && !criteria.accountNo.trim())
            e.rrn = "Either RRN or Account Number is required.";
        setCriteriaErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSearch = () => {
        if (!validate()) return;
        // Filter sample data by criteria (backend will handle this in production)
        const filtered = SAMPLE_ARCHIVAL.filter((r) => {
            if (criteria.rrn.trim() && !r.rrn.includes(criteria.rrn.trim())) return false;
            if (criteria.accountNo.trim() && !r.accountNo.includes(criteria.accountNo.trim())) return false;
            return true;
        });
        setResults(filtered);
        setSearch("");
        setCurrentPage(1);
    };

    const handleClear = () => {
        setCriteria({ fromDate: "", toDate: "", rrn: "", accountNo: "" });
        setCriteriaErrors({});
        setResults(null);
        setSearch("");
        setCurrentPage(1);
    };

    const filteredResults = results
        ? results.filter((row) => {
            if (!search.trim()) return true;
            return Object.values(row).join(" ").toLowerCase().includes(search.trim().toLowerCase());
        })
        : [];

    const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);
    const indexOfFirst = (currentPage - 1) * PAGE_SIZE;
    const pageData = filteredResults.slice(indexOfFirst, indexOfFirst + PAGE_SIZE);

    return (
        <div className="container-fluid p-2">
            {/* Search Criteria Card */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white py-2 border-bottom">
                    <nav aria-label="breadcrumb" className="mb-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item text-muted">Enquiry</li>
                            <li className="breadcrumb-item active fw-semibold" aria-current="page">Archival Enquiry</li>
                        </ol>
                    </nav>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-lg-3 col-md-6">
                            <label className="form-label">From Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                name="fromDate"
                                className={`form-control ${criteriaErrors.fromDate ? "is-invalid" : ""}`}
                                value={criteria.fromDate}
                                onChange={handleCriteriaChange}
                            />
                            {criteriaErrors.fromDate && <div className="text-danger small">{criteriaErrors.fromDate}</div>}
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <label className="form-label">To Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                name="toDate"
                                className={`form-control ${criteriaErrors.toDate ? "is-invalid" : ""}`}
                                value={criteria.toDate}
                                onChange={handleCriteriaChange}
                            />
                            {criteriaErrors.toDate && <div className="text-danger small">{criteriaErrors.toDate}</div>}
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <label className="form-label">RRN Number</label>
                            <input
                                type="text"
                                name="rrn"
                                className={`form-control ${criteriaErrors.rrn ? "is-invalid" : ""}`}
                                placeholder="Enter RRN"
                                value={criteria.rrn}
                                onChange={handleCriteriaChange}
                            />
                            {criteriaErrors.rrn && <div className="text-danger small">{criteriaErrors.rrn}</div>}
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <label className="form-label">Account Number</label>
                            <input
                                type="text"
                                name="accountNo"
                                className={`form-control ${criteriaErrors.accountNo ? "is-invalid" : ""}`}
                                placeholder="Enter Account Number"
                                value={criteria.accountNo}
                                onChange={handleCriteriaChange}
                            />
                            {criteriaErrors.accountNo && <div className="text-danger small">{criteriaErrors.accountNo}</div>}
                        </div>
                    </div>

                    <div className="alert alert-info py-2 mt-3 mb-0" style={{ fontSize: "13px" }}>
                        <strong>Note:</strong> From Date and To Date are <strong>mandatory</strong>. Either <strong>RRN</strong> or <strong>Account Number</strong> must be provided.
                    </div>

                    <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-primary btn-sm px-4" onClick={handleSearch}>Search</button>
                        <button className="btn btn-outline-secondary btn-sm px-4" onClick={handleClear}>Clear</button>
                    </div>
                </div>
            </div>

            {/* Results Card — shown only after search */}
            {results !== null && (
                <div className="card border-0 shadow-sm">
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

                    {filteredResults.length === 0 && (
                        <div className="alert alert-info mx-3 mt-2 py-2" style={{ fontSize: "13px" }}>No archived records found for the given criteria.</div>
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
                                    <th>MID</th>
                                    <th>Reference Document</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.map((row) => (
                                    <tr key={row.requestId}>
                                        <td>
                                            <span
                                                className="fw-semibold text-primary"
                                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                                onClick={() => { setSelectedRequest(row); setShowDetails(true); }}
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
                                        <td>{row.mid}</td>
                                        <td>
                                            {row.documentName
                                                ? <a href={row.documentUrl || "#"} target="_blank" rel="noreferrer" className="text-primary d-flex align-items-center gap-1" style={{ textDecoration: "underline", fontSize: "13px" }}>
                                                    <FaFileAlt size={12} />{row.documentName}
                                                  </a>
                                                : <span className="text-muted">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="card-footer bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Showing {filteredResults.length === 0 ? 0 : indexOfFirst + 1}
                                {" – "}
                                {Math.min(indexOfFirst + PAGE_SIZE, filteredResults.length)} of {filteredResults.length} records
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
            )}

            <RequestDetailsModal
                show={showDetails}
                request={selectedRequest}
                onClose={() => { setShowDetails(false); setSelectedRequest(null); }}
                title="Archived Request Details"
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
                ]}
            />
        </div>
    );
};

export default ArchivalEnquiry;
