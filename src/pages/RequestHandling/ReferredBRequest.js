import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";


const ReferredBRequest = () => {

    const [requests] = useState([
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
    ]);
    const [searchRequestId, setSearchRequestId] = useState("");
    const [searchVendor, setSearchVendor] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const recordsPerPage = 10;

    const filteredRequests = requests.filter((request) => {

        const requestMatch =
            searchRequestId === "" ||
            request.requestId
                .toLowerCase()
                .includes(searchRequestId.toLowerCase());

        const vendorMatch =
            searchVendor === "" ||
            request.vendor === searchVendor;

        return requestMatch && vendorMatch;
    });

    const indexOfLastRecord =
        currentPage * recordsPerPage;

    const indexOfFirstRecord =
        indexOfLastRecord - recordsPerPage;

    const currentRecords =
        filteredRequests.slice(
            indexOfFirstRecord,
            indexOfLastRecord
        );

    const totalPages = Math.max(
        1,
        Math.ceil(filteredRequests.length / recordsPerPage)
    );

    return (
        <div className="container-fluid p-2">

            <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                        Request Handling
                    </li>
                    <li className="breadcrumb-item active">
                        Referred Back Requests
                    </li>
                </ol>
            </nav>

            <hr />

            <div className="alert alert-warning py-1 mb-2">
                <strong style={{ fontSize: "13px" }}>
                    Referred Back Requests
                </strong>
                <span style={{ fontSize: "13px" }}>
                    {" "} - Modify the request and resubmit or delete if required.<br />
                    Post 90 days of referral, requests will be moved to archival tray</span>
            </div>

            <div className="card border-0 shadow-sm mb-3">

                <div className="card-body">

                    <div className="row g-3">

                        <div className="col-md-4">

                            <label className="form-label">
                                Request ID
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search Request ID"
                                value={searchRequestId}
                                onChange={(e) => {
                                    setSearchRequestId(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />

                        </div>

                        <div className="col-md-4">

                            <label className="form-label">
                                Vendor
                            </label>

                            <select
                                className="form-select"
                                value={searchVendor}
                                onChange={(e) => {
                                    setSearchVendor(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">
                                    All Vendors
                                </option>

                                <option value="Worldline">
                                    Worldline
                                </option>

                                <option value="Hitachi">
                                    Hitachi
                                </option>

                                <option value="Sarvatra">
                                    Sarvatra
                                </option>

                            </select>

                        </div>

                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-primary w-100">
                                Search
                            </button>
                        </div>

                    </div>

                </div>

            </div>

            <div className="card border-0 shadow-sm">

                <div className="card-header bg-white fw-semibold">
                    Referred Back Requests
                </div>

                <div className="table-responsive">

                    <table
                        className="table table-bordered table-hover table-sm align-middle mb-0"
                        style={{ fontSize: "13px" }}
                    >

                        <thead className="table-light">

                            <tr>
                                <th>Request ID</th>
                                <th>Vendor</th>
                                <th>MID</th>
                                <th>Amount</th>
                                <th>Referred By</th>
                                <th>Stage</th>
                                <th width="300">Remarks</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {currentRecords.map((request) => (

                                <tr key={request.requestId}>

                                    <td>
                                        <span className="fw-semibold text-primary">
                                            {request.requestId}
                                        </span>
                                    </td>

                                    <td>{request.vendor}</td>

                                    <td>{request.mid}</td>

                                    <td>
                                        ₹ {request.amount.toLocaleString()}
                                    </td>

                                    <td>
                                        <span className="badge bg-warning text-dark">
                                            {request.referredBy}
                                        </span>
                                    </td>

                                    <td>
                                        {request.stage}
                                    </td>

                                    <td>
                                        <span title={request.remarks}>
                                            {request.remarks.length > 45
                                                ? request.remarks.substring(0, 45) + "..."
                                                : request.remarks}
                                        </span>
                                    </td>

                                    <td>
                                        {request.date}
                                    </td>

                                    <td>
                                        <div className="d-flex gap-1">

                                            <button
                                                className="btn btn-outline-warning btn-sm p-0"
                                                style={{
                                                    width: "30px",
                                                    height: "30px"
                                                }}
                                                title="Modify Request"
                                            >
                                                <FaEdit size={14} />
                                            </button>

                                            <button
                                                className="btn btn-outline-danger btn-sm p-0"
                                                style={{
                                                    width: "30px",
                                                    height: "30px"
                                                }}
                                                title="Delete Request"
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

                            Showing

                            {" "}

                            {filteredRequests.length === 0
                                ? 0
                                : indexOfFirstRecord + 1}

                            {" - "}

                            {Math.min(
                                indexOfLastRecord,
                                filteredRequests.length
                            )}

                            {" of "}

                            {filteredRequests.length}

                            {" records"}

                        </small>

                        <ul className="pagination pagination-sm mb-0">

                            <li
                                className={`page-item ${currentPage === 1
                                    ? "disabled"
                                    : ""
                                    }`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() =>
                                        setCurrentPage(
                                            currentPage - 1
                                        )
                                    }
                                >
                                    Previous
                                </button>
                            </li>

                            {[...Array(totalPages)].map(
                                (_, index) => (

                                    <li
                                        key={index}
                                        className={`page-item ${currentPage ===
                                            index + 1
                                            ? "active"
                                            : ""
                                            }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                setCurrentPage(
                                                    index + 1
                                                )
                                            }
                                        >
                                            {index + 1}
                                        </button>
                                    </li>

                                )
                            )}

                            <li
                                className={`page-item ${currentPage === totalPages
                                    ? "disabled"
                                    : ""
                                    }`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() =>
                                        setCurrentPage(
                                            currentPage + 1
                                        )
                                    }
                                >
                                    Next
                                </button>
                            </li>

                        </ul>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ReferredBRequest;