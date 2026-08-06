import React, { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";

import AlertModal from "../../../components/AlertModel";
import ConfirmModal from "../../../components/ComfirmModel";
import RequestFormFields from "../../../components/RequestFormFields";
import RequestDetailsModal from "../../../components/RequestDetailsModal";

const SAMPLE_REQUESTS = [
    {
        requestId: "REQ0001",
        vendor: "Worldline",
        mid: "MID12345",
        amount: 1500,
        referredBy: "BH User",
        stage: "BH Approval",
        remarks: "Incorrect refund amount entered You need to make request again to approval.",
        date: "10-Jun-2026"
    },
    {
        requestId: "REQ0002",
        vendor: "Hitachi",
        mid: "MID56789",
        amount: 2500,
        referredBy: "RH User",
        stage: "RH Approval",
        remarks: "Please upload supporting document.",
        date: "09-Jun-2026"
    },
    {
        requestId: "REQ0003",
        vendor: "Sarvatra",
        mid: "MID99999",
        amount: 5000,
        referredBy: "DCO User",
        stage: "DCO Review",
        remarks: "RRN mismatch with vendor file.",
        date: "08-Jun-2026"
    }
];

const PAGE_SIZE = 10;

const ReferredBRequest = () => {
    const [requests, setRequests] = useState(SAMPLE_REQUESTS);
    const [filters, setFilters] = useState({ search: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [checkedIds, setCheckedIds] = useState([]);

    const [showDetails, setShowDetails] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalMode, setModalMode] = useState(null);

    const [deleteConfig, setDeleteConfig] = useState({ show: false, request: null });
    const [submitConfig, setSubmitConfig] = useState({ show: false });
    const fileRef = useRef(null);

    const [alertConfig, setAlertConfig] = useState({ show: false, type: "", title: "", message: "" });

    const filteredRequests = requests.filter((r) => {
        if (!filters.search.trim()) return true;
        const s = filters.search.toLowerCase();
        return (
            r.requestId.toLowerCase().includes(s) ||
            r.vendor.toLowerCase().includes(s) ||
            r.mid.toLowerCase().includes(s) ||
            r.referredBy.toLowerCase().includes(s) ||
            r.stage.toLowerCase().includes(s) ||
            r.remarks.toLowerCase().includes(s)
        );
    });

    const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
    const indexOfFirst = (currentPage - 1) * PAGE_SIZE;
    const currentRecords = filteredRequests.slice(indexOfFirst, indexOfFirst + PAGE_SIZE);
    const allPageChecked = currentRecords.length > 0 && currentRecords.every(r => checkedIds.includes(r.requestId));

    const toggleAll = () => {
        if (allPageChecked) setCheckedIds(prev => prev.filter(id => !currentRecords.find(r => r.requestId === id)));
        else setCheckedIds(prev => [...new Set([...prev, ...currentRecords.map(r => r.requestId)])]);
    };

    const toggleOne = (id) =>
        setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const openViewModal = (request) => {
        setSelectedRequest(request);
        setShowDetails(true);
    };

    const openEditModal = (request) => {
        setSelectedRequest(request);
        setModalMode("edit");
    };

    const closeDetailsModal = () => {
        setShowDetails(false);
        setSelectedRequest(null);
    };

    const closeEditModal = () => {
        setModalMode(null);
        setSelectedRequest(null);
    };

    const handleUpdate = (data) => {
        setRequests(prev =>
            prev.map(r => r.requestId === selectedRequest.requestId ? { ...r, ...data } : r)
        );
        closeEditModal();
        setAlertConfig({ show: true, type: "success", title: "Request Updated", message: "Request updated successfully." });
    };

    const handleDelete = () => {
        setRequests(prev => prev.filter(r => r.requestId !== deleteConfig.request.requestId));
        setCheckedIds(prev => prev.filter(id => id !== deleteConfig.request.requestId));
        setDeleteConfig({ show: false, request: null });
        setAlertConfig({ show: true, type: "success", title: "Deleted", message: "Request deleted successfully." });
    };

    const handleSubmit = () => {
        setRequests(prev => prev.filter(r => !checkedIds.includes(r.requestId)));
        setCheckedIds([]);
        setSubmitConfig({ show: false });
        setAlertConfig({ show: true, type: "success", title: "Submitted", message: "Selected requests submitted successfully." });
    };

    return (
        <div className="container-fluid p-2">
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white py-2 border-bottom">
                    <nav aria-label="breadcrumb" className="mb-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item text-muted">Request Handling</li>
                            <li className="breadcrumb-item active fw-semibold" aria-current="page">Referred Back Requests</li>
                        </ol>
                    </nav>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-lg-3">
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
                                    value={filters.search}
                                    onChange={(e) => { setFilters({ search: e.target.value }); setCurrentPage(1); }}
                                    style={{ paddingLeft: "38px" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-body pb-2">
                    <button
                        className="btn btn-success btn-sm px-3 p-1"
                        onClick={() => setSubmitConfig({ show: true })}
                        disabled={checkedIds.length === 0}
                    >
                        Submit
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table modern-table align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "50px" }}>
                                    <input
                                        type="checkbox"
                                        style={{ border: "1px solid #bebebe" }}
                                        className="form-check-input"
                                        checked={allPageChecked}
                                        onChange={toggleAll}
                                    />
                                </th>
                                <th>Request ID</th>
                                <th>Referred Back Date</th>
                                <th>Vendor</th>
                                <th>MID</th>
                                <th>Amount</th>
                                <th>Referred By</th>
                                <th>Stage</th>
                                <th width="300">Remarks</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((request) => (
                                <tr key={request.requestId}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={checkedIds.includes(request.requestId)}
                                            onChange={() => toggleOne(request.requestId)}
                                        />
                                    </td>
                                    <td>
                                        <span
                                            className="fw-semibold text-primary"
                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                            onClick={() => openViewModal(request)}
                                        >
                                            {request.requestId}
                                        </span>
                                    </td>
                                    <td>{request.date}</td>
                                    <td>{request.vendor}</td>
                                    <td>{request.mid}</td>
                                    <td>₹ {request.amount.toLocaleString()}</td>
                                    <td>
                                        <span className="badge bg-warning text-dark">{request.referredBy}</span>
                                    </td>
                                    <td>{request.stage}</td>
                                    <td className="text-danger fw-semibold">
                                        <span title={request.remarks}>
                                            {request.remarks.length > 45 ? request.remarks.substring(0, 45) + "..." : request.remarks}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button
                                                className="btn btn-outline-warning btn-sm p-0"
                                                style={{ width: "30px", height: "30px" }}
                                                title="Modify Request"
                                                onClick={() => openEditModal(request)}
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm p-0"
                                                style={{ width: "30px", height: "30px" }}
                                                title="Delete Request"
                                                onClick={() => setDeleteConfig({ show: true, request })}
                                            >
                                                <FaTrash size={14} />
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
                            Showing {filteredRequests.length === 0 ? 0 : indexOfFirst + 1}
                            {" – "}
                            {Math.min(indexOfFirst + PAGE_SIZE, filteredRequests.length)}
                            {" of "}
                            {filteredRequests.length} records
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
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* View Details Modal */}
            <RequestDetailsModal
                show={showDetails}
                request={selectedRequest}
                onClose={closeDetailsModal}
                title="Referred Back Request Details"
                firstDateLabel="Referred Back Date"
                firstDateValue={selectedRequest?.date}
                fields={[
                    { label: "Vendor", value: selectedRequest?.vendor },
                    { label: "MID", value: selectedRequest?.mid },
                    { label: "Amount", value: `₹ ${selectedRequest?.amount?.toLocaleString()}` },
                    { label: "Referred By", value: selectedRequest?.referredBy },
                    { label: "Current Stage", value: selectedRequest?.stage },
                    { label: "Remarks", value: selectedRequest?.remarks }
                ]}
            />

            {/* Edit Modal */}
            {modalMode === "edit" && selectedRequest && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content" style={{ borderRadius: "10px", overflow: "hidden" }}>
                            <div className="modal-header py-2" style={{ borderBottom: "1px solid #e9ecef" }}>
                                <span className="fw-semibold" style={{ fontSize: "13px", color: "#495057" }}>
                                    Modify Request — {selectedRequest.requestId}
                                </span>
                                <button className="btn-close" onClick={closeEditModal} />
                            </div>
                            <div className="modal-body p-3">
                                <RequestFormFields
                                    mode="edit"
                                    formData={selectedRequest}
                                    errors={{}}
                                    onChange={(e) => setSelectedRequest(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                    tidStatus=""
                                    tidError=""
                                    fetchingTid={false}
                                    onValidateTid={() => {}}
                                    fileRef={fileRef}
                                    onFileChange={() => {}}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={() => handleUpdate(selectedRequest)}>Update Request</button>
                                <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            <ConfirmModal
                show={deleteConfig.show}
                title="Delete Request"
                message={`Are you sure you want to delete ${deleteConfig.request?.requestId}?`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDelete}
                onClose={() => setDeleteConfig({ show: false, request: null })}
            />

            {/* Submit Confirm */}
            <ConfirmModal
                show={submitConfig.show}
                title="Submit Requests"
                message={`Are you sure you want to submit ${checkedIds.length} selected request(s)?`}
                confirmText="Submit"
                cancelText="Cancel"
                type="success"
                onConfirm={handleSubmit}
                onClose={() => setSubmitConfig({ show: false })}
            />

            <AlertModal
                show={alertConfig.show}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ show: false, type: "", title: "", message: "" })}
            />
        </div>
    );
};

export default ReferredBRequest;
