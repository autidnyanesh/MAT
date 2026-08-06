import React, { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AlertModal from "../../../components/AlertModel";
import ConfirmModal from "../../../components/ComfirmModel";
import RequestFormFields from "../../../components/RequestFormFields";
import api from "../../../api/axiosConfig";
import { sanitizeInput, validateFile } from "../../../utils/sanitize";
import "../../../styles/tableAlign.css";
import RequestDetailsModal from "../../../components/RequestDetailsModal";

const SAMPLE_REQUESTS = [
    { requestId: "REQ0001", txnType: "UPI", customerId: "CUST1001", accountNo: "1234567890", sol: "1001", mid: "MID12345", tid: "TID001", dateRaised: "09-07-2026", rrn: "RRN001", dateTxn: "2026-06-10", tranAmount: 1500, refundAmt: 1500, gateTxnId: "GTX001", merchantVPA: "merchant@upi", stage: "BH Approval", status: "Pending", documentName: "receipt_001.pdf", documentUrl: "#" },
    { requestId: "REQ0002", txnType: "CARD", customerId: "CUST1002", accountNo: "9876543210", sol: "1002", mid: "MID56789", tid: "TID002", dateRaised: "09-07-2026", rrn: "RRN002", dateTxn: "2026-06-09", tranAmount: 2500, refundAmt: 2500, cardNum: "XXXX-XXXX-XXXX-1234", authCode: "AUTH002", scheme: "VISA", stage: "Completed", status: "Approved", documentName: "receipt_002.pdf", documentUrl: "#" },
    { requestId: "REQ0003", txnType: "UPI", customerId: "CUST1003", accountNo: "1122334455", sol: "1003", mid: "MID99999", tid: "TID003", dateRaised: "09-07-2026", rrn: "RRN003", dateTxn: "2026-06-08", tranAmount: 5000, refundAmt: 5000, gateTxnId: "GTX003", merchantVPA: "store@upi", stage: "DCO Review", status: "Rejected", documentName: null, documentUrl: null },
    { requestId: "REQ0004", txnType: "UPI", customerId: "CUST1004", accountNo: "2233445566", sol: "1004", mid: "MID44444", tid: "TID004", dateRaised: "09-07-2026", rrn: "RRN004", dateTxn: "2026-06-07", tranAmount: 1200, refundAmt: 1200, gateTxnId: "GTX004", merchantVPA: "pay@upi", stage: "SOM Approval", status: "Pending", documentName: "receipt_004.jpg", documentUrl: "#" },
];

const RECORDS_PER_PAGE = 10;

const MyRequest = () => {
    // NOTE: added the setter here — it didn't exist before, so a successful
    // delete had no way to ever remove the row from this table.
    const [allRequests, setAllRequests] = useState(SAMPLE_REQUESTS);
    const [currentPage, setCurrentPage] = useState(1);

    // modal mode: "view" | "edit" | null
    const [modalMode, setModalMode] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // validation state — only TID is fetch-validated in edit mode.
    // Customer ID / MID / RRN / Account No were fixed when the request was
    // first raised, so they're shown read-only instead of re-editable.
    const [errors, setErrors] = useState({});
    const [tidStatus, setTidStatus] = useState("");
    const [tidError, setTidError] = useState("");
    const [fetchingTid, setFetchingTid] = useState(false);
    const fileRef = useRef(null);

    const [filters, setFilters] = useState({ search: "" });
    const [filterErrors, setFilterErrors] = useState({});

    const [alertConfig, setAlertConfig] = useState({ show: false, title: "", message: "", type: "success" });
    const [confirmConfig, setConfirmConfig] = useState({ show: false, requestId: null });

    // ── Filter + Pagination ──────────────────────────────────────────────────
    const filteredRequests = filters.search.trim()
        ? allRequests.filter(r =>
            Object.values(r).some(v =>
                String(v ?? "").toLowerCase().includes(filters.search.trim().toLowerCase())
            )
        )
        : allRequests;
    const totalPages = Math.ceil(filteredRequests.length / RECORDS_PER_PAGE);
    const indexOfFirst = (currentPage - 1) * RECORDS_PER_PAGE;
    const currentRecords = filteredRequests.slice(indexOfFirst, indexOfFirst + RECORDS_PER_PAGE);



    // ── Open modal ───────────────────────────────────────────────────────────
    const openViewModal = (request) => {
        setSelectedRequest(request);
        setShowDetails(true);
    };

    const openEditModal = (request) => {
        setSelectedRequest({
            ...request,
            custId: request.customerId
        });

        setModalMode("edit");

        setErrors({});
        setTidStatus("valid");
        setTidError("");
    };

    const closeModal = () => { setModalMode(null); setSelectedRequest(null); };

    // ── Field change in edit mode (TID / Refund Amount only) ──────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedRequest(prev => ({ ...prev, [name]: sanitizeInput(value) }));
        if (name === "tid") { setTidStatus(""); setTidError(""); }
    };

    // ── API calls ────────────────────────────────────────────────────────────
    const validateTid = async () => {
        if (!selectedRequest?.tid?.trim()) { setTidError("TID is required"); return; }
        setFetchingTid(true); setTidError(""); setTidStatus("");
        try {
            const res = await api.get(`/api/terminal/${sanitizeInput(selectedRequest.tid)}?mid=${sanitizeInput(selectedRequest.mid)}`);
            if (res.data) { setTidStatus("valid"); }
            else { setTidStatus("invalid"); setTidError("TID not found for the given MID"); }
        } catch { setTidStatus("invalid"); setTidError("TID not found for the given MID"); }
        finally { setFetchingTid(false); }
    };

    // ── Validate & Submit — same rules as the Raise Request page ──────────────
    const validateEdit = () => {
        const e = {};
        if (!selectedRequest.tid?.trim()) e.tid = "TID is required";
        if (tidStatus !== "valid") e.tid = "Please validate TID";
        if (!String(selectedRequest.refundAmt ?? "").trim()) e.refundAmt = "Refund Amount is required";
        if (selectedRequest.refundAmt && Number(selectedRequest.refundAmt) <= 0) {
            e.refundAmt = "Refund Amount must be greater than zero";
        }
        if (selectedRequest.refundAmt && Number(selectedRequest.refundAmt) > Number(selectedRequest.tranAmount)) {
            e.refundAmt = `Refund Amount cannot exceed maximum refundable amount of ₹ ${Number(selectedRequest.tranAmount).toLocaleString()}`;
        }
        // A document already exists from the original submission, so a new
        // upload here is optional — only validate it if one was chosen.
        const fileError = validateFile(fileRef.current?.files?.[0], { optional: true });
        if (fileError) e.uDocument = fileError;
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleUpdate = async () => {
        if (!validateEdit()) return;
        try {
            await api.put(`/api/request/${selectedRequest.requestId}`, selectedRequest);
            setAllRequests(prev => prev.map(r => r.requestId === selectedRequest.requestId ? { ...r, ...selectedRequest } : r));
            setAlertConfig({ show: true, title: "Request Updated", message: `Request ID ${selectedRequest.requestId} updated successfully.`, type: "success" });
            closeModal();
        } catch {
            setAlertConfig({ show: true, title: "Update Failed", message: "Unable to update request.", type: "error" });
        }
    };

    const handleDelete = async () => {
        try {
            const response = await api.delete(`/api/request/${confirmConfig.requestId}`);

            if (response.status === 200 || response.status === 204) {
                setAlertConfig({
                    show: true,
                    title: "Request Deleted",
                    message: `Request ID ${confirmConfig.requestId} deleted successfully.`,
                    type: "success"
                });

                // Remove the deleted row locally instead of calling an
                // undefined fetchRequests() — swap this for a real refetch
                // once GET /api/requests is wired up.
                setAllRequests(prev => prev.filter(r => r.requestId !== confirmConfig.requestId));
            } else {
                setAlertConfig({
                    show: true,
                    title: "Delete Failed",
                    message: response.data?.message || "Unable to delete request.",
                    type: "error"
                });
            }
        } catch (error) {
            setAlertConfig({
                show: true,
                title: "Delete Failed",
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to delete request.",
                type: "error"
            });
        } finally {
            setConfirmConfig({
                show: false,
                requestId: null
            });
        }
    };

    const requestFields = selectedRequest
        ? [
            {
                label: "Customer ID",
                value: selectedRequest.customerId
            },
            {
                label: "Account Number",
                value: selectedRequest.accountNo
            },
            {
                label: "RRN",
                value: selectedRequest.rrn
            },
            {
                label: "MID",
                value: selectedRequest.mid
            },
            {
                label: "TID",
                value: selectedRequest.tid
            },
            {
                label: "Refund Amount",
                value: selectedRequest.refundAmt
            },
            {
                label: "Transaction Amount",
                value: selectedRequest.tranAmount
            }
        ]
        : [];

    const closeDetailsModal = () => {
        setShowDetails(false);
        setSelectedRequest(null);
    };
    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="container-fluid p-2">
            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">Request Handling</li>
                    <li
                        className="breadcrumb-item active fw-semibold text-primary"
                        aria-current="page"
                    >
                        View Requests</li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="row g-4">
                        <div className="col-lg-3">
                            <label className="form-label">Search</label>
                            <div className="position-relative">
                                <FaSearch
                                    className="position-absolute"
                                    style={{
                                        left: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#6c757d",
                                        fontSize: "14px"
                                    }}
                                />
                                <input
                                    type="text"
                                    className={`form-control ${filterErrors.search ? "is-invalid" : ""}`}
                                    placeholder="Search by any field..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ search: e.target.value })}
                                    style={{ paddingLeft: "38px" }}
                                />
                            </div>
                            {filterErrors.search && <div className="text-danger small">{filterErrors.search}</div>}
                        </div>


                    </div>
                </div>

                <div
                    className="alert alert-warning py-2 m-2"
                    style={{ fontSize: "13px" }}
                >
                    <strong>Note:</strong> The requests listed below were raised within the last <strong>90 days</strong>.
                    <strong> Modify</strong> and <strong>Delete</strong> actions are available only for requests that have <strong>not yet received any approval</strong>.
                </div>

                {filteredRequests.length === 0 && (
                    <div className="alert alert-info m-2 py-2" style={{ fontSize: "13px" }}>No requests found.</div>
                )}

                <div className="table-responsive">
                    <table className="table modern-table align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>No.</th>
                                <th>Request ID</th>
                                <th>Request Raised Date</th>
                                <th>RRN</th>
                                <th>Date of Txn</th>
                                <th>Txn Amt (₹)</th>
                                <th>Refund Amt (₹)</th>
                                <th>Cust ID</th>
                                <th>Account No</th>
                                <th>Gateway Txn ID</th>
                                <th>Reference Document</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((req, idx) => (
                                <tr key={req.requestId}>
                                    <td>{indexOfFirst + idx + 1}</td>
                                    <td>
                                        <span
                                            className="text-primary fw-semibold"
                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                            onClick={() => openViewModal(req)}
                                        >
                                            {req.requestId}
                                        </span>
                                    </td>
                                    <td>{req.dateRaised}</td>
                                    <td>{req.rrn}</td>
                                    <td>{req.dateTxn}</td>
                                    <td>{req.tranAmount?.toLocaleString("en-IN")}</td>
                                    <td>{req.refundAmt?.toLocaleString("en-IN")}</td>
                                    <td>{req.customerId}</td>
                                    <td>{req.accountNo}</td>
                                    <td>{req.gateTxnId || <span className="text-muted">—</span>}</td>
                                    <td>
                                        {req.documentName
                                            ? <a href={req.documentUrl || "#"} target="_blank" rel="noreferrer" className="text-primary" style={{ textDecoration: "underline" }}>{req.documentName}</a>
                                            : <span className="text-muted">—</span>}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            {req.status === "Pending" && (
                                                <button className="btn btn-outline-warning btn-sm p-0" style={{ width: 30, height: 30 }} title="Modify" onClick={() => openEditModal(req)}>
                                                    <FaEdit size={13} />
                                                </button>
                                            )}
                                            {req.status === "Pending" && (
                                                <button className="btn btn-outline-danger btn-sm p-0" style={{ width: 30, height: 30 }} title="Delete" onClick={() => setConfirmConfig({ show: true, requestId: req.requestId })}>
                                                    <FaTrash size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="card-footer bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Showing {filteredRequests.length === 0 ? 0 : indexOfFirst + 1}–{Math.min(indexOfFirst + RECORDS_PER_PAGE, filteredRequests.length)} of {filteredRequests.length} requests
                        </small>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            {/* ── View / Edit Modal ── */}
            {modalMode === "edit" && selectedRequest && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
                            <div className="modal-header py-2" style={{ borderBottom: "1px solid #e9ecef" }}>
                                <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>
                                    {selectedRequest.requestId} &nbsp;<span className="badge bg-secondary" style={{ fontSize: "11px" }}>{selectedRequest.txnType}</span>
                                </span>
                                <button className="btn-close" onClick={closeModal} />
                            </div>

                            <div className="modal-body p-3">
                                <RequestFormFields
                                    mode="edit"
                                    formData={selectedRequest}
                                    errors={errors}
                                    onChange={handleChange}
                                    tidStatus={tidStatus}
                                    tidError={tidError}
                                    fetchingTid={fetchingTid}
                                    onValidateTid={validateTid}
                                    fileRef={fileRef}
                                    onFileChange={(e) => setSelectedRequest(prev => ({ ...prev, uDocument: e.target.files[0] }))}
                                />
                            </div>

                            {modalMode === "edit" && (
                                <div className="modal-footer">
                                    <button className="btn btn-primary" onClick={handleUpdate}>Update Request</button>
                                    <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <RequestDetailsModal
                show={showDetails}
                request={selectedRequest}
                onClose={closeDetailsModal}
                title="Request Details"
                firstDateLabel="Request Raised Date"
                firstDateValue={selectedRequest?.dateRaised}
                fields={requestFields}
            />

            <AlertModal show={alertConfig.show} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig(p => ({ ...p, show: false }))} />
            <ConfirmModal show={confirmConfig.show} title="Delete Request"
                message={`Are you sure you want to delete Request ID ${confirmConfig.requestId}?`} confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDelete}
                onClose={() => setConfirmConfig({ show: false, requestId: null })} />
        </div>
    );
};

export default MyRequest;