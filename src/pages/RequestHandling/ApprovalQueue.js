import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye } from "react-icons/fa";
import AlertModal from "../../components/AlertModel";
import ConfirmModal from "../../components/ComfirmModel";

const SAMPLE_REQUESTS = [
  { requestId: "REQ0001", txnType: "UPI", vendor: "Worldline", customerId: "CUST1001", accountNo: "1234567890", sol: "1001", mid: "MID12345", tid: "TID001", rrn: "RRN001", dateTxn: "2026-06-01", tranAmount: 5000, refundAmt: 5000, stage: "BH Approval", status: "Pending", createdDate: "10-Jun-2026", gateTxnId: "GTX001", merchantVPA: "merchant@upi", remarks: "" },
  { requestId: "REQ0002", txnType: "CARD", vendor: "Hitachi", customerId: "CUST1002", accountNo: "2345678901", sol: "1002", mid: "MID56789", tid: "TID002", rrn: "RRN002", dateTxn: "2026-06-02", tranAmount: 2500, refundAmt: 2500, stage: "DCO Review", status: "Pending", createdDate: "09-Jun-2026", cardNum: "XXXX-XXXX-XXXX-1234", authCode: "AUTH002", scheme: "VISA", remarks: "" },
  { requestId: "REQ0003", txnType: "UPI", vendor: "Sarvatra", customerId: "CUST1003", accountNo: "3456789012", sol: "1003", mid: "MID99999", tid: "TID003", rrn: "RRN003", dateTxn: "2026-06-03", tranAmount: 7500, refundAmt: 7500, stage: "RH Approval", status: "Pending", createdDate: "08-Jun-2026", gateTxnId: "GTX003", merchantVPA: "store@upi", remarks: "" },
  { requestId: "REQ0004", txnType: "CARD", vendor: "Worldline", customerId: "CUST1004", accountNo: "4567890123", sol: "1004", mid: "MID44444", tid: "TID004", rrn: "RRN004", dateTxn: "2026-06-04", tranAmount: 1200, refundAmt: 1200, stage: "BH Approval", status: "Pending", createdDate: "07-Jun-2026", cardNum: "XXXX-XXXX-XXXX-5678", authCode: "AUTH004", scheme: "MASTERCARD", remarks: "" },
  { requestId: "REQ0005", txnType: "UPI", vendor: "Hitachi", customerId: "CUST1005", accountNo: "5678901234", sol: "1005", mid: "MID55555", tid: "TID005", rrn: "RRN005", dateTxn: "2026-06-05", tranAmount: 4500, refundAmt: 4500, stage: "DCO Review", status: "Pending", createdDate: "06-Jun-2026", gateTxnId: "GTX005", merchantVPA: "shop@upi", remarks: "" },
  { requestId: "REQ0006", txnType: "CARD", vendor: "Sarvatra", customerId: "CUST1006", accountNo: "6789012345", sol: "1006", mid: "MID66666", tid: "TID006", rrn: "RRN006", dateTxn: "2026-06-06", tranAmount: 900, refundAmt: 900, stage: "RH Approval", status: "Pending", createdDate: "05-Jun-2026", cardNum: "XXXX-XXXX-XXXX-9012", authCode: "AUTH006", scheme: "RUPAY", remarks: "" },
  { requestId: "REQ0007", txnType: "UPI", vendor: "Worldline", customerId: "CUST1007", accountNo: "7890123456", sol: "1007", mid: "MID77777", tid: "TID007", rrn: "RRN007", dateTxn: "2026-06-07", tranAmount: 3000, refundAmt: 3000, stage: "BH Approval", status: "Pending", createdDate: "04-Jun-2026", gateTxnId: "GTX007", merchantVPA: "retail@upi", remarks: "" },
  { requestId: "REQ0008", txnType: "CARD", vendor: "Hitachi", customerId: "CUST1008", accountNo: "8901234567", sol: "1008", mid: "MID88888", tid: "TID008", rrn: "RRN008", dateTxn: "2026-06-08", tranAmount: 6500, refundAmt: 6500, stage: "DCO Review", status: "Pending", createdDate: "03-Jun-2026", cardNum: "XXXX-XXXX-XXXX-3456", authCode: "AUTH008", scheme: "VISA", remarks: "" },
  { requestId: "REQ0009", txnType: "UPI", vendor: "Sarvatra", customerId: "CUST1009", accountNo: "9012345678", sol: "1009", mid: "MID99990", tid: "TID009", rrn: "RRN009", dateTxn: "2026-06-09", tranAmount: 2200, refundAmt: 2200, stage: "RH Approval", status: "Pending", createdDate: "02-Jun-2026", gateTxnId: "GTX009", merchantVPA: "market@upi", remarks: "" },
  { requestId: "REQ0010", txnType: "CARD", vendor: "Worldline", customerId: "CUST1010", accountNo: "0123456789", sol: "1010", mid: "MID10101", tid: "TID010", rrn: "RRN010", dateTxn: "2026-06-10", tranAmount: 7000, refundAmt: 7000, stage: "BH Approval", status: "Pending", createdDate: "01-Jun-2026", cardNum: "XXXX-XXXX-XXXX-7890", authCode: "AUTH010", scheme: "MASTERCARD", remarks: "" },
  { requestId: "REQ0011", txnType: "UPI", vendor: "Hitachi", customerId: "CUST1011", accountNo: "1122334455", sol: "1011", mid: "MID11111", tid: "TID011", rrn: "RRN011", dateTxn: "2026-05-31", tranAmount: 1900, refundAmt: 1900, stage: "DCO Review", status: "Pending", createdDate: "31-May-2026", gateTxnId: "GTX011", merchantVPA: "food@upi", remarks: "" },
  { requestId: "REQ0012", txnType: "CARD", vendor: "Sarvatra", customerId: "CUST1012", accountNo: "2233445566", sol: "1012", mid: "MID12121", tid: "TID012", rrn: "RRN012", dateTxn: "2026-05-30", tranAmount: 5500, refundAmt: 5500, stage: "RH Approval", status: "Pending", createdDate: "30-May-2026", cardNum: "XXXX-XXXX-XXXX-2345", authCode: "AUTH012", scheme: "RUPAY", remarks: "" },
];

const getBadge = (status) => {
  switch (status) {
    case "Pending": return "bg-warning text-dark";
    case "Approved": return "bg-success";
    case "Rejected": return "bg-danger";
    case "Referred Back": return "bg-info text-dark";
    default: return "bg-secondary";
  }
};

const RECORDS_PER_PAGE = 10;

function ApprovalQueue() {

  const [requests, setRequests] = useState(SAMPLE_REQUESTS);

  const [filters, setFilters] = useState({
    requestId: "",
    requestDateFrom: "",
    requestDateTo: "",
    txnDateFrom: "",
    txnDateTo: "",
    txnAmount: "",
    status: ""
  });

  const [filterErrors, setFilterErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState("");

  const [confirmConfig, setConfirmConfig] = useState({
    show: false, action: null, requestId: null
  });

  const [alertConfig, setAlertConfig] = useState({
    show: false, title: "", message: "", type: "success"
  });

  // ── Filter handlers ─────────────────────────────────────────────────────────

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    if (!filters.requestId.trim()) {
      setFilterErrors({ requestId: "Request ID is required" });
      return;
    }
    setFilterErrors({});
    setCurrentPage(1);
    // API call placeholder: axios.get("/api/approval-queue", { params: filters })
  };

  // ── Pagination ───────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(requests.length / RECORDS_PER_PAGE);
  const indexOfFirst = (currentPage - 1) * RECORDS_PER_PAGE;
  const indexOfLast = indexOfFirst + RECORDS_PER_PAGE;
  const currentRecords = requests.slice(indexOfFirst, indexOfLast);

  // ── View modal ───────────────────────────────────────────────────────────────

  const openViewModal = (request) => {
    setSelectedRequest(request);
    setRemarks("");
    setRemarksError("");
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedRequest(null);
    setRemarks("");
    setRemarksError("");
  };

  // ── Action handlers ──────────────────────────────────────────────────────────

  const handleActionClick = (action) => {
    if ((action === "Reject" || action === "Refer Back") && !remarks.trim()) {
      setRemarksError("Remarks are required for this action");
      return;
    }
    setRemarksError("");
    setConfirmConfig({ show: true, action, requestId: selectedRequest.requestId });
  };

  const handleConfirmAction = () => {
    const { action, requestId } = confirmConfig;

    const newStatus =
      action === "Approve" ? "Approved" :
        action === "Reject" ? "Rejected" :
          "Referred Back";

    setRequests(prev =>
      prev.map(r =>
        r.requestId === requestId
          ? { ...r, status: newStatus }
          : r
      )
    );

    setConfirmConfig({ show: false, action: null, requestId: null });
    closeViewModal();

    setAlertConfig({
      show: true,
      title: `Request ${action}d`,
      message: `Request ID ${requestId} has been ${action.toLowerCase()}d successfully.`,
      type: action === "Approve" ? "success" : action === "Reject" ? "error" : "warning"
    });

    // API placeholder:
    // await axios.post(`/api/approval-queue/${requestId}/action`, { action, remarks });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid p-2">

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">Request Handling</li>
          <li className="breadcrumb-item active">Approval Queue</li>
        </ol>
      </nav>
      <hr style={{ marginTop: "2px" }} />

      {/* Filter Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-3">
              <label className="form-label">
                Request ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="requestId"
                value={filters.requestId}
                onChange={handleFilterChange}
                className={`form-control ${filterErrors.requestId ? "is-invalid" : ""}`}
                placeholder="Enter Request ID"
              />
              {filterErrors.requestId && (
                <div className="text-danger small">{filterErrors.requestId}</div>
              )}
            </div>

            <div className="col-md-6 d-flex gap-2 align-items-end">
              <button className="btn btn-primary" onClick={handleSearch}>
                Search
              </button>
            </div>

          </div>
        </div>

        {/* Table */}
        <div className="card-header bg-white fw-semibold">
          Approval Queue
        </div>

        <div className="table-responsive" style={{ padding: "8px" }}>
          <table
            className="table table-bordered table-hover table-sm align-middle mb-0"
            style={{ fontSize: "13px" }}
          >
            <thead className="table-light">
              <tr>
                <th>Request ID</th>
                <th>Type</th>
                <th>Vendor</th>
                <th>Customer ID</th>
                <th>MID</th>
                <th>Amount</th>
                <th>Current Stage</th>
                <th>Status</th>
                <th>Created Date</th>
                <th width="80">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((request) => (
                  <tr key={request.requestId}>
                    <td>
                      <span
                        className="fw-semibold text-primary"
                        style={{ cursor: "pointer" }}
                        onClick={() => openViewModal(request)}
                      >
                        {request.requestId}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {request.txnType === "UPI" ? "📱 UPI" : "💳 POS"}
                      </span>
                    </td>
                    <td>{request.vendor}</td>
                    <td>{request.customerId}</td>
                    <td>{request.mid}</td>
                    <td className="fw-semibold">
                      ₹ {request.refundAmt.toLocaleString()}
                    </td>
                    <td>
                      <span className="text-muted">{request.stage}</span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${getBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{request.createdDate}</td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm p-0"
                        style={{ width: "30px", height: "30px" }}
                        title="View & Action"
                        onClick={() => openViewModal(request)}
                      >
                        <FaEye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-4">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Showing {indexOfFirst + 1} – {Math.min(indexOfLast, requests.length)} of {requests.length} requests
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* View & Action Modal */}
      {showViewModal && selectedRequest && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeViewModal(); }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
            <div className="modal-content border-0 shadow">

              <div className="modal-header">
                <h5 className="modal-title">
                  Request Details —{" "}
                  <span className="text-primary">{selectedRequest.requestId}</span>
                </h5>
                <button className="btn-close" onClick={closeViewModal} />
              </div>

              <div className="modal-body">

                {/* Status badge */}
                <div className="mb-3">
                  <span className={`badge rounded-pill ${getBadge(selectedRequest.status)} me-2`}>
                    {selectedRequest.status}
                  </span>
                  <span className="text-muted small">
                    Stage: {selectedRequest.stage}
                  </span>
                </div>

                {/* Details table */}
                <div className="table-responsive">
                  <table className="table table-bordered table-sm" style={{ fontSize: "13px" }}>
                    <tbody>
                      <tr>
                        <th className="table-light" style={{ width: "30%" }}>Transaction Type</th>
                        <td>{selectedRequest.txnType === "UPI" ? "📱 UPI" : "💳 POS"}</td>
                        <th className="table-light">Vendor</th>
                        <td>{selectedRequest.vendor}</td>
                      </tr>
                      <tr>
                        <th className="table-light">Customer ID</th>
                        <td>{selectedRequest.customerId}</td>
                        <th className="table-light">Account No</th>
                        <td>{selectedRequest.accountNo}</td>
                      </tr>
                      <tr>
                        <th className="table-light">SOL</th>
                        <td>{selectedRequest.sol}</td>
                        <th className="table-light">MID</th>
                        <td>{selectedRequest.mid}</td>
                      </tr>
                      <tr>
                        <th className="table-light">TID</th>
                        <td>{selectedRequest.tid}</td>
                        <th className="table-light">RRN</th>
                        <td>{selectedRequest.rrn}</td>
                      </tr>
                      <tr>
                        <th className="table-light">Date of Transaction</th>
                        <td>{selectedRequest.dateTxn}</td>
                        <th className="table-light">Transaction Amount</th>
                        <td className="fw-semibold">
                          ₹ {selectedRequest.tranAmount?.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <th className="table-light">Refund Amount</th>
                        <td className="fw-semibold text-primary">
                          ₹ {selectedRequest.refundAmt?.toLocaleString()}
                        </td>
                        <th className="table-light">Created Date</th>
                        <td>{selectedRequest.createdDate}</td>
                      </tr>

                      {selectedRequest.txnType === "UPI" && (
                        <>
                          <tr>
                            <th className="table-light">Gateway Txn ID</th>
                            <td>{selectedRequest.gateTxnId || "—"}</td>
                            <th className="table-light">Merchant VPA</th>
                            <td>{selectedRequest.merchantVPA || "—"}</td>
                          </tr>
                        </>
                      )}

                      {selectedRequest.txnType === "CARD" && (
                        <>
                          <tr>
                            <th className="table-light">Card Number</th>
                            <td>{selectedRequest.cardNum || "—"}</td>
                            <th className="table-light">Auth Code</th>
                            <td>{selectedRequest.authCode || "—"}</td>
                          </tr>
                          <tr>
                            <th className="table-light">Scheme</th>
                            <td colSpan="3">{selectedRequest.scheme || "—"}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Remarks — required for Reject / Refer Back */}
                {selectedRequest.status === "Pending" && (
                  <div className="mt-3">
                    <label className="form-label fw-semibold">
                      Remarks
                      <span className="text-muted fw-normal small ms-1">
                        (required for Reject / Refer Back)
                      </span>
                    </label>
                    <textarea
                      className={`form-control ${remarksError ? "is-invalid" : ""}`}
                      rows={3}
                      placeholder="Enter remarks..."
                      value={remarks}
                      onChange={(e) => {
                        setRemarks(e.target.value);
                        if (e.target.value.trim()) setRemarksError("");
                      }}
                    />
                    {remarksError && (
                      <div className="text-danger small mt-1">{remarksError}</div>
                    )}
                  </div>
                )}

              </div>

              <div className="modal-footer">
                {selectedRequest.status === "Pending" ? (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleActionClick("Approve")}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn btn-info text-white"
                      onClick={() => handleActionClick("Refer Back")}
                    >
                      🔄 Refer Back
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleActionClick("Reject")}
                    >
                      ❌ Reject
                    </button>
                    <button className="btn btn-secondary" onClick={closeViewModal}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn btn-secondary" onClick={closeViewModal}>
                    Close
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        show={confirmConfig.show}
        title={`Confirm ${confirmConfig.action}`}
        message={`Are you sure you want to ${confirmConfig.action?.toLowerCase()} Request ID ${confirmConfig.requestId}?`}
        confirmText={confirmConfig.action}
        cancelText="Cancel"
        type={
          confirmConfig.action === "Approve" ? "success" :
            confirmConfig.action === "Reject" ? "danger" :
              "warning"
        }
        onConfirm={handleConfirmAction}
        onClose={() =>
          setConfirmConfig({ show: false, action: null, requestId: null })
        }
      />

      {/* Alert Modal */}
      <AlertModal
        show={alertConfig.show}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() =>
          setAlertConfig(prev => ({ ...prev, show: false }))
        }
      />

    </div>
  );
}

export default ApprovalQueue;
