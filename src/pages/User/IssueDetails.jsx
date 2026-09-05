import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Home,
  Map,
  Plus,
  FileText,
  User,
} from "lucide-react";

import potholeImage from "../../assets/images/pothole.png";

import "../../styles/IssueDetails.css";
import "../../styles/UserAppLayout.css";

function IssueDetails() {
  const navigate = useNavigate();

  return (
    <div className="issue-details-page">

      {/* =========================
          CARD
      ========================= */}

      <div className="issue-details-card">

        {/* =========================
            HEADER
        ========================= */}

        <header className="issue-details-header">

          <button
            className="issue-details-back"
            onClick={() => navigate("/user/reports")}
          >
            <ArrowLeft size={21} />
          </button>

          <h1>Issue Details</h1>

          <div className="issue-header-space"></div>

        </header>


        {/* =========================
            CONTENT
        ========================= */}

        <main className="issue-details-content">

          {/* IMAGE */}

          <div className="issue-details-image">
            <img
              src={potholeImage}
              alt="Pothole on MG Road"
            />
          </div>


          {/* TITLE */}

          <div className="issue-title-row">

            <h2>
              Pothole on MG Road
            </h2>

            <span className="issue-status">
              In Progress
            </span>

          </div>


          {/* LOCATION */}

          <div className="issue-info-row">

            <MapPin size={14} />

            <span>
              MG Road, Pune, Maharashtra
            </span>

          </div>


          {/* DATE */}

          <div className="issue-info-row">

            <CalendarDays size={14} />

            <span>
              15 May 2024 at 10:30 AM
            </span>

          </div>


          {/* DESCRIPTION */}

          <section className="issue-description">

            <h3>
              Description
            </h3>

            <p>
              There is a deep pothole on the road causing
              traffic and vehicle damage.
            </p>

          </section>


          {/* STATUS TIMELINE */}

          <section className="issue-timeline">

            <h3>
              Status Timeline
            </h3>


            {/* REPORTED */}

            <div className="timeline-item completed">

              <div className="timeline-dot">
                ✓
              </div>

              <div className="timeline-content">

                <h4>
                  Reported
                </h4>

                <p>
                  15 May 2024, 10:30 AM
                </p>

              </div>

            </div>


            {/* IN PROGRESS */}

            <div className="timeline-item current">

              <div className="timeline-dot"></div>

              <div className="timeline-content">

                <h4>
                  In Progress
                </h4>

                <p>
                  16 May 2024, 11:00 AM
                </p>

                <small>
                  Issue assigned to Road Maintenance Department
                </small>

              </div>

            </div>


            {/* PENDING */}

            <div className="timeline-item pending">

              <div className="timeline-dot"></div>

              <div className="timeline-content">

                <h4>
                  Pending
                </h4>

                <p>
                  Resolution in progress
                </p>

              </div>

            </div>


            {/* RESOLVED */}

            <div className="timeline-item pending last">

              <div className="timeline-dot"></div>

              <div className="timeline-content">

                <h4>
                  Resolved
                </h4>

                <p>
                  Will be updated soon
                </p>

              </div>

            </div>

          </section>

        </main>


        {/* =========================
            BOTTOM NAVIGATION
        ========================= */}

        <nav className="issue-details-navigation">

          {/* HOME */}

          <button
            className="issue-nav-item"
            onClick={() => navigate("/user")}
          >
            <Home size={20} />

            <span>
              Home
            </span>
          </button>


          {/* MAP */}

          <button
            className="issue-nav-item"
            onClick={() => navigate("/user/map")}
          >
            <Map size={20} />

            <span>
              Map
            </span>
          </button>


          {/* ADD */}

          <button
            className="issue-nav-add"
            onClick={() => navigate("/user/report")}
          >
            <Plus size={28} />
          </button>


          {/* REPORTS */}

          <button
            className="issue-nav-item active"
            onClick={() => navigate("/user/reports")}
          >
            <FileText size={20} />

            <span>
              Reports
            </span>
          </button>


          {/* PROFILE */}

          <button
            className="issue-nav-item"
            onClick={() => navigate("/user/profile")}
          >
            <User size={20} />

            <span>
              Profile
            </span>
          </button>

        </nav>

      </div>

    </div>
  );
}

export default IssueDetails;