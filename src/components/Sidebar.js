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
  FaCloudDownloadAlt,
  FaCloudUploadAlt,
} from "react-icons/fa";

function Sidebar({ expanded, onToggle }) {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) => paths.some((path) => path && location.pathname === path);

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = Boolean(item.children?.length);
    const isSectionActive = hasChildren
      ? isParentActive(item.children.flatMap(c => c.children ? c.children.map(x => x.to) : [c.to]).filter(Boolean))
      : false;
    const isOpen = openSubmenu === item.label;

    if (!hasChildren) {
      return (
        <Link
          key={item.to}
          to={item.to}
          className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}
          title={expanded ? "" : item.label}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <span className="sidebar-icon">{item.icon}</span>
          {expanded && <span className="sidebar-label">{item.label}</span>}
        </Link>
      );
    }

    return (
      <div
        key={item.label}
        className="sidebar-section"
        onMouseEnter={() => setOpenSubmenu(item.label)}
        onMouseLeave={() => setOpenSubmenu(null)}
      >
        <div className={`sidebar-link section-label ${isSectionActive ? "active" : ""}`} style={{ paddingLeft: `${12 + level * 16}px` }}>
          <span className="sidebar-icon">{item.icon}</span>
          {expanded && <span className="sidebar-label">{item.label}</span>}
        </div>
        <div className={`sidebar-submenu ${isOpen ? "open" : ""}`}>
          {item.children.map((child) => renderMenuItem(child, level + 1))}
        </div>
      </div>
    );
  };

  const menuItems = [
    { to: "/", label: "Dashboard", icon: <FaTachometerAlt /> },
    {
      label: "Request Handling",
      icon: <FaFileInvoiceDollar />,
      children: [
        { to: "/raise-request", label: "Raise Request", icon: <FaPlus /> },
        {
          label: "Request Processing",
          icon: <FaClipboardList />,
          children: [
            { to: "/my-request", label: "View Request", icon: <FaClipboardList /> },
            { to: "/referred-request", label: "Referred Back Request", icon: <FaInbox /> },
            { to: "/rejected", label: "Reject Request", icon: <FaUsers /> },
            { to: "/archival-enquiry", label: "Archival Request", icon: <FaShieldAlt /> },
          ],
        },
      ],
    },
    { to: "/report", label: "Reports", icon: <FaFileAlt /> },
    {
      label: "File Handling",
      icon: <FaCloudDownloadAlt />,
      children: [
        { to: "/file-handling", label: "Vendor File Download", icon: <FaCloudDownloadAlt /> },
        { to: "/arn-file-handling", label: "ARN File Handling", icon: <FaCloudUploadAlt /> },
      ],
    },
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
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

    </aside>
  );
}

export default Sidebar;