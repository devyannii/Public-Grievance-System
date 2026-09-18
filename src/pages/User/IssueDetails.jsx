import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

import { supabase } from "../../lib/supabaseClient";

import "../../styles/IssueDetails.css";
import "../../styles/BottomNavigation.css";
import "../../styles/UserAppLayout.css";

function formatDate(dateString) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusIndex(status) {
  const statuses = ["Pending", "In Progress", "Resolved"];

  if (status === "Rejected") return -1;

  return statuses.indexOf(status);
}

function IssueDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;

    const loadComplaint = async (showLoader = false) => {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        // ------------------------------------------------
        // Get the complaint
        // ------------------------------------------------
        const { data, error: complaintError } = await supabase
          .from("complaints")
          .select(`
            id,
            complaint_code,
            title,
            description,
            status,
            priority,
            category_id,
            department_id,
            latitude,
            longitude,
            location_text,
            created_at,
            updated_at,
            resolved_at
          `)
          .eq("id", id)
          .single();

        if (complaintError) {
          throw complaintError;
        }

        if (!isMounted) return;

        setComplaint(data);

        // ------------------------------------------------
        // Get the first image
        // ------------------------------------------------
        const { data: imageData, error: imageError } = await supabase
          .from("complaint_images")
          .select("storage_path")
          .eq("complaint_id", data.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (imageError) {
          console.warn("Could not load complaint image:", imageError);
        }

        if (imageData?.storage_path) {
          const { data: signedImage, error: signedImageError } =
            await supabase.storage
              .from("complaint-images")
              .createSignedUrl(imageData.storage_path, 3600);

          if (signedImageError) {
            console.warn(
              "Could not create complaint image URL:",
              signedImageError
            );
          } else if (isMounted) {
            setImageUrl(signedImage?.signedUrl || "");
          }
        }
        // ------------------------------------------------
        // Get category name without using ambiguous joins
        // ------------------------------------------------
        if (data.category_id) {
          const { data: categoryData, error: categoryError } =
            await supabase
              .from("categories")
              .select("name")
              .eq("id", data.category_id)
              .maybeSingle();

          if (!categoryError && isMounted) {
            setCategoryName(categoryData?.name || "");
          }
        } else if (isMounted) {
          setCategoryName("");
        }


      } catch (err) {
        console.error("Issue details error:", err);

        if (isMounted) {
          setError(
            err?.message || "Unable to load this complaint."
          );
        }
      } finally {
        if (isMounted && showLoader) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadComplaint(true);

      // Refresh the complaint briefly so AI-generated fields such as
      // the title and description appear automatically after processing.
      pollTimer = window.setInterval(() => {
        loadComplaint(false);
      }, 3000);
    }

    return () => {
      isMounted = false;

      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
    };
  }, [id]);

  const status = complaint?.status || "Pending";
  const currentStatusIndex = getStatusIndex(status);

  const locationText =
    complaint?.location_text || "Location not available";

  const title = complaint?.title || "Issue Details";

  return (
    <div className="issue-details-page">
      <div className="issue-details-card">

        {/* HEADER */}
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

        {/* CONTENT */}
        <main className="issue-details-content">

          {loading && (
            <div style={{ padding: "30px 0", textAlign: "center" }}>
              Loading complaint...
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "30px 0", textAlign: "center" }}>
              <p style={{ color: "#d64545", fontSize: "13px" }}>
                {error}
              </p>

              <button
                type="button"
                onClick={() => navigate("/user/reports")}
                style={{
                  marginTop: "10px",
                  border: "none",
                  background: "#00a982",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                Back to Reports
              </button>
            </div>
          )}

          {!loading && !error && complaint && (
            <>
              {/* IMAGE */}
              <div className="issue-details-image">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#7b8794",
                      fontSize: "13px",
                    }}
                  >
                    No image available
                  </div>
                )}
              </div>

              {/* TITLE */}
              <div className="issue-title-row">
                <h2>{title}</h2>

                <span className="issue-status">
                  {status}
                </span>
              </div>

              {/* LOCATION */}
              <div className="issue-info-row">
                <MapPin size={14} />

                <span>{locationText}</span>
              </div>

              {/* DATE */}
              <div className="issue-info-row">
                <CalendarDays size={14} />

                <span>
                  {formatDate(complaint.created_at)}
                </span>
              </div>

              {/* DESCRIPTION */}
              <section className="issue-description">
                <h3>Description</h3>

                <p>
                  {complaint.description ||
                    "Description is being generated from the submitted image."}
                </p>
              </section>

              {/* STATUS TIMELINE */}
              <section className="issue-timeline">
                <h3>Status Timeline</h3>

                {/* REPORTED */}
                <div className="timeline-item completed">
                  <div className="timeline-dot">
                    ✓
                  </div>

                  <div className="timeline-content">
                    <h4>Reported</h4>

                    <p>
                      {formatDate(complaint.created_at)}
                    </p>
                  </div>
                </div>

                {/* PENDING */}
                <div
                  className={`timeline-item ${
                    status === "Pending"
                      ? "current"
                      : currentStatusIndex > 0
                        ? "completed"
                        : "pending"
                  }`}
                >
                  <div className="timeline-dot">
                    {status === "Pending" ? "" : currentStatusIndex > 0 ? "✓" : ""}
                  </div>

                  <div className="timeline-content">
                    <h4>Pending</h4>

                    <p>
                      {status === "Pending"
                        ? "Current status"
                        : currentStatusIndex > 0
                          ? "Completed"
                          : "Waiting for processing"}
                    </p>
                  </div>
                </div>

                {/* IN PROGRESS */}
                <div
                  className={`timeline-item ${
                    status === "In Progress"
                      ? "current"
                      : currentStatusIndex > 1
                        ? "completed"
                        : "pending"
                  }`}
                >
                  <div className="timeline-dot">
                    {status === "In Progress"
                      ? ""
                      : currentStatusIndex > 1
                        ? "✓"
                        : ""}
                  </div>

                  <div className="timeline-content">
                    <h4>In Progress</h4>

                    <p>
                      {status === "In Progress"
                        ? "Current status"
                        : currentStatusIndex > 1
                          ? "Completed"
                          : "Will be updated when processing begins"}
                    </p>
                  </div>
                </div>

                {/* RESOLVED */}
                <div
                  className={`timeline-item ${
                    status === "Resolved"
                      ? "current"
                      : "pending last"
                  }`}
                >
                  <div className="timeline-dot">
                    {status === "Resolved" ? "✓" : ""}
                  </div>

                  <div className="timeline-content">
                    <h4>Resolved</h4>

                    <p>
                      {status === "Resolved"
                        ? formatDate(complaint.resolved_at || complaint.updated_at)
                        : "Will be updated when resolved"}
                    </p>
                  </div>
                </div>

                {/* REJECTED */}
                {status === "Rejected" && (
                  <div className="timeline-item current last">
                    <div className="timeline-dot"></div>

                    <div className="timeline-content">
                      <h4>Rejected</h4>

                      <p>Current status</p>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className="issue-details-navigation">
          <button
            className="issue-nav-item"
            onClick={() => navigate("/user")}
          >
            <Home size={20} />
            <span>Home</span>
          </button>

          <button
            className="issue-nav-item"
            onClick={() => navigate("/user/map")}
          >
            <Map size={20} />
            <span>Map</span>
          </button>

          <button
            className="issue-nav-add"
            onClick={() => navigate("/user/report")}
          >
            <Plus size={28} />
          </button>

          <button
            className="issue-nav-item active"
            onClick={() => navigate("/user/reports")}
          >
            <FileText size={20} />
            <span>Reports</span>
          </button>

          <button
            className="issue-nav-item"
            onClick={() => navigate("/user/profile")}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default IssueDetails;
