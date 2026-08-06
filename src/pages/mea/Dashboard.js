import React from "react";
import PageShell from "./PageShell";

function Dashboard() {
  return (
    <PageShell
      title="MEA Dashboard"
      subtitle="Merchant Enablement App — enrolment overview"
    >
      <div className="row g-3">
        {[
          { label: "Total Enrolments", value: "—" },
          { label: "Pending Approval", value: "—" },
          { label: "Approved", value: "—" },
          { label: "Rejected", value: "—" },
        ].map((card) => (
          <div className="col-sm-6 col-xl-3" key={card.label}>
            <div
              className="p-3 h-100"
              style={{
                borderRadius: 12,
                background: "rgba(15, 118, 110, 0.08)",
                borderLeft: "4px solid #0f766e",
              }}
            >
              <div className="text-muted small">{card.label}</div>
              <div className="fs-4 fw-semibold mt-1">{card.value}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted small mt-4 mb-0">
        Switch back to MAT anytime from the navbar toggle — session stays signed in.
      </p>
    </PageShell>
  );
}

export default Dashboard;
