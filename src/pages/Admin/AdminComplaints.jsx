import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  CalendarDays,
  Clock3,
  CheckCircle2,
  Circle,
  Users,
  Edit3,
  Map,
  Sparkles,
  AlertTriangle,
  Target,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

import AdminLayout from "../../components/layout/AdminLayout";
import "../../styles/AdminComplaints.css";

import leakageImage from "../../assets/images/leaking-pipe.png";

const fallbackImage = leakageImage;

function getStatusClass(status) {
  if (status === "Resolved") return "status-resolved";
  if (status === "Pending") return "status-pending";
  return "status-progress";
}

function AdminComplaints() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ======================================================
     LOAD COMPLAINTS
  ====================================================== */

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data,
          error: complaintsError,
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
            department_id,

            ai_detected_category,
            ai_confidence,
            ai_priority,
            ai_priority_reason,
            duplicate_detected,
            duplicate_score,
            ai_recommended_department,
            automatically_assigned,
            ai_summary,

            profiles(full_name),
            categories(name),

            complaint_images(
              id,
              storage_path,
              file_name,
              file_type,
              created_at
            ),

            ai_analysis(
              detected_category,
              image_confidence,
              predicted_priority,
              priority_reason,
              recommended_department,
              duplicate_risk,
              duplicate_count,
              duplicate_score,
              summary,
              model_name,
              processing_status,
              created_at
            )
          `)
          .order("created_at", { ascending: false });

        if (complaintsError) {
          console.error(
            "Error loading complaints:",
            complaintsError
          );

          throw new Error(
            complaintsError.message ||
              "Unable to load complaints."
          );
        }

        const formattedComplaints = await Promise.all(
          (data || []).map(async (complaint) => {
            /* ------------------------------------------------
               FIRST IMAGE
            ------------------------------------------------ */

            const firstImage =
              complaint.complaint_images?.[0];

            let imageUrl = fallbackImage;

            if (firstImage?.storage_path) {
              const {
                data: signedImage,
                error: imageError,
              } = await supabase.storage
                .from("complaint-images")
                .createSignedUrl(
                  firstImage.storage_path,
                  3600
                );

              if (
                !imageError &&
                signedImage?.signedUrl
              ) {
                imageUrl = signedImage.signedUrl;
              }
            }

            /* ------------------------------------------------
               DEPARTMENT
            ------------------------------------------------ */

            let department = "Not assigned";

            if (complaint.department_id) {
              const {
                data: departmentData,
                error: departmentError,
              } = await supabase
                .from("departments")
                .select("name")
                .eq("id", complaint.department_id)
                .maybeSingle();

              if (
                !departmentError &&
                departmentData?.name
              ) {
                department = departmentData.name;
              }
            }

            /* ------------------------------------------------
               LATEST AI ANALYSIS
            ------------------------------------------------ */

            let latestAI = null;

            if (
              complaint.ai_analysis &&
              complaint.ai_analysis.length > 0
            ) {
              latestAI = [...complaint.ai_analysis].sort(
                (a, b) =>
                  new Date(b.created_at) -
                  new Date(a.created_at)
              )[0];
            }

            const ai = latestAI || {
              detected_category:
                complaint.ai_detected_category,

              image_confidence:
                complaint.ai_confidence,

              predicted_priority:
                complaint.ai_priority ||
                complaint.priority,

              priority_reason:
                complaint.ai_priority_reason,

              duplicate_risk:
                complaint.duplicate_detected
                  ? "High"
                  : "Low",

              duplicate_count: 0,

              duplicate_score:
                complaint.duplicate_score || 0,

              summary:
                complaint.ai_summary,

              recommended_department:
                complaint.ai_recommended_department,
            };

            /* ------------------------------------------------
               DATE + TIME
            ------------------------------------------------ */

            const createdAt = new Date(
              complaint.created_at
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

            const formattedTime =
              createdAt.toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

            /* ------------------------------------------------
               AI CONFIDENCE
            ------------------------------------------------ */

            let confidence = "Not available";

            if (
              ai.image_confidence !== null &&
              ai.image_confidence !== undefined
            ) {
              confidence = `${Math.round(
                Number(ai.image_confidence) * 100
              )}%`;
            }

            /* ------------------------------------------------
               RETURN FORMATTED COMPLAINT
            ------------------------------------------------ */

            return {
              id:
                complaint.complaint_code ||
                complaint.id,

              uuid: complaint.id,

              title:
                complaint.title ||
                "Untitled Complaint",

              reportedBy:
                complaint.profiles?.full_name ||
                "Citizen",

              category:
                complaint.categories?.name ||
                complaint.ai_detected_category ||
                "Other",

              location:
                complaint.location_text ||
                "Location not provided",

              date: formattedDate,
              time: formattedTime,

              status:
                complaint.status ||
                "Pending",

              department,

              description:
                complaint.description || "",

              image: imageUrl,

              automaticallyAssigned:
                Boolean(
                  complaint.automatically_assigned
                ),

              aiAnalysis: {
                summary:
                  ai.summary ||
                  "AI analysis not available yet.",

                suggestedCategory:
                  ai.detected_category ||
                  complaint.categories?.name ||
                  "Not available",

                priority:
                  ai.predicted_priority ||
                  complaint.priority ||
                  "Medium",

                confidence,

                department:
                  ai.recommended_department ||
                  department ||
                  "Not assigned",

                duplicateRisk:
                  ai.duplicate_risk ||
                  "Low",

                duplicateCount:
                  ai.duplicate_count ?? 0,

                duplicateScore:
                  ai.duplicate_score
                    ? `${Math.round(
                        Number(ai.duplicate_score) * 100
                      )}%`
                    : "0%",

                priorityReason:
                  ai.priority_reason ||
                  "Not available",

                modelName:
                  ai.model_name ||
                  "AI Analysis",

                processingStatus:
                  ai.processing_status ||
                  "completed",
              },

              timeline: [
                {
                  title: "Reported",
                  date: formattedDate,
                  time: formattedTime,
                  type: "reported",
                },
                {
                  title: "Assigned",
                  date:
                    complaint.automatically_assigned
                      ? "Automatically assigned"
                      : "-",
                  time: "",
                  type: "assigned",
                },
                {
                  title: "In Progress",
                  date:
                    complaint.status === "In Progress" ||
                    complaint.status === "Resolved"
                      ? "Current status"
                      : "-",
                  time: "",
                  type: "progress",
                },
                {
                  title: "Resolved",
                  date:
                    complaint.status === "Resolved"
                      ? "Resolved"
                      : "-",
                  time: "",
                  type: "resolved",
                },
              ],
            };
          })
        );

        setComplaints(formattedComplaints);

        if (formattedComplaints.length > 0) {
          setSelectedComplaintId(
            formattedComplaints[0].id
          );
        }
      } catch (err) {
        console.error(
          "Admin complaints error:",
          err
        );

        setError(
          err.message ||
            "Unable to load complaints."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  /* ======================================================
     FILTERED COMPLAINTS
  ====================================================== */

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        complaint.title
          .toLowerCase()
          .includes(searchText) ||
        complaint.reportedBy
          .toLowerCase()
          .includes(searchText) ||
        complaint.category
          .toLowerCase()
          .includes(searchText) ||
        complaint.id
          .toLowerCase()
          .includes(searchText);

      const actualStatus =
        statusOverrides[complaint.id] ??
        complaint.status;

      const matchesFilter =
        activeFilter === "All" ||
        actualStatus === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [
    complaints,
    search,
    activeFilter,
    statusOverrides,
  ]);

  /* ======================================================
     SELECTED COMPLAINT
  ====================================================== */

  const baseSelectedComplaint =
    complaints.find(
      (complaint) =>
        complaint.id === selectedComplaintId
    ) || complaints[0];

  const selectedComplaint =
    baseSelectedComplaint
      ? {
          ...baseSelectedComplaint,
          status:
            statusOverrides[
              baseSelectedComplaint.id
            ] ??
            baseSelectedComplaint.status,
        }
      : null;

  /* ======================================================
     ACTIONS
  ====================================================== */

  const openComplaint = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setShowStatusMenu(false);
  };

  const goBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  const goToMap = () => {
    navigate("/admin/map");
  };

  const changeStatus = async (newStatus) => {
    if (!selectedComplaint) return;

    setShowStatusMenu(false);

    const complaintId =
      selectedComplaint.id;

    const previousStatus =
      selectedComplaint.status;

    /* Update UI immediately */
    setStatusOverrides((previous) => ({
      ...previous,
      [complaintId]: newStatus,
    }));

    /* Update database */
    const {
      error: updateError,
    } = await supabase
      .from("complaints")
      .update({
        status: newStatus,
      })
      .eq(
        "id",
        selectedComplaint.uuid
      );

    /* Revert if database update fails */
    if (updateError) {
      console.error(
        "Status update failed:",
        updateError
      );

      setStatusOverrides((previous) => ({
        ...previous,
        [complaintId]: previousStatus,
      }));

      return;
    }

    /* Update local complaint data */
    setComplaints((previous) =>
      previous.map((complaint) =>
        complaint.id === complaintId
          ? {
              ...complaint,
              status: newStatus,
            }
          : complaint
      )
    );
  };

  /* ======================================================
     UPDATE PROGRESS
     Uses the existing changeStatus function.
  ====================================================== */

  const updateProgress = (newStatus) => {
    changeStatus(newStatus);
  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <AdminLayout>
      <div className="complaints-page">

        {/* LOADING */}
        {loading && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            Loading complaints...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            <strong>
              Unable to load complaints.
            </strong>

            <p>{error}</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          complaints.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >
              No complaints found.
            </div>
          )}

        {/* MAIN CONTENT */}
        {!loading &&
          !error &&
          selectedComplaint && (
            <>
              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <div className="complaints-header">
                <div>
                  <button
                    className="back-button"
                    onClick={
                      goBackToDashboard
                    }
                    aria-label="Back to dashboard"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="header-title">
                    <h1>All Complaints</h1>
                    <p>
                      Manage and track citizen
                      complaints
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  MAIN TWO-COLUMN LAYOUT
              ================================================= */}

              <div className="complaints-layout">

                {/* =================================================
                    LEFT PANEL
                ================================================= */}

                <section className="complaints-list-panel">

                  {/* SEARCH */}

                  <div className="complaints-search-row">
                    <div className="search-box">
                      <Search size={18} />

                      <input
                        type="text"
                        placeholder="Search complaints..."
                        value={search}
                        onChange={(e) =>
                          setSearch(
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <button
                      className="filter-button"
                      type="button"
                    >
                      <SlidersHorizontal
                        size={17}
                      />
                      Filter
                    </button>
                  </div>

                  {/* TABS */}

                  <div className="complaint-tabs">

                    <button
                      className={
                        activeFilter === "All"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveFilter("All")
                      }
                    >
                      All{" "}
                      <span>
                        ({complaints.length})
                      </span>
                    </button>

                    <button
                      className={
                        activeFilter ===
                        "In Progress"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveFilter(
                          "In Progress"
                        )
                      }
                    >
                      In Progress{" "}
                      <span>
                        (
                        {
                          complaints.filter(
                            (c) =>
                              (
                                statusOverrides[
                                  c.id
                                ] ??
                                c.status
                              ) ===
                              "In Progress"
                          ).length
                        }
                        )
                      </span>
                    </button>

                    <button
                      className={
                        activeFilter === "Pending"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveFilter("Pending")
                      }
                    >
                      Pending{" "}
                      <span>
                        (
                        {
                          complaints.filter(
                            (c) =>
                              (
                                statusOverrides[
                                  c.id
                                ] ??
                                c.status
                              ) ===
                              "Pending"
                          ).length
                        }
                        )
                      </span>
                    </button>

                    <button
                      className={
                        activeFilter ===
                        "Resolved"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveFilter("Resolved")
                      }
                    >
                      Resolved{" "}
                      <span>
                        (
                        {
                          complaints.filter(
                            (c) =>
                              (
                                statusOverrides[
                                  c.id
                                ] ??
                                c.status
                              ) ===
                              "Resolved"
                          ).length
                        }
                        )
                      </span>
                    </button>

                  </div>

                  {/* COMPLAINT LIST */}

                  <div className="complaint-cards">

                    {filteredComplaints.length ===
                    0 ? (
                      <div
                        style={{
                          padding: "30px",
                          textAlign: "center",
                        }}
                      >
                        No matching complaints.
                      </div>
                    ) : (
                      filteredComplaints.map(
                        (complaint) => (
                          <button
                            key={complaint.id}
                            type="button"
                            className={`complaint-card ${
                              complaint.id ===
                              selectedComplaint.id
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              openComplaint(
                                complaint.id
                              )
                            }
                          >

                            {/* ONE THUMBNAIL IN LIST */}

                            <img
                              src={complaint.image}
                              alt={complaint.title}
                              className="complaint-thumbnail"
                            />

                            <div className="complaint-card-content">

                              <div className="complaint-title-row">

                                <h3>
                                  {complaint.title}
                                </h3>

                                <ChevronRight
                                  size={21}
                                  className="complaint-arrow"
                                />

                              </div>

                              <p className="reported-by">
                                Reported by:{" "}
                                <strong>
                                  {
                                    complaint.reportedBy
                                  }
                                </strong>
                              </p>

                              <div className="complaint-meta">

                                <span>
                                  <CalendarDays
                                    size={14}
                                  />
                                  {complaint.date}
                                </span>

                                <span>
                                  • {complaint.time}
                                </span>

                              </div>

                            </div>

                            <span
                              className={`status-badge ${getStatusClass(
                                statusOverrides[
                                  complaint.id
                                ] ??
                                  complaint.status
                              )}`}
                            >
                              {
                                statusOverrides[
                                  complaint.id
                                ] ??
                                  complaint.status
                              }
                            </span>

                          </button>
                        )
                      )
                    )}

                  </div>

                </section>

                {/* =================================================
                    RIGHT DETAILS PANEL
                ================================================= */}

                <section className="complaint-details-panel">

                  {/* =================================================
                      COMPLAINT SUMMARY
                  ================================================= */}

                  <div className="complaint-summary">

                    <img
                      src={selectedComplaint.image}
                      alt={selectedComplaint.title}
                    />

                    <div className="summary-info">

                      <div className="summary-title-row">

                        <h2>
                          {selectedComplaint.title}
                        </h2>

                        <span
                          className={`status-badge ${getStatusClass(
                            selectedComplaint.status
                          )}`}
                        >
                          {selectedComplaint.status}
                        </span>

                      </div>

                      <p>
                        Reported on:{" "}
                        <strong>
                          {selectedComplaint.date}
                        </strong>{" "}
                        • {selectedComplaint.time}
                      </p>

                      <p>
                        Reported by:{" "}
                        <strong>
                          {selectedComplaint.reportedBy}
                        </strong>
                      </p>

                      <p>
                        Category:{" "}
                        <strong>
                          {selectedComplaint.category}
                        </strong>
                      </p>

                    </div>

                  </div>

                  {/* LOCATION */}

                  <div className="detail-section">

                    <div className="section-heading">
                      <MapPin size={18} />
                      <h3>Location</h3>
                    </div>

                    <div className="location-row">

                      <span>
                        <MapPin size={17} />

                        {
                          selectedComplaint.location
                        }
                      </span>

                      <button
                        onClick={goToMap}
                        type="button"
                      >
                        <Map size={15} />
                        View on Map
                      </button>

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="detail-section">

                    <div className="section-heading">
                      <h3>Description</h3>
                    </div>

                    <p className="description-text">
                      {
                        selectedComplaint.description
                      }
                    </p>

                  </div>

                  {/* PHOTOS */}

                  <div className="detail-section photos-section">

                    <div className="section-heading">
                      <h3>Photos</h3>
                      <span>1 photo</span>
                    </div>

                    <div className="photo-grid single-photo">

                      <img
                        src={selectedComplaint.image}
                        alt={`${selectedComplaint.title} photo`}
                      />

                    </div>

                  </div>

                  {/* AUTOMATIC ALLOTMENT */}

                  <div className="assignment-card">

                    <div className="assignment-icon">
                      <Users size={19} />
                    </div>

                    <div>

                      <span>
                        Assigned Department
                      </span>

                      <strong>
                        {
                          selectedComplaint.department
                        }
                      </strong>

                      {selectedComplaint.automaticallyAssigned && (
                        <small>
                          Automatically assigned
                          by AI
                        </small>
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      UPDATE PROGRESS
                  ================================================= */}

                  <div className="update-progress-card">

                    <div className="update-progress-header">

                      <div className="update-progress-title">

                        <div className="update-progress-icon">
                          <Edit3 size={17} />
                        </div>

                        <div>

                          <h3>
                            Update Progress
                          </h3>

                          <span>
                            Update the complaint status
                          </span>

                        </div>

                      </div>

                      <span
                        className={`status-badge ${getStatusClass(
                          selectedComplaint.status
                        )}`}
                      >
                        {selectedComplaint.status}
                      </span>

                    </div>

                    <div className="update-progress-actions">

                      {/* PENDING */}

                      <button
                        type="button"
                        className={`progress-option ${
                          selectedComplaint.status ===
                          "Pending"
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          updateProgress(
                            "Pending"
                          )
                        }
                      >
                        <span className="progress-dot pending-dot"></span>

                        Pending
                      </button>


                      {/* IN PROGRESS */}

                      <button
                        type="button"
                        className={`progress-option ${
                          selectedComplaint.status ===
                          "In Progress"
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          updateProgress(
                            "In Progress"
                          )
                        }
                      >
                        <span className="progress-dot"></span>

                        In Progress
                      </button>


                      {/* RESOLVED */}

                      <button
                        type="button"
                        className={`progress-option ${
                          selectedComplaint.status ===
                          "Resolved"
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          updateProgress(
                            "Resolved"
                          )
                        }
                      >
                        <span className="progress-dot resolved-dot"></span>

                        Resolved
                      </button>

                    </div>

                  </div>

                  {/* =================================================
                      AI ANALYSIS
                  ================================================= */}

                  <div className="ai-analysis-card">

                    <div className="ai-analysis-header">

                      <div className="ai-analysis-title">

                        <div className="ai-icon">
                          <Sparkles size={16} />
                        </div>

                        <div>

                          <h3>
                            AI Analysis
                          </h3>

                          <span>
                            Automated complaint
                            assessment
                          </span>

                        </div>

                      </div>

                      <span className="ai-confidence">
                        {
                          selectedComplaint
                            .aiAnalysis
                            .confidence
                        }{" "}
                        confidence
                      </span>

                    </div>

                    <p className="ai-summary">
                      {
                        selectedComplaint
                          .aiAnalysis
                          .summary
                      }
                    </p>

                    <div className="ai-insights">

                      {/* CATEGORY */}

                      <div className="ai-insight">

                        <Target size={15} />

                        <div>

                          <span>
                            Category
                          </span>

                          <strong>
                            {
                              selectedComplaint
                                .aiAnalysis
                                .suggestedCategory
                            }
                          </strong>

                        </div>

                      </div>


                      {/* PRIORITY */}

                      <div className="ai-insight">

                        <AlertTriangle
                          size={15}
                        />

                        <div>

                          <span>
                            Priority
                          </span>

                          <strong
                            className={`ai-priority ai-${String(
                              selectedComplaint
                                .aiAnalysis
                                .priority
                            ).toLowerCase()}`}
                          >
                            {
                              selectedComplaint
                                .aiAnalysis
                                .priority
                            }
                          </strong>

                        </div>

                      </div>


                      {/* DUPLICATE RISK */}

                      <div className="ai-insight">

                        <ShieldCheck size={15} />

                        <div>

                          <span>
                            Duplicate Risk
                          </span>

                          <strong>
                            {
                              selectedComplaint
                                .aiAnalysis
                                .duplicateRisk
                            }
                          </strong>

                        </div>

                      </div>

                    </div>

                    {/* RECOMMENDED DEPARTMENT */}

                    <div className="ai-recommendation">

                      <Sparkles size={14} />

                      <span>
                        Recommended department:{" "}
                        <strong>
                          {
                            selectedComplaint
                              .aiAnalysis
                              .department
                          }
                        </strong>
                      </span>

                    </div>

                    {/* PRIORITY REASON */}

                    {selectedComplaint
                      .aiAnalysis
                      .priorityReason !==
                      "Not available" && (

                      <div className="ai-recommendation">

                        <AlertTriangle
                          size={14}
                        />

                        <span>
                          Priority reason:{" "}
                          <strong>
                            {
                              selectedComplaint
                                .aiAnalysis
                                .priorityReason
                            }
                          </strong>
                        </span>

                      </div>

                    )}

                  </div>

                  {/* STATUS TIMELINE */}

                  <div className="detail-section timeline-section">

                    <div className="section-heading">
                      <Clock3 size={18} />
                      <h3>Status Timeline</h3>
                    </div>

                    <div className="timeline">

                      {selectedComplaint.timeline.map(
                        (item, index) => {

                          const completed =
                            item.type ===
                              "reported" ||

                            (
                              item.type ===
                                "assigned" &&
                              selectedComplaint
                                .automaticallyAssigned
                            ) ||

                            (
                              item.type ===
                                "progress" &&
                              selectedComplaint
                                .status !==
                                "Pending"
                            ) ||

                            (
                              item.type ===
                                "resolved" &&
                              selectedComplaint
                                .status ===
                                "Resolved"
                            );

                          return (
                            <div
                              className="timeline-item"
                              key={index}
                            >

                              <div
                                className={`timeline-dot ${
                                  completed
                                    ? "completed"
                                    : ""
                                }`}
                              >

                                {completed ? (
                                  <CheckCircle2
                                    size={16}
                                  />
                                ) : (
                                  <Circle
                                    size={16}
                                  />
                                )}

                              </div>

                              {index <
                                selectedComplaint
                                  .timeline
                                  .length -
                                  1 && (

                                <div className="timeline-line" />

                              )}

                              <div className="timeline-content">

                                <strong>
                                  {item.title}
                                </strong>

                                {item.date !== "-" && (
                                  <span>
                                    {item.date}

                                    {item.time &&
                                      ` • ${item.time}`}
                                  </span>
                                )}

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                </section>

              </div>
            </>
          )}

      </div>
    </AdminLayout>
  );
}

export default AdminComplaints;