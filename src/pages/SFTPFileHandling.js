import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/tableAlign.css";
import {
    FaSearch, FaFileUpload, FaTrash, FaFolderOpen,
    FaCheckCircle, FaTimesCircle, FaCloudDownloadAlt, FaSyncAlt
} from "react-icons/fa";
import AlertModal from "../components/AlertModel";
import ConfirmModal from "../components/ComfirmModel";

// ── Vendor / file name reference ─────────────────────────────────────────────
const VENDOR_INFO = [
    { vendor: "Worldline", txnType: "POS/UPI", path: "MAT >> WORLDLINE >> INBOX", filePattern: "ALLTXN-OOO11-NON-MC_DDMMYY.TXT" },
    { vendor: "Hitachi", txnType: "POS", path: "MAT >> HITACHI >> INBOX", filePattern: "IDI_PoS_Delimiter_Card_DDMMYYYY.xlsx" },
    { vendor: "Hitachi", txnType: "UPI", path: "MAT >> HITACHI >> INBOX", filePattern: "IDI_PoS_Delimiter_UPIQR_DDMMYYYY.xlsx" },
    { vendor: "Sarvatra", txnType: "UPI", path: "MAT >> Sarvatra >> INBOX", filePattern: "—" },
];

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_FILES = [
    { id: "VF-001", vendor: "Worldline", txnType: "POS/UPI", fileName: "ALLTXN-OOO11-NON-MC_020726.TXT", source: "Auto SFTP", uploadedAt: "02-Jul-2026 08:10 AM", records: 1842, status: "Success", sameDay: false },
    { id: "VF-002", vendor: "Sarvatra", txnType: "UPI", fileName: "SAR_UPI_020726.txt", source: "Auto SFTP", uploadedAt: "02-Jul-2026 09:05 AM", records: 928, status: "Success", sameDay: false },
    { id: "VF-003", vendor: "Hitachi", txnType: "POS", fileName: "IDI_PoS_Delimiter_Card_02072026.xlsx", source: "Desktop Upload", uploadedAt: "02-Jul-2026 11:42 AM", records: 412, status: "Success", sameDay: true },
    { id: "VF-004", vendor: "Hitachi", txnType: "UPI", fileName: "IDI_PoS_Delimiter_UPIQR_02072026.xlsx", source: "SFTP Manual", uploadedAt: "02-Jul-2026 11:50 AM", records: 0, status: "Failed", sameDay: true },
];

const SAMPLE_SCHEDULER = [
    { runTime: "02-Jul-2026 08:00 AM", vendor: "Worldline", txnType: "POS/UPI", fileName: "ALLTXN-OOO11-NON-MC_020726.TXT", status: "Success", records: 1842, remarks: "" },
    { runTime: "02-Jul-2026 09:00 AM", vendor: "Sarvatra", txnType: "UPI", fileName: "SAR_UPI_020726.txt", status: "Success", records: 928, remarks: "" },
    { runTime: "02-Jul-2026 10:00 AM", vendor: "Hitachi", txnType: "POS", fileName: "—", status: "Failed", records: 0, remarks: "File not found on SFTP" },
    { runTime: "02-Jul-2026 11:00 AM", vendor: "Hitachi", txnType: "UPI", fileName: "—", status: "Failed", records: 0, remarks: "File not found on SFTP" },
];

const PAGE_SIZE = 10;

const STATUS_BADGE = {
    Success: "bg-success-subtle text-success border-success-subtle",
    Failed: "bg-danger-subtle text-danger border-danger-subtle",
    "Pending Validation": "bg-warning-subtle text-warning border-warning-subtle",
};

function SFTPFileHandling() {
    // ── tabs ──────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("view");

    // ── view files ────────────────────────────────────────────────────────────
    const [files, setFiles] = useState(SAMPLE_FILES);
    const [viewFilter, setViewFilter] = useState({ vendor: "", txnType: "", status: "", search: "" });
    const [viewPage, setViewPage] = useState(1);
    const [deleteConfig, setDeleteConfig] = useState({ show: false, file: null });

    // ── manual upload ─────────────────────────────────────────────────────────
    const [uploadMode, setUploadMode] = useState("Desktop");
    const [uploadForm, setUploadForm] = useState({ vendor: "", txnType: "", file: null });
    const [uploadErrors, setUploadErrors] = useState({});

    // ── scheduler report ──────────────────────────────────────────────────────
    const [schedSearch, setSchedSearch] = useState("");
    const [schedPage, setSchedPage] = useState(1);

    // ── alert ─────────────────────────────────────────────────────────────────
    const [alert, setAlert] = useState({ show: false, type: "", title: "", message: "" });
    const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });

    // ── view files logic ──────────────────────────────────────────────────────
    const filteredFiles = files.filter((f) => {
        const s = viewFilter.search.toLowerCase();
        return (
            (!viewFilter.vendor || f.vendor === viewFilter.vendor) &&
            (!viewFilter.txnType || f.txnType === viewFilter.txnType) &&
            (!viewFilter.status || f.status === viewFilter.status) &&
            (!s || Object.values(f).join(" ").toLowerCase().includes(s))
        );
    });
    const filesTotalPages = Math.ceil(filteredFiles.length / PAGE_SIZE);
    const filesIndexFirst = (viewPage - 1) * PAGE_SIZE;
    const filesPage = filteredFiles.slice(filesIndexFirst, filesIndexFirst + PAGE_SIZE);

    const handleDelete = () => {
        setFiles(prev => prev.filter(f => f.id !== deleteConfig.file.id));
        setDeleteConfig({ show: false, file: null });
        showAlert("success", "File Deleted", "File deleted successfully. Associated requests have been rejected.");
    };

    // ── manual upload logic ───────────────────────────────────────────────────
    const validateUpload = () => {
        const e = {};
        if (!uploadForm.vendor) e.vendor = "Vendor is required.";
        if (!uploadForm.txnType) e.txnType = "Transaction type is required.";
        if (!uploadForm.file) e.file = "Please select a file.";
        setUploadErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleUpload = () => {
        if (!validateUpload()) return;
        showAlert("success", "File Uploaded", `${uploadForm.file.name} uploaded successfully via ${uploadMode}.`);
        setUploadForm({ vendor: "", txnType: "", file: null });
        document.getElementById("fileInput").value = "";
    };

    // ── scheduler report logic ────────────────────────────────────────────────
    const filteredSched = SAMPLE_SCHEDULER.filter((r) =>
        !schedSearch.trim() || Object.values(r).join(" ").toLowerCase().includes(schedSearch.toLowerCase())
    );
    const schedTotalPages = Math.ceil(filteredSched.length / PAGE_SIZE);
    const schedIndexFirst = (schedPage - 1) * PAGE_SIZE;
    const schedPageData = filteredSched.slice(schedIndexFirst, schedIndexFirst + PAGE_SIZE);

    const TAB = (key, label) => (
        <button
            className={`btn btn-sm ${activeTab === key ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setActiveTab(key)}
        >
            {label}
        </button>
    );

    return (
        <div className="container-fluid p-2">
            {/* Search */}
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "12px" }} >
                <div className="card-header bg-white py-2 border-bottom">
                    <nav aria-label="breadcrumb" className="mb-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">File Handling</li>
                            <li className="breadcrumb-item active">Vendor File Download</li>
                        </ol>
                    </nav>
                </div>

                {/* Auto SFTP Info Banner */}
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body py-2">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="d-flex align-items-center gap-3 p-2 rounded" style={{ background: "#f0f7ff" }}>
                                    <FaCloudDownloadAlt size={28} className="text-primary" />
                                    <div>
                                        <div className="fw-semibold" style={{ fontSize: "13px" }}>Auto SFTP Scheduler</div>
                                        <div className="text-muted" style={{ fontSize: "12px" }}>Runs hourly · 08:00 AM – 12:00 PM</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex align-items-center gap-3 p-2 rounded" style={{ background: "#f0fff4" }}>
                                    <FaCheckCircle size={28} className="text-success" />
                                    <div>
                                        <div className="fw-semibold" style={{ fontSize: "13px" }}>Files Received Today</div>
                                        <div className="text-muted" style={{ fontSize: "12px" }}>2 of 4 vendors · Success mail sent to DCO</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex align-items-center gap-3 p-2 rounded" style={{ background: "#fff8f0" }}>
                                    <FaTimesCircle size={28} className="text-danger" />
                                    <div>
                                        <div className="fw-semibold" style={{ fontSize: "13px" }}>Failure Notification</div>
                                        <div className="text-muted" style={{ fontSize: "12px" }}>Sent at 12:05 PM if file not received · Manual upload required</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Buttons */}
                <div className="d-flex gap-2 mb-3">
                    {TAB("view", "View Uploaded Files")}
                    {TAB("upload", "Manual Upload")}
                    {TAB("scheduler", "Scheduler Report")}
                </div>

                {/* ── TAB: View Uploaded Files ── */}
                {activeTab === "view" && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body pb-2">
                            <div className="row g-3 align-items-end">
                                <div className="col-lg-2 col-md-4">
                                    <label className="form-label">Vendor</label>
                                    <select className="form-select" value={viewFilter.vendor} onChange={e => { setViewFilter(p => ({ ...p, vendor: e.target.value })); setViewPage(1); }}>
                                        <option value="">All Vendors</option>
                                        <option>Worldline</option>
                                        <option>Hitachi</option>
                                        <option>Sarvatra</option>
                                    </select>
                                </div>
                                <div className="col-lg-2 col-md-4">
                                    <label className="form-label">Txn Type</label>
                                    <select className="form-select" value={viewFilter.txnType} onChange={e => { setViewFilter(p => ({ ...p, txnType: e.target.value })); setViewPage(1); }}>
                                        <option value="">All</option>
                                        <option>POS</option>
                                        <option>UPI</option>
                                        <option>POS/UPI</option>
                                    </select>
                                </div>
                                <div className="col-lg-2 col-md-4">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={viewFilter.status} onChange={e => { setViewFilter(p => ({ ...p, status: e.target.value })); setViewPage(1); }}>
                                        <option value="">All</option>
                                        <option>Success</option>
                                        <option>Failed</option>
                                        <option>Pending Validation</option>
                                    </select>
                                </div>
                                <div className="col-lg-3">
                                    <label className="form-label">Search</label>
                                    <div className="position-relative">
                                        <FaSearch className="position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: "13px" }} />
                                        <input type="text" className="form-control" placeholder="Search by any field..." value={viewFilter.search}
                                            onChange={e => { setViewFilter(p => ({ ...p, search: e.target.value })); setViewPage(1); }}
                                            style={{ paddingLeft: "36px" }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="alert alert-info py-2 mx-3 mb-0" style={{ fontSize: "13px" }}>
                            <strong>Note:</strong> Only <strong>same-day</strong> files can be deleted. Deleting a file will reject all associated requests. If a transaction is already completed, it will be reversed before rejection.
                        </div>

                        {filteredFiles.length === 0 && (
                            <div className="alert alert-warning mx-3 mt-2 py-2" style={{ fontSize: "13px" }}>No files found.</div>
                        )}

                        <div className="table-responsive">
                            <table className="table modern-table align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>File ID</th>
                                        <th>Vendor</th>
                                        <th>Txn Type</th>
                                        <th>File Name</th>
                                        <th>Source</th>
                                        <th>Uploaded At</th>
                                        <th>Records</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filesPage.map((file) => (
                                        <tr key={file.id}>
                                            <td className="fw-semibold text-primary">{file.id}</td>
                                            <td>{file.vendor}</td>
                                            <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>{file.txnType}</span></td>
                                            <td style={{ fontSize: "12px" }}><code>{file.fileName}</code></td>
                                            <td>{file.source}</td>
                                            <td>{file.uploadedAt}</td>
                                            <td>{file.records.toLocaleString("en-IN")}</td>
                                            <td>
                                                <span className={`badge border rounded-pill px-2 ${STATUS_BADGE[file.status] || "bg-secondary-subtle text-secondary border-secondary-subtle"}`} style={{ fontSize: "11px" }}>
                                                    {file.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-outline-primary btn-sm p-0" style={{ width: 30, height: 30 }} title="View Details">
                                                        <FaFolderOpen size={13} />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm p-0"
                                                        style={{ width: 30, height: 30 }}
                                                        title={file.sameDay ? "Delete File" : "Deletion allowed for same-day files only"}
                                                        disabled={!file.sameDay}
                                                        onClick={() => setDeleteConfig({ show: true, file })}
                                                    >
                                                        <FaTrash size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="card-footer bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    Showing {filteredFiles.length === 0 ? 0 : filesIndexFirst + 1} – {Math.min(filesIndexFirst + PAGE_SIZE, filteredFiles.length)} of {filteredFiles.length} records
                                </small>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${viewPage === 1 ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setViewPage(p => p - 1)}>Previous</button>
                                    </li>
                                    {[...Array(filesTotalPages)].map((_, i) => (
                                        <li key={i} className={`page-item ${viewPage === i + 1 ? "active" : ""}`}>
                                            <button className="page-link" onClick={() => setViewPage(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${viewPage === filesTotalPages || filesTotalPages === 0 ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setViewPage(p => p + 1)}>Next</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: Manual Upload ── */}
                {activeTab === "upload" && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            {/* Upload Mode Toggle */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Upload Mode</label>
                                <div className="d-flex gap-2">
                                    {["Desktop", "SFTP"].map(mode => (
                                        <button
                                            key={mode}
                                            className={`btn btn-sm ${uploadMode === mode ? "btn-primary" : "btn-outline-secondary"}`}
                                            onClick={() => setUploadMode(mode)}
                                        >
                                            {mode === "Desktop" ? "Manual – From Desktop" : "Manual – From SFTP"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="alert alert-warning py-2 mb-3" style={{ fontSize: "13px" }}>
                                {uploadMode === "Desktop"
                                    ? <><strong>From Desktop:</strong> Use this when the vendor has sent the file via email. Download from mail and upload here.</>
                                    : <><strong>From SFTP:</strong> Use this when the auto-scheduler failed to pick the file. Manually download from IDBI SFTP and upload here.</>
                                }
                            </div>

                            <div className="row g-3 align-items-end">
                                <div className="col-lg-2 col-md-4">
                                    <label className="form-label">Vendor <span className="text-danger">*</span></label>
                                    <select
                                        className={`form-select ${uploadErrors.vendor ? "is-invalid" : ""}`}
                                        value={uploadForm.vendor}
                                        onChange={e => { setUploadForm(p => ({ ...p, vendor: e.target.value })); setUploadErrors(p => ({ ...p, vendor: "" })); }}
                                    >
                                        <option value="">Select Vendor</option>
                                        <option>Worldline</option>
                                        <option>Hitachi</option>
                                        <option>Sarvatra</option>
                                    </select>
                                    {uploadErrors.vendor && <div className="text-danger small">{uploadErrors.vendor}</div>}
                                </div>

                                <div className="col-lg-2 col-md-4">
                                    <label className="form-label">Txn Type <span className="text-danger">*</span></label>
                                    <select
                                        className={`form-select ${uploadErrors.txnType ? "is-invalid" : ""}`}
                                        value={uploadForm.txnType}
                                        onChange={e => { setUploadForm(p => ({ ...p, txnType: e.target.value })); setUploadErrors(p => ({ ...p, txnType: "" })); }}
                                    >
                                        <option value="">Select Type</option>
                                        <option>POS</option>
                                        <option>UPI</option>
                                    </select>
                                    {uploadErrors.txnType && <div className="text-danger small">{uploadErrors.txnType}</div>}
                                </div>

                                <div className="col-lg-4 col-md-6">
                                    <label className="form-label">Select File <span className="text-danger">*</span></label>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept=".csv,.txt,.xlsx,.xls"
                                        className={`form-control ${uploadErrors.file ? "is-invalid" : ""}`}
                                        onChange={e => { setUploadForm(p => ({ ...p, file: e.target.files[0] || null })); setUploadErrors(p => ({ ...p, file: "" })); }}
                                    />
                                    {uploadErrors.file && <div className="text-danger small">{uploadErrors.file}</div>}
                                </div>

                                <div className="col-lg-2 col-md-4">
                                    <button className="btn btn-primary w-100" onClick={handleUpload}>
                                        <FaFileUpload className="me-2" />Upload
                                    </button>
                                </div>
                            </div>

                            {/* Expected file name hint */}
                            {uploadForm.vendor && uploadForm.txnType && (
                                <div className="alert alert-info py-2 mt-3 mb-0" style={{ fontSize: "13px" }}>
                                    <strong>Expected file name: </strong>
                                    <code>
                                        {VENDOR_INFO.find(v => v.vendor === uploadForm.vendor && (v.txnType === uploadForm.txnType || v.txnType === "POS/UPI"))?.filePattern || "—"}
                                    </code>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB: Scheduler Report ── */}
                {activeTab === "scheduler" && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body pb-2">
                            <div className="col-lg-3">
                                <label className="form-label">Search</label>
                                <div className="position-relative">
                                    <FaSearch className="position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: "13px" }} />
                                    <input type="text" className="form-control" placeholder="Search by any field..."
                                        value={schedSearch} onChange={e => { setSchedSearch(e.target.value); setSchedPage(1); }}
                                        style={{ paddingLeft: "36px" }} />
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table modern-table align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Run Time</th>
                                        <th>Vendor</th>
                                        <th>Txn Type</th>
                                        <th>File Name</th>
                                        <th>Records</th>
                                        <th>Status</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedPageData.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r.runTime}</td>
                                            <td>{r.vendor}</td>
                                            <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>{r.txnType}</span></td>
                                            <td><code style={{ fontSize: "12px" }}>{r.fileName}</code></td>
                                            <td>{r.records > 0 ? r.records.toLocaleString("en-IN") : <span className="text-muted">—</span>}</td>
                                            <td>
                                                <span className={`badge border rounded-pill px-2 ${STATUS_BADGE[r.status] || "bg-secondary-subtle text-secondary border-secondary-subtle"}`} style={{ fontSize: "11px" }}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td>{r.remarks || <span className="text-muted">—</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="card-footer bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    Showing {filteredSched.length === 0 ? 0 : schedIndexFirst + 1} – {Math.min(schedIndexFirst + PAGE_SIZE, filteredSched.length)} of {filteredSched.length} records
                                </small>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${schedPage === 1 ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setSchedPage(p => p - 1)}>Previous</button>
                                    </li>
                                    {[...Array(schedTotalPages)].map((_, i) => (
                                        <li key={i} className={`page-item ${schedPage === i + 1 ? "active" : ""}`}>
                                            <button className="page-link" onClick={() => setSchedPage(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${schedPage === schedTotalPages || schedTotalPages === 0 ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setSchedPage(p => p + 1)}>Next</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirm */}
                <ConfirmModal
                    show={deleteConfig.show}
                    title="Delete File"
                    message={`Are you sure you want to delete "${deleteConfig.file?.fileName}"? All associated requests will be rejected and completed transactions will be reversed.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    type="danger"
                    onConfirm={handleDelete}
                    onClose={() => setDeleteConfig({ show: false, file: null })}
                />

                <AlertModal
                    show={alert.show}
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert({ show: false, type: "", title: "", message: "" })}
                />
            </div>
        </div>
    );
}


export default SFTPFileHandling;
