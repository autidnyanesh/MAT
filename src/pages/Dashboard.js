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
  CartesianGrid
} from "recharts";

const Dashboard = () => {

  const [dashboardData, setDashboardData] = useState({
    userSummary: {
      total: 48,
      pending: 12,
      approved: 28,
      rejected: 4,
      referredBack: 4
    },

    solSummary: {
      total: 145,
      pending: 25,
      approved: 95,
      rejected: 15,
      referredBack: 10
    },

    vendorStats: [
      {
        vendor: "Worldline",
        requests: 145
      },
      {
        vendor: "Hitachi",
        requests: 95
      },
      {
        vendor: "Sarvatra",
        requests: 62
      }
    ]
  });

  useEffect(() => {

    // Future API

    /*
    axios.get("/api/dashboard")
      .then((response) => {
        setDashboardData(response.data);
      });
    */

  }, []);

  const COLORS = [
    "#198754",
    "#ffc107",
    "#dc3545",
    "#0dcaf0"
  ];

  const myRequestPieData = [
    {
      name: "Approved",
      value: dashboardData.userSummary.approved
    },
    {
      name: "Pending",
      value: dashboardData.userSummary.pending
    },
    {
      name: "Rejected",
      value: dashboardData.userSummary.rejected
    },
    {
      name: "Referred Back",
      value: dashboardData.userSummary.referredBack
    }
  ];

  const solPieData = [
    {
      name: "Approved",
      value: dashboardData.solSummary.approved
    },
    {
      name: "Pending",
      value: dashboardData.solSummary.pending
    },
    {
      name: "Rejected",
      value: dashboardData.solSummary.rejected
    },
    {
      name: "Referred Back",
      value: dashboardData.solSummary.referredBack
    }
  ];

  return (
    <div className="container-fluid p-2">

      {/* Breadcrumb */}

      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item active">
            Dashboard
          </li>
        </ol>
      </nav>

      <hr style={{ marginTop: "3px" }} />

      {/* PIE CHARTS */}

      <div className="row g-3 mb-4">

        {/* My Requests */}

        <div className="col-lg-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-header bg-white fw-semibold">
              My Request Status
            </div>

            <div className="card-body">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={myRequestPieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    innerRadius={55}
                    paddingAngle={3}
                    label
                  >

                    {myRequestPieData.map(
                      (entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index]}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />
                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        {/* SOL Requests */}

        <div className="col-lg-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-header bg-white fw-semibold">
              SOL Request Status
            </div>

            <div className="card-body">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={solPieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    innerRadius={55}
                    paddingAngle={3}
                    label
                  >

                    {solPieData.map(
                      (entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index]}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />
                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

      {/* BAR CHART */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white fw-semibold py-2">
          Vendor Wise Request Distribution
        </div>

        <div className="card-body p-2">

          <ResponsiveContainer
            width="100%"
            height={300}
            width={400}
          >

            <BarChart
              data={dashboardData.vendorStats}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 5
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="vendor"
              />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="requests"
                name="Requests"
                fill="#0d6efd"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;