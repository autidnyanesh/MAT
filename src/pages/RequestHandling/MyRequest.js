import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// import { FaEllipsisV } from "react-icons/fa";
import { FaEdit, FaTrash } from "react-icons/fa";
import AlertModal from "../../components/AlertModel";
import ConfirmModal from "../../components/ComfirmModel";
import axios from "axios";

const MyRequest = () => {

    //const [openDropdown, setOpenDropdown] = useState(null);

    const [requests] = useState([
        { requestId: "REQ0001", txnType: "UPI", vendor: "Worldline", customerId: "CUST1001", mid: "MID12345", amount: 1500, stage: "BH Approval", status: "Pending", createdDate: "10-Jun-2026" },
        { requestId: "REQ0002", txnType: "CARD", vendor: "Hitachi", customerId: "CUST1002", mid: "MID56789", amount: 2500, stage: "Completed", status: "Approved", createdDate: "09-Jun-2026" },
        { requestId: "REQ0003", txnType: "UPI", vendor: "Sarvatra", customerId: "CUST1003", mid: "MID99999", amount: 5000, stage: "DCO Review", status: "Rejected", createdDate: "08-Jun-2026" },
        { requestId: "REQ0004", txnType: "UPI", vendor: "Worldline", customerId: "CUST1004", mid: "MID44444", amount: 1200, stage: "SOM Approval", status: "Pending", createdDate: "07-Jun-2026" },
        { requestId: "REQ0005", txnType: "CARD", vendor: "Hitachi", customerId: "CUST1005", mid: "MID55555", amount: 4500, stage: "BH Approval", status: "Pending", createdDate: "06-Jun-2026" },
        { requestId: "REQ0006", txnType: "UPI", vendor: "Sarvatra", customerId: "CUST1006", mid: "MID66666", amount: 900, stage: "Completed", status: "Approved", createdDate: "05-Jun-2026" },
        { requestId: "REQ0007", txnType: "CARD", vendor: "Worldline", customerId: "CUST1007", mid: "MID77777", amount: 3000, stage: "RH Approval", status: "Pending", createdDate: "04-Jun-2026" },
        { requestId: "REQ0008", txnType: "UPI", vendor: "Hitachi", customerId: "CUST1008", mid: "MID88888", amount: 6500, stage: "DCO Review", status: "Rejected", createdDate: "03-Jun-2026" },
        { requestId: "REQ0009", txnType: "CARD", vendor: "Sarvatra", customerId: "CUST1009", mid: "MID99990", amount: 2200, stage: "Completed", status: "Approved", createdDate: "02-Jun-2026" },
        { requestId: "REQ0010", txnType: "UPI", vendor: "Worldline", customerId: "CUST1010", mid: "MID10101", amount: 7000, stage: "SOM Approval", status: "Pending", createdDate: "01-Jun-2026" },
        { requestId: "REQ0011", txnType: "CARD", vendor: "Hitachi", customerId: "CUST1011", mid: "MID11111", amount: 1900, stage: "Completed", status: "Approved", createdDate: "31-May-2026" },
        { requestId: "REQ0012", txnType: "UPI", vendor: "Sarvatra", customerId: "CUST1012", mid: "MID12121", amount: 5500, stage: "BH Approval", status: "Pending", createdDate: "30-May-2026" }
    ]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [CustStatus, setCustStatus] = useState("");
    const [fetchingCust, setFetchingCust] = useState(false);
    const [fetchCustError, setFetchCustError] = useState("");
    const [alertConfig, setAlertConfig] = useState({
        show: false,
        title: "",
        message: "",
        type: "success"
    });
    const [confirmConfig, setConfirmConfig] = useState({
        show: false,
        requestId: null
    });
    const [filters, setFilters] = useState({
        requestId: "",
        requestDateFrom: "",
        requestDateTo: "",
        txnDateFrom: "",
        txnDateTo: "",
        txnAmount: ""
    });

    const [errors, setErrors] = useState({});

    const recordsPerPage = 10;

    const getBadge = (status) => {
        switch (status) {
            case "Pending":
                return "bg-warning text-dark";
            case "Approved":
                return "bg-success";
            case "Rejected":
                return "bg-danger";
            default:
                return "bg-secondary";
        }
    };
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = requests.slice(
        indexOfFirstRecord,
        indexOfLastRecord
    );
    const totalPages = Math.ceil(
        requests.length / recordsPerPage
    );
    const fetchCustomerDetails = async () => {

        if (!selectedRequest?.custId) {
            setFetchCustError("Customer ID required");
            return;
        }
        setFetchingCust(true);
        try {
            // API call later
            setSelectedRequest(prev => ({
                ...prev,
                accountNo: "1234567890",
                sol: "1001"
            }));
            setCustStatus("Valid");
            setFetchCustError("");
        } catch {
            setCustStatus("Invalid");
            setFetchCustError("Customer not found");
        } finally {
            setFetchingCust(false);
        }
    };
    const handleDelete = async () => {
        try {
            await axios.delete(
                `/api/request/${confirmConfig.requestId}`
            );
            setAlertConfig({
                show: true,
                title: "Request Deleted",
                message: `Request ID ${confirmConfig.requestId} has been deleted successfully.`,
                type: "success"
            });
        } catch (error) {
            setAlertConfig({
                show: true,
                title: "Delete Fail ed",
                message: "Unable to delete request.",
                type: "error"
            });
        } finally {
            setConfirmConfig({
                show: false,
                requestId: null
            });
        }
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="container-fluid p-2">

            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                        Request Handling
                    </li>
                    <li className="breadcrumb-item active">
                        My Request
                    </li>
                </ol>
            </nav>
            <hr style={{ marginTop: "2px" }} />

            {/* Filters */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">

                    <div className="row g-3">

                        <div className="col-md-3">
                            <label className="form-label">
                                Request ID
                                <span className="text-danger"> *</span>
                            </label>

                            <input
                                type="text"
                                name="requestId"
                                value={filters.requestId}
                                onChange={handleFilterChange}
                                className={`form-control ${errors.requestId ? "is-invalid" : ""
                                    }`}
                                placeholder="Enter Request ID"
                            />

                            {errors.requestId && (
                                <div className="text-danger small">
                                    {errors.requestId}
                                </div>
                            )}
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                Request Date From
                            </label>

                            <input
                                type="date"
                                name="requestDateFrom"
                                value={filters.requestDateFrom}
                                onChange={handleFilterChange}
                                className="form-control"
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                Request Date To
                            </label>

                            <input
                                type="date"
                                name="requestDateTo"
                                value={filters.requestDateTo}
                                onChange={handleFilterChange}
                                className="form-control"
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                Transaction Date From
                            </label>

                            <input
                                type="date"
                                name="txnDateFrom"
                                value={filters.txnDateFrom}
                                onChange={handleFilterChange}
                                className="form-control"
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                Transaction Date To
                            </label>

                            <input
                                type="date"
                                name="txnDateTo"
                                value={filters.txnDateTo}
                                onChange={handleFilterChange}
                                className="form-control"
                            />
                        </div>

                        <div className="col-md-1">
                            <label className="form-label">
                                Amount
                            </label>

                            <input
                                type="number"
                                name="txnAmount"
                                value={filters.txnAmount}
                                onChange={handleFilterChange}
                                className="form-control"
                                placeholder="₹"
                            />
                        </div>

                        <div className="col-md-6 d-flex gap-2 align-items-end">

                            <button
                                className="btn btn-primary"
                                onClick={() => {

                                    if (!filters.requestId.trim()) {

                                        setErrors({
                                            requestId:
                                                "Request ID is required"
                                        });

                                        return;
                                    }

                                    setErrors({});

                                    // API Call
                                    // searchRequests(filters);

                                }}
                            >
                                Search
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {

                                    setFilters({
                                        requestId: "",
                                        requestDateFrom: "",
                                        requestDateTo: "",
                                        txnDateFrom: "",
                                        txnDateTo: "",
                                        txnAmount: ""
                                    });

                                    setErrors({});
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}

                <div className="card-header bg-white fw-semibold">
                    My Requests
                </div>
                <div className="table-responsive" style={{ padding: "8px" }}>
                    <table
                        className="table table-bordered table-hover table-sm align-middle mb-0"
                        style={{ fontSize: "13px", padding: "8px" }}
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
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((request, index) => (
                                <tr key={request.requestId}>
                                    <td>
                                        <span
                                            className="fw-semibold text-primary"
                                            style={{ cursor: "pointer" }}
                                        >
                                            {request.requestId}
                                        </span>
                                    </td>
                                    <td>{request.txnType}</td>
                                    <td>{request.vendor}</td>
                                    <td>{request.customerId}</td>
                                    <td>{request.mid}</td>
                                    <td className="fw-semibold">
                                        ₹ {request.amount.toLocaleString()}
                                    </td>
                                    <td>
                                        <span className="text-muted">
                                            {request.stage}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge rounded-pill ${getBadge(
                                                request.status
                                            )}`}
                                        >
                                            {request.status}
                                        </span>
                                    </td>
                                    <td>{request.createdDate}</td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            {request.status === "Pending" && (
                                                <button
                                                    className="btn btn-outline-warning btn-sm p-0"
                                                    style={{
                                                        width: "30px",
                                                        height: "30px"
                                                    }}
                                                    title="Modify Request"
                                                    onClick={() => {
                                                        setSelectedRequest({
                                                            ...request,
                                                            custId: request.customerId,
                                                            accountNo: request.accountNo || "1234567890",
                                                            sol: request.sol || "1234"
                                                        });
                                                        setCustStatus("Valid");
                                                        setShowModifyModal(true);
                                                    }}
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                            )}
                                            {(request.status === "Pending" ||
                                                request.status === "Rejected") && (
                                                    <button
                                                        className="btn btn-outline-danger btn-sm p-0"
                                                        style={{
                                                            width: "30px",
                                                            height: "30px"
                                                        }}
                                                        title="Delete Request"
                                                        onClick={() =>
                                                            setConfirmConfig({
                                                                show: true,
                                                                requestId: request.requestId
                                                            })
                                                        }
                                                    >
                                                        <FaTrash size={14} />
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
                            Showing {indexOfFirstRecord + 1}
                            {" - "}
                            {Math.min(indexOfLastRecord, requests.length)}
                            {" of "}
                            {requests.length} requests
                        </small>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li
                                    className={`page-item ${currentPage === 1 ? "disabled" : ""
                                        }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setCurrentPage(prev => prev - 1)
                                        }
                                    >
                                        Previous
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, index) => (
                                    <li
                                        key={index}
                                        className={`page-item ${currentPage === index + 1
                                            ? "active"
                                            : ""
                                            }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                setCurrentPage(index + 1)
                                            }
                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                                <li
                                    className={`page-item ${currentPage === totalPages
                                        ? "disabled"
                                        : ""
                                        }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setCurrentPage(prev => prev + 1)
                                        }
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            {showModifyModal && selectedRequest && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.4)"
                    }}
                >
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Modify Request
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => {
                                        setShowModifyModal(false);
                                    }}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Request ID
                                        </label>
                                        <input
                                            className="form-control"
                                            value={selectedRequest.requestId}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Vendor
                                        </label>
                                        <select
                                            className="form-select"
                                            value={selectedRequest.vendor}
                                            onChange={(e) =>
                                                setSelectedRequest({
                                                    ...selectedRequest,
                                                    vendor: e.target.value
                                                })
                                            }
                                        >
                                            <option>Worldline</option>
                                            <option>Hitachi</option>
                                            <option>Sarvatra</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Transaction Type
                                        </label>
                                        <div className="d-flex gap-2">
                                            <div
                                                className={`card flex-fill ${selectedRequest.txnType === "UPI"
                                                    ? "border-primary bg-primary-subtle"
                                                    : ""
                                                    }`}
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                    setSelectedRequest({
                                                        ...selectedRequest,
                                                        txnType: "UPI"
                                                    })
                                                }
                                            >
                                                <div className="card-body py-2 text-center">
                                                    <small className="mb=0">
                                                        📱UPI
                                                    </small>
                                                </div>
                                            </div>
                                            <div
                                                className={`card flex-fill ${selectedRequest.txnType === "CARD"
                                                    ? "border-primary bg-primary-subtle"
                                                    : ""
                                                    }`}
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                    setSelectedRequest({
                                                        ...selectedRequest,
                                                        txnType: "CARD"
                                                    })
                                                }
                                            >
                                                <div className="card-body py-2 text-center">
                                                    <small className="mb=0">
                                                        💳Card
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Customer ID
                                        </label>
                                        <div className="d-flex gap-2">
                                            <input
                                                type="text"
                                                className={`form-control ${CustStatus === "Invalid"
                                                    ? "is-invalid"
                                                    : CustStatus === "Valid"
                                                        ? "is-valid"
                                                        : ""
                                                    }`}
                                                value={selectedRequest.custId || ""}
                                                onChange={(e) => {
                                                    setSelectedRequest({
                                                        ...selectedRequest,
                                                        custId: e.target.value,
                                                        accountNo: "",
                                                        sol: ""
                                                    });

                                                    setCustStatus("");
                                                }}
                                            />
                                            {CustStatus === "Valid" ? (
                                                <button
                                                    className="btn btn-success"
                                                    disabled
                                                >
                                                    ✓
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    disabled={fetchingCust}
                                                    onClick={fetchCustomerDetails}
                                                >
                                                    {fetchingCust
                                                        ? "..."
                                                        : "🔍"}
                                                </button>
                                            )}
                                        </div>
                                        {fetchCustError && (
                                            <small className="text-danger">
                                                {fetchCustError}
                                            </small>
                                        )}
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Account Number
                                        </label>
                                        <input
                                            className="form-control"
                                            value={selectedRequest.accountNo || ""}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">
                                            SOL
                                        </label>
                                        <input
                                            className="form-control"
                                            value={selectedRequest.sol || ""}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            TID
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={selectedRequest.tid || ""}
                                            onChange={(e) =>
                                                setSelectedRequest({
                                                    ...selectedRequest,
                                                    tid: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Date Of Transaction
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={selectedRequest.dateTxn || ""}
                                            onChange={(e) =>
                                                setSelectedRequest({
                                                    ...selectedRequest,
                                                    dateTxn: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            RRN
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={selectedRequest.rrn || ""}
                                            onChange={(e) =>
                                                setSelectedRequest({
                                                    ...selectedRequest,
                                                    rrn: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                    {selectedRequest.txnType === "UPI" && (
                                        <>
                                            <div className="col-md-4">
                                                <label className="form-label">
                                                    Gateway Transaction ID
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={selectedRequest.gateTxnId || ""}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">
                                                    Merchant VPA
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={selectedRequest.merchantVPA || ""}
                                                    readOnly
                                                />
                                            </div>
                                        </>
                                    )}
                                    {selectedRequest.txnType === "CARD" && (
                                        <>
                                            <div className="col-md-4">
                                                <label className="form-label">
                                                    Card Number
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={selectedRequest.cardNum || ""}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">
                                                    Auth Code
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={selectedRequest.authCode || ""}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">
                                                    Scheme
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={selectedRequest.scheme || ""}
                                                    readOnly
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Transaction Amount
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={selectedRequest.tranAmount || ""}
                                            onChange={(e) =>
                                                setSelectedRequest({
                                                    ...selectedRequest,
                                                    tranAmount: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Refund Amount
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={selectedRequest.refundAmt || ""}
                                            onChange={(e) =>
                                                setSelectedRequest({
                                                    ...selectedRequest,
                                                    refundAmt: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Upload Document
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) =>
                                                setSelectedRequest({
                                                    ...selectedRequest,
                                                    uDocument: e.target.files[0]
                                                })
                                            }
                                        />
                                        {selectedRequest.documentName && (
                                            <small className="text-success">
                                                Existing File :
                                                {" "}
                                                {selectedRequest.documentName}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        /*
                                        axios.put(
                                          `/api/request/${selectedRequest.requestId}`,
                                          selectedRequest
                                        )
                                        */
                                        setAlertConfig({
                                            show: true,
                                            title: "Request Updated Successfully",
                                            message: `Request ID ${selectedRequest.requestId} has been updated successfully.`,
                                            type: "success"
                                        });

                                        // setAlertConfig({
                                        //     show: true,
                                        //     title: "Update Failed",
                                        //     message: "Unable to update request.",
                                        //     type: "error"
                                        // });

                                        setShowModifyModal(false);
                                    }}
                                >
                                    Update Request
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setShowModifyModal(false)
                                    }
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <AlertModal
                show={alertConfig.show}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() =>
                    setAlertConfig(prev => ({
                        ...prev,
                        show: false
                    }))
                }
            />
            <ConfirmModal
                show={confirmConfig.show}
                title="Delete Request"
                message={`Are you sure you want to delete Request ID ${confirmConfig.requestId}?`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDelete}
                onClose={() =>
                    setConfirmConfig({
                        show: false,
                        requestId: null
                    })
                }
            />
        </div>
    );
};
export default MyRequest;
