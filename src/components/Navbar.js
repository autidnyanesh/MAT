import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaTachometerAlt,
  FaUsers,
  FaFileAlt,
  FaShieldAlt,
  FaPlus,
  FaClipboardList,
  FaInbox,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaFile,
  FaUserCircle,
} from "react-icons/fa";

function Navbar({
  user,
  onLogout,
  theme,
  setTheme,
}) {
  const location = useLocation();

  const [requestOpen, setRequestOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const roleMenus = {
    BU: [
      {
        to: "/raise-request",
        label: "Raise Request",
        icon: <FaPlus />,
      },
      {
        to: "/my-request",
        label: "My Requests",
        icon: <FaClipboardList />,
      },
      {
        to: "/referred-request",
        label: "Referred Back Requests",
        icon: <FaInbox />,
      },
      {
        to: "/enquiry",
        label: "Enquiry",
        icon: <FaUsers />,
      },
      {
        to: "/archival-enquiry",
        label: "Archival Enquiry",
        icon: <FaShieldAlt />,
      },
    ],

    SOM: [
      {
        to: "/raise-request",
        label: "Raise Request",
        icon: <FaPlus />,
      },
      {
        to: "/my-request",
        label: "My Requests",
        icon: <FaClipboardList />,
      },
      {
        to: "/approval-queue",
        label: "Approval Queue",
        icon: <FaShieldAlt />,
      },
    ],

    BH: [
      {
        to: "/approval-queue",
        label: "Approval Queue",
        icon: <FaShieldAlt />,
      },
    ],

    RH: [
      {
        to: "/approval-queue",
        label: "Approval Queue",
        icon: <FaShieldAlt />,
      },
    ],

    DCO: [
      {
        to: "/approval-queue",
        label: "Approval Queue",
        icon: <FaShieldAlt />,
      },
      {
        to: "/profile-management",
        label: "Profile Management",
        icon: <FaUser />,
      },
      {
        to: "/archival-enquiry",
        label: "Archival Enquiry",
        icon: <FaInbox />,
      },
    ],

    AGM: [
      {
        to: "/final-approval",
        label: "Final Approval",
        icon: <FaShieldAlt />,
      },
    ],

    DGM: [
      {
        to: "/final-approval",
        label: "Final Approval",
        icon: <FaShieldAlt />,
      },
    ],
  };

  const menus = roleMenus[user?.role] || [];

  const isRequestMenuActive = menus.some(
    menu => location.pathname === menu.to
  );

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light shadow-sm mat-navbar px-3">

        <div className="container-fluid">

          <Link
            to="/"
            className="navbar-brand d-flex flex-column align-items-center text-decoration-none me-5"
          >
            <div
              className="d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: "70px",
                height: "39px",
                borderRadius: "7px",
                background:
                  "linear-gradient(135deg, rgb(13, 110, 253), rgb(70 134 229))",
                fontSize: "16px",
                boxShadow: "0 4px 12px rgba(13,110,253,0.25)"
              }}
            >
              MAT
            </div>

            <small
              className="text-muted text-center mt-1"
              style={{
                fontSize: "7px",
                lineHeight: "1.1",
                width: "90px"
              }}
            >
              Merchant Acquiring Tool
            </small>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse"
            id="mainNavbar"
          >

            <ul className="navbar-nav me-auto ms-4" style={{ gap: "12px" }}>

              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === "/"
                    ? "active fw-semibold text-primary"
                    : ""
                    }`}
                  to="/"
                >
                  <FaTachometerAlt className="me-1" />
                  Dashboard
                </Link>
              </li>

              <li
                className="nav-item dropdown"
                onMouseEnter={() => setRequestOpen(true)}
                onMouseLeave={() => setRequestOpen(false)}
              >
                <div
                  className={`nav-link d-flex align-items-center ${requestOpen || isRequestMenuActive
                    ? "text-primary fw-semibold"
                    : ""
                    }`}
                  style={{ cursor: "pointer" }}
                >
                  <FaFileInvoiceDollar className="me-1" />

                  <span
                    onClick={() => setRequestOpen(true)}
                  >
                    Request Handling
                  </span>

                  <FaChevronDown
                    className={`ms-2 transition-arrow ${requestOpen ? "rotate-arrow" : ""
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRequestOpen(!requestOpen);
                    }}
                  />
                </div>

                <ul
                  className={`dropdown-menu shadow border-0 py-2 ${requestOpen ? "show" : ""
                    }`}
                  style={{
                    minWidth: "300px",
                    borderRadius: "6px"
                  }}
                >
                  {menus.map((menu) => (
                    <li key={menu.to}>
                      <Link
                        className={`dropdown-item d-flex align-items-center gap-2 ${location.pathname === menu.to
                          ? "active"
                          : ""
                          }`}
                        to={menu.to}
                        onClick={() => setRequestOpen(false)}
                      >
                        {menu.icon}
                        <span>{menu.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === "/report"
                    ? "active fw-semibold text-primary"
                    : ""
                    }`}
                  to="/report"
                >
                  <FaFileAlt className="me-1" />
                  Reports
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === "/file-handling"
                    ? "active fw-semibold text-primary"
                    : ""
                    }`}
                  to="/file-handling"
                >
                  <FaFile className="me-1" />
                  File Handling
                </Link>
              </li>

              {user?.role === "DCO" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname ===
                    "/profile-management"
                    ? "active fw-semibold text-primary"
                    : ""
                    }`}
                  to="/profile-management"
                >
                  <FaUsers className="me-2" />
                  User Management
                </Link>
              </li>
              )}

            </ul>

            <div
              className="position-relative"
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >

              <button
                className="btn btn-light border d-flex align-items-center gap-2"
                type="button"
              >
                <FaUserCircle size={22} />

                <span className="fw-normal">
                  {user?.username}
                </span>

                <FaChevronDown size={12} />
              </button>

              {profileOpen && (
                <div
                  className="dropdown-menu show shadow border-0"
                  style={{
                    right: 0,
                    left: "auto",
                    minWidth: "220px",
                    borderRadius: "10px"
                  }}
                >

                  <button
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={() => {
                      setShowProfileModal(true);
                      setProfileOpen(false);
                    }}
                  >
                    <FaUser />
                    Profile Information
                  </button>

                  <hr className="dropdown-divider my-1" />

                  <button
                    className="dropdown-item text-danger d-flex align-items-center gap-2"
                    onClick={onLogout}
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

      </nav>
      {showProfileModal && (

        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)"
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content border-0 shadow">

              <div className="modal-header">

                <h5 className="modal-title">
                  Profile Information
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setShowProfileModal(false)
                  }
                />

              </div>

              <div className="modal-body">

                <div className="text-center mb-4">

                  <FaUserCircle
                    size={75}
                    className="text-primary"
                  />

                  <h5 className="mt-2 mb-0">
                    {user?.displayName || "-"}
                  </h5>

                </div>

                <div className="row g-3">

                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      User ID
                    </small>
                    <div className="fw-semibold">
                      {user?.username || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      Name
                    </small>
                    <div className="fw-semibold">
                      {user?.displayName || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      Email
                    </small>
                    <div className="fw-semibold">
                      {user?.email || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      Role
                    </small>
                    <div>
                      <span className="badge bg-primary">
                        {user?.role || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      SOL ID
                    </small>
                    <div className="fw-semibold">
                      {user?.sol || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      SOL Name
                    </small>
                    <div className="fw-semibold">
                      {user?.solName || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      Region Name
                    </small>
                    <div className="fw-semibold">
                      {user?.regionName || "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      Zone Name
                    </small>
                    <div className="fw-semibold">
                      {user?.zoneName || "-"}
                    </div>
                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setShowProfileModal(false)
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Navbar;