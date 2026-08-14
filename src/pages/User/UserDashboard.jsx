import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Menu,
  Bell,
  FileText,
  Hourglass,
  Check,
  Clock3,
  Home,
  Map,
  Plus,
  ClipboardList,
  User,
  ChevronRight,
} from "lucide-react";

import "../../styles/UserDashboard.css";

const reports = [
  {
    title: "Pothole on MG Road",
    date: "15 May 2026",
    status: "In Progress",
    type: "progress",
    image: "/images/pothole.jpg",
  },
  {
    title: "Garbage Overflow",
    date: "14 May 2026",
    status: "Resolved",
    type: "resolved",
    image: "/images/garbage.jpg",
  },
  {
    title: "Broken Street Light",
    date: "13 May 2026",
    status: "Pending",
    type: "pending",
    image: "/images/street-light.jpg",
  },
  {
    title: "Water Leakage",
    date: "12 May 2026",
    status: "In Progress",
    type: "progress",
    image: "/images/water-leakage.jpg",
  },
];

const StatCard = ({ icon: Icon, value, label, type }) => {
  return (
    <div className="user-stat-card">
      <div className={`user-stat-icon ${type}`}>
        <Icon size={20} strokeWidth={2} />
      </div>

      <div className="user-stat-info">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="user-dashboard-page">

      {/* =========================
          TOP BAR
      ========================= */}

      <header className="user-dashboard-header">

        <button className="user-header-button">
          <Menu size={22} />
        </button>

        <h1>Dashboard</h1>

        <button className="user-header-button notification-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

      </header>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="user-dashboard-content">

        {/* Welcome */}

        <section className="user-welcome">

          <h2>Hello, User 👋</h2>

          <p>
            Let's make our city better together.
          </p>

        </section>


        {/* =========================
            STATISTICS
        ========================= */}

        <section className="user-stats-grid">

          <StatCard
            icon={FileText}
            value="12"
            label="Total Reports"
            type="total"
          />

          <StatCard
            icon={Hourglass}
            value="4"
            label="In Progress"
            type="progress"
          />

          <StatCard
            icon={Check}
            value="5"
            label="Resolved"
            type="resolved"
          />

          <StatCard
            icon={Clock3}
            value="3"
            label="Pending"
            type="pending"
          />

        </section>


        {/* =========================
            RECENT REPORTS
        ========================= */}

        <section className="recent-reports-section">

          <div className="recent-reports-heading">

            <h2>Recent Reports</h2>

            <button
              className="view-all-button"
              onClick={() => navigate("/user/reports")}
            >
              View All
            </button>

          </div>


          <div className="reports-list">

            {reports.map((report, index) => (

              <div
                className="report-card"
                key={index}
                onClick={() => navigate(`/user/issue/${index + 1}`)}
              >

                {/* Report Image */}

                <div className="report-thumbnail">

                  <img
                    src={report.image}
                    alt={report.title}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <FileText
                    className="fallback-report-icon"
                    size={20}
                  />

                </div>


                {/* Report Information */}

                <div className="report-information">

                  <h3>{report.title}</h3>

                  <span>{report.date}</span>

                </div>


                {/* Status */}

                <span className={`report-status ${report.type}`}>
                  {report.status}
                </span>


                {/* Arrow */}

                <ChevronRight
                  className="report-arrow"
                  size={18}
                />

              </div>

            ))}

          </div>

        </section>

      </main>


      {/* =========================
          BOTTOM NAVIGATION
      ========================= */}

      <nav className="user-bottom-navigation">

        {/* HOME */}

        <button className="bottom-nav-item active">

          <Home size={19} />

          <span>Home</span>

        </button>


        {/* MAP */}

        <button
          className="bottom-nav-item"
          onClick={() => navigate("/user/map")}
        >

          <Map size={19} />

          <span>Map</span>

        </button>


        {/* ADD REPORT */}

        <button
          className="report-add-button"
          onClick={() => navigate("/user/report")}
        >

          <Plus
            size={28}
            strokeWidth={2}
          />

        </button>


        {/* REPORTS */}

        <button
          className="bottom-nav-item"
          onClick={() => navigate("/user/reports")}
        >

          <ClipboardList size={19} />

          <span>Reports</span>

        </button>


        {/* PROFILE */}

        <button
          className="bottom-nav-item"
          onClick={() => navigate("/user/profile")}
        >

          <User size={19} />

          <span>Profile</span>

        </button>

      </nav>

    </div>
  );
};

export default UserDashboard;