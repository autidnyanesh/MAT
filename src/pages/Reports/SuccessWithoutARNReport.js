import React, { useState } from "react";
import ReportBase from "./ReportBase";

const SAMPLE = [
    { requestId: "REQ0007", rrn: "444444444", txnDate: "04-Jun-2026", txnAmount: "₹ 1,800", refundAmount: "₹ 1,800", custId: "CUST1007", accountNo: "XXXX7777", mid: "MID77777", tid: "TID007", vendor: "Hitachi", processedDate: "05-Jun-2026", arnStatus: "Pending" },
    { requestId: "REQ0008", rrn: "666666666", txnDate: "03-Jun-2026", txnAmount: "₹ 2,200", refundAmount: "₹ 2,200", custId: "CUST1008", accountNo: "XXXX8888", mid: "MID88888", tid: "TID008", vendor: "Worldline", processedDate: "04-Jun-2026", arnStatus: "Not Generated" },
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
    { key: "processedDate", label: "Processed Date" },
    {
        key: "arnStatus", label: "ARN Status",
        render: (row) => <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>{row.arnStatus}</span>
    },
];

const SuccessWithoutARNReport = () => {
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
            title="Success W/O ARN Report"
            reportKey="SuccessWithoutARN"
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
            note="Lists all successfully processed refund transactions where ARN was not yet generated."
        />
    );
};

export default SuccessWithoutARNReport;
