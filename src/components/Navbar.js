import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaTachometerAlt,
  FaUsers,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaFile,
  FaUserCircle,
} from "react-icons/fa";
import "../styles/main.css";
import { APPS, useApplication } from "../context/ApplicationContext";
import { getAppMenus, COMMON_PROFILE_LINKS } from "../config/menuConfig";
import AppToggle from "./AppToggle";

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeApp, allowedApps, switchApp } = useApplication();

  const [requestOpen, setRequestOpen] = useState(false);
  const [fileHandlingOpen, setFileHandlingOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const menusConfig = getAppMenus(activeApp, user?.role);
  const menus = menusConfig.roleMenus;
  const fileHandlingMenus = menusConfig.fileMenus;
  const brand = menusConfig.brand;

  const isRequestMenuActive = menus.some((menu) => location.pathname === menu.to);
  const isFileHandlingActive = fileHandlingMenus.some(
    (menu) => location.pathname === menu.to
  );

  const canToggle =
    allowedApps.includes(APPS.MAT) && allowedApps.includes(APPS.MEA);

  /** Instant local switch — never wait on backend (hang/401 was blocking the toggle). */
  const handleApplicationSwitch = (target) => {
    if (target === activeApp) return;
    if (!allowedApps.includes(target)) return;

    const ok = switchApp(target);
    if (!ok) return;

    // Stay on shared screens (e.g. User Management); otherwise open that app's dashboard
    const commonPaths = ["/profile-management"];
    if (!commonPaths.includes(location.pathname)) {
      navigate("/", { replace: true });
    }
  };

  const userMgmt = COMMON_PROFILE_LINKS.userManagement;
  const showUserManagement =
    userMgmt.roles.includes(user?.role);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light shadow-sm mat-navbar px-3">
        <div className="container-fluid" style={{ fontWeight: "500" }}>
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
                background: brand.accent,
                fontSize: "16px",
                boxShadow:
                  activeApp === APPS.MEA
                    ? "0 4px 12px rgba(15,118,110,0.25)"
                    : "0 4px 12px rgba(13,110,253,0.25)",
              }}
            >
              {brand.short}
            </div>

            <small
              className="text-muted text-center mt-1"
              style={{
                fontSize: "7px",
                lineHeight: "1.1",
                width: "90px",
              }}
            >
              {brand.full}
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

          <div className="collapse navbar-collapse" id="mainNavbar">
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

              {menus.length > 0 && (
                <li
                  className="nav-item dropdown position-relative"
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
                    <span>{menusConfig.requestLabel}</span>
                    <FaChevronDown
                      className={`ms-2 ${requestOpen ? "rotate-arrow" : ""}`}
                    />
                  </div>

                  <ul
                    className={`dropdown-menu shadow border-0 py-2 ${requestOpen ? "show" : ""
                      }`}
                    style={{
                      minWidth: "280px",
                      borderRadius: "10px",
                    }}
                  >
                    {menus.map((menu) => (
                      <li key={menu.to}>
                        <Link
                          className={`dropdown-item d-flex align-items-center gap-2 py-1 fs-6 ${location.pathname === menu.to ? "active" : ""
                            }`}
                          to={menu.to}
                          onClick={() => setRequestOpen(false)}
                        >
                          <span>{menu.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}

              {menusConfig.showReports && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === menusConfig.reportsTo
                        ? "active fw-semibold text-primary"
                        : ""
                      }`}
                    to={menusConfig.reportsTo}
                  >
                    <FaFileAlt className="me-1" />
                    Reports
                  </Link>
                </li>
              )}

              {menusConfig.showFileHandling && fileHandlingMenus.length > 0 && (
                <li
                  className="nav-item dropdown position-relative"
                  onMouseEnter={() => setFileHandlingOpen(true)}
                  onMouseLeave={() => setFileHandlingOpen(false)}
                >
                  <div
                    className={`nav-link d-flex align-items-center ${fileHandlingOpen || isFileHandlingActive
                        ? "text-primary fw-semibold"
                        : ""
                      }`}
                    style={{ cursor: "pointer" }}
                  >
                    <FaFile className="me-1" />
                    <span>File Handling</span>
                    <FaChevronDown
                      className={`ms-2 ${fileHandlingOpen ? "rotate-arrow" : ""}`}
                    />
                  </div>

                  <ul
                    className={`dropdown-menu shadow border-0 py-2 ${fileHandlingOpen ? "show" : ""
                      }`}
                    style={{
                      minWidth: "250px",
                      borderRadius: "10px",
                    }}
                  >
                    {fileHandlingMenus.map((menu) => (
                      <li key={menu.to}>
                        <Link
                          className={`dropdown-item py-2 ${location.pathname === menu.to ? "active" : ""
                            }`}
                          to={menu.to}
                          onClick={() => setFileHandlingOpen(false)}
                        >
                          {menu.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>

            {canToggle && (
              <div className="d-flex align-items-center me-3">
                <AppToggle
                  activeApp={activeApp}
                  onSwitch={handleApplicationSwitch}
                />
              </div>
            )}

            <div
              className="position-relative"
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <button
                className="btn btn-light border d-flex align-items-center gap-2"
                type="button"
              >
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: 30, height: 30 }}
                >
                  <FaUser size={16} />
                </div>
                <span className="fw-normal">{user?.username}</span>
                <FaChevronDown size={12} />
              </button>

              {profileOpen && (
                <div
                  className="dropdown-menu show shadow border-0"
                  style={{
                    right: 0,
                    left: "auto",
                    minWidth: "220px",
                    borderRadius: "10px",
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

                  {showUserManagement && (
                    <Link
                      className="dropdown-item d-flex align-items-center gap-2"
                      to={userMgmt.to}
                      onClick={() => setProfileOpen(false)}
                    >
                      <FaUsers />
                      {userMgmt.label}
                      {user?.isAdmin && (
                        <span
                          className="badge bg-primary ms-auto"
                          style={{ fontSize: "10px" }}
                        >
                          Admin
                        </span>
                      )}
                    </Link>
                  )}
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
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Profile Information</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProfileModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="text-center mb-4">
                  <FaUserCircle size={75} className="text-primary" />
                  <h5 className="mt-2 mb-0">{user?.displayName || "-"}</h5>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <small className="text-muted d-block">User ID</small>
                    <div className="fw-semibold">{user?.username || "-"}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Name</small>
                    <div className="fw-semibold">{user?.displayName || "-"}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Email</small>
                    <div className="fw-semibold">{user?.email || "-"}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Role</small>
                    <div>
                      <span className="badge bg-primary">{user?.role || "-"}</span>
                      {user?.isAdmin && (
                        <span className="badge bg-info text-dark ms-1">Admin</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Active Application</small>
                    <div className="fw-semibold">{activeApp}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">SOL ID</small>
                    <div className="fw-semibold">{user?.sol || "-"}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">SOL Name</small>
                    <div className="fw-semibold">{user?.solName || "-"}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Region Name</small>
                    <div className="fw-semibold">{user?.regionName || "-"}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Zone Name</small>
                    <div className="fw-semibold">{user?.zoneName || "-"}</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowProfileModal(false)}
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
