import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Label
} from "recharts";

import {
  FaClipboardList,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaUndo
} from "react-icons/fa";

import api from "../api/axiosConfig";

const USE_MOCK_DATA = true;

const COLORS = {
  totalRequest: "#3b82f6",
  approved: "#22c55e",
  pending: "#f59e0b",
  rejected: "#ef4444",
  referredBack: "#8b5cf6",
};

const MOCK_DASHBOARD_DATA = {
  userSummary: {
    total: 48,
    pending: 12,
    approved: 28,
    rejected: 4,
    referredBack: 4,
  },
  solSummary: {
    total: 145,
    pending: 25,
    approved: 95,
    rejected: 15,
    referredBack: 10,
  },
  vendorStats: [
    { vendor: "Worldline", requests: 145 },
    { vendor: "Hitachi", requests: 95 },
    { vendor: "Sarvatra", requests: 62 },
  ],
};

// Single source of truth for vendor bar-chart colors. The bars and the
// legend swatches both read from this array, so they can never fall out
// of sync no matter how many vendors the backend returns.
const BAR_COLORS = ["#0055d3", "#0d6efd", "#8bbaff", "#ef4444", "#8b5cf6", "#06b6d4"];

const StatCard = ({ icon, label, value, accent }) => (
  <div className="col-sm-4 col-xl-4">
    <div
      className="card h-100"
      style={{
        border: "none",
        borderRadius: 14,
        borderLeft: `4px solid ${accent}`,
        background: `${accent}0d`,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 14px 36px rgba(15, 23, 42, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(15, 23, 42, 0.08)";
      }}
    >
      <div className="card-body d-flex align-items-center p-4">
        <div
          className="rounded-3 d-flex align-items-center justify-content-center"
          style={{
            width: 40,
            height: 40,
            background: `${accent}20`,
            color: accent,
            fontSize: 22,
            marginRight: 15,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div className="flex-grow-1">
          <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>
            {label}
          </div>
          <div style={{ color: accent, fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const toPieData = (summary) => [
  { name: "Approved", value: summary.approved, color: COLORS.approved },
  { name: "Pending", value: summary.pending, color: COLORS.pending },
  { name: "Rejected", value: summary.rejected, color: COLORS.rejected },
  { name: "Referred", value: summary.referredBack, color: COLORS.referredBack },
];

const RADIAN = Math.PI / 180;

// External label + leader line for each slice, positioned just outside the
// ring. Explicit fill/stroke colors set here on purpose — Recharts' default
// label/labelLine don't set their own color, so they end up inheriting from
// the slice path they're grouped with (that's what caused the earlier
// stray colored numbers).
const renderSliceLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
  if (!value) return null; // skip 0-value slices to avoid clutter
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fill="#334155" fontSize={13} fontWeight={700}>
      {value}
    </text>
  );
};

const StatusPieCard = ({ title, data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className="card mb-4"
      style={{
        border: "none",
        borderRadius: 18,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
      }}
    >
      <div
        className="card-header bg-white fw-bold"
        style={{ borderBottom: "1px solid #eef2f7", padding: "14px 18px", fontSize: 15 }}
      >
        {title}
      </div>

      <div className="card-body p-3">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={90}
              paddingAngle={1}
              cornerRadius={4}
              label={renderSliceLabel}
              labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}

              {/* Center "total" label. Guarded against cx/cy being
                  0/undefined on the very first render pass — without the
                  guard this can briefly render at (0,0), i.e. the
                  top-left corner of the SVG, as a stray mark. */}
              <Label
                position="center"
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox || {};
                  if (!cx || !cy) return null;
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={cx} dy="-5" fontSize="28" fontWeight="700" fill="#222">
                        {total}
                      </tspan>
                      <tspan x={cx} dy="20" fontSize="12" fill="#94a3b8">
                        Total
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>

            <Tooltip
              contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 6px 15px rgba(0,0,0,.15)" }}
            />
            <Legend verticalAlign="bottom" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Vendor bar chart, with its own color-matched legend built from BAR_COLORS
// so it stays correct regardless of how many vendors the backend returns.
const VendorBarCard = ({ vendorStats }) => (
  <div
    className="card"
    style={{ border: "none", borderRadius: 12, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}
  >
    <div
      className="card-header bg-white fw-bold"
      style={{ borderBottom: "1px solid #eef2f7", padding: "14px 18px" }}
    >
      Vendor Wise Request Distribution
    </div>

    {/* Bar chart */}
    <div className="card-body p-4">
      <div className="row align-items-center g-3">
        <div className="col-md-9">
          <ResponsiveContainer width="80%" height={260}>
            <BarChart data={vendorStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="vendor" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 6px 15px rgba(0,0,0,.15)" }}
                cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
              />
              <Bar dataKey="requests" name="Requests" radius={[10, 10, 0, 0]} maxBarSize={56}>
                {vendorStats.map((item, index) => (
                  <Cell key={item.vendor} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Index — derived from the same vendorStats + BAR_COLORS used by
            the bars above, so it can never fall out of sync with them. */}
        <div className="col-md-3">
          <div className="d-flex flex-column gap-3">
            {vendorStats.map((item, index) => (
              <div key={item.vendor} className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <span
                    style={{
                      width: 10,
                      height: 12,
                      background: BAR_COLORS[index % BAR_COLORS.length],
                      borderRadius: 3,
                      display: "inline-block",
                      marginRight: 10,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 14, color: "#334155" }}>{item.vendor}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{item.requests}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        if (USE_MOCK_DATA) {
          await new Promise((r) => setTimeout(r, 300));
          if (!cancelled) setDashboardData(MOCK_DASHBOARD_DATA);
        } else {
          const response = await api.get("/api/dashboard");
          if (!cancelled) setDashboardData(response.data);
        }
      } catch {
        if (!cancelled) setError("Unable to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container-fluid p-3" style={{ background: "linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%)" }}>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb mb-0" style={{ background: "transparent", padding: 0 }}>
          <li className="breadcrumb-item active fw-semibold text-primary">Dashboard</li>
        </ol>
      </nav>

      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" />
          <span>Loading Dashboard...</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && dashboardData && (
        <div className="row g-4">
          {/* ================= LEFT SIDE ================= */}
          <div className="col-lg-8">
            {/* KPI CARDS */}
            <div className="row g-3 mb-4">
              <StatCard
                icon={<FaClipboardList />}
                label="Total Requests"
                value={dashboardData.userSummary.total}
                accent={COLORS.totalRequest}
              />
              <StatCard
                icon={<FaCheckCircle />}
                label="Approved"
                value={dashboardData.userSummary.approved}
                accent={COLORS.approved}
              />
              <StatCard
                icon={<FaHourglassHalf />}
                label="Pending"
                value={dashboardData.userSummary.pending}
                accent={COLORS.pending}
              />
              <StatCard
                icon={<FaTimesCircle />}
                label="Rejected"
                value={dashboardData.userSummary.rejected}
                accent={COLORS.rejected}
              />
              <StatCard
                icon={<FaUndo />}
                label="Referred Back"
                value={dashboardData.userSummary.referredBack}
                accent={COLORS.referredBack}
              />
            </div>

            {/* VENDOR BAR CHART */}
            <VendorBarCard vendorStats={dashboardData.vendorStats} />
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="col-lg-4">
            <StatusPieCard title="My Request Status" data={toPieData(dashboardData.userSummary)} />
            <StatusPieCard title="SOL Request Status" data={toPieData(dashboardData.solSummary)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;