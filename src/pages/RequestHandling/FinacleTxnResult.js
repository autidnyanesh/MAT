import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaDownload } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/tableAlign.css";

const FinacleTxnResult = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // state = { results: [...], submittedAt: "..." }
    const results = state?.results || [];
    const submittedAt = state?.submittedAt || new Date().toLocaleString();

    const successCount = results.filter(r => r.finacleStatus === "SUCCESS").length;
    const failedCount = results.length - successCount;

    const exportCSV = () => {
        const headers = ["Request ID", "Account No", "Txn Type", "Refund Amount", "Finacle Status", "Finacle Ref No", "Error Message"];
        const rows = results.map(r => [
            r.requestId, r.accountNo, r.txnType,
            r.refundAmt, r.finacleStatus,
            r.finacleRefNo || "", r.errorMessage || ""
        ]);
        const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `finacle_txn_result_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!results.length) {
        return (
            <div className="container-fluid p-4 text-center text-muted">
                No transaction results found.{" "}
                <span className="text-primary" style={{ cursor: "pointer" }} onClick={() => navigate("/dco-checker-approval-queue")}>
                    Go back
                </span>
            </div>
        );
    }

    return (
        <div className="container-fluid p-2">
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">Request Handling</li>
                    <li className="breadcrumb-item">DCO Checker Approval Queue</li>
                    <li className="breadcrumb-item active">Finacle Transaction Result</li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            {/* Summary Banner */}
            <div className="row g-3 mb-3">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center py-3" style={{ borderRadius: "10px", background: "#f0fdf4" }}>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#16a34a" }}>{results.length}</div>
                        <div className="text-muted" style={{ fontSize: "12px" }}>Total Submitted</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center py-3" style={{ borderRadius: "10px", background: "#f0fdf4" }}>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#16a34a" }}>{successCount}</div>
                        <div className="text-muted" style={{ fontSize: "12px" }}>Finacle Success</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center py-3" style={{ borderRadius: "10px", background: failedCount > 0 ? "#fef2f2" : "#f0fdf4" }}>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: failedCount > 0 ? "#dc2626" : "#16a34a" }}>{failedCount}</div>
                        <div className="text-muted" style={{ fontSize: "12px" }}>Finacle Failed</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center py-3" style={{ borderRadius: "10px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>{submittedAt}</div>
                        <div className="text-muted" style={{ fontSize: "12px" }}>Submitted At</div>
                    </div>
                </div>
            </div>

            {/* Alert if any failed */}
            {failedCount > 0 && (
                <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "13px" }}>
                    <strong>{failedCount} transaction(s) failed</strong> in Finacle. Failed requests remain in the queue for retry. Please check the error messages below.
                </div>
            )}
            {failedCount === 0 && (
                <div className="alert alert-success py-2 mb-3" style={{ fontSize: "13px" }}>
                    <FaCheckCircle className="me-1" />
                    All <strong>{successCount} transaction(s)</strong> processed successfully in Finacle.
                </div>
            )}

            {/* Results Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3">
                    <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>
                        Finacle API Response — {results.length} Request(s)
                    </span>
                    <button className="btn btn-outline-secondary btn-sm" onClick={exportCSV}>
                        <FaDownload className="me-1" /> Export CSV
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table modern-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Request ID</th>
                                <th>Account No</th>
                                <th>Txn Type</th>
                                <th>Refund Amount</th>
                                <th>Finacle Status</th>
                                <th>Finacle Ref No</th>
                                <th>Error / Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={r.requestId}>
                                    <td className="text-muted" style={{ fontSize: "12px" }}>{i + 1}</td>
                                    <td className="fw-semibold" style={{ fontSize: "13px" }}>{r.requestId}</td>
                                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{r.accountNo}</td>
                                    <td>
                                        <span className={`badge bg-${r.txnType === "UPI" ? "info" : "secondary"}-subtle text-${r.txnType === "UPI" ? "info" : "secondary"} border border-${r.txnType === "UPI" ? "info" : "secondary"}-subtle rounded-pill px-2`} style={{ fontSize: "11px" }}>
                                            {r.txnType}
                                        </span>
                                    </td>
                                    <td className="fw-semibold">₹ {Number(r.refundAmt).toLocaleString("en-IN")}</td>
                                    <td>
                                        {r.finacleStatus === "SUCCESS" ? (
                                            <span className="d-flex align-items-center gap-1 text-success fw-semibold" style={{ fontSize: "13px" }}>
                                                <FaCheckCircle /> SUCCESS
                                            </span>
                                        ) : (
                                            <span className="d-flex align-items-center gap-1 text-danger fw-semibold" style={{ fontSize: "13px" }}>
                                                <FaTimesCircle /> FAILED
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                                        {r.finacleRefNo || <span className="text-muted">—</span>}
                                    </td>
                                    <td style={{ fontSize: "12px", color: r.errorMessage ? "#dc2626" : "#6c757d" }}>
                                        {r.errorMessage || (r.finacleStatus === "SUCCESS" ? "Transaction processed successfully" : "—")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="d-flex gap-2 mt-3">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/dco-checker-approval-queue")}>
                    <FaArrowLeft className="me-1" /> Back to Approval Queue
                </button>
            </div>
        </div>
    );
};

export default FinacleTxnResult;
