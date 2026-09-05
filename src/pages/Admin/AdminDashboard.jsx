import React from "react";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  Hourglass,
  TrendingUp,
  TrendingDown,
  MapPin,
  MoreVertical,
  UserPlus,
  BarChart3,
  Megaphone,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/layout/AdminLayout";

import "../../styles/AdminDashboard.css";


/* =========================================================
   DATA
========================================================= */

const stats = [
  {
    title: "Total Complaints",
    value: "128",
    change: "12% from last week",
    direction: "up",
    type: "total",
    icon: ClipboardList,
  },

  {
    title: "Pending Complaints",
    value: "42",
    change: "8% from last week",
    direction: "up",
    type: "pending",
    icon: Clock3,
  },

  {
    title: "Resolved Complaints",
    value: "78",
    change: "15% from last week",
    direction: "up",
    type: "resolved",
    icon: CheckCircle2,
  },

  {
    title: "In Progress",
    value: "8",
    change: "5% from last week",
    direction: "down",
    type: "progress",
    icon: Hourglass,
  },
];


const recentComplaints = [
  {
    id: "#UGS-1287",
    complaint: "Street light not working",
    category: "Infrastructure",
    location: "Block A, Road 3",
    status: "In Progress",
    date: "May 26, 2025",
  },

  {
    id: "#UGS-1286",
    complaint: "Water leakage in parking",
    category: "Maintenance",
    location: "Basement Parking",
    status: "Pending",
    date: "May 26, 2025",
  },

  {
    id: "#UGS-1285",
    complaint: "Garbage overflow near gate",
    category: "Cleanliness",
    location: "Main Gate",
    status: "Resolved",
    date: "May 25, 2025",
  },

  {
    id: "#UGS-1284",
    complaint: "Pothole on MG Road",
    category: "Maintenance",
    location: "MG Road",
    status: "In Progress",
    date: "May 25, 2025",
  },
];


const categoryData = [
  {
    name: "Maintenance",
    value: 42,
    percentage: "32.8%",
    color: "green",
  },

  {
    name: "Cleanliness",
    value: 28,
    percentage: "21.9%",
    color: "blue",
  },

  {
    name: "Security",
    value: 20,
    percentage: "15.6%",
    color: "orange",
  },

  {
    name: "Infrastructure",
    value: 18,
    percentage: "14.1%",
    color: "purple",
  },

  {
    name: "Others",
    value: 20,
    percentage: "15.6%",
    color: "gray",
  },
];


/* =========================================================
   COMPONENT
========================================================= */

function AdminDashboard() {

  const navigate = useNavigate();


  return (
    <AdminLayout>

      <div className="admin-dashboard">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

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
              May 20 – May 26, 2025
            </button>

            <button className="download-button">
              Download Report
            </button>

          </div>

        </div>



        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="dashboard-stats">

          {stats.map((stat) => {

            const Icon = stat.icon;

            return (

              <div
                className={`stat-card ${stat.type}`}
                key={stat.title}
              >

                <div className="stat-icon">

                  <Icon size={22} />

                </div>


                <div className="stat-content">

                  <span className="stat-title">
                    {stat.title}
                  </span>

                  <strong className="stat-value">
                    {stat.value}
                  </strong>


                  <span
                    className={`stat-change ${stat.direction}`}
                  >

                    {stat.direction === "up" ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}

                    {stat.change}

                  </span>

                </div>

              </div>

            );

          })}

        </div>



        {/* =================================================
            ANALYTICS ROW
        ================================================= */}

        <div className="dashboard-analytics">


          {/* =================================================
              COMPLAINT OVERVIEW
          ================================================= */}

          <section className="dashboard-card overview-card">

            <div className="card-header">

              <div>

                <h2>Complaints Overview</h2>

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

              </div>


              <select defaultValue="week">

                <option value="week">
                  This Week
                </option>

                <option value="month">
                  This Month
                </option>

              </select>

            </div>


            {/* SIMPLE CHART */}

            <div className="chart-area">

              <div className="chart-grid">

                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>

              </div>


              <svg
                className="complaint-chart"
                viewBox="0 0 800 230"
                preserveAspectRatio="none"
              >

                {/* Received */}

                <polyline
                  points="
                    0,175
                    115,105
                    230,135
                    345,75
                    460,102
                    575,88
                    690,130
                    800,98
                  "
                  fill="none"
                  stroke="#1c9a50"
                  strokeWidth="3"
                />


                {/* Resolved */}

                <polyline
                  points="
                    0,205
                    115,160
                    230,180
                    345,125
                    460,155
                    575,132
                    690,178
                    800,145
                  "
                  fill="none"
                  stroke="#347fe5"
                  strokeWidth="3"
                />


                {/* Pending */}

                <polyline
                  points="
                    0,220
                    115,192
                    230,198
                    345,173
                    460,198
                    575,178
                    690,193
                    800,172
                  "
                  fill="none"
                  stroke="#f0a000"
                  strokeWidth="3"
                />

              </svg>


              <div className="chart-labels">

                <span>May 20</span>
                <span>May 21</span>
                <span>May 22</span>
                <span>May 23</span>
                <span>May 24</span>
                <span>May 25</span>
                <span>May 26</span>

              </div>

            </div>

          </section>



          {/* =================================================
              CATEGORY CHART
          ================================================= */}

          <section className="dashboard-card category-card">

            <div className="card-header">

              <h2>
                Complaints by Category
              </h2>

              <select defaultValue="month">

                <option value="month">
                  This Month
                </option>

                <option value="week">
                  This Week
                </option>

              </select>

            </div>


            <div className="category-content">


              {/* DONUT */}

              <div className="donut-wrapper">

                <div className="donut-chart">

                  <div className="donut-center">

                    <strong>128</strong>

                    <span>Total</span>

                  </div>

                </div>

              </div>


              {/* LEGEND */}

              <div className="category-list">

                {categoryData.map((item) => (

                  <div
                    className="category-row"
                    key={item.name}
                  >

                    <div className="category-name">

                      <i
                        className={`category-dot ${item.color}`}
                      ></i>

                      <span>
                        {item.name}
                      </span>

                    </div>


                    <div className="category-number">

                      <strong>
                        {item.value}
                      </strong>

                      <span>
                        ({item.percentage})
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </section>

        </div>



        {/* =================================================
            BOTTOM ROW
        ================================================= */}

        <div className="dashboard-bottom">


          {/* =================================================
              RECENT COMPLAINTS
          ================================================= */}

          <section className="dashboard-card recent-card">

            <div className="card-header">

              <h2>
                Recent Complaints
              </h2>


              <button
                className="view-all"
                onClick={() =>
                  navigate("/admin/complaints")
                }
              >
                View All
              </button>

            </div>


            <div className="complaints-table-wrapper">

              <table className="complaints-table">

                <thead>

                  <tr>

                    <th>ID</th>
                    <th>Complaint</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>

                  </tr>

                </thead>


                <tbody>

                  {recentComplaints.map((complaint) => (

                    <tr key={complaint.id}>

                      <td className="complaint-id">
                        {complaint.id}
                      </td>


                      <td className="complaint-title">
                        {complaint.complaint}
                      </td>


                      <td>

                        <span className="category-badge">
                          {complaint.category}
                        </span>

                      </td>


                      <td>

                        <span className="location-cell">

                          <MapPin size={14} />

                          {complaint.location}

                        </span>

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


                      <td className="date-cell">
                        {complaint.date}
                      </td>


                      <td>

                        <button className="more-button">

                          <MoreVertical size={17} />

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>



          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="dashboard-card quick-card">

            <div className="card-header">

              <h2>
                Quick Actions
              </h2>

            </div>


            <div className="quick-actions">


              <button
                className="quick-action assign"
              >

                <div className="quick-icon">

                  <UserPlus size={22} />

                </div>


                <div>

                  <strong>
                    Assign Complaint
                  </strong>

                  <span>
                    Assign to staff/department
                  </span>

                </div>

              </button>



              <button
                className="quick-action reports"
                onClick={() =>
                  navigate("/admin/reports")
                }
              >

                <div className="quick-icon">

                  <BarChart3 size={22} />

                </div>


                <div>

                  <strong>
                    View All Reports
                  </strong>

                  <span>
                    Check detailed reports
                  </span>

                </div>

              </button>



              <button
                className="quick-action announcement"
              >

                <div className="quick-icon">

                  <Megaphone size={22} />

                </div>


                <div>

                  <strong>
                    Add Announcement
                  </strong>

                  <span>
                    Send an announcement
                  </span>

                </div>

              </button>


            </div>

          </section>


        </div>


      </div>

    </AdminLayout>
  );
}


export default AdminDashboard;