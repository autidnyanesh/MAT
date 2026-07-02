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
} from "react-icons/fa";

function Sidebar({ expanded, onToggle }) {
  const location = useLocation();
  const [requestOpen, setRequestOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) => paths.some((path) => location.pathname === path);

  const menuItems = [
    { to: "/", label: "Dashboard", icon: <FaTachometerAlt /> },
    {
      label: "Request Handling",
      icon: <FaFileInvoiceDollar />,
      children: [
        { to: "/raise-request", label: "Raise Request", icon: <FaPlus /> },
        { to: "/my-request", label: "My Requests", icon: <FaClipboardList /> },
        { to: "/referred-request", label: "Referred Back Requests", icon: <FaInbox /> },
        { to: "/enquiry", label: "Enquiry", icon: <FaUsers /> },
        { to: "/archival-enquiry", label: "Archival Enquiry", icon: <FaShieldAlt /> },
      ],
    },
    { to: "/report", label: "Reports", icon: <FaFileAlt /> },
    { to: "/profile-management", label: "Profile", icon: <FaUser /> },
  ];

  return (
    <aside className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-brand">
        <div className="brand-pill">MAT</div>
        {expanded && (
          <div className="brand-copy">
            <strong>Merchant Acquiring Tool</strong>
            <span>Refund & reversal operations</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const isSectionActive = item.children ? isParentActive(item.children.map((child) => child.to)) : false;
          return (
            <div
              key={index}
              className="sidebar-section"
              onMouseEnter={() => item.children && setRequestOpen(true)}
              onMouseLeave={() => item.children && setRequestOpen(false)}
            >
              {!item.children ? (
                <Link
                  to={item.to}
                  className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}
                  title={expanded ? "" : item.label}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {expanded && <span className="sidebar-label">{item.label}</span>}
                </Link>
              ) : (
                <>
                  <div className={`sidebar-link section-label ${isSectionActive ? "active" : ""}`}>
                    <span className="sidebar-icon">{item.icon}</span>
                    {expanded && <span className="sidebar-label">{item.label}</span>}
                  </div>
                  <div className={`sidebar-submenu ${requestOpen ? "open" : ""}`}>
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={`sidebar-link sidebar-child ${isActive(child.to) ? "active" : ""}`}
                        title={expanded ? "" : child.label}
                      >
                        <span className="sidebar-icon">{child.icon}</span>
                        {expanded && <span className="sidebar-label">{child.label}</span>}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </nav>

    </aside>
  );
}

export default Sidebar;