import React, { useState } from "react";
import ReportBase from "./ReportBase";

const SAMPLE = [
    { logId: "LOG001", requestId: "REQ0001", userId: "USR001", userName: "John Doe", action: "Created", module: "Raise Request", ipAddress: "192.168.1.10", timestamp: "10-Jun-2026 09:15:00", details: "Request raised for ₹1,500" },
    { logId: "LOG002", requestId: "REQ0001", userId: "USR002", userName: "BH User", action: "Approved", module: "Approval Queue", ipAddress: "192.168.1.20", timestamp: "11-Jun-2026 10:30:00", details: "Approved at BH level" },
    { logId: "LOG003", requestId: "REQ0002", userId: "USR001", userName: "John Doe", action: "Deleted", module: "My Request", ipAddress: "192.168.1.10", timestamp: "09-Jun-2026 14:00:00", details: "Deleted due to wrong amount" },
    { logId: "LOG004", requestId: "REQ0003", userId: "USR003", userName: "DCO User", action: "Refer Back", module: "DCO Approval Queue", ipAddress: "192.168.1.30", timestamp: "08-Jun-2026 11:45:00", details: "RRN mismatch with vendor file" },
];

const COLUMNS = [
    { key: "logId", label: "Log ID" },
    { key: "requestId", label: "Request ID" },
    { key: "userId", label: "User ID" },
    { key: "userName", label: "User Name" },
    {
        key: "action", label: "Action",
        render: (row) => {
            const map = { Created: "primary", Approved: "success", Deleted: "danger", "Refer Back": "warning", Rejected: "danger", Updated: "info" };
            const c = map[row.action] || "secondary";
            return <span className={`badge bg-${c}-subtle text-${c} border border-${c}-subtle rounded-pill px-2`} style={{ fontSize: "11px" }}>{row.action}</span>;
        }
    },
    { key: "module", label: "Module" },
    { key: "ipAddress", label: "IP Address" },
    { key: "timestamp", label: "Timestamp" },
    { key: "details", label: "Details" },
];

const AuditLogsReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [filterErrors, setFilterErrors] = useState({});
    const [data, setData] = useState([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = () => {
        const e = {};
        if (!fromDate) e.fromDate = "From Date is required.";
        if (!toDate) e.toDate = "To Date is required.";
        if (fromDate && toDate && fromDate > toDate) e.toDate = "To Date must be on or after From Date.";
        setFilterErrors(e);
        if (Object.keys(e).length) return;
        setData(SAMPLE);
        setSearched(true);
    };

    const handleClear = () => {
        setFromDate(""); setToDate(""); setFilterErrors({}); setData([]); setSearched(false);
    };

    return (
        <ReportBase
            title="Audit Logs"
            reportKey="AuditLogs"
            columns={COLUMNS}
            data={data}
            searched={searched}
            onSearch={handleSearch}
            onClear={handleClear}
            filterErrors={filterErrors}
            fromDate={fromDate}
            toDate={toDate}
            onFromDate={setFromDate}
            onToDate={setToDate}
            note="Complete audit trail of all user actions within the selected date range."
        />
    );
};

export default AuditLogsReport;
