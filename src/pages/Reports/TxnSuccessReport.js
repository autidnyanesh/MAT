import React, { useState } from "react";
import ReportBase from "./ReportBase";

const SAMPLE = [
    { requestId: "REQ0001", rrn: "123456789", txnDate: "10-Jun-2026", txnAmount: "₹ 1,500", refundAmount: "₹ 1,500", custId: "CUST1001", accountNo: "XXXX1234", mid: "MID12345", tid: "TID001", vendor: "Worldline", arn: "ARN123456", processedDate: "11-Jun-2026", status: "Success" },
    { requestId: "REQ0004", rrn: "111111111", txnDate: "07-Jun-2026", txnAmount: "₹ 2,000", refundAmount: "₹ 2,000", custId: "CUST1004", accountNo: "XXXX4444", mid: "MID44444", tid: "TID004", vendor: "Worldline", arn: "ARN222222", processedDate: "08-Jun-2026", status: "Success" },
    { requestId: "REQ0006", rrn: "333333333", txnDate: "05-Jun-2026", txnAmount: "₹ 3,500", refundAmount: "₹ 3,500", custId: "CUST1006", accountNo: "XXXX6666", mid: "MID66666", tid: "TID006", vendor: "Sarvatra", arn: "ARN333333", processedDate: "06-Jun-2026", status: "Success" },
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
    { key: "tid", label: "TID" },
    { key: "vendor", label: "Vendor" },
    { key: "arn", label: "ARN" },
    { key: "processedDate", label: "Processed Date" },
    {
        key: "status", label: "Status",
        render: (row) => <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>{row.status}</span>
    },
];

const TxnSuccessReport = () => {
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
            title="Transaction Success Report"
            reportKey="TxnSuccess"
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
            note="Lists all successfully processed refund transactions within the selected date range."
        />
    );
};

export default TxnSuccessReport;
