import React, { useState } from "react";
import ReportBase from "./ReportBase";

const SAMPLE = [
    { requestId: "REQ0010", rrn: "111111111", txnDate: "05-Jun-2026", txnAmount: "₹ 1,200", refundAmount: "₹ 1,200", custId: "CUST2001", accountNo: "XXXX1111", mid: "MID11111", vendor: "Worldline", deletedBy: "BU User", deletedDate: "06-Jun-2026", reason: "Entered wrong amount" },
    { requestId: "REQ0011", rrn: "222222222", txnDate: "04-Jun-2026", txnAmount: "₹ 3,000", refundAmount: "₹ 3,000", custId: "CUST2002", accountNo: "XXXX2222", mid: "MID22222", vendor: "Hitachi", deletedBy: "BU User", deletedDate: "05-Jun-2026", reason: "Duplicate entry" },
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
    { key: "deletedBy", label: "Deleted By" },
    { key: "deletedDate", label: "Deleted Date" },
    { key: "reason", label: "Reason" },
];

const DeletedReport = () => {
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
            title="Deleted Report"
            reportKey="DeletedReport"
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
            note="Lists all requests deleted by users within the selected date range."
        />
    );
};

export default DeletedReport;
