import React, { useMemo, useState } from "react";
import {
    FaCheckCircle,
    FaCloudDownloadAlt,
    FaExclamationTriangle,
    FaFileUpload,
    FaFolderOpen,
    FaSyncAlt,
    FaTrashAlt,
} from "react-icons/fa";

const vendorFiles = [
    {
        id: "VF-001",
        vendor: "Worldline",
        txnType: "POS",
        fileName: "WL_POS_REFUND_20260702.csv",
        source: "Auto SFTP",
        uploadedAt: "02-Jul-2026 08:10 AM",
        status: "Success",
        records: 1842,
        deletionAllowed: false,
    },
    {
        id: "VF-002",
        vendor: "Sarvatra",
        txnType: "UPI",
        fileName: "SAR_UPI_REFUND_20260702.txt",
        source: "Auto SFTP",
        uploadedAt: "02-Jul-2026 09:05 AM",
        status: "Success",
        records: 928,
        deletionAllowed: false,
    },
    {
        id: "VF-003",
        vendor: "Hitachi",
        txnType: "POS",
        fileName: "HIT_POS_REFUND_20260702.xlsx",
        source: "Desktop Upload",
        uploadedAt: "02-Jul-2026 11:42 AM",
        status: "Pending Validation",
        records: 0,
        deletionAllowed: true,
    },
];

const arnJobs = [
    { vendor: "Worldline", fileName: "WL_ARN_20260702.csv", mode: "Scheduler", status: "Ready to Process" },
    { vendor: "Sarvatra", fileName: "SAR_ARN_20260702.txt", mode: "Manual Check", status: "Not Received" },
    { vendor: "Hitachi", fileName: "HIT_ARN_20260702.xlsx", mode: "Scheduler", status: "Processed" },
];

const statusClass = {
    Success: "bg-success",
    "Pending Validation": "bg-warning text-dark",
    Failed: "bg-danger",
    Processed: "bg-success",
    "Ready to Process": "bg-info text-dark",
    "Not Received": "bg-secondary",
};

function FileHandling() {
    const [filters, setFilters] = useState({ vendor: "", txnType: "", status: "" });

    const filteredFiles = useMemo(
        () =>
            vendorFiles.filter(
                (file) =>
                    (!filters.vendor || file.vendor === filters.vendor) &&
                    (!filters.txnType || file.txnType === filters.txnType) &&
                    (!filters.status || file.status === filters.status)
            ),
        [filters]
    );

    const updateFilter = (event) => {
        const { name, value } = event.target;
        setFilters((current) => ({ ...current, [name]: value }));
    };

    return (
        <div className="container-fluid p-2 mat-page">
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item active">File Handling</li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            <div className="ops-summary-grid mb-3">
                <div className="ops-summary-card">
                    <div className="ops-summary-icon bg-primary-subtle text-primary">
                        <FaCloudDownloadAlt />
                    </div>
                    <div>
                        <span>Auto SFTP Window</span>
                        <strong>08:00 AM - 12:00 PM</strong>
                        <small>Hourly scheduler run</small>
                    </div>
                </div>
                <div className="ops-summary-card">
                    <div className="ops-summary-icon bg-success-subtle text-success">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <span>Files Received Today</span>
                        <strong>2 of 3</strong>
                        <small>12:05 PM mail notification pending</small>
                    </div>
                </div>
                <div className="ops-summary-card">
                    <div className="ops-summary-icon bg-warning-subtle text-warning">
                        <FaExclamationTriangle />
                    </div>
                    <div>
                        <span>Manual Intervention</span>
                        <strong>1 Vendor</strong>
                        <small>Hitachi desktop upload waiting validation</small>
                    </div>
                </div>
                <div className="ops-summary-card">
                    <div className="ops-summary-icon bg-info-subtle text-info">
                        <FaSyncAlt />
                    </div>
                    <div>
                        <span>ARN Handling</span>
                        <strong>1 Ready</strong>
                        <small>Current-day scheduler and menu check</small>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
                    <span>Manual Upload</span>
                    <span className="badge rounded-pill text-bg-light border">DCO only</span>
                </div>
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label className="form-label">Upload Mode</label>
                            <select className="form-select">
                                <option>From SFTP</option>
                                <option>From Desktop</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Vendor</label>
                            <select className="form-select">
                                <option>Worldline</option>
                                <option>Hitachi</option>
                                <option>Sarvatra</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Transaction Type</label>
                            <select className="form-select">
                                <option>POS</option>
                                <option>UPI</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Vendor File</label>
                            <input className="form-control" type="file" accept=".csv,.txt,.xlsx,.xls" />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-primary w-100">
                                <FaFileUpload className="me-2" />
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white fw-semibold">Uploaded Vendor Files</div>
                <div className="card-body border-bottom">
                    <div className="row g-3">
                        <div className="col-md-2">
                            <label className="form-label">Vendor</label>
                            <select className="form-select" name="vendor" value={filters.vendor} onChange={updateFilter}>
                                <option value="">All Vendors</option>
                                <option>Worldline</option>
                                <option>Hitachi</option>
                                <option>Sarvatra</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Transaction Type</label>
                            <select className="form-select" name="txnType" value={filters.txnType} onChange={updateFilter}>
                                <option value="">All</option>
                                <option>POS</option>
                                <option>UPI</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Status</label>
                            <select className="form-select" name="status" value={filters.status} onChange={updateFilter}>
                                <option value="">All Statuses</option>
                                <option>Success</option>
                                <option>Pending Validation</option>
                                <option>Failed</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="table-responsive p-2">
                    <table className="table table-bordered table-hover table-sm align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>File ID</th>
                                <th>Vendor</th>
                                <th>Type</th>
                                <th>File Name</th>
                                <th>Source</th>
                                <th>Uploaded At</th>
                                <th>Records</th>
                                <th>Status</th>
                                <th width="120">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFiles.map((file) => (
                                <tr key={file.id}>
                                    <td className="fw-semibold text-primary">{file.id}</td>
                                    <td>{file.vendor}</td>
                                    <td>{file.txnType}</td>
                                    <td>{file.fileName}</td>
                                    <td>{file.source}</td>
                                    <td>{file.uploadedAt}</td>
                                    <td>{file.records.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${statusClass[file.status] || "bg-secondary"}`}>{file.status}</span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button className="btn btn-outline-primary btn-sm" title="View file details">
                                                <FaFolderOpen />
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                title={file.deletionAllowed ? "Delete same-day file" : "Deletion locked after processing"}
                                                disabled={!file.deletionAllowed}
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white fw-semibold">ARN File Handling</div>
                <div className="table-responsive p-2">
                    <table className="table table-bordered table-hover table-sm align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Vendor</th>
                                <th>ARN File</th>
                                <th>Mode</th>
                                <th>Status</th>
                                <th width="150">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {arnJobs.map((job) => (
                                <tr key={`${job.vendor}-${job.fileName}`}>
                                    <td>{job.vendor}</td>
                                    <td>{job.fileName}</td>
                                    <td>{job.mode}</td>
                                    <td>
                                        <span className={`badge ${statusClass[job.status] || "bg-secondary"}`}>{job.status}</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline-primary btn-sm" disabled={job.status === "Not Received"}>
                                            <FaSyncAlt className="me-1" />
                                            Process
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default FileHandling;
