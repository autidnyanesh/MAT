import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaFileExcel,
  FaFileCode,
  FaSearch
} from "react-icons/fa";

function Report() {

  const [filters, setFilters] = useState({
    reportType: "SUCCESS",
    vendor: "",
    requestId: "",
    rrn: "",
    fromDate: "",
    toDate: ""
  });

  const [reportData] = useState([
    {
      requestId: "REQ0001",
      vendor: "Worldline",
      rrn: "123456789",
      amount: 1500,
      status: "Success",
      arn: "ARN123456",
      requestDate: "10-Jun-2026"
    },
    {
      requestId: "REQ0002",
      vendor: "Hitachi",
      rrn: "987654321",
      amount: 2500,
      status: "Pending",
      arn: "",
      requestDate: "09-Jun-2026"
    },
    {
      requestId: "REQ0003",
      vendor: "Sarvatra",
      rrn: "555555555",
      amount: 5000,
      status: "Failed",
      arn: "",
      requestDate: "08-Jun-2026"
    },
    {
      requestId: "REQ0004",
      vendor: "Worldline",
      rrn: "111111111",
      amount: 2000,
      status: "Success",
      arn: "ARN22222",
      requestDate: "07-Jun-2026"
    },
    {
      requestId: "REQ0005",
      vendor: "Hitachi",
      rrn: "222222222",
      amount: 4500,
      status: "Pending",
      arn: "",
      requestDate: "06-Jun-2026"
    },
    {
      requestId: "REQ0006",
      vendor: "Sarvatra",
      rrn: "333333333",
      amount: 3500,
      status: "Success",
      arn: "ARN33333",
      requestDate: "05-Jun-2026"
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 5;

  const handleChange = (e) => {

    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });

  };

  const handleSearch = () => {

    /*
      axios.post("/api/reports/search", filters)
      .then(res => {
          setReportData(res.data);
      });
    */

    console.log(filters);
  };

  const filteredData = useMemo(() => {

    return reportData.filter(row => {

      return (
        (!filters.vendor ||
          row.vendor === filters.vendor) &&

        (!filters.requestId ||
          row.requestId
            .toLowerCase()
            .includes(filters.requestId.toLowerCase())) &&

        (!filters.rrn ||
          row.rrn.includes(filters.rrn))
      );

    });

  }, [reportData, filters]);

  const totalPages = Math.ceil(
    filteredData.length / recordsPerPage
  );

  const currentData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const columns =
    currentData.length > 0
      ? Object.keys(currentData[0])
      : [];

  const exportToExcel = () => {

    const worksheet =
      XLSX.utils.json_to_sheet(filteredData);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Report"
    );

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
      });

    const file = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    );

    saveAs(
      file,
      `${filters.reportType}_Report.xlsx`
    );
  };

  const exportToHtml = () => {

    if (!filteredData.length) return;

    let html = `
      <html>
      <head>
        <title>MAT Report</title>
        <style>
          body{
            font-family:Arial;
            padding:20px;
          }

          table{
            width:100%;
            border-collapse:collapse;
          }

          th,td{
            border:1px solid #ddd;
            padding:8px;
          }

          th{
            background:#0d6efd;
            color:white;
          }
        </style>
      </head>
      <body>

      <h2>${filters.reportType} Report</h2>

      <table>
        <thead>
          <tr>
    `;

    columns.forEach(col => {
      html += `<th>${col}</th>`;
    });

    html += "</tr></thead><tbody>";

    filteredData.forEach(row => {

      html += "<tr>";

      columns.forEach(col => {
        html += `<td>${row[col] ?? ""}</td>`;
      });

      html += "</tr>";
    });

    html += `
      </tbody>
      </table>
      </body>
      </html>
    `;

    const blob = new Blob(
      [html],
      { type: "text/html" }
    );

    saveAs(
      blob,
      `${filters.reportType}_Report.html`
    );
  };

  return (

    <div className="container-fluid p-2">

      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item active">
            Reports
          </li>
        </ol>
      </nav>

      <hr />

      {/* Filters */}

      <div className="card shadow-sm border-0 mb-3">

        <div className="card-header bg-white fw-semibold">
          Report Filters
        </div>

        <div className="card-body">

          <div className="row g-3">

            <div className="col-md-2">
              <label className="form-label">
                Report Type
              </label>

              <select
                className="form-select"
                name="reportType"
                value={filters.reportType}
                onChange={handleChange}
              >
                <option value="SUCCESS">
                  Success Report
                </option>

                <option value="FAILURE">
                  Failure Report
                </option>

                <option value="PENDING">
                  Pending Report
                </option>

                <option value="REFERRED_BACK">
                  Referred Back Report
                </option>

                <option value="USER">
                  User Wise Report
                </option>

                <option value="VENDOR">
                  Vendor Wise Report
                </option>
              </select>

            </div>

            <div className="col-md-2">

              <label className="form-label">
                Vendor
              </label>

              <select
                className="form-select"
                name="vendor"
                value={filters.vendor}
                onChange={handleChange}
              >
                <option value="">
                  All Vendors
                </option>

                <option>
                  Worldline
                </option>

                <option>
                  Hitachi
                </option>

                <option>
                  Sarvatra
                </option>

              </select>

            </div>

            <div className="col-md-2">

              <label className="form-label">
                Request ID
              </label>

              <input
                type="text"
                className="form-control"
                name="requestId"
                value={filters.requestId}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-2">

              <label className="form-label">
                RRN
              </label>

              <input
                type="text"
                className="form-control"
                name="rrn"
                value={filters.rrn}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-2">

              <label className="form-label">
                From
              </label>

              <input
                type="date"
                className="form-control"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-2">

              <label className="form-label">
                To
              </label>

              <input
                type="date"
                className="form-control"
                name="toDate"
                value={filters.toDate}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-1 d-flex align-items-end">

              <button
                className="btn btn-primary w-100"
                onClick={handleSearch}
              >
                <FaSearch />
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Results */}

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white d-flex justify-content-between align-items-center">

          <span className="fw-semibold">
            Report Results
          </span>

          <div className="d-flex gap-2">

            <button
              className="btn btn-success btn-sm"
              onClick={exportToExcel}
            >
              <FaFileExcel className="me-1" />
              Excel
            </button>

            <button
              className="btn btn-info btn-sm text-white"
              onClick={exportToHtml}
            >
              <FaFileCode className="me-1" />
              HTML
            </button>

          </div>

        </div>

        <div className="table-responsive">

          <table
            className="table table-bordered table-hover table-sm mb-0"
            style={{ fontSize: "13px" }}
          >

            <thead className="table-light">

              <tr>
                {columns.map(col => (
                  <th key={col}>
                    {col}
                  </th>
                ))}
              </tr>

            </thead>

            <tbody>

              {currentData.map((row, index) => (

                <tr key={index}>

                  {columns.map(col => (
                    <td key={col}>
                      {row[col]}
                    </td>
                  ))}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="card-footer bg-white d-flex justify-content-between align-items-center">

          <small className="text-muted">
            Showing {currentData.length} of {filteredData.length} records
          </small>

          <ul className="pagination pagination-sm mb-0">

            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
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
                className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
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

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
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

        </div>

      </div>

    </div>

  );
}

export default Report;