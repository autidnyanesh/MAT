import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/tableAlign.css";
import { FaSearch, FaFileExcel, FaCloudUploadAlt, FaSyncAlt, FaCheckCircle } from "react-icons/fa";
import AlertModal from "../components/AlertModel";
import ConfirmModal from "../components/ComfirmModel";

// ── Sample success transactions for upload to vendor ─────────────────────────
const SAMPLE_SUCCESS_TXN = [
    { requestId: "REQ0001", vendor: "Worldline", txnType: "POS", rrn: "123456789", txnDate: "10-Jun-2026", txnAmount: "₹ 1,500", refundAmount: "₹ 1,500", custId: "CUST1001", accountNo: "XXXX1234", mid: "MID12345", tid: "TID001", processedDate: "11-Jun-2026" },
    { requestId: "REQ0004", vendor: "Worldline", txnType: "POS", rrn: "111111111", txnDate: "07-Jun-2026", txnAmount: "₹ 2,000", refundAmount: "₹ 2,000", custId: "CUST1004", accountNo: "XXXX4444", mid: "MID44444", tid: "TID004", processedDate: "08-Jun-2026" },
    { requestId: "REQ0006", vendor: "Sarvatra", txnType: "UPI", rrn: "333333333", txnDate: "05-Jun-2026", txnAmount: "₹ 3,500", refundAmount: "₹ 3,500", custId: "CUST1006", accountNo: "XXXX6666", mid: "MID66666", tid: "TID006", processedDate: "06-Jun-2026" },
    { requestId: "REQ0007", vendor: "Hitachi", txnType: "POS", rrn: "444444444", txnDate: "04-Jun-2026", txnAmount: "₹ 1,800", refundAmount: "₹ 1,800", custId: "CUST1007", accountNo: "XXXX7777", mid: "MID77777", tid: "TID007", processedDate: "05-Jun-2026" },
];

// ── Sample ARN files available on vendor SFTP ─────────────────────────────────
const SAMPLE_ARN_FILES = [
    { fileId: "ARN-001", vendor: "Worldline", txnType: "POS", fileName: "WL_ARN_02072026.txt", detectedAt: "02-Jul-2026 10:15 AM", records: 2, status: "Ready" },
    { fileId: "ARN-002", vendor: "Hitachi", txnType: "POS", fileName: "IDI_ARN_Card_02072026.xlsx", detectedAt: "02-Jul-2026 10:20 AM", records: 1, status: "Processed" },
    { fileId: "ARN-003", vendor: "Sarvatra", txnType: "UPI", fileName: "—", detectedAt: "—", records: 0, status: "Not Received" },
];

// ── Sample ARN processing results ────────────────────────────────────────────
const SAMPLE_ARN_RESULTS = [
    { requestId: "REQ0001", rrn: "123456789", mid: "MID12345", vendor: "Worldline", arn: "ARN123456", arnDate: "02-Jul-2026", status: "ARN Updated" },
    { requestId: "REQ0004", rrn: "111111111", mid: "MID44444", vendor: "Worldline", arn: "ARN222222", arnDate: "02-Jul-2026", status: "ARN Updated" },
    { requestId: "REQ0007", rrn: "444444444", mid: "MID77777", vendor: "Hitachi", arn: "", arnDate: "02-Jul-2026", status: "Vendor Rejected", rejectionReason: "Out of time frame for processing refund" },
];

const PAGE_SIZE = 10;

const STATUS_BADGE = {
    "ARN Updated": "bg-success-subtle text-success border-success-subtle",
    "Vendor Rejected": "bg-danger-subtle text-danger border-danger-subtle",
    "Ready": "bg-info-subtle text-info border-info-subtle",
    "Processed": "bg-success-subtle text-success border-success-subtle",
    "Not Received": "bg-secondary-subtle text-secondary border-secondary-subtle",
    "Pending at Branch End": "bg-warning-subtle text-warning border-warning-subtle",
};

function ARNFileHandling() {
    const [activeTab, setActiveTab] = useState("upload-success");

    // ── Upload success to vendor ──────────────────────────────────────────────
    const [successFilter, setSuccessFilter] = useState({ vendor: "", txnType: "", search: "" });
    const [successPage, setSuccessPage] = useState(1);
    const [checkedIds, setCheckedIds] = useState([]);
    const [uploadConfirm, setUploadConfirm] = useState(false);

    // ── ARN file processing ───────────────────────────────────────────────────
    const [arnFiles, setArnFiles] = useState(SAMPLE_ARN_FILES);
    const [arnResults, setArnResults] = useState(SAMPLE_ARN_RESULTS);
    const [arnSearch, setArnSearch] = useState("");
    const [arnResultSearch, setArnResultSearch] = useState("");
    const [processConfirm, setProcessConfirm] = useState({ show: false, file: null });
    const [checkConfirm, setCheckConfirm] = useState(false);

    // ── alert ─────────────────────────────────────────────────────────────────
    const [alert, setAlert] = useState({ show: false, type: "", title: "", message: "" });
    const showAlert = (type, title, message) => setAlert({ show: true, type, title, message });

    // ── success txn filter ────────────────────────────────────────────────────
    const filteredSuccess = SAMPLE_SUCCESS_TXN.filter(r => {
        const s = successFilter.search.toLowerCase();
        return (
            (!successFilter.vendor || r.vendor === successFilter.vendor) &&
            (!successFilter.txnType || r.txnType === successFilter.txnType) &&
            (!s || Object.values(r).join(" ").toLowerCase().includes(s))
        );
    });
    const successTotalPages = Math.ceil(filteredSuccess.length / PAGE_SIZE);
    const successIndexFirst = (successPage - 1) * PAGE_SIZE;
    const successPageData = filteredSuccess.slice(successIndexFirst, successIndexFirst + PAGE_SIZE);
    const allPageChecked = successPageData.length > 0 && successPageData.every(r => checkedIds.includes(r.requestId));

    const toggleAll = () => {
        if (allPageChecked) setCheckedIds(prev => prev.filter(id => !successPageData.find(r => r.requestId === id)));
        else setCheckedIds(prev => [...new Set([...prev, ...successPageData.map(r => r.requestId)])]);
    };
    const toggleOne = (id) => setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleUploadToVendor = () => {
        setCheckedIds([]);
        setUploadConfirm(false);
        showAlert("success", "File Uploaded to Vendor SFTP", `${checkedIds.length} transaction(s) exported and uploaded to vendor SFTP successfully.`);
    };

    // ── ARN file processing ───────────────────────────────────────────────────
    const filteredArnFiles = arnFiles.filter(f =>
        !arnSearch.trim() || Object.values(f).join(" ").toLowerCase().includes(arnSearch.toLowerCase())
    );

    const filteredArnResults = arnResults.filter(r =>
        !arnResultSearch.trim() || Object.values(r).join(" ").toLowerCase().includes(arnResultSearch.toLowerCase())
    );

    const handleProcessARN = () => {
        setArnFiles(prev => prev.map(f => f.fileId === processConfirm.file.fileId ? { ...f, status: "Processed" } : f));
        setProcessConfirm({ show: false, file: null });
        showAlert("success", "ARN File Processed", `ARN file processed. ARN values updated in database. File moved to DONE folder on SFTP. Vendor-rejected requests notified to branches via email.`);
    };

    const handleCheckSFTP = () => {
        setCheckConfirm(false);
        showAlert("info", "SFTP Check Complete", "Vendor SFTP checked for ARN files. New files detected and listed below.");
    };

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
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">File Handling</li>
                    <li className="breadcrumb-item active">ARN File Handling</li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            <div className="d-flex gap-2 mb-3">
                {TAB("upload-success", "Upload Success Transactions to Vendor")}
                {TAB("arn-process", "ARN File Processing")}
            </div>

            {/* ── TAB: Upload Success Transactions to Vendor ── */}
            {activeTab === "upload-success" && (
                <div className="card border-0 shadow-sm">
                    <div className="card-body pb-2">
                        <div className="alert alert-info py-2 mb-3" style={{ fontSize: "13px" }}>
                            <strong>Note:</strong> Select the successfully processed transactions below, validate, and upload the generated file to the vendor-specific SFTP folder. The exported file will include the <strong>Request ID</strong> column appended to the standard format.
                        </div>
                        <div className="row g-3 align-items-end">
                            <div className="col-lg-2 col-md-4">
                                <label className="form-label">Vendor</label>
                                <select className="form-select" value={successFilter.vendor} onChange={e => { setSuccessFilter(p => ({ ...p, vendor: e.target.value })); setSuccessPage(1); }}>
                                    <option value="">All Vendors</option>
                                    <option>Worldline</option>
                                    <option>Hitachi</option>
                                    <option>Sarvatra</option>
                                </select>
                            </div>
                            <div className="col-lg-2 col-md-4">
                                <label className="form-label">Txn Type</label>
                                <select className="form-select" value={successFilter.txnType} onChange={e => { setSuccessFilter(p => ({ ...p, txnType: e.target.value })); setSuccessPage(1); }}>
                                    <option value="">All</option>
                                    <option>POS</option>
                                    <option>UPI</option>
                                </select>
                            </div>
                            <div className="col-lg-3">
                                <label className="form-label">Search</label>
                                <div className="position-relative">
                                    <FaSearch className="position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: "13px" }} />
                                    <input type="text" className="form-control" placeholder="Search by any field..."
                                        value={successFilter.search} onChange={e => { setSuccessFilter(p => ({ ...p, search: e.target.value })); setSuccessPage(1); }}
                                        style={{ paddingLeft: "36px" }} />
                                </div>
                            </div>
                            <div className="col-lg-3 d-flex gap-2">
                                <button className="btn btn-success btn-sm px-3" disabled={checkedIds.length === 0} onClick={() => setUploadConfirm(true)}>
                                    <FaCloudUploadAlt className="me-1" />Upload to Vendor SFTP ({checkedIds.length})
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table modern-table align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 45 }}>
                                        <input type="checkbox" className="form-check-input" style={{ border: "1px solid #bebebe" }}
                                            checked={allPageChecked} onChange={toggleAll} />
                                    </th>
                                    <th>Request ID</th>
                                    <th>Vendor</th>
                                    <th>Txn Type</th>
                                    <th>RRN</th>
                                    <th>Date of Txn</th>
                                    <th>Txn Amount</th>
                                    <th>Refund Amount</th>
                                    <th>Cust ID</th>
                                    <th>Account No</th>
                                    <th>MID</th>
                                    <th>TID</th>
                                    <th>Processed Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {successPageData.length === 0 ? (
                                    <tr><td colSpan="13" className="text-center py-4 text-muted">No records found.</td></tr>
                                ) : successPageData.map(r => (
                                    <tr key={r.requestId}>
                                        <td>
                                            <input type="checkbox" className="form-check-input" style={{ border: "1px solid #bebebe" }}
                                                checked={checkedIds.includes(r.requestId)} onChange={() => toggleOne(r.requestId)} />
                                        </td>
                                        <td className="fw-semibold text-primary">{r.requestId}</td>
                                        <td>{r.vendor}</td>
                                        <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>{r.txnType}</span></td>
                                        <td>{r.rrn}</td>
                                        <td>{r.txnDate}</td>
                                        <td>{r.txnAmount}</td>
                                        <td>{r.refundAmount}</td>
                                        <td>{r.custId}</td>
                                        <td>{r.accountNo}</td>
                                        <td>{r.mid}</td>
                                        <td>{r.tid}</td>
                                        <td>{r.processedDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="card-footer bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Showing {filteredSuccess.length === 0 ? 0 : successIndexFirst + 1} – {Math.min(successIndexFirst + PAGE_SIZE, filteredSuccess.length)} of {filteredSuccess.length} records
                            </small>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${successPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setSuccessPage(p => p - 1)}>Previous</button>
                                </li>
                                {[...Array(successTotalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${successPage === i + 1 ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => setSuccessPage(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${successPage === successTotalPages || successTotalPages === 0 ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setSuccessPage(p => p + 1)}>Next</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: ARN File Processing ── */}
            {activeTab === "arn-process" && (
                <>
                    {/* ARN Files on SFTP */}
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body pb-2">
                            <div className="alert alert-info py-2 mb-3" style={{ fontSize: "13px" }}>
                                <strong>Note:</strong> The scheduler checks vendor SFTP for ARN files daily (current date only). Back-dated files must be processed manually using the <strong>Check SFTP</strong> button. On processing, ARN values are updated in the database and the file is moved to the <code>DONE</code> folder. Vendor-rejected requests are notified to branches via email and marked as <strong>Pending at Branch End</strong>.
                            </div>
                            <div className="d-flex justify-content-between align-items-end flex-wrap gap-2">
                                <div style={{ minWidth: "260px" }}>
                                    <label className="form-label">Search</label>
                                    <div className="position-relative">
                                        <FaSearch className="position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: "13px" }} />
                                        <input type="text" className="form-control" placeholder="Search by any field..."
                                            value={arnSearch} onChange={e => setArnSearch(e.target.value)}
                                            style={{ paddingLeft: "36px" }} />
                                    </div>
                                </div>
                                <button className="btn btn-outline-primary btn-sm px-3" onClick={() => setCheckConfirm(true)}>
                                    <FaSyncAlt className="me-1" />Check SFTP for ARN Files
                                </button>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table modern-table align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>File ID</th>
                                        <th>Vendor</th>
                                        <th>Txn Type</th>
                                        <th>ARN File Name</th>
                                        <th>Detected At</th>
                                        <th>Records</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredArnFiles.map(f => (
                                        <tr key={f.fileId}>
                                            <td className="fw-semibold text-primary">{f.fileId}</td>
                                            <td>{f.vendor}</td>
                                            <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2" style={{ fontSize: "11px" }}>{f.txnType}</span></td>
                                            <td><code style={{ fontSize: "12px" }}>{f.fileName}</code></td>
                                            <td>{f.detectedAt}</td>
                                            <td>{f.records > 0 ? f.records : <span className="text-muted">—</span>}</td>
                                            <td>
                                                <span className={`badge border rounded-pill px-2 ${STATUS_BADGE[f.status] || "bg-secondary-subtle text-secondary border-secondary-subtle"}`} style={{ fontSize: "11px" }}>
                                                    {f.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-outline-primary btn-sm px-3"
                                                    disabled={f.status !== "Ready"}
                                                    onClick={() => setProcessConfirm({ show: true, file: f })}
                                                >
                                                    <FaCheckCircle className="me-1" />Process
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ARN Processing Results */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white fw-semibold" style={{ fontSize: "13px" }}>
                            ARN Processing Results
                        </div>
                        <div className="card-body pb-2">
                            <div className="col-lg-3">
                                <label className="form-label">Search</label>
                                <div className="position-relative">
                                    <FaSearch className="position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: "13px" }} />
                                    <input type="text" className="form-control" placeholder="Search by any field..."
                                        value={arnResultSearch} onChange={e => setArnResultSearch(e.target.value)}
                                        style={{ paddingLeft: "36px" }} />
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table modern-table align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Request ID</th>
                                        <th>RRN</th>
                                        <th>MID</th>
                                        <th>Vendor</th>
                                        <th>ARN</th>
                                        <th>ARN Date</th>
                                        <th>Status</th>
                                        <th>Rejection Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredArnResults.map(r => (
                                        <tr key={r.requestId}>
                                            <td className="fw-semibold text-primary">{r.requestId}</td>
                                            <td>{r.rrn}</td>
                                            <td>{r.mid}</td>
                                            <td>{r.vendor}</td>
                                            <td>{r.arn ? <span className="fw-semibold text-success">{r.arn}</span> : <span className="text-muted">—</span>}</td>
                                            <td>{r.arnDate}</td>
                                            <td>
                                                <span className={`badge border rounded-pill px-2 ${STATUS_BADGE[r.status] || "bg-secondary-subtle text-secondary border-secondary-subtle"}`} style={{ fontSize: "11px" }}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td>
                                                {r.rejectionReason
                                                    ? <span className="text-danger fw-semibold" style={{ fontSize: "12px" }}>{r.rejectionReason}</span>
                                                    : <span className="text-muted">—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Upload to Vendor Confirm */}
            <ConfirmModal
                show={uploadConfirm}
                title="Upload to Vendor SFTP"
                message={`Generate and upload success transaction file for ${checkedIds.length} selected request(s) to vendor SFTP?`}
                confirmText="Upload"
                cancelText="Cancel"
                type="primary"
                onConfirm={handleUploadToVendor}
                onClose={() => setUploadConfirm(false)}
            />

            {/* Process ARN Confirm */}
            <ConfirmModal
                show={processConfirm.show}
                title="Process ARN File"
                message={`Process ARN file "${processConfirm.file?.fileName}"? ARN values will be updated in the database and the file will be moved to the DONE folder. Vendor-rejected requests will be notified to branches via email.`}
                confirmText="Process"
                cancelText="Cancel"
                type="primary"
                onConfirm={handleProcessARN}
                onClose={() => setProcessConfirm({ show: false, file: null })}
            />

            {/* Check SFTP Confirm */}
            <ConfirmModal
                show={checkConfirm}
                title="Check SFTP for ARN Files"
                message="This will check all vendor SFTP folders for available ARN files. Proceed?"
                confirmText="Check"
                cancelText="Cancel"
                type="primary"
                onConfirm={handleCheckSFTP}
                onClose={() => setCheckConfirm(false)}
            />

            <AlertModal
                show={alert.show}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert({ show: false, type: "", title: "", message: "" })}
            />
        </div>
    );
}

export default ARNFileHandling;
