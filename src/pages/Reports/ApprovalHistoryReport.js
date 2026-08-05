import React, { useState } from "react";
import ReportBase from "./ReportBase";

const SAMPLE = [
    { requestId: "REQ0001", rrn: "123456789", txnDate: "10-Jun-2026", txnAmount: "₹ 1,500", refundAmount: "₹ 1,500", custId: "CUST1001", accountNo: "XXXX1234", mid: "MID12345", vendor: "Worldline", action: "Approved", actionBy: "BH User", actionDate: "11-Jun-2026", remarks: "" },
    { requestId: "REQ0002", rrn: "987654321", txnDate: "09-Jun-2026", txnAmount: "₹ 2,500", refundAmount: "₹ 2,500", custId: "CUST1002", accountNo: "XXXX5678", mid: "MID56789", vendor: "Hitachi", action: "Rejected", actionBy: "RH User", actionDate: "10-Jun-2026", remarks: "Duplicate request" },
    { requestId: "REQ0003", rrn: "555555555", txnDate: "08-Jun-2026", txnAmount: "₹ 5,000", refundAmount: "₹ 5,000", custId: "CUST1003", accountNo: "XXXX9999", mid: "MID99999", vendor: "Sarvatra", action: "Refer Back", actionBy: "DCO User", actionDate: "09-Jun-2026", remarks: "RRN mismatch" },
];

const COLUMNS = [
    { key: "requestId", label: "Request ID" },
    { key: "rrn", label: "RRN" },
    { key: "txnDate", label: "Date of Txn" },
    { key: "txnAmount", label: "Txn Amount" },
    { key: "refundAmount", label: "Refund Amount" },
    { key: "custId", label: "Cust ID" },
    { key: "accountNo", label: "Account No" },
    { key: "mid", label: "MID" },
    { key: "vendor", label: "Vendor" },
    {
        key: "action", label: "Action",
        render: (row) => {
            const map = { Approved: "success", Rejected: "danger", "Refer Back": "warning" };
            return <span className={`badge bg-${map[row.action] || "secondary"}-subtle text-${map[row.action] || "secondary"} border border-${map[row.action] || "secondary"}-subtle rounded-pill px-2`} style={{ fontSize: "11px" }}>{row.action}</span>;
        }
    },
    { key: "actionBy", label: "Action By" },
    { key: "actionDate", label: "Action Date" },
    { key: "remarks", label: "Remarks" },
];

const ApprovalHistoryReport = () => {
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
            title="Approved / Rejected / Refer Back History"
            reportKey="ApprovalHistory"
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
        />
    );
};

export default ApprovalHistoryReport;
