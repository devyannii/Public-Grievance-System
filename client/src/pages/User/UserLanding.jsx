import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Home,
  Map,
  FileText,
  User,
  ArrowRight,
} from "lucide-react";

import landingImage from "../../assets/images/user-landing-image.png";

import "../../styles/UserLanding.css";
import "../../styles/UserAppLayout.css";
import "../../styles/BottomNavigation.css";

function UserLanding() {
  const navigate = useNavigate();

  /* =========================================================
     REPORT ISSUE
  ========================================================= */

  const handleReportIssue = () => {
    navigate("/user/report");
  };

  /* =========================================================
     TRACK ISSUE
     
     User enters their Complaint ID on the tracking page.
     Example:
     UGS-1024
  ========================================================= */

  const handleTrackIssue = () => {
    navigate("/user/track");
  };

  return (
    <div className="user-landing-page">

      {/* =====================================================
          MAIN LANDING CARD
      ===================================================== */}

      <main className="user-landing-card">

        {/* ===================================================
            IMAGE / HERO SECTION
        =================================================== */}

        <section
          className="user-landing-hero"
          style={{
            backgroundImage: `url("${landingImage}")`,
          }}
        >

          {/* =================================================
              SOFT IMAGE OVERLAY
          ================================================= */}

          <div className="landing-image-overlay"></div>


          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <div className="landing-content">

            <h1>
              Report.
              <br />

              Track.
              <br />

              <span>Resolve.</span>
            </h1>


            <h2>
              For a Better City.
            </h2>


            <p>
              Report civic issues in your area
              and track their progress in
              real-time.
            </p>


            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="landing-actions">

              {/* REPORT AN ISSUE */}

              <button
                type="button"
                className="report-issue-button"
                onClick={handleReportIssue}
              >

                <span>
                  Report an Issue
                </span>

                <ArrowRight size={17} />

              </button>


              {/* TRACK AN ISSUE */}

              <button
                type="button"
                className="track-issue-button"
                onClick={handleTrackIssue}
              >

                <span>
                  Track an Issue
                </span>

              </button>

            </div>

          </div>


          {/* =================================================
              PAGE INDICATORS
          ================================================= */}

          <div className="landing-indicators">

            <span
              className="landing-dot active"
            ></span>

            <span
              className="landing-dot"
            ></span>

            <span
              className="landing-dot"
            ></span>

          </div>

        </section>


        {/* =====================================================
            BOTTOM NAVIGATION
        ===================================================== */}

        <nav className="user-bottom-navigation">

          {/* =================================================
              HOME
          ================================================= */}

          <button
            type="button"
            className="bottom-nav-item active"
            onClick={() => navigate("/user")}
          >

            <Home size={19} />

            <span>
              Home
            </span>

          </button>


          {/* =================================================
              MAP
          ================================================= */}

          <button
            type="button"
            className="bottom-nav-item"
            onClick={() => navigate("/user/map")}
          >

            <Map size={19} />

            <span>
              Map
            </span>

          </button>


          {/* =================================================
              ADD / REPORT
          ================================================= */}

          <button
            type="button"
            className="bottom-add-button"
            onClick={handleReportIssue}
            aria-label="Report an issue"
          >

            <Plus size={28} />

          </button>


          {/* =================================================
              REPORTS
          ================================================= */}

          <button
            type="button"
            className="bottom-nav-item"
            onClick={() => navigate("/user/reports")}
          >

            <FileText size={19} />

            <span>
              Reports
            </span>

          </button>


          {/* =================================================
              PROFILE
          ================================================= */}

          <button
            type="button"
            className="bottom-nav-item"
            onClick={() => navigate("/user/profile")}
          >

            <User size={19} />

            <span>
              Profile
            </span>

          </button>

        </nav>

      </main>

    </div>
  );
}

export default UserLanding;