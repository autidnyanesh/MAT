import React, { useState } from "react";
import ReportBase from "./ReportBase";

const SAMPLE = [
    { requestId: "REQ0003", rrn: "555555555", txnDate: "08-Jun-2026", txnAmount: "₹ 5,000", refundAmount: "₹ 5,000", custId: "CUST1003", accountNo: "XXXX9999", mid: "MID99999", tid: "TID003", vendor: "Sarvatra", failureReason: "Account not found in Finacle", failureDate: "09-Jun-2026", retryCount: 2 },
    { requestId: "REQ0005", rrn: "222222222", txnDate: "06-Jun-2026", txnAmount: "₹ 4,500", refundAmount: "₹ 4,500", custId: "CUST1005", accountNo: "XXXX5555", mid: "MID55555", tid: "TID005", vendor: "Hitachi", failureReason: "Finacle timeout", failureDate: "07-Jun-2026", retryCount: 1 },
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
    {
        key: "failureReason", label: "Failure Reason",
        render: (row) => <span className="text-danger fw-semibold">{row.failureReason}</span>
    },
    { key: "failureDate", label: "Failure Date" },
    { key: "retryCount", label: "Retry Count" },
];

const FinacleFailureReport = () => {
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
            title="Finacle Failure Report"
            reportKey="FinacleFailure"
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
            note="Lists all requests that failed during Finacle processing within the selected date range."
        />
    );
};

export default FinacleFailureReport;
