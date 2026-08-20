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
import { APP_BRAND } from "../config/menuConfig";
import { iconForMenu } from "../config/menuApiAdapter";
import { useMenus } from "../context/MenuContext";
import AppToggle from "./AppToggle";

const ICONS = {
  dashboard: FaTachometerAlt,
  request: FaFileInvoiceDollar,
  reports: FaFileAlt,
  file: FaFile,
  users: FaUsers,
};

function MenuIcon({ name, className = "me-1" }) {
  const Icon = ICONS[name] || FaFileAlt;
  return <Icon className={className} />;
}

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeApp, allowedApps, switchApp } = useApplication();
  const { menus, profileMenus, brand: menuBrand, loading: menusLoading, error: menusError } =
    useMenus();

  const [openCode, setOpenCode] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const brand = menuBrand || (activeApp === APPS.MEA ? APP_BRAND.MEA : APP_BRAND.MAT);

  const pathActive = (path) => path && location.pathname === path;
  const dropdownActive = (node) =>
    (node.children || []).some((c) => pathActive(c.path));

  const canToggle =
    allowedApps.includes(APPS.MAT) && allowedApps.includes(APPS.MEA);

  const handleApplicationSwitch = (target) => {
    if (target === activeApp) return;
    if (!allowedApps.includes(target)) return;
    const ok = switchApp(target);
    if (!ok) return;
    const commonPaths = ["/profileManagement", "/profile-management"];
    if (!commonPaths.includes(location.pathname)) {
      navigate("/home", { replace: true });
    }
  };

  const visibleNav = (menus || []).filter((m) => m.visible !== false);
  const visibleProfile = (profileMenus || []).filter((m) => {
    if (m.visible === false) return false;
    // User Management: DCO admin only (BU / normal DCO never see it)
    if (/user management|profilemanagement|profile-management/i.test(`${m.label} ${m.path}`)) {
      return user?.role === "DCO" && user?.isAdmin === true;
    }
    return true;
  });

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light shadow-sm mat-navbar px-3">
        <div className="container-fluid" style={{ fontWeight: "500" }}>
          <Link
            to="/home"
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
              style={{ fontSize: "7px", lineHeight: "1.1", width: "90px" }}
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
              {menusLoading && (
                <li className="nav-item">
                  <span className="nav-link text-muted small">Loading menus…</span>
                </li>
              )}
              {!menusLoading && menusError && visibleNav.length === 0 && (
                <li className="nav-item">
                  <span className="nav-link text-danger small" title={menusError}>
                    Menus unavailable
                  </span>
                </li>
              )}
              {visibleNav.map((item) => {
                if (item.kind === "dropdown") {
                  const open = openCode === item.id;
                  const active = open || dropdownActive(item);
                  const kids = (item.children || []).filter((c) => c.visible !== false);
                  if (!kids.length) return null;
                  return (
                    <li
                      key={item.id}
                      className="nav-item dropdown position-relative"
                      onMouseEnter={() => setOpenCode(item.id)}
                      onMouseLeave={() => setOpenCode(null)}
                    >
                      <div
                        className={`nav-link d-flex align-items-center ${
                          active ? "text-primary fw-semibold" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <MenuIcon name={iconForMenu(item)} />
                        <span>{item.label}</span>
                        <FaChevronDown className={`ms-2 ${open ? "rotate-arrow" : ""}`} />
                      </div>
                      <ul
                        className={`dropdown-menu shadow border-0 py-2 ${open ? "show" : ""}`}
                        style={{ minWidth: "280px", borderRadius: "10px" }}
                      >
                        {kids.map((child) => (
                          <li key={child.id}>
                            <Link
                              className={`dropdown-item d-flex align-items-center gap-2 py-1 fs-6 ${
                                pathActive(child.path) ? "active" : ""
                              }`}
                              to={child.path}
                              onClick={() => setOpenCode(null)}
                            >
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }

                return (
                  <li key={item.id} className="nav-item">
                    <Link
                      className={`nav-link ${
                        pathActive(item.path) ? "active fw-semibold text-primary" : ""
                      }`}
                      to={item.path || "/home"}
                    >
                      <MenuIcon name={iconForMenu(item)} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {canToggle && (
              <div className="d-flex align-items-center me-3">
                <AppToggle activeApp={activeApp} onSwitch={handleApplicationSwitch} />
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

                  {visibleProfile.map((pm) => (
                    <Link
                      key={pm.id}
                      className="dropdown-item d-flex align-items-center gap-2"
                      to={pm.path}
                      onClick={() => setProfileOpen(false)}
                    >
                      <MenuIcon name={iconForMenu(pm)} className="" />
                      {pm.label}
                      {user?.isAdmin && /user management/i.test(pm.label || "") && (
                        <span
                          className="badge bg-primary ms-auto"
                          style={{ fontSize: "10px" }}
                        >
                          Admin
                        </span>
                      )}
                    </Link>
                  ))}
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
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "12px" }}>
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FaUserCircle /> Profile Information
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProfileModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <div
                    className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                    style={{ width: 64, height: 64 }}
                  >
                    <FaUser size={28} />
                  </div>
                  <h5 className="mt-2 mb-0">{user?.displayName || "-"}</h5>
                  <div className="text-muted small">{user?.role || "-"}</div>
                </div>
                <div className="row g-2 small">
                  <div className="col-5 text-muted">Username / EIN</div>
                  <div className="col-7 fw-semibold">{user?.ein || user?.username || "-"}</div>
                  <div className="col-5 text-muted">Display Name</div>
                  <div className="col-7 fw-semibold">{user?.displayName || "-"}</div>
                  <div className="col-5 text-muted">Email</div>
                  <div className="col-7 fw-semibold">{user?.email || "-"}</div>
                  <div className="col-5 text-muted">SOL</div>
                  <div className="col-7 fw-semibold">
                    {user?.sol || "-"}
                    {user?.solName ? ` — ${user.solName}` : ""}
                  </div>
                  <div className="col-5 text-muted">Region / Zone</div>
                  <div className="col-7 fw-semibold">
                    {[user?.regionName, user?.zoneName].filter(Boolean).join(" / ") || "-"}
                  </div>
                  <div className="col-5 text-muted">Active App</div>
                  <div className="col-7 fw-semibold">{activeApp}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
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
