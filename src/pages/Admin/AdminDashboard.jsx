import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  Hourglass,
  BarChart3,
  UserPlus,
  Megaphone,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  MoreVertical,
  MapPin,
  CalendarDays,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";

import potholeImage from "../../assets/images/pothole.png";
import garbageImage from "../../assets/images/garbage-overflow.png";
import streetLightImage from "../../assets/images/broken-streetlight.png";
import leakageImage from "../../assets/images/leaking-pipe.png";

import "../../styles/AdminDashboard.css";


function AdminDashboard() {

  const navigate = useNavigate();


  /* =========================================
     RECENT COMPLAINTS
  ========================================= */

  const recentComplaints = [
    {
      id: "#UGS-1287",
      title: "Street light not working",
      category: "Infrastructure",
      location: "Block A, Road 3",
      status: "In Progress",
      date: "May 26, 2025",
      image: streetLightImage,
    },

    {
      id: "#UGS-1286",
      title: "Water leakage in parking",
      category: "Maintenance",
      location: "Basement Parking",
      status: "Pending",
      date: "May 26, 2025",
      image: leakageImage,
    },

    {
      id: "#UGS-1285",
      title: "Garbage not collected",
      category: "Cleanliness",
      location: "Block B, Road 1",
      status: "Pending",
      date: "May 25, 2025",
      image: garbageImage,
    },

    {
      id: "#UGS-1284",
      title: "Security guard on duty",
      category: "Security",
      location: "Main Gate",
      status: "Resolved",
      date: "May 25, 2025",
      image: potholeImage,
    },
  ];


  /* =========================================
     STATUS CLASS
  ========================================= */

  const getStatusClass = (status) => {

    if (status === "Resolved") {
      return "status-resolved";
    }

    if (status === "Pending") {
      return "status-pending";
    }

    return "status-progress";
  };


  return (

    <AdminLayout>

      <div className="dashboard-page">


        {/* =========================================
            HEADER
        ========================================= */}

        <div className="dashboard-header">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back, Admin! Here's what's happening in your community.
            </p>

          </div>


          <div className="dashboard-header-actions">

            <button className="date-selector">

              <CalendarDays size={17} />

              <span>
                May 20 – May 26, 2025
              </span>

              <ChevronDown size={15} />

            </button>


            <button className="download-button">

              <BarChart3 size={17} />

              Download Report

            </button>

          </div>

        </div>


        {/* =========================================
            STAT CARDS
        ========================================= */}

        <div className="stats-grid">


          {/* TOTAL */}

          <div className="stat-card">

            <div className="stat-icon stat-green">
              <ClipboardList size={23} />
            </div>

            <div className="stat-content">

              <span>
                Total Complaints
              </span>

              <strong>
                128
              </strong>

              <small className="trend-up">
                <ArrowUp size={13} />
                12% from last week
              </small>

            </div>

          </div>


          {/* PENDING */}

          <div className="stat-card">

            <div className="stat-icon stat-yellow">
              <Clock3 size={23} />
            </div>

            <div className="stat-content">

              <span>
                Pending Complaints
              </span>

              <strong>
                42
              </strong>

              <small className="trend-yellow">
                <ArrowUp size={13} />
                8% from last week
              </small>

            </div>

          </div>


          {/* RESOLVED */}

          <div className="stat-card">

            <div className="stat-icon stat-green">
              <CheckCircle2 size={23} />
            </div>

            <div className="stat-content">

              <span>
                Resolved Complaints
              </span>

              <strong>
                78
              </strong>

              <small className="trend-up">
                <ArrowUp size={13} />
                15% from last week
              </small>

            </div>

          </div>


          {/* IN PROGRESS */}

          <div className="stat-card">

            <div className="stat-icon stat-blue">
              <Hourglass size={23} />
            </div>

            <div className="stat-content">

              <span>
                In Progress
              </span>

              <strong>
                8
              </strong>

              <small className="trend-down">
                <ArrowDown size={13} />
                5% from last week
              </small>

            </div>

          </div>

        </div>


        {/* =========================================
            CHARTS ROW
        ========================================= */}

        <div className="dashboard-charts">


          {/* COMPLAINT OVERVIEW */}

          <section className="dashboard-card overview-card">

            <div className="card-header">

              <h2>
                Complaints Overview
              </h2>

              <button className="small-selector">
                This Week
                <ChevronDown size={14} />
              </button>

            </div>


            <div className="chart-legend">

              <span>
                <i className="legend-green"></i>
                Received
              </span>

              <span>
                <i className="legend-blue"></i>
                Resolved
              </span>

              <span>
                <i className="legend-yellow"></i>
                Pending
              </span>

            </div>


            <div className="line-chart">

              <div className="chart-grid-lines">

                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>

              </div>


              <svg
                viewBox="0 0 800 250"
                preserveAspectRatio="none"
                className="chart-svg"
              >

                {/* RECEIVED */}

                <polyline
                  points="0,180 115,95 230,130 345,55 460,92 575,78 690,125 800,90"
                  className="chart-line received-line"
                />


                {/* RESOLVED */}

                <polyline
                  points="0,215 115,160 230,185 345,125 460,160 575,130 690,180 800,145"
                  className="chart-line resolved-line"
                />


                {/* PENDING */}

                <polyline
                  points="0,235 115,210 230,215 345,190 460,215 575,195 690,210 800,185"
                  className="chart-line pending-line"
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


          {/* CATEGORY */}

          <section className="dashboard-card category-card">

            <div className="card-header">

              <h2>
                Complaints by Category
              </h2>

              <button className="small-selector">
                This Month
                <ChevronDown size={14} />
              </button>

            </div>


            <div className="category-content">


              <div className="donut-chart">

                <div className="donut-hole">

                  <strong>
                    128
                  </strong>

                  <span>
                    Total
                  </span>

                </div>

              </div>


              <div className="category-list">

                <div>
                  <span className="category-dot maintenance"></span>
                  <span>Maintenance</span>
                  <strong>42 <small>(32.8%)</small></strong>
                </div>

                <div>
                  <span className="category-dot cleanliness"></span>
                  <span>Cleanliness</span>
                  <strong>28 <small>(21.9%)</small></strong>
                </div>

                <div>
                  <span className="category-dot security"></span>
                  <span>Security</span>
                  <strong>20 <small>(15.6%)</small></strong>
                </div>

                <div>
                  <span className="category-dot infrastructure"></span>
                  <span>Infrastructure</span>
                  <strong>18 <small>(14.1%)</small></strong>
                </div>

                <div>
                  <span className="category-dot others"></span>
                  <span>Others</span>
                  <strong>20 <small>(15.6%)</small></strong>
                </div>

              </div>

            </div>

          </section>

        </div>


        {/* =========================================
            BOTTOM ROW
        ========================================= */}

        <div className="dashboard-bottom">


          {/* =====================================
              RECENT COMPLAINTS
          ===================================== */}

          <section className="dashboard-card recent-card">

            <div className="card-header">

              <h2>
                Recent Complaints
              </h2>

              <button
                className="view-all-button"
                onClick={() => navigate("/admin/complaints")}
              >
                View All
              </button>

            </div>


            <div className="complaints-table">


              <div className="table-header">

                <span>ID</span>
                <span>Complaint</span>
                <span>Category</span>
                <span>Location</span>
                <span>Status</span>
                <span>Date</span>
                <span></span>

              </div>


              {recentComplaints.map((complaint) => (

                <div
                  className="complaint-row"
                  key={complaint.id}
                >

                  <span className="complaint-id">
                    {complaint.id}
                  </span>


                  <div className="complaint-title">

                    <img
                      src={complaint.image}
                      alt={complaint.title}
                    />

                    <strong>
                      {complaint.title}
                    </strong>

                  </div>


                  <span>
                    <span className="category-badge">
                      {complaint.category}
                    </span>
                  </span>


                  <span className="location-cell">

                    <MapPin size={14} />

                    {complaint.location}

                  </span>


                  <span>

                    <span
                      className={`status-badge ${getStatusClass(
                        complaint.status
                      )}`}
                    >
                      {complaint.status}
                    </span>

                  </span>


                  <span>
                    {complaint.date}
                  </span>


                  <button className="more-button">

                    <MoreVertical size={17} />

                  </button>

                </div>

              ))}

            </div>

          </section>


          {/* =====================================
              QUICK ACTIONS
          ===================================== */}

          <section className="dashboard-card quick-actions-card">

            <div className="card-header">

              <h2>
                Quick Actions
              </h2>

            </div>


            <div className="quick-actions-grid">


              {/* =================================
                  ASSIGN COMPLAINT
              ================================= */}

              <button
                className="quick-action green-action"
                onClick={() => navigate("/admin/departments")}
              >

                <div className="quick-action-icon">

                  <UserPlus size={23} />

                </div>

                <div className="quick-action-text">

                  <strong>
                    Assign Complaint
                  </strong>

                  <span>
                    Assign to staff/department
                  </span>

                </div>

              </button>


              {/* =================================
                  VIEW ALL REPORTS
              ================================= */}

              <button
                className="quick-action blue-action"
                onClick={() => navigate("/admin/reports")}
              >

                <div className="quick-action-icon">

                  <BarChart3 size={23} />

                </div>

                <div className="quick-action-text">

                  <strong>
                    View All Reports
                  </strong>

                  <span>
                    Check detailed reports
                  </span>

                </div>

              </button>


              {/* =================================
                  ADD ANNOUNCEMENT
              ================================= */}

              <button
                className="quick-action red-action"
                onClick={() => navigate("/admin/announcements")}
              >

                <div className="quick-action-icon">

                  <Megaphone size={23} />

                </div>

                <div className="quick-action-text">

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