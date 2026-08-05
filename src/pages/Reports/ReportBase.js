import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/tableAlign.css";
import { FaSearch, FaFileExcel, FaFileCode } from "react-icons/fa";

const PAGE_SIZE = 10;

/**
 * ReportBase — shared shell for all report pages.
 *
 * Props:
 *  title        string   — breadcrumb / heading
 *  reportKey    string   — used in export filenames
 *  columns      Array<{ key, label }>  — table column definitions
 *  extraFilters node     — optional extra filter fields rendered inside the filter card
 *  data         Array    — full dataset (filtered by parent via criteria)
 *  searched     bool     — true once the user has clicked Search at least once
 *  onSearch     fn       — called when Search button clicked (parent validates & fetches)
 *  onClear      fn       — called when Clear button clicked
 *  filterErrors object   — { fromDate, toDate, ... } validation messages
 *  fromDate     string
 *  toDate       string
 *  onFromDate   fn
 *  onToDate     fn
 *  note         string   — optional info note shown above table
 */
const ReportBase = ({
    title,
    reportKey,
    columns,
    extraFilters,
    data = [],
    searched = false,
    onSearch,
    onClear,
    filterErrors = {},
    fromDate,
    toDate,
    onFromDate,
    onToDate,
    note,
}) => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = data.filter((row) => {
        if (!search.trim()) return true;
        return Object.values(row).join(" ").toLowerCase().includes(search.trim().toLowerCase());
    });

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const indexOfFirst = (currentPage - 1) * PAGE_SIZE;
    const pageData = filteredData.slice(indexOfFirst, indexOfFirst + PAGE_SIZE);

    const handleSearch = () => {
        setSearch("");
        setCurrentPage(1);
        onSearch();
    };

    const handleClear = () => {
        setSearch("");
        setCurrentPage(1);
        onClear();
    };

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
        saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${reportKey}_Report.xlsx`);
    };

    const exportToHtml = () => {
        if (!filteredData.length) return;
        const headers = columns.map(({ label }) => `<th>${label}</th>`).join("");
        const rows = filteredData.map((row) =>
            `<tr>${columns.map(({ key }) => `<td>${row[key] ?? ""}</td>`).join("")}</tr>`
        ).join("");
        const html = `<html><head><title>${title}</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#0d6efd;color:#fff}</style></head><body><h2>${title}</h2><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
        saveAs(new Blob([html], { type: "text/html" }), `${reportKey}_Report.html`);
    };

    return (
        <div className="container-fluid p-2">
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">Reports</li>
                    <li className="breadcrumb-item active">{title}</li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            {/* Filter Card */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-lg-2 col-md-4">
                            <label className="form-label">From Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className={`form-control ${filterErrors.fromDate ? "is-invalid" : ""}`}
                                value={fromDate}
                                onChange={(e) => onFromDate(e.target.value)}
                            />
                            {filterErrors.fromDate && <div className="text-danger small">{filterErrors.fromDate}</div>}
                        </div>
                        <div className="col-lg-2 col-md-4">
                            <label className="form-label">To Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className={`form-control ${filterErrors.toDate ? "is-invalid" : ""}`}
                                value={toDate}
                                onChange={(e) => onToDate(e.target.value)}
                            />
                            {filterErrors.toDate && <div className="text-danger small">{filterErrors.toDate}</div>}
                        </div>

                        {extraFilters}

                        <div className="col-lg-2 col-md-4 d-flex gap-2">
                            <button className="btn btn-primary btn-sm px-4" onClick={handleSearch}>Search</button>
                            <button className="btn btn-outline-secondary btn-sm px-4" onClick={handleClear}>Clear</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Card */}
            {searched && (
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

                    {note && (
                        <div className="alert alert-warning py-2 mx-3 mb-0" style={{ fontSize: "13px" }}>
                            <strong>Note:</strong> {note}
                        </div>
                    )}

                    {filteredData.length === 0 && (
                        <div className="alert alert-info mx-3 mt-2 py-2" style={{ fontSize: "13px" }}>No records found.</div>
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
                                        {columns.map(({ key, render }) => (
                                            <td key={key}>{render ? render(row) : (row[key] ?? <span className="text-muted">—</span>)}</td>
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
    );
};

export default ReportBase;
