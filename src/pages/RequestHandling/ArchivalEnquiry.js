import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch } from "react-icons/fa";

function ArchivalEnquiry() {

  const [rrn, setRrn] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 5;

  const [requests] = useState([
    {
      requestId: "REQ0001",
      vendor: "Worldline",
      mid: "MID12345",
      rrn: "123456789012",
      amount: 1500,
      archivedDate: "10-Mar-2026",
      remarks: "Request archived after 90 days."
    },
    {
      requestId: "REQ0002",
      vendor: "Hitachi",
      mid: "MID56789",
      rrn: "223456789012",
      amount: 2500,
      archivedDate: "09-Mar-2026",
      remarks: "Refund processed successfully."
    },
    {
      requestId: "REQ0003",
      vendor: "Sarvatra",
      mid: "MID99999",
      rrn: "323456789012",
      amount: 5000,
      archivedDate: "08-Mar-2026",
      remarks: "RRN verified and archived."
    },
    {
      requestId: "REQ0004",
      vendor: "Worldline",
      mid: "MID44444",
      rrn: "423456789012",
      amount: 1800,
      archivedDate: "07-Mar-2026",
      remarks: "Archived after completion."
    },
    {
      requestId: "REQ0005",
      vendor: "Hitachi",
      mid: "MID55555",
      rrn: "523456789012",
      amount: 3200,
      archivedDate: "06-Mar-2026",
      remarks: "Transaction completed."
    },
    {
      requestId: "REQ0006",
      vendor: "Sarvatra",
      mid: "MID66666",
      rrn: "623456789012",
      amount: 4200,
      archivedDate: "05-Mar-2026",
      remarks: "Request moved to archival tray."
    },
    {
      requestId: "REQ0007",
      vendor: "Worldline",
      mid: "MID77777",
      rrn: "723456789012",
      amount: 5100,
      archivedDate: "04-Mar-2026",
      remarks: "Archived successfully."
    }
  ]);

  const filteredRequests = requests.filter((request) =>
    rrn === "" ||
    request.rrn.toLowerCase().includes(rrn.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / recordsPerPage)
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const currentRecords = filteredRequests.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  return (
    <div className="container-fluid p-2">

      {/* Breadcrumb */}

      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            Enquiry
          </li>
          <li className="breadcrumb-item active">
            Archival Enquiry
          </li>
        </ol>
      </nav>

      <hr />

      {/* Search Card */}

      <div className="card border-0 shadow-sm mb-3">

        <div className="card-header bg-white fw-semibold">
          Search Archived Requests
        </div>

        <div className="card-body">

          <div className="row g-3 align-items-end">

            <div className="col-md-6">

              <label className="form-label">
                RRN
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter RRN"
                value={rrn}
                onChange={(e) => {
                  setRrn(e.target.value);
                  setCurrentPage(1);
                }}
              />

            </div>

            <div className="col-md-2">

              <button className="btn btn-primary w-100">
                <FaSearch className="me-1" />
                Search
              </button>

            </div>

            {/* <div className="col-md-2">

              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setRrn("");
                  setCurrentPage(1);
                }}
              >
                Reset
              </button>

            </div> */}

          </div>

        </div>

      </div>

      {/* Result Table */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white fw-semibold">
          Archived Requests
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
                <th>RRN</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Archived Date</th>
                <th>Remarks</th>
              </tr>

            </thead>

            <tbody>

              {currentRecords.length > 0 ? (

                currentRecords.map((request) => (

                  <tr key={request.requestId}>

                    <td className="fw-semibold text-primary">
                      {request.requestId}
                    </td>

                    <td>
                      {request.vendor}
                    </td>

                    <td>
                      {request.mid}
                    </td>

                    <td>
                      {request.rrn}
                    </td>

                    <td>
                      ₹ {request.amount.toLocaleString()}
                    </td>

                    <td>
                      <span className="badge bg-secondary">
                        Archived
                      </span>
                    </td>

                    <td>
                      {request.archivedDate}
                    </td>

                    <td title={request.remarks}>
                      {request.remarks.length > 50
                        ? request.remarks.substring(0, 50) + "..."
                        : request.remarks}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan="8"
                    className="text-center text-muted py-4"
                  >
                    No archived records found
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
                    setCurrentPage(currentPage - 1)
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
                    setCurrentPage(currentPage + 1)
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
}

export default ArchivalEnquiry;