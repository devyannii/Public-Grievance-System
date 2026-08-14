import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ChevronRight,
  Home,
  Map,
  FileText,
  User,
  Plus,
} from "lucide-react";

import potholeImage from "../../assets/images/pothole.png";
import garbageImage from "../../assets/images/garbage-overflow.png";
import streetlightImage from "../../assets/images/broken-streetlight.png";
import leakageImage from "../../assets/images/leaking-pipe.png";

import "../../styles/MyReports.css";

const reports = [
  {
    id: 1,
    title: "Pothole on MG Road",
    date: "15 May 2026",
    status: "In Progress",
    image: potholeImage,
  },
  {
    id: 2,
    title: "Garbage Overflow",
    date: "14 May 2026",
    status: "Resolved",
    image: garbageImage,
  },
  {
    id: 3,
    title: "Broken Street Light",
    date: "13 May 2026",
    status: "Pending",
    image: streetlightImage,
  },
  {
    id: 4,
    title: "Water Leakage",
    date: "12 May 2026",
    status: "In Progress",
    image: leakageImage,
  },
];

const filters = ["All", "In Progress", "Resolved", "Pending"];

function MyReports() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("All");

  const filteredReports =
    activeFilter === "All"
      ? reports
      : reports.filter((report) => report.status === activeFilter);

  return (
    <div className="my-reports-page">

      {/* ================= HEADER ================= */}

      <header className="my-reports-header">

        <button
          className="reports-back-button"
          onClick={() => navigate("/user")}
        >
          <ArrowLeft size={21} />
        </button>

        <h1>My Reports</h1>

        <div className="reports-header-space"></div>

      </header>


      {/* ================= CONTENT ================= */}

      <main className="my-reports-content">

        {/* FILTERS */}

        <div className="reports-filters">

          {filters.map((filter) => (

            <button
              key={filter}
              className={`report-filter ${
                activeFilter === filter ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>

          ))}

        </div>


        {/* REPORT LIST */}

        <section className="reports-list-page">

          {filteredReports.map((report) => (

            <button
              className="my-report-card"
              key={report.id}
              onClick={() => navigate(`/user/issue/${report.id}`)}
            >

              {/* IMAGE */}

              <div className="my-report-image">

                <img
                  src={report.image}
                  alt={report.title}
                />

              </div>


              {/* INFORMATION */}

              <div className="my-report-information">

                <h2>{report.title}</h2>

                <div className="my-report-meta">

                  <span>{report.date}</span>

                  <span className="meta-dot">•</span>

                  <span
                    className={`my-report-status ${
                      report.status === "In Progress"
                        ? "status-progress"
                        : report.status === "Resolved"
                        ? "status-resolved"
                        : "status-pending"
                    }`}
                  >
                    {report.status}
                  </span>

                </div>

              </div>


              {/* ARROW */}

              <ChevronRight
                className="my-report-arrow"
                size={21}
              />

            </button>

          ))}

        </section>

      </main>


      {/* ================= BOTTOM NAVIGATION ================= */}

      <nav className="user-bottom-navigation reports-bottom-nav">

        {/* HOME */}

        <button
          className="bottom-nav-item"
          onClick={() => navigate("/user")}
        >
          <Home />
          <span>Home</span>
        </button>


        {/* MAP */}

        <button
          className="bottom-nav-item"
          onClick={() => navigate("/user/map")}
        >
          <Map />
          <span>Map</span>
        </button>


        {/* ADD REPORT */}

        <button
          className="report-add-button"
          onClick={() => navigate("/user/report")}
        >
          <Plus />
        </button>


        {/* REPORTS */}

        <button
          className="bottom-nav-item active"
          onClick={() => navigate("/user/reports")}
        >
          <FileText />
          <span>Reports</span>
        </button>


        {/* PROFILE */}

        <button
          className="bottom-nav-item"
          onClick={() => navigate("/user/profile")}
        >
          <User />
          <span>Profile</span>
        </button>

      </nav>

    </div>
  );
}

export default MyReports;