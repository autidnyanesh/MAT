import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/tableAlign.css";
import { FaFileExcel, FaFileCode, FaSearch } from "react-icons/fa";

// ── Sample data per report type ───────────────────────────────────────────────
const SAMPLE_DATA = {
    APPROVAL_HISTORY: [
        { requestId: "REQ0001", rrn: "123456789", txnDate: "10-Jun-2026", txnAmount: "₹ 1,500", refundAmount: "₹ 1,500", custId: "CUST1001", accountNo: "XXXX1234", mid: "MID12345", vendor: "Worldline", action: "Approved", actionBy: "BH User", actionDate: "11-Jun-2026", remarks: "" },
        { requestId: "REQ0002", rrn: "987654321", txnDate: "09-Jun-2026", txnAmount: "₹ 2,500", refundAmount: "₹ 2,500", custId: "CUST1002", accountNo: "XXXX5678", mid: "MID56789", vendor: "Hitachi", action: "Rejected", actionBy: "RH User", actionDate: "10-Jun-2026", remarks: "Duplicate request" },
        { requestId: "REQ0003", rrn: "555555555", txnDate: "08-Jun-2026", txnAmount: "₹ 5,000", refundAmount: "₹ 5,000", custId: "CUST1003", accountNo: "XXXX9999", mid: "MID99999", vendor: "Sarvatra", action: "Refer Back", actionBy: "DCO User", actionDate: "09-Jun-2026", remarks: "RRN mismatch" },
    ],
    DELETED: [
        { requestId: "REQ0010", rrn: "111111111", txnDate: "05-Jun-2026", txnAmount: "₹ 1,200", refundAmount: "₹ 1,200", custId: "CUST2001", accountNo: "XXXX1111", mid: "MID11111", vendor: "Worldline", deletedBy: "BU User", deletedDate: "06-Jun-2026", reason: "Entered wrong amount" },
        { requestId: "REQ0011", rrn: "222222222", txnDate: "04-Jun-2026", txnAmount: "₹ 3,000", refundAmount: "₹ 3,000", custId: "CUST2002", accountNo: "XXXX2222", mid: "MID22222", vendor: "Hitachi", deletedBy: "BU User", deletedDate: "05-Jun-2026", reason: "Duplicate entry" },
    ],
    AUDIT_LOGS: [
        { logId: "LOG001", requestId: "REQ0001", userId: "USR001", userName: "John Doe", action: "Created", module: "Raise Request", ipAddress: "192.168.1.10", timestamp: "10-Jun-2026 09:15:00", details: "Request raised for ₹1,500" },
        { logId: "LOG002", requestId: "REQ0001", userId: "USR002", userName: "BH User", action: "Approved", module: "Approval Queue", ipAddress: "192.168.1.20", timestamp: "11-Jun-2026 10:30:00", details: "Approved at BH level" },
        { logId: "LOG003", requestId: "REQ0002", userId: "USR001", userName: "John Doe", action: "Deleted", module: "My Request", ipAddress: "192.168.1.10", timestamp: "09-Jun-2026 14:00:00", details: "Deleted due to wrong amount" },
        { logId: "LOG004", requestId: "REQ0003", userId: "USR003", userName: "DCO User", action: "Refer Back", module: "DCO Approval Queue", ipAddress: "192.168.1.30", timestamp: "08-Jun-2026 11:45:00", details: "RRN mismatch with vendor file" },
    ],
    TXN_SUCCESS: [
        { requestId: "REQ0001", rrn: "123456789", txnDate: "10-Jun-2026", txnAmount: "₹ 1,500", refundAmount: "₹ 1,500", custId: "CUST1001", accountNo: "XXXX1234", mid: "MID12345", tid: "TID001", vendor: "Worldline", arn: "ARN123456", processedDate: "11-Jun-2026" },
        { requestId: "REQ0004", rrn: "111111111", txnDate: "07-Jun-2026", txnAmount: "₹ 2,000", refundAmount: "₹ 2,000", custId: "CUST1004", accountNo: "XXXX4444", mid: "MID44444", tid: "TID004", vendor: "Worldline", arn: "ARN222222", processedDate: "08-Jun-2026" },
        { requestId: "REQ0006", rrn: "333333333", txnDate: "05-Jun-2026", txnAmount: "₹ 3,500", refundAmount: "₹ 3,500", custId: "CUST1006", accountNo: "XXXX6666", mid: "MID66666", tid: "TID006", vendor: "Sarvatra", arn: "ARN333333", processedDate: "06-Jun-2026" },
    ],
    FINACLE_FAILURE: [
        { requestId: "REQ0003", rrn: "555555555", txnDate: "08-Jun-2026", txnAmount: "₹ 5,000", refundAmount: "₹ 5,000", custId: "CUST1003", accountNo: "XXXX9999", mid: "MID99999", tid: "TID003", vendor: "Sarvatra", failureReason: "Account not found in Finacle", failureDate: "09-Jun-2026", retryCount: 2 },
        { requestId: "REQ0005", rrn: "222222222", txnDate: "06-Jun-2026", txnAmount: "₹ 4,500", refundAmount: "₹ 4,500", custId: "CUST1005", accountNo: "XXXX5555", mid: "MID55555", tid: "TID005", vendor: "Hitachi", failureReason: "Finacle timeout", failureDate: "07-Jun-2026", retryCount: 1 },
    ],
    SUCCESS_WITH_ARN: [
        { requestId: "REQ0001", rrn: "123456789", txnDate: "10-Jun-2026", txnAmount: "₹ 1,500", refundAmount: "₹ 1,500", custId: "CUST1001", accountNo: "XXXX1234", mid: "MID12345", tid: "TID001", vendor: "Worldline", arn: "ARN123456", processedDate: "11-Jun-2026" },
        { requestId: "REQ0006", rrn: "333333333", txnDate: "05-Jun-2026", txnAmount: "₹ 3,500", refundAmount: "₹ 3,500", custId: "CUST1006", accountNo: "XXXX6666", mid: "MID66666", tid: "TID006", vendor: "Sarvatra", arn: "ARN333333", processedDate: "06-Jun-2026" },
    ],
    SUCCESS_WITHOUT_ARN: [
        { requestId: "REQ0007", rrn: "444444444", txnDate: "04-Jun-2026", txnAmount: "₹ 1,800", refundAmount: "₹ 1,800", custId: "CUST1007", accountNo: "XXXX7777", mid: "MID77777", tid: "TID007", vendor: "Hitachi", processedDate: "05-Jun-2026", arnStatus: "Pending" },
        { requestId: "REQ0008", rrn: "666666666", txnDate: "03-Jun-2026", txnAmount: "₹ 2,200", refundAmount: "₹ 2,200", custId: "CUST1008", accountNo: "XXXX8888", mid: "MID88888", tid: "TID008", vendor: "Worldline", processedDate: "04-Jun-2026", arnStatus: "Not Generated" },
    ],
};

// ── Column definitions per report type ───────────────────────────────────────
const COLUMNS = {
    APPROVAL_HISTORY: [
        { key: "requestId", label: "Request ID" },
        { key: "rrn", label: "RRN" },
        { key: "txnDate", label: "Date of Txn" },
        { key: "txnAmount", label: "Txn Amount" },
        { key: "refundAmount", label: "Refund Amount" },
        { key: "custId", label: "Cust ID" },
        { key: "accountNo", label: "Account No" },
        { key: "mid", label: "MID" },
        { key: "vendor", label: "Vendor" },
        { key: "action", label: "Action" },
        { key: "actionBy", label: "Action By" },
        { key: "actionDate", label: "Action Date" },
        { key: "remarks", label: "Remarks" },
    ],
    DELETED: [
        { key: "requestId", label: "Request ID" },
        { key: "rrn", label: "RRN" },
        { key: "txnDate", label: "Date of Txn" },
        { key: "txnAmount", label: "Txn Amount" },
        { key: "refundAmount", label: "Refund Amount" },
        { key: "custId", label: "Cust ID" },
        { key: "accountNo", label: "Account No" },
        { key: "mid", label: "MID" },
        { key: "vendor", label: "Vendor" },
        { key: "deletedBy", label: "Deleted By" },
        { key: "deletedDate", label: "Deleted Date" },
        { key: "reason", label: "Reason" },
    ],
    AUDIT_LOGS: [
        { key: "logId", label: "Log ID" },
        { key: "requestId", label: "Request ID" },
        { key: "userId", label: "User ID" },
        { key: "userName", label: "User Name" },
        { key: "action", label: "Action" },
        { key: "module", label: "Module" },
        { key: "ipAddress", label: "IP Address" },
        { key: "timestamp", label: "Timestamp" },
        { key: "details", label: "Details" },
    ],
    TXN_SUCCESS: [
        { key: "requestId", label: "Request ID" },
        { key: "rrn", label: "RRN" },
        { key: "txnDate", label: "Date of Txn" },
        { key: "txnAmount", label: "Txn Amount" },
        { key: "refundAmount", label: "Refund Amount" },
        { key: "custId", label: "Cust ID" },
        { key: "accountNo", label: "Account No" },
        { key: "mid", label: "MID" },
        { key: "tid", label: "TID" },
        { key: "vendor", label: "Vendor" },
        { key: "arn", label: "ARN" },
        { key: "processedDate", label: "Processed Date" },
    ],
    FINACLE_FAILURE: [
        { key: "requestId", label: "Request ID" },
        { key: "rrn", label: "RRN" },
        { key: "txnDate", label: "Date of Txn" },
        { key: "txnAmount", label: "Txn Amount" },
        { key: "refundAmount", label: "Refund Amount" },
        { key: "custId", label: "Cust ID" },
        { key: "accountNo", label: "Account No" },
        { key: "mid", label: "MID" },
        { key: "tid", label: "TID" },
        { key: "vendor", label: "Vendor" },
        { key: "failureReason", label: "Failure Reason" },
        { key: "failureDate", label: "Failure Date" },
        { key: "retryCount", label: "Retry Count" },
    ],
    SUCCESS_WITH_ARN: [
        { key: "requestId", label: "Request ID" },
        { key: "rrn", label: "RRN" },
        { key: "txnDate", label: "Date of Txn" },
        { key: "txnAmount", label: "Txn Amount" },
        { key: "refundAmount", label: "Refund Amount" },
        { key: "custId", label: "Cust ID" },
        { key: "accountNo", label: "Account No" },
        { key: "mid", label: "MID" },
        { key: "tid", label: "TID" },
        { key: "vendor", label: "Vendor" },
        { key: "arn", label: "ARN" },
        { key: "processedDate", label: "Processed Date" },
    ],
    SUCCESS_WITHOUT_ARN: [
        { key: "requestId", label: "Request ID" },
        { key: "rrn", label: "RRN" },
        { key: "txnDate", label: "Date of Txn" },
        { key: "txnAmount", label: "Txn Amount" },
        { key: "refundAmount", label: "Refund Amount" },
        { key: "custId", label: "Cust ID" },
        { key: "accountNo", label: "Account No" },
        { key: "mid", label: "MID" },
        { key: "tid", label: "TID" },
        { key: "vendor", label: "Vendor" },
        { key: "processedDate", label: "Processed Date" },
        { key: "arnStatus", label: "ARN Status" },
    ],
};

// ── Badge renderer for specific columns ──────────────────────────────────────
const ACTION_BADGE = { Approved: "success", Rejected: "danger", "Refer Back": "warning", Created: "primary", Deleted: "danger", Updated: "info" };

const renderCell = (col, row) => {
    const val = row[col.key];
    if (val === undefined || val === null || val === "") return <span className="text-muted">—</span>;

    if (col.key === "action") {
        const c = ACTION_BADGE[val] || "secondary";
        return <span className={`badge bg-${c}-subtle text-${c} border border-${c}-subtle rounded-pill px-2`} style={{ fontSize: "11px" }}>{val}</span>;
    }
    if (col.key === "arnStatus") {
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>{val}</span>;
    }
    if (col.key === "failureReason") {
        return <span className="text-danger fw-semibold">{val}</span>;
    }
    if (col.key === "arn") {
        return <span className="fw-semibold text-success">{val}</span>;
    }
    return val;
};

const REPORT_TYPES = [
    { value: "APPROVED", label: "Approved Report" },
    { value: "REJECTED", label: "Rejected Report" },
    { value: "REFER_BACK", label: "Refer Back Report" },
    { value: "DELETED", label: "Deleted Report" },
    { value: "AUDIT_LOGS", label: "Audit Logs" },
    { value: "TXN_SUCCESS", label: "Transaction Success Report" },
    { value: "FINACLE_FAILURE", label: "Finacle Failure Report" },
    { value: "SUCCESS_WITH_ARN", label: "Success with ARN Report" },
    { value: "SUCCESS_WITHOUT_ARN", label: "Success W/O ARN Report" },
];

const PAGE_SIZE = 10;

function getApprovalHistoryData(reportType) {
    const actionMap = {
        APPROVED: "Approved",
        REJECTED: "Rejected",
        REFER_BACK: "Refer Back",
    };
    const action = actionMap[reportType];
    return action ? SAMPLE_DATA.APPROVAL_HISTORY.filter((row) => row.action === action) : [];
}

function Report() {
    const [reportType, setReportType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [filterErrors, setFilterErrors] = useState({});
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [results, setResults] = useState(null); // null = not searched yet

    const columns = COLUMNS[reportType] || [];

    const validate = () => {
        const e = {};
        if (!reportType) e.reportType = "Report Type is required.";
        if (!fromDate) e.fromDate = "From Date is required.";
        if (!toDate) e.toDate = "To Date is required.";
        if (fromDate && toDate && fromDate > toDate) e.toDate = "To Date must be on or after From Date.";
        setFilterErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSearch = () => {
        if (!validate()) return;
        // Backend: await api.post("/api/reports", { reportType, fromDate, toDate })
        const data = reportType === "APPROVED" || reportType === "REJECTED" || reportType === "REFER_BACK"
            ? getApprovalHistoryData(reportType)
            : SAMPLE_DATA[reportType] || [];
        setResults(data);
        setSearch("");
        setCurrentPage(1);
    };

    const handleClear = () => {
        setReportType("");
        setFromDate(""); setToDate(""); setFilterErrors({});
        setSearch(""); setCurrentPage(1); setResults(null);
    };

    const handleTypeChange = (val) => {
        setReportType(val);
        setResults(null);
        setSearch("");
        setCurrentPage(1);
        setFilterErrors({});
    };

    const filteredData = results
        ? results.filter((row) =>
            !search.trim() ||
            Object.values(row).join(" ").toLowerCase().includes(search.trim().toLowerCase())
        )
        : [];

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const indexOfFirst = (currentPage - 1) * PAGE_SIZE;
    const pageData = filteredData.slice(indexOfFirst, indexOfFirst + PAGE_SIZE);

    const exportToExcel = () => {
        if (!filteredData.length) return;
        const rows = filteredData.map((row) => {
            const obj = {};
            columns.forEach(({ key, label }) => { obj[label] = row[key] ?? ""; });
            return obj;
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${reportType}_Report.xlsx`);
    };

    const exportToHtml = () => {
        if (!filteredData.length) return;
        const title = REPORT_TYPES.find(r => r.value === reportType)?.label || "Report";
        const headers = columns.map(({ label }) => `<th>${label}</th>`).join("");
        const rows = filteredData.map((row) =>
            `<tr>${columns.map(({ key }) => `<td>${row[key] ?? ""}</td>`).join("")}</tr>`
        ).join("");
        const html = `<html><head><title>${title}</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#0d6efd;color:#fff}</style></head><body><h2>${title}</h2><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
        saveAs(new Blob([html], { type: "text/html" }), `${reportType}_Report.html`);
    };

    const activeLabel = REPORT_TYPES.find(r => r.value === reportType)?.label || "";

    return (
        <div className="container-fluid p-2">
            <div className="card shadow-sm border-0 mb-1 p-2">
                <nav aria-label="breadcrumb" className="mb-2">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item text-muted">Reports</li>
                        <li className="breadcrumb-item active fw-semibold">{activeLabel}</li>
                    </ol>
                </nav>
                <hr style={{ marginTop: "2px" }} />


                {/* Filter Card */}
                <div className="card-body">
                    <div className="row g-3 justify-content-center">

                        <div className="col-lg-3 col-md-6">
                            <label className="form-label">Report Type</label>
                            <select
                                className="form-select"
                                value={reportType}
                                onChange={(e) => handleTypeChange(e.target.value)}
                            >
                                <option value="">-- Select Report Type --</option>
                                {REPORT_TYPES.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-lg-2 col-md-6">
                            <label className="form-label">From Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className={`form-control ${filterErrors.fromDate ? "is-invalid" : ""}`}
                                value={fromDate}
                                onChange={(e) => { setFromDate(e.target.value); setFilterErrors(p => ({ ...p, fromDate: "" })); }}
                            />
                            {filterErrors.fromDate && <div className="text-danger small">{filterErrors.fromDate}</div>}
                        </div>

                        <div className="col-lg-2 col-md-6">
                            <label className="form-label">To Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className={`form-control ${filterErrors.toDate ? "is-invalid" : ""}`}
                                value={toDate}
                                onChange={(e) => { setToDate(e.target.value); setFilterErrors(p => ({ ...p, toDate: "" })); }}
                            />
                            {filterErrors.toDate && <div className="text-danger small">{filterErrors.toDate}</div>}
                        </div>

                        <div className="col-lg-2 col-md-6 d-flex gap-2">
                            <button className="btn btn-primary btn-sm px-4" onClick={handleSearch}>Search</button>
                            <button className="btn btn-outline-secondary btn-sm px-4" onClick={handleClear}>Clear</button>
                        </div>

                    </div>
                </div>
                <div className="card-header bg-white py-2 border-bottom">

                </div>

                {/* Results Card — shown only after search */}
                {results !== null && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body pb-2 d-flex justify-content-between align-items-end flex-wrap gap-2">
                            <div style={{ minWidth: "260px" }}>
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
                            <div className="d-flex gap-2">
                                <button className="btn btn-success btn-sm px-3" onClick={exportToExcel} disabled={!filteredData.length}>
                                    <FaFileExcel className="me-1" />Excel
                                </button>
                                <button className="btn btn-info btn-sm px-3 text-white" onClick={exportToHtml} disabled={!filteredData.length}>
                                    <FaFileCode className="me-1" />HTML
                                </button>
                            </div>
                        </div>

                        {filteredData.length === 0 && (
                            <div className="alert alert-info mx-3 mt-2 py-2" style={{ fontSize: "13px" }}>No records found for the selected criteria.</div>
                        )}

                        <div className="table-responsive">
                            <table className="table modern-table align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        {columns.map(({ key, label }) => <th key={key}>{label}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.map((row, i) => (
                                        <tr key={i}>
                                            {columns.map((col) => (
                                                <td key={col.key}>{renderCell(col, row)}</td>
                                            ))}
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
                )}
            </div>
        </div>
    );

}


export default Report;
