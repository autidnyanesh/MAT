import React from "react";
import { useApplication } from "../../context/ApplicationContext";

/** Shared layout for MEA screens until full pages are built. */
function PageShell({ title, subtitle, children }) {
  const { activeApp } = useApplication();

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-start justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 className="mb-1 fw-semibold">{title}</h4>
          {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
        </div>
        <span className="badge rounded-pill text-bg-success align-self-start">
          {activeApp}
        </span>
      </div>
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-4">
          {children || (
            <p className="text-muted mb-0">
              This MEA screen is ready for wiring. Navigation and app toggle work;
              connect API and form fields here next.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageShell;
