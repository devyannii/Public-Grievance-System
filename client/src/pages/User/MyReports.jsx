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
  // LOAD LOGGED-IN USER'S REPORTS
  // ====================================================

  useEffect(() => {
    const loadMyReports = async () => {
      try {
        setLoading(true);
        setError("");

        // ----------------------------------------------
        // GET LOGGED-IN USER
        // ----------------------------------------------

        const {
          data: { user },
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
        // GET ONLY THIS USER'S COMPLAINTS
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
          .is("deleted_at", null)
          .order("created_at", {
            ascending: false,
          });

        if (complaintsError) {
          throw complaintsError;
        }


        // ----------------------------------------------
        // FORMAT REPORTS
        // ----------------------------------------------

        const formattedReports =
          await Promise.all(
            (data || []).map(
              async (report) => {

                let imageUrl = "";


                // ------------------------------------
                // GET FIRST UPLOADED IMAGE
                // ------------------------------------

                const firstImage =
                  report.complaint_images?.[0];

                if (firstImage?.storage_path) {

                  const {
                    data: signedImage,
                    error: imageError,
                  } =
                    await supabase.storage
                      .from("complaint-images")
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
                // FORMAT DATE
                // ------------------------------------

                const createdAt =
                  new Date(report.created_at);

                const formattedDate =
                  createdAt.toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );


                // ------------------------------------
                // RETURN CLEAN REPORT OBJECT
                // ------------------------------------

                return {
                  // REAL UUID
                  // Used when opening IssueDetails
                  id: report.id,

                  // HUMAN-READABLE COMPLAINT ID
                  // Example: UGS-1234
                  complaintCode:
                    report.complaint_code ||
                    "UGS-—",

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


        setReports(formattedReports);

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
  // OPEN FULL COMPLAINT
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
          type="button"
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


        <div className="reports-header-space"></div>

      </header>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <main className="my-reports-content">

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="reports-filters">

          {filters.map((filter) => (

            <button
              key={filter}
              type="button"
              className={`report-filter ${
                activeFilter === filter
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveFilter(filter)
              }
            >
              {filter}
            </button>

          ))}

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

        {!loading && error && (

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

              {filteredReports.map((report) => (

                <button
                  key={report.id}
                  type="button"
                  className="my-report-card"
                  onClick={() =>
                    openReport(report.id)
                  }
                >

                  {/* ======================================
                      IMAGE
                  ====================================== */}

                  <div className="my-report-image">

                    {report.image ? (

                      <img
                        src={report.image}
                        alt={report.title}
                      />

                    ) : (

                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#8b9892",
                          fontSize: "10px",
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
                      {report.title}
                    </h2>


                    {/* ------------------------------------
                        COMPLAINT ID
                    ------------------------------------ */}

                    <div className="my-report-complaint-id">
                      Complaint ID:{" "}
                      <strong>
                        {report.complaintCode}
                      </strong>
                    </div>


                    {/* ------------------------------------
                        DATE + STATUS
                    ------------------------------------ */}

                    <div className="my-report-meta">

                      <span>
                        {report.date}
                      </span>

                      <span className="meta-dot">
                        •
                      </span>

                      <span
                        className={`my-report-status ${getStatusClass(
                          report.status
                        )}`}
                      >
                        {report.status}
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

              ))}

            </section>

          )}

      </main>


      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <nav className="user-bottom-navigation reports-bottom-nav">

        {/* HOME */}

        <button
          type="button"
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
          type="button"
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
          type="button"
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
          type="button"
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
          type="button"
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