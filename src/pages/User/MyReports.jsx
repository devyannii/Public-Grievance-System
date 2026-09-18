import React, { useEffect, useState } from "react";
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

import { supabase } from "../../lib/supabaseClient";

import "../../styles/MyReports.css";
import "../../styles/UserAppLayout.css";


// ======================================================
// FILTERS
// ======================================================

const filters = [
  "All",
  "In Progress",
  "Resolved",
  "Pending",
];


// ======================================================
// STATUS CLASS
// ======================================================

function getStatusClass(status) {
  if (status === "In Progress") {
    return "status-progress";
  }

  if (status === "Resolved") {
    return "status-resolved";
  }

  return "status-pending";
}


// ======================================================
// MY REPORTS
// ======================================================

function MyReports() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] =
    useState("All");

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ====================================================
  // LOAD ONLY LOGGED-IN USER'S REPORTS
  // ====================================================

  useEffect(() => {
    const loadMyReports = async () => {
      try {
        setLoading(true);
        setError("");


        // ----------------------------------------------
        // Get logged-in user
        // ----------------------------------------------

        const {
          data: {
            user,
          },
          error: userError,
        } = await supabase.auth.getUser();


        if (userError) {
          throw userError;
        }


        if (!user) {
          navigate("/user/login");
          return;
        }


        // ----------------------------------------------
        // Get ONLY this user's complaints
        // ----------------------------------------------

        const {
          data,
          error: complaintsError,
        } = await supabase
          .from("complaints")
          .select(`
            id,
            complaint_code,
            title,
            status,
            created_at,
            complaint_images(
              storage_path,
              created_at
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });


        if (complaintsError) {
          throw complaintsError;
        }


        // ----------------------------------------------
        // Format reports
        // ----------------------------------------------

        const formattedReports =
          await Promise.all(
            (data || []).map(
              async (report) => {

                let imageUrl = "";


                // ------------------------------------
                // Get first uploaded image
                // ------------------------------------

                const firstImage =
                  report.complaint_images?.[0];


                if (
                  firstImage?.storage_path
                ) {
                  const {
                    data: signedImage,
                    error: imageError,
                  } =
                    await supabase.storage
                      .from(
                        "complaint-images"
                      )
                      .createSignedUrl(
                        firstImage.storage_path,
                        3600
                      );


                  if (
                    !imageError &&
                    signedImage?.signedUrl
                  ) {
                    imageUrl =
                      signedImage.signedUrl;
                  }
                }


                // ------------------------------------
                // Format date
                // ------------------------------------

                const createdAt =
                  new Date(
                    report.created_at
                  );


                const formattedDate =
                  createdAt.toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );


                return {
                  // IMPORTANT:
                  // This is the REAL UUID.
                  // IssueDetails expects this.
                  id: report.id,

                  // Human-readable complaint ID
                  complaintCode:
                    report.complaint_code,

                  title:
                    report.title ||
                    "Untitled Complaint",

                  date:
                    formattedDate,

                  status:
                    report.status ||
                    "Pending",

                  image:
                    imageUrl,
                };
              }
            )
          );


        setReports(
          formattedReports
        );

      } catch (err) {

        console.error(
          "My Reports error:",
          err
        );

        setError(
          err?.message ||
          "Unable to load your reports."
        );

      } finally {
        setLoading(false);
      }
    };


    loadMyReports();
  }, [navigate]);


  // ====================================================
  // FILTER REPORTS
  // ====================================================

  const filteredReports =
    activeFilter === "All"
      ? reports
      : reports.filter(
          (report) =>
            report.status ===
            activeFilter
        );


  // ====================================================
  // OPEN REPORT
  // ====================================================

  const openReport = (reportId) => {
    navigate(
      `/user/issue/${reportId}`
    );
  };


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="my-reports-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="my-reports-header">

        <button
          className="reports-back-button"
          onClick={() =>
            navigate("/user")
          }
          aria-label="Back to home"
        >
          <ArrowLeft size={21} />
        </button>


        <h1>
          My Reports
        </h1>


        <div className="reports-header-space">
        </div>

      </header>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <main className="my-reports-content">

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="reports-filters">

          {filters.map(
            (filter) => (

              <button
                key={filter}
                className={`report-filter ${
                  activeFilter === filter
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveFilter(
                    filter
                  )
                }
              >
                {filter}
              </button>

            )
          )}

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <section className="reports-list-page">

            <div
              style={{
                padding: "30px 10px",
                textAlign: "center",
                color: "#64756c",
                fontSize: "13px",
              }}
            >
              Loading your reports...
            </div>

          </section>
        )}


        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading &&
          error && (
            <section className="reports-list-page">

              <div
                style={{
                  padding: "30px 10px",
                  textAlign: "center",
                  color: "#d9534f",
                  fontSize: "13px",
                }}
              >
                Unable to load your reports.

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                  }}
                >
                  {error}
                </div>

              </div>

            </section>
          )}


        {/* ==================================================
            NO REPORTS
        ================================================== */}

        {!loading &&
          !error &&
          reports.length === 0 && (
            <section className="reports-list-page">

              <div
                style={{
                  padding: "40px 15px",
                  textAlign: "center",
                  color: "#64756c",
                  fontSize: "13px",
                }}
              >

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#183b2a",
                    marginBottom: "6px",
                  }}
                >
                  No reports yet
                </div>

                <div>
                  Complaints you submit will
                  appear here.
                </div>

              </div>

            </section>
          )}


        {/* ==================================================
            NO REPORTS FOR FILTER
        ================================================== */}

        {!loading &&
          !error &&
          reports.length > 0 &&
          filteredReports.length === 0 && (
            <section className="reports-list-page">

              <div
                style={{
                  padding: "35px 15px",
                  textAlign: "center",
                  color: "#64756c",
                  fontSize: "13px",
                }}
              >
                No{" "}
                {activeFilter.toLowerCase()}{" "}
                reports.
              </div>

            </section>
          )}


        {/* ==================================================
            REPORT LIST
        ================================================== */}

        {!loading &&
          !error &&
          filteredReports.length > 0 && (

            <section className="reports-list-page">

              {filteredReports.map(
                (report) => (

                  <button
                    className="my-report-card"
                    key={report.id}
                    onClick={() =>
                      openReport(
                        report.id
                      )
                    }
                    type="button"
                  >

                    {/* ======================================
                        IMAGE
                    ====================================== */}

                    <div className="my-report-image">

                      {report.image ? (

                        <img
                          src={
                            report.image
                          }
                          alt={
                            report.title
                          }
                        />

                      ) : (

                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            color: "#8b9892",
                            fontSize:
                              "10px",
                          }}
                        >
                          No image
                        </div>

                      )}

                    </div>


                    {/* ======================================
                        INFORMATION
                    ====================================== */}

                    <div className="my-report-information">

                      <h2>
                        {
                          report.title
                        }
                      </h2>


                      <div className="my-report-meta">

                        <span>
                          {
                            report.date
                          }
                        </span>


                        <span className="meta-dot">
                          •
                        </span>


                        <span
                          className={`my-report-status ${getStatusClass(
                            report.status
                          )}`}
                        >
                          {
                            report.status
                          }
                        </span>

                      </div>

                    </div>


                    {/* ======================================
                        ARROW
                    ====================================== */}

                    <ChevronRight
                      className="my-report-arrow"
                      size={21}
                    />

                  </button>

                )
              )}

            </section>

          )}

      </main>


      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <nav className="user-bottom-navigation reports-bottom-nav">

        {/* HOME */}

        <button
          className="bottom-nav-item"
          onClick={() =>
            navigate("/user")
          }
          aria-label="Home"
        >
          <Home />
          <span>
            Home
          </span>
        </button>


        {/* MAP */}

        <button
          className="bottom-nav-item"
          onClick={() =>
            navigate("/user/map")
          }
          aria-label="Map"
        >
          <Map />
          <span>
            Map
          </span>
        </button>


        {/* ADD REPORT */}

        <button
          className="report-add-button"
          onClick={() =>
            navigate("/user/report")
          }
          aria-label="Report an issue"
        >
          <Plus />
        </button>


        {/* REPORTS */}

        <button
          className="bottom-nav-item active"
          onClick={() =>
            navigate("/user/reports")
          }
          aria-label="My reports"
        >
          <FileText />
          <span>
            Reports
          </span>
        </button>


        {/* PROFILE */}

        <button
          className="bottom-nav-item"
          onClick={() =>
            navigate("/user/profile")
          }
          aria-label="Profile"
        >
          <User />
          <span>
            Profile
          </span>
        </button>

      </nav>

    </div>
  );
}


export default MyReports;