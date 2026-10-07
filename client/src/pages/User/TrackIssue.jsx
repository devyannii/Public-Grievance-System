import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  FileText,
  Home,
  Map,
  Plus,
  User,
  ClipboardList,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import "../../styles/TrackIssue.css";

function TrackIssue() {
  const navigate = useNavigate();

  const [complaintCode, setComplaintCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [complaint, setComplaint] = useState(null);
  const [departmentName, setDepartmentName] = useState("");


  // ==================================================
  // TRACK COMPLAINT
  // ==================================================

  const handleTrackComplaint = async () => {
    try {
      setError("");
      setComplaint(null);
      setDepartmentName("");

      const code = complaintCode.trim();

      if (!code) {
        setError("Please enter your Complaint ID.");
        return;
      }

      setLoading(true);


      // ----------------------------------------------
      // GET CURRENT USER
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
      // FIND COMPLAINT
      // ----------------------------------------------

      const {
        data,
        error: complaintError,
      } = await supabase
        .from("complaints")
        .select(`
          id,
          complaint_code,
          title,
          description,
          status,
          priority,
          location_text,
          created_at,
          updated_at,
          assigned_at,
          resolved_at,
          department_id
        `)
        .eq("user_id", user.id)
        .ilike("complaint_code", code)
        .is("deleted_at", null)
        .maybeSingle();

      if (complaintError) {
        throw complaintError;
      }


      // ----------------------------------------------
      // NO COMPLAINT FOUND
      // ----------------------------------------------

      if (!data) {
        setError(
          "No complaint was found with this Complaint ID."
        );

        return;
      }


      // ----------------------------------------------
      // GET DEPARTMENT
      // ----------------------------------------------

      if (data.department_id) {
        const {
          data: department,
          error: departmentError,
        } = await supabase
          .from("departments")
          .select("name")
          .eq("id", data.department_id)
          .maybeSingle();

        if (!departmentError && department) {
          setDepartmentName(
            department.name || ""
          );
        }
      }


      setComplaint(data);

    } catch (err) {

      console.error(
        "Track complaint error:",
        err
      );

      setError(
        err?.message ||
        "Unable to track your complaint."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // STATUS STEP
  // ==================================================

  const getStatusStep = (status) => {

    if (status === "Resolved") {
      return 3;
    }

    if (status === "In Progress") {
      return 2;
    }

    return 1;
  };


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="track-issue-page">


      {/* ==============================================
          HEADER
      ============================================== */}

      <header className="track-issue-header">

        <button
          type="button"
          className="track-back-button"
          onClick={() => navigate("/user")}
          aria-label="Back to home"
        >
          <ArrowLeft size={21} />
        </button>

        <h1>
          Track an Issue
        </h1>

        <div className="track-header-space"></div>

      </header>


      {/* ==============================================
          CONTENT
      ============================================== */}

      <main className="track-issue-content">


        {/* ============================================
            TRACK FORM
            NO INNER BOX
        ============================================ */}

        <section className="track-card">


          {/* ICON */}

          <div className="track-icon">

            <Search size={25} />

          </div>


          {/* TITLE */}

          <h2>
            Track your complaint
          </h2>


          {/* DESCRIPTION */}

          <p className="track-description">
            Enter the Complaint ID you received
            after submitting your report.
          </p>


          {/* LABEL */}

          <label
            htmlFor="complaint-id"
            className="track-label"
          >
            Complaint ID
          </label>


          {/* INPUT */}

          <div className="track-input-wrapper">

            <FileText
              size={18}
              className="track-input-icon"
            />

            <input
              id="complaint-id"
              type="text"
              value={complaintCode}
              onChange={(e) =>
                setComplaintCode(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTrackComplaint();
                }
              }}
              placeholder="Example: UGS-4821"
              autoComplete="off"
            />

          </div>


          {/* ERROR */}

          {error && (

            <div className="track-error">
              {error}
            </div>

          )}


          {/* TRACK BUTTON */}

          <button
            type="button"
            className="track-submit-button"
            onClick={handleTrackComplaint}
            disabled={loading}
          >

            <Search size={18} />

            {loading
              ? "Tracking..."
              : "Track Complaint"}

          </button>


          {/* ==========================================
              OR
          ========================================== */}

          <div className="track-help-divider">

            <span></span>

            <small>
              OR
            </small>

            <span></span>

          </div>


          {/* ==========================================
              DON'T KNOW ID
          ========================================== */}

          <div className="track-no-id">

            <p>
              Don't know your Complaint ID?
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/user/reports")
              }
            >

              <ClipboardList size={16} />

              <span>
                View My Reports
              </span>

              <strong>
                →
              </strong>

            </button>

          </div>


        </section>


        {/* ============================================
            COMPLAINT RESULT
        ============================================ */}

        {complaint && (

          <section className="track-result-card">


            {/* RESULT HEADER */}

            <div className="track-result-header">

              <div>

                <span className="track-result-label">
                  Complaint ID
                </span>

                <h3>
                  {complaint.complaint_code}
                </h3>

              </div>


              <span
                className={`track-result-status ${
                  complaint.status
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")
                }`}
              >
                {complaint.status}
              </span>

            </div>


            {/* TITLE */}

            <div className="track-result-title">
              {complaint.title}
            </div>


            {/* DEPARTMENT */}

            {departmentName && (

              <div className="track-result-row">

                <span>
                  Department
                </span>

                <strong>
                  {departmentName}
                </strong>

              </div>

            )}


            {/* PRIORITY */}

            {complaint.priority && (

              <div className="track-result-row">

                <span>
                  Priority
                </span>

                <strong>
                  {complaint.priority}
                </strong>

              </div>

            )}


            {/* LOCATION */}

            {complaint.location_text && (

              <div className="track-result-row">

                <span>
                  Location
                </span>

                <strong>
                  {complaint.location_text}
                </strong>

              </div>

            )}


            {/* ========================================
                TIMELINE
            ======================================== */}

            <div className="track-timeline">


              {/* REPORTED */}

              <div
                className={`track-step ${
                  getStatusStep(
                    complaint.status
                  ) >= 1
                    ? "completed"
                    : ""
                }`}
              >

                <div className="track-step-dot">
                  ✓
                </div>

                <div>

                  <strong>
                    Reported
                  </strong>

                  <span>
                    {formatDate(
                      complaint.created_at
                    )}
                  </span>

                </div>

              </div>


              {/* PENDING */}

              <div
                className={`track-step ${
                  getStatusStep(
                    complaint.status
                  ) >= 1
                    ? "completed"
                    : ""
                }`}
              >

                <div className="track-step-dot">
                  ✓
                </div>

                <div>

                  <strong>
                    Pending
                  </strong>

                  <span>
                    Complaint received
                  </span>

                </div>

              </div>


              {/* IN PROGRESS */}

              <div
                className={`track-step ${
                  getStatusStep(
                    complaint.status
                  ) >= 2
                    ? "completed"
                    : ""
                }`}
              >

                <div className="track-step-dot">

                  {getStatusStep(
                    complaint.status
                  ) >= 2
                    ? "✓"
                    : ""}

                </div>

                <div>

                  <strong>
                    In Progress
                  </strong>

                  <span>
                    {complaint.assigned_at
                      ? formatDate(
                          complaint.assigned_at
                        )
                      : "Awaiting assignment"}
                  </span>

                </div>

              </div>


              {/* RESOLVED */}

              <div
                className={`track-step ${
                  getStatusStep(
                    complaint.status
                  ) >= 3
                    ? "completed"
                    : ""
                }`}
              >

                <div className="track-step-dot">

                  {getStatusStep(
                    complaint.status
                  ) >= 3
                    ? "✓"
                    : ""}

                </div>

                <div>

                  <strong>
                    Resolved
                  </strong>

                  <span>
                    {complaint.resolved_at
                      ? formatDate(
                          complaint.resolved_at
                        )
                      : "Not resolved yet"}
                  </span>

                </div>

              </div>

            </div>


            {/* FULL COMPLAINT */}

            <button
              type="button"
              className="track-full-details"
              onClick={() =>
                navigate(
                  `/user/issue/${complaint.id}`
                )
              }
            >

              <span>
                View Full Complaint
              </span>

              <strong>
                →
              </strong>

            </button>

          </section>

        )}

      </main>


      {/* ==============================================
          BOTTOM NAVIGATION
      ============================================== */}

      <nav className="track-bottom-navigation">


        {/* HOME */}

        <button
          type="button"
          className="track-bottom-item"
          onClick={() =>
            navigate("/user")
          }
        >

          <Home size={19} />

          <span>
            Home
          </span>

        </button>


        {/* MAP */}

        <button
          type="button"
          className="track-bottom-item"
          onClick={() =>
            navigate("/user/map")
          }
        >

          <Map size={19} />

          <span>
            Map
          </span>

        </button>


        {/* PLUS */}

        <button
          type="button"
          className="track-add-button"
          onClick={() =>
            navigate("/user/report")
          }
          aria-label="Report an issue"
        >

          <Plus size={27} />

        </button>


        {/* REPORTS */}

        <button
          type="button"
          className="track-bottom-item"
          onClick={() =>
            navigate("/user/reports")
          }
        >

          <FileText size={19} />

          <span>
            Reports
          </span>

        </button>


        {/* PROFILE */}

        <button
          type="button"
          className="track-bottom-item"
          onClick={() =>
            navigate("/user/profile")
          }
        >

          <User size={19} />

          <span>
            Profile
          </span>

        </button>

      </nav>

    </div>
  );
}

export default TrackIssue;