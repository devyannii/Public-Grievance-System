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
  Trash2,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/layout/AdminLayout";
import "../../styles/AdminComplaints.css";

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
  const [departments, setDepartments] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  // Close the full-size image preview with Escape and prevent background scrolling.
  useEffect(() => {
    if (!previewImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setPreviewImage(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewImage]);

  // Department modal
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [assignmentReason, setAssignmentReason] = useState("");
  const [savingDepartment, setSavingDepartment] = useState(false);

  // Delete
  const [deletingComplaint, setDeletingComplaint] = useState(false);

  // Load complaints and departments
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const { data, error: complaintsError } = await supabase
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
            assignment_source,
            automatically_assigned,
            deleted_at,
            ai_detected_category,
            ai_confidence,
            ai_priority,
            ai_priority_reason,
            duplicate_detected,
            duplicate_score,
            ai_recommended_department,
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
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (complaintsError) {
          console.error("Error loading complaints:", complaintsError);
          throw new Error(
            complaintsError.message || "Unable to load complaints."
          );
        }

        const formattedComplaints = await Promise.all(
          (data || []).map(async (complaint) => {
            // Use the actual uploaded complaint image only.
            const firstImage = complaint.complaint_images?.[0];
            let imageUrl = null;

            if (firstImage?.storage_path) {
              const {
                data: signedImage,
                error: imageError,
              } = await supabase.storage
                .from("complaint-images")
                .createSignedUrl(firstImage.storage_path, 3600);

              if (imageError) {
                console.error(
                  "Error creating signed complaint image URL:",
                  complaint.id,
                  imageError
                );
              }

              if (!imageError && signedImage?.signedUrl) {
                imageUrl = signedImage.signedUrl;
              }
            }

            // Resolve department name.
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

              if (!departmentError && departmentData?.name) {
                department = departmentData.name;
              }
            }

            // Use the most recent AI analysis when available.
            let latestAI = null;

            if (
              complaint.ai_analysis &&
              complaint.ai_analysis.length > 0
            ) {
              latestAI = [...complaint.ai_analysis].sort(
                (a, b) =>
                  new Date(b.created_at) - new Date(a.created_at)
              )[0];
            }

            const ai = latestAI || {
              detected_category: complaint.ai_detected_category,
              image_confidence: complaint.ai_confidence,
              predicted_priority:
                complaint.ai_priority || complaint.priority,
              priority_reason: complaint.ai_priority_reason,
              duplicate_risk: complaint.duplicate_detected
                ? "High"
                : "Low",
              duplicate_count: 0,
              duplicate_score: complaint.duplicate_score || 0,
              summary: complaint.ai_summary,
              recommended_department:
                complaint.ai_recommended_department,
            };

            const createdAt = new Date(complaint.created_at);

            const formattedDate = createdAt.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            const formattedTime = createdAt.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            let confidence = "Not available";

            if (
              ai.image_confidence !== null &&
              ai.image_confidence !== undefined
            ) {
              confidence = `${Math.round(
                Number(ai.image_confidence) * 100
              )}%`;
            }

            const assignmentSource =
              complaint.assignment_source ||
              (complaint.automatically_assigned
                ? "ai"
                : complaint.department_id
                  ? "admin"
                  : null);

            return {
              id: complaint.complaint_code || complaint.id,
              uuid: complaint.id,
              title: complaint.title || "Untitled Complaint",
              reportedBy: complaint.profiles?.full_name || "Citizen",
              category:
                complaint.categories?.name ||
                complaint.ai_detected_category ||
                "Other",
              location:
                complaint.location_text || "Location not provided",
              date: formattedDate,
              time: formattedTime,
              status: complaint.status || "Pending",
              department,
              description: complaint.description || "",
              image: imageUrl,
              automaticallyAssigned: Boolean(
                complaint.automatically_assigned
              ),
              assignmentSource,

              aiAnalysis: {
                summary:
                  ai.summary || "AI analysis not available yet.",
                suggestedCategory:
                  ai.detected_category ||
                  complaint.categories?.name ||
                  "Not available",
                priority:
                  ai.predicted_priority ||
                  complaint.priority ||
                  "Medium",
                confidence,
                department: department || "Not assigned",
                duplicateRisk: ai.duplicate_risk || "Low",
                duplicateCount: ai.duplicate_count ?? 0,
                duplicateScore: ai.duplicate_score
                  ? `${Math.round(Number(ai.duplicate_score) * 100)}%`
                  : "0%",
                priorityReason: ai.priority_reason || "Not available",
                modelName: ai.model_name || "AI Analysis",
                processingStatus: ai.processing_status || "completed",
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
                  date: complaint.department_id
                    ? complaint.automatically_assigned
                      ? "Automatically assigned"
                      : "Manually assigned"
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
                    complaint.status === "Resolved" ? "Resolved" : "-",
                  time: "",
                  type: "resolved",
                },
              ],
            };
          })
        );

        setComplaints(formattedComplaints);

        if (formattedComplaints.length > 0) {
          setSelectedComplaintId(formattedComplaints[0].id);
        } else {
          setSelectedComplaintId(null);
        }
      } catch (err) {
        console.error("Admin complaints error:", err);
        setError(err.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    };

    const loadDepartments = async () => {
      const {
        data,
        error: departmentsError,
      } = await supabase
        .from("departments")
        .select("id, name")
        .order("name", { ascending: true });

      if (departmentsError) {
        console.error("Error loading departments:", departmentsError);
        return;
      }

      setDepartments(data || []);
    };

    loadComplaints();
    loadDepartments();
  }, []);

  // Filter complaints by search and status.
  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        complaint.title.toLowerCase().includes(searchText) ||
        complaint.reportedBy.toLowerCase().includes(searchText) ||
        complaint.category.toLowerCase().includes(searchText) ||
        complaint.id.toLowerCase().includes(searchText);

      const actualStatus =
        statusOverrides[complaint.id] ?? complaint.status;

      const matchesFilter =
        activeFilter === "All" || actualStatus === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [complaints, search, activeFilter, statusOverrides]);

  // Selected complaint.
  const baseSelectedComplaint =
    complaints.find(
      (complaint) => complaint.id === selectedComplaintId
    ) || complaints[0];

  const selectedComplaint = baseSelectedComplaint
    ? {
        ...baseSelectedComplaint,
        status:
          statusOverrides[baseSelectedComplaint.id] ??
          baseSelectedComplaint.status,
      }
    : null;

  // Navigation and selection actions.
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

  // Change complaint status in Supabase.
  const changeStatus = async (newStatus) => {
    if (!selectedComplaint) return;

    setShowStatusMenu(false);

    const complaintId = selectedComplaint.id;
    const previousStatus = selectedComplaint.status;

    setStatusOverrides((previous) => ({
      ...previous,
      [complaintId]: newStatus,
    }));

    const { error: updateError } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", selectedComplaint.uuid);

    if (updateError) {
      console.error("Status update failed:", updateError);

      setStatusOverrides((previous) => ({
        ...previous,
        [complaintId]: previousStatus,
      }));

      return;
    }

    setComplaints((previous) =>
      previous.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, status: newStatus }
          : complaint
      )
    );
  };

  const updateProgress = (newStatus) => {
    changeStatus(newStatus);
  };

  // Open department reassignment modal.
  const openDepartmentModal = () => {
    if (!selectedComplaint) return;

    const currentDepartment = departments.find(
      (department) =>
        department.name === selectedComplaint.department
    );

    setSelectedDepartmentId(currentDepartment?.id || "");
    setAssignmentReason("");
    setShowDepartmentModal(true);
  };

  // Save department reassignment.
  const saveDepartmentAssignment = async () => {
    if (!selectedComplaint || !selectedDepartmentId) return;

    setSavingDepartment(true);

    try {
      const selectedDepartment = departments.find(
        (department) => department.id === selectedDepartmentId
      );

      if (!selectedDepartment) {
        throw new Error("Selected department was not found.");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in as an admin.");
      }

      const { error: updateError } = await supabase
        .from("complaints")
        .update({
          department_id: selectedDepartmentId,
          automatically_assigned: false,
          assignment_source: "admin",
          manually_assigned_at: new Date().toISOString(),
          assignment_reason: assignmentReason.trim() || null,
        })
        .eq("id", selectedComplaint.uuid);

      if (updateError) throw updateError;

      setComplaints((previous) =>
        previous.map((complaint) =>
          complaint.uuid === selectedComplaint.uuid
            ? {
                ...complaint,
                department: selectedDepartment.name,
                automaticallyAssigned: false,
                assignmentSource: "admin",
                aiAnalysis: {
                  ...complaint.aiAnalysis,
                  department: selectedDepartment.name,
                },
                timeline: complaint.timeline.map((item) =>
                  item.type === "assigned"
                    ? { ...item, date: "Manually assigned" }
                    : item
                ),
              }
            : complaint
        )
      );

      setShowDepartmentModal(false);
      setAssignmentReason("");
    } catch (error) {
      console.error("Department assignment failed:", error);
      alert(error.message || "Unable to change department.");
    } finally {
      setSavingDepartment(false);
    }
  };

  // Soft-delete a complaint; preserve its database record.
  const deleteComplaint = async () => {
    if (!selectedComplaint) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint?\n\n" +
        "The complaint will be removed from the active complaints list."
    );

    if (!confirmed) return;

    setDeletingComplaint(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in as an admin.");
      }

      const { error: deleteError } = await supabase
        .from("complaints")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
        })
        .eq("id", selectedComplaint.uuid);

      if (deleteError) throw deleteError;

      setComplaints((previous) =>
        previous.filter(
          (complaint) => complaint.uuid !== selectedComplaint.uuid
        )
      );

      setSelectedComplaintId(null);
    } catch (error) {
      console.error("Delete complaint failed:", error);
      alert(error.message || "Unable to delete complaint.");
    } finally {
      setDeletingComplaint(false);
    }
  };
    // Render
  return (
    <AdminLayout>
      <div className="complaints-page">
        {loading && (
          <div className="complaints-message">
            Loading complaints...
          </div>
        )}

        {!loading && error && (
          <div className="complaints-message">
            <strong>Unable to load complaints.</strong>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && complaints.length === 0 && (
          <div className="complaints-message">
            No complaints found.
          </div>
        )}

        {!loading && !error && selectedComplaint && (
          <>
            <header className="complaints-header">
              <div>
                <button
                  className="back-button"
                  onClick={goBackToDashboard}
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="header-title">
                  <h1>All Complaints</h1>
                  <p>Manage and track citizen complaints</p>
                </div>
              </div>
            </header>

            <div className="complaints-layout">
              {/* LEFT: COMPLAINT LIST */}
              <section className="complaints-list-panel">
                <div className="complaints-search-row">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>

                  <button
                    className="filter-button"
                    type="button"
                    onClick={() => setShowStatusMenu((value) => !value)}
                    aria-expanded={showStatusMenu}
                  >
                    <SlidersHorizontal size={17} />
                    Filter
                  </button>
                </div>

                {showStatusMenu && (
                  <div className="complaint-filter-menu">
                    {["All", "Pending", "In Progress", "Resolved"].map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          className={activeFilter === status ? "active" : ""}
                          onClick={() => {
                            setActiveFilter(status);
                            setShowStatusMenu(false);
                          }}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                )}

                <div className="complaint-tabs">
                  {["All", "In Progress", "Pending", "Resolved"].map(
                    (status) => {
                      const count =
                        status === "All"
                          ? complaints.length
                          : complaints.filter(
                              (complaint) =>
                                (statusOverrides[complaint.id] ??
                                  complaint.status) === status
                            ).length;

                      return (
                        <button
                          key={status}
                          type="button"
                          className={activeFilter === status ? "active" : ""}
                          onClick={() => setActiveFilter(status)}
                        >
                          {status} <span>({count})</span>
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="complaint-cards">
                  {filteredComplaints.length === 0 ? (
                    <div className="complaints-empty">
                      No matching complaints.
                    </div>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <button
                        key={complaint.id}
                        type="button"
                        className={`complaint-card ${
                          complaint.id === selectedComplaint.id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => openComplaint(complaint.id)}
                      >
                        {complaint.image ? (
                          <img
                            src={complaint.image}
                            alt={complaint.title}
                            className="complaint-thumbnail"
                            loading="lazy"
                          />
                        ) : (
                          <div className="complaint-thumbnail complaint-no-image">
                            No image
                          </div>
                        )}

                        <div className="complaint-card-content">
                          <div className="complaint-title-row">
                            <h3>{complaint.title}</h3>
                            <ChevronRight
                              size={21}
                              className="complaint-arrow"
                            />
                          </div>

                          <p className="reported-by">
                            Reported by:{" "}
                            <strong>{complaint.reportedBy}</strong>
                          </p>

                          <div className="complaint-meta">
                            <span>
                              <CalendarDays size={14} />
                              {complaint.date}
                            </span>
                            <span>• {complaint.time}</span>
                          </div>
                        </div>

                        <span
                          className={`status-badge ${getStatusClass(
                            statusOverrides[complaint.id] ??
                              complaint.status
                          )}`}
                        >
                          {statusOverrides[complaint.id] ??
                            complaint.status}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </section>

              {/* RIGHT: COMPLAINT DETAILS */}
              <section className="complaint-details-panel">
                <div className="complaint-summary">
                  {selectedComplaint.image ? (
                    <button
                      type="button"
                      className="complaint-summary-image-button"
                      onClick={() =>
                        setPreviewImage(selectedComplaint.image)
                      }
                      aria-label="View complaint image full size"
                    >
                      <img
                        src={selectedComplaint.image}
                        alt={selectedComplaint.title}
                      />
                      <span className="image-view-hint">View image</span>
                    </button>
                  ) : (
                    <div className="complaint-summary-no-image">
                      No image
                    </div>
                  )}

                  <div className="summary-info">
                    <div className="summary-title-row">
                      <h2>{selectedComplaint.title}</h2>
                      <span
                        className={`status-badge ${getStatusClass(
                          selectedComplaint.status
                        )}`}
                      >
                        {selectedComplaint.status}
                      </span>
                    </div>

                    <p>
                      Reported on: <strong>{selectedComplaint.date}</strong>{" "}
                      • {selectedComplaint.time}
                    </p>
                    <p>
                      Reported by:{" "}
                      <strong>{selectedComplaint.reportedBy}</strong>
                    </p>
                    <p>
                      Category: <strong>{selectedComplaint.category}</strong>
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
                      {selectedComplaint.location}
                    </span>
                    <button type="button" onClick={goToMap}>
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
                    {selectedComplaint.description || "No description provided."}
                  </p>
                </div>

                {/* PHOTOS */}
                <div className="detail-section photos-section">
                  <div className="section-heading">
                    <h3>Photos</h3>
                    <span>{selectedComplaint.image ? "1 photo" : "0 photos"}</span>
                  </div>

                  <div className="photo-grid single-photo">
                    {selectedComplaint.image ? (
                      <button
                        type="button"
                        className="complaint-photo-button"
                        onClick={() =>
                          setPreviewImage(selectedComplaint.image)
                        }
                        aria-label="Open complaint photo full size"
                      >
                        <img
                          src={selectedComplaint.image}
                          alt={`${selectedComplaint.title} photo`}
                        />
                        <span className="photo-view-overlay">View photo</span>
                      </button>
                    ) : (
                      <div className="complaint-no-photo">
                        No image available
                      </div>
                    )}
                  </div>
                </div>

                {/* ASSIGNMENT */}
                <div className="assignment-card">
                  <div className="assignment-icon">
                    <Users size={19} />
                  </div>

                  <div className="assignment-info">
                    <span>Assigned Department</span>
                    <strong>{selectedComplaint.department}</strong>
                    <small>
                      {selectedComplaint.automaticallyAssigned
                        ? "Automatically assigned by AI"
                        : selectedComplaint.department !== "Not assigned"
                          ? "Manually assigned by Admin"
                          : "Not assigned"}
                    </small>
                  </div>

                  <button
                    type="button"
                    className="assignment-change-button"
                    onClick={openDepartmentModal}
                    disabled={savingDepartment}
                  >
                    <Edit3 size={15} />
                    Change
                  </button>

                  <button
                    type="button"
                    className="assignment-delete-button"
                    onClick={deleteComplaint}
                    disabled={deletingComplaint}
                    title="Delete complaint"
                    aria-label="Delete complaint"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* UPDATE PROGRESS */}
                <div className="update-progress-card">
                  <div className="update-progress-header">
                    <div className="update-progress-title">
                      <div className="update-progress-icon">
                        <Edit3 size={17} />
                      </div>
                      <div>
                        <h3>Update Progress</h3>
                        <span>Update the complaint status</span>
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
                    {["Pending", "In Progress", "Resolved"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`progress-option ${
                          selectedComplaint.status === status ? "selected" : ""
                        }`}
                        onClick={() => updateProgress(status)}
                        disabled={selectedComplaint.status === status}
                      >
                        <span
                          className={`progress-dot ${
                            status === "Pending"
                              ? "pending-dot"
                              : status === "Resolved"
                                ? "resolved-dot"
                                : ""
                          }`}
                        />
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI ANALYSIS */}
                <div className="ai-analysis-card">
                  <div className="ai-analysis-header">
                    <div className="ai-analysis-title">
                      <div className="ai-icon">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h3>AI Analysis</h3>
                        <span>Automated complaint assessment</span>
                      </div>
                    </div>

                    <span className="ai-confidence">
                      {selectedComplaint.aiAnalysis.confidence} confidence
                    </span>
                  </div>

                  <p className="ai-summary">
                    {selectedComplaint.aiAnalysis.summary}
                  </p>

                  <div className="ai-insights">
                    <div className="ai-insight">
                      <Target size={15} />
                      <div>
                        <span>Category</span>
                        <strong>
                          {selectedComplaint.aiAnalysis.suggestedCategory}
                        </strong>
                      </div>
                    </div>

                    <div className="ai-insight">
                      <AlertTriangle size={15} />
                      <div>
                        <span>Priority</span>
                        <strong
                          className={`ai-priority ai-${String(
                            selectedComplaint.aiAnalysis.priority
                          ).toLowerCase()}`}
                        >
                          {selectedComplaint.aiAnalysis.priority}
                        </strong>
                      </div>
                    </div>

                    <div className="ai-insight">
                      <ShieldCheck size={15} />
                      <div>
                        <span>Duplicate Risk</span>
                        <strong>
                          {selectedComplaint.aiAnalysis.duplicateRisk}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="ai-recommendation">
                    <Sparkles size={14} />
                    <span>
                      Recommended department:{" "}
                      <strong>
                        {selectedComplaint.aiAnalysis.department}
                      </strong>
                    </span>
                  </div>

                  {selectedComplaint.aiAnalysis.priorityReason !==
                    "Not available" && (
                    <div className="ai-recommendation">
                      <AlertTriangle size={14} />
                      <span>
                        Priority reason:{" "}
                        <strong>
                          {selectedComplaint.aiAnalysis.priorityReason}
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
                    {selectedComplaint.timeline.map((item, index) => {
                      const completed =
                        item.type === "reported" ||
                        (item.type === "assigned" &&
                          selectedComplaint.department !== "Not assigned") ||
                        (item.type === "progress" &&
                          selectedComplaint.status !== "Pending") ||
                        (item.type === "resolved" &&
                          selectedComplaint.status === "Resolved");

                      return (
                        <div className="timeline-item" key={index}>
                          <div
                            className={`timeline-dot ${
                              completed ? "completed" : ""
                            }`}
                          >
                            {completed ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <Circle size={16} />
                            )}
                          </div>

                          {index < selectedComplaint.timeline.length - 1 && (
                            <div className="timeline-line" />
                          )}

                          <div className="timeline-content">
                            <strong>{item.title}</strong>
                            {item.date !== "-" && (
                              <span>
                                {item.date}
                                {item.time && ` • ${item.time}`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        {/* CHANGE DEPARTMENT MODAL */}
        {showDepartmentModal && (
          <div
            className="department-modal-overlay"
            onClick={() => {
              if (!savingDepartment) setShowDepartmentModal(false);
            }}
          >
            <div
              className="department-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="department-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="department-modal-header">
                <div>
                  <h2 id="department-modal-title">Change Department</h2>
                  <p>Reassign this complaint manually.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDepartmentModal(false)}
                  disabled={savingDepartment}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="department-modal-field">
                <label>Current Department</label>
                <div className="current-department">
                  {selectedComplaint?.department}
                </div>
              </div>

              <div className="department-modal-field">
                <label htmlFor="new-department">Assign To</label>
                <select
                  id="new-department"
                  value={selectedDepartmentId}
                  onChange={(event) =>
                    setSelectedDepartmentId(event.target.value)
                  }
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="department-modal-field">
                <label htmlFor="assignment-reason">
                  Reason for reassignment <span>(optional)</span>
                </label>
                <textarea
                  id="assignment-reason"
                  value={assignmentReason}
                  onChange={(event) =>
                    setAssignmentReason(event.target.value)
                  }
                  placeholder="Why is this complaint being reassigned?"
                  rows={3}
                />
              </div>

              <div className="department-modal-actions">
                <button
                  type="button"
                  className="department-cancel-button"
                  onClick={() => setShowDepartmentModal(false)}
                  disabled={savingDepartment}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="department-save-button"
                  onClick={saveDepartmentAssignment}
                  disabled={savingDepartment || !selectedDepartmentId}
                >
                  {savingDepartment ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FULL-SIZE IMAGE PREVIEW */}
        {previewImage && (
          <div
            className="complaint-image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Complaint image preview"
            onClick={() => setPreviewImage(null)}
          >
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setPreviewImage(null)}
              aria-label="Close image preview"
            >
              <X size={22} />
            </button>

            <img
              src={previewImage}
              alt="Full-size complaint evidence"
              className="lightbox-image"
              onClick={(event) => event.stopPropagation()}
            />

            <p className="lightbox-caption">
              Click outside the image or press the close button to return
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminComplaints;

