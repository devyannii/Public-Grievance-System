import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  Hourglass,
  CalendarDays,
  Download,
  Plus,
  ClipboardCheck,
  Megaphone,
  UserPlus,
  BarChart3,
  Settings,
  MoreVertical,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import "../../styles/AdminDashboard.css";

function AdminDashboard() {
  const complaints = [
    {
      id: "#UGS-1287",
      title: "Street light not working",
      category: "Infrastructure",
      location: "Block A, Road 3",
      status: "In Progress",
      date: "May 26, 2025",
    },
    {
      id: "#UGS-1286",
      title: "Water leakage in parking",
      category: "Maintenance",
      location: "Basement Parking",
      status: "Pending",
      date: "May 26, 2025",
    },
    {
      id: "#UGS-1285",
      title: "Garbage not collected",
      category: "Cleanliness",
      location: "Block B, Road 1",
      status: "Pending",
      date: "May 25, 2025",
    },
    {
      id: "#UGS-1284",
      title: "Security guard on duty",
      category: "Security",
      location: "Main Gate",
      status: "Resolved",
      date: "May 25, 2025",
    },
    {
      id: "#UGS-1283",
      title: "Playground maintenance",
      category: "Maintenance",
      location: "Central Park",
      status: "Resolved",
      date: "May 24, 2025",
    },
  ];

  const categories = [
    {
      name: "Maintenance",
      value: 42,
      percentage: "32.8%",
      className: "maintenance",
    },
    {
      name: "Cleanliness",
      value: 28,
      percentage: "21.9%",
      className: "cleanliness",
    },
    {
      name: "Security",
      value: 20,
      percentage: "15.6%",
      className: "security",
    },
    {
      name: "Infrastructure",
      value: 18,
      percentage: "14.1%",
      className: "infrastructure",
    },
    {
      name: "Others",
      value: 20,
      percentage: "15.6%",
      className: "others",
    },
  ];

  return (
    <AdminLayout>
      <div className="dashboard-page">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="dashboard-header">

          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back, Admin! Here's what's happening
              in your community.
            </p>
          </div>


          <div className="dashboard-header-actions">

            <button className="date-button">
              <CalendarDays size={17} />

              <span>May 20 – May 26, 2025</span>

              <span className="date-arrow">⌄</span>
            </button>


            <button className="download-button">
              <Download size={17} />

              <span>Download Report</span>
            </button>

          </div>

        </div>


        {/* =========================================
            STATISTICS
        ========================================= */}

        <section className="stats-grid">

          {/* Total */}
          <div className="stat-card">

            <div className="stat-icon green">
              <ClipboardList size={23} />
            </div>

            <div className="stat-content">

              <span className="stat-label">
                Total Complaints
              </span>

              <strong>128</strong>

              <p className="stat-change positive">
                ↑ 12%
                <span>from last week</span>
              </p>

            </div>

          </div>


          {/* Pending */}
          <div className="stat-card">

            <div className="stat-icon yellow">
              <Clock3 size={23} />
            </div>

            <div className="stat-content">

              <span className="stat-label">
                Pending Complaints
              </span>

              <strong>42</strong>

              <p className="stat-change warning">
                ↑ 8%
                <span>from last week</span>
              </p>

            </div>

          </div>


          {/* Resolved */}
          <div className="stat-card">

            <div className="stat-icon green">
              <CheckCircle2 size={23} />
            </div>

            <div className="stat-content">

              <span className="stat-label">
                Resolved Complaints
              </span>

              <strong>78</strong>

              <p className="stat-change positive">
                ↑ 15%
                <span>from last week</span>
              </p>

            </div>

          </div>


          {/* In Progress */}
          <div className="stat-card">

            <div className="stat-icon blue">
              <Hourglass size={23} />
            </div>

            <div className="stat-content">

              <span className="stat-label">
                In Progress
              </span>

              <strong>8</strong>

              <p className="stat-change blue-text">
                ↓ 5%
                <span>from last week</span>
              </p>

            </div>

          </div>

        </section>


        {/* =========================================
            CHARTS ROW
        ========================================= */}

        <section className="dashboard-charts-grid">

          {/* Complaints Overview */}

          <div className="dashboard-card overview-card">

            <div className="card-header">

              <h2>Complaints Overview</h2>

              <button className="small-select">
                This Week
                <span>⌄</span>
              </button>

            </div>


            {/* Legend */}

            <div className="chart-legend">

              <span>
                <i className="legend-dot received"></i>
                Received
              </span>

              <span>
                <i className="legend-dot resolved"></i>
                Resolved
              </span>

              <span>
                <i className="legend-dot pending"></i>
                Pending
              </span>

            </div>


            {/* Simple chart */}

            <div className="line-chart">

              <div className="chart-y-axis">
                <span>40</span>
                <span>30</span>
                <span>20</span>
                <span>10</span>
                <span>0</span>
              </div>


              <div className="chart-area">

                <div className="chart-grid-line line-1"></div>
                <div className="chart-grid-line line-2"></div>
                <div className="chart-grid-line line-3"></div>
                <div className="chart-grid-line line-4"></div>
                <div className="chart-grid-line line-5"></div>


                <svg
                  className="chart-svg"
                  viewBox="0 0 700 220"
                  preserveAspectRatio="none"
                >

                  {/* Received */}
                  <polyline
                    points="0,112 100,55 200,82 300,32 400,58 500,50 600,82 700,58"
                    className="chart-line received-line"
                  />

                  {/* Resolved */}
                  <polyline
                    points="0,165 100,125 200,145 300,105 400,132 500,108 600,142 700,118"
                    className="chart-line resolved-line"
                  />

                  {/* Pending */}
                  <polyline
                    points="0,190 100,174 200,177 300,158 400,177 500,165 600,176 700,160"
                    className="chart-line pending-line"
                  />

                </svg>


                <div className="chart-x-axis">
                  <span>May 20</span>
                  <span>May 21</span>
                  <span>May 22</span>
                  <span>May 23</span>
                  <span>May 24</span>
                  <span>May 25</span>
                  <span>May 26</span>
                </div>

              </div>

            </div>

          </div>


          {/* Category Chart */}

          <div className="dashboard-card category-card">

            <div className="card-header">

              <h2>Complaints by Category</h2>

              <button className="small-select">
                This Month
                <span>⌄</span>
              </button>

            </div>


            <div className="category-content">

              <div className="donut-chart">

                <div className="donut-hole">
                  <strong>128</strong>
                  <span>Total</span>
                </div>

              </div>


              <div className="category-list">

                {categories.map((category) => (
                  <div
                    className="category-item"
                    key={category.name}
                  >

                    <div className="category-name">

                      <span
                        className={`category-dot ${category.className}`}
                      ></span>

                      <span>{category.name}</span>

                    </div>

                    <span className="category-value">
                      {category.value}
                      {" "}
                      <small>
                        ({category.percentage})
                      </small>
                    </span>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            BOTTOM ROW
        ========================================= */}

        <section className="dashboard-bottom-grid">

          {/* Recent Complaints */}

          <div className="dashboard-card complaints-card">

            <div className="card-header">

              <h2>Recent Complaints</h2>

              <button className="view-all-button">
                View All
              </button>

            </div>


            <div className="complaints-table-wrapper">

              <table className="complaints-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>


                <tbody>

                  {complaints.map((complaint) => (
                    <tr key={complaint.id}>

                      <td className="complaint-id">
                        {complaint.id}
                      </td>

                      <td>
                        {complaint.title}
                      </td>

                      <td>
                        <span
                          className={`category-badge ${complaint.category
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {complaint.category}
                        </span>
                      </td>

                      <td>
                        {complaint.location}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${complaint.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {complaint.status}
                        </span>
                      </td>

                      <td>
                        {complaint.date}
                      </td>

                      <td>
                        <button className="more-button">
                          <MoreVertical size={16} />
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>


          {/* Quick Actions */}

          <div className="dashboard-card quick-actions-card">

            <div className="card-header">

              <h2>Quick Actions</h2>

            </div>


            <div className="quick-actions-grid">

              <button className="quick-action green-action">

                <div className="quick-action-icon">
                  <Plus size={20} />
                </div>

                <div>
                  <strong>New Complaint</strong>
                  <span>Register a new complaint</span>
                </div>

              </button>


              <button className="quick-action blue-action">

                <div className="quick-action-icon">
                  <ClipboardCheck size={20} />
                </div>

                <div>
                  <strong>Assign Task</strong>
                  <span>Assign to staff/committee</span>
                </div>

              </button>


              <button className="quick-action yellow-action">

                <div className="quick-action-icon">
                  <Megaphone size={20} />
                </div>

                <div>
                  <strong>Announcement</strong>
                  <span>Send announcement</span>
                </div>

              </button>


              <button className="quick-action purple-action">

                <div className="quick-action-icon">
                  <UserPlus size={20} />
                </div>

                <div>
                  <strong>Add Resident</strong>
                  <span>Add new resident</span>
                </div>

              </button>


              <button className="quick-action teal-action">

                <div className="quick-action-icon">
                  <BarChart3 size={20} />
                </div>

                <div>
                  <strong>View Reports</strong>
                  <span>Check detailed reports</span>
                </div>

              </button>


              <button className="quick-action gray-action">

                <div className="quick-action-icon">
                  <Settings size={20} />
                </div>

                <div>
                  <strong>Settings</strong>
                  <span>Manage system settings</span>
                </div>

              </button>

            </div>

          </div>

        </section>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;