import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  User,
  Building2,
  Clock3,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Brain,
  X,
  Maximize2,
  MessageSquare,
  Trash2,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import "./StaffComplaintDetails.css";

function StaffComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [savingRemark, setSavingRemark] = useState(false);

  const [error, setError] = useState("");

  const [staffProfile, setStaffProfile] = useState(null);
  const [complaint, setComplaint] = useState(null);
  const [department, setDepartment] = useState(null);
  const [reporter, setReporter] = useState(null);
  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [remarks, setRemarks] = useState([]);
  const [remarkText, setRemarkText] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);

  /* =========================================================
     LOAD COMPLAINT
  ========================================================= */

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      setError("");

      /* =====================================================
         AUTH
      ===================================================== */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/staff/login");
        return;
      }

      /* =====================================================
         STAFF PROFILE
      ===================================================== */

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, full_name, role, department_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Unable to load staff profile.");
      }

      if (profile.role !== "department_staff") {
        navigate("/staff/login");
        return;
      }

      if (!profile.department_id) {
        throw new Error(
          "No department is assigned to this staff account."
        );
      }

      setStaffProfile(profile);

      /* =====================================================
         COMPLAINT
      ===================================================== */

      const {
        data: complaintData,
        error: complaintError,
      } = await supabase
        .from("complaints")
        .select(`
          id,
          complaint_code,
          user_id,
          title,
          description,
          category_id,
          department_id,
          status,
          priority,
          latitude,
          longitude,
          location_text,
          ai_recommended_department,
          automatically_assigned,
          assigned_at,
          ai_summary,
          created_at,
          updated_at,
          resolved_at,
          assignment_source,
          manually_assigned_at,
          assignment_reason
        `)
        .eq("id", id)
        .eq("department_id", profile.department_id)
        .is("deleted_at", null)
        .single();

      if (complaintError || !complaintData) {
        throw new Error(
          "Complaint not found or it is not assigned to your department."
        );
      }

      setComplaint(complaintData);

      /* =====================================================
         DEPARTMENT
      ===================================================== */

      if (complaintData.department_id) {
        const { data: departmentData } = await supabase
          .from("departments")
          .select("id, name")
          .eq("id", complaintData.department_id)
          .maybeSingle();

        setDepartment(departmentData);
      }

      /* =====================================================
         CATEGORY
      ===================================================== */

      if (complaintData.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id, name")
          .eq("id", complaintData.category_id)
          .maybeSingle();

        setCategory(categoryData);
      }

      /* =====================================================
         REPORTER
      ===================================================== */

      if (complaintData.user_id) {
        const {
          data: reporterData,
          error: reporterError,
        } = await supabase
          .from("profiles")
          .select("id, full_name, profile_picture")
          .eq("id", complaintData.user_id)
          .maybeSingle();

        console.log("Reporter:", reporterData);
        console.log("Reporter error:", reporterError);

        setReporter(reporterData);
      }

      /* =====================================================
         COMPLAINT IMAGES
      ===================================================== */

      const {
        data: imageRows,
        error: imageRowsError,
      } = await supabase
        .from("complaint_images")
        .select(`
          id,
          complaint_id,
          storage_path,
          file_name,
          file_type,
          created_at
        `)
        .eq("complaint_id", complaintData.id)
        .order("created_at", {
          ascending: true,
        });

      if (imageRowsError) {
        console.error(
          "Image records error:",
          imageRowsError
        );
      }

      if (imageRows?.length) {
        const signedImages = [];

        for (const image of imageRows) {
          const {
            data: signedImage,
            error: signedUrlError,
          } = await supabase.storage
            .from("complaint-images")
            .createSignedUrl(
              image.storage_path,
              3600
            );

          if (
            !signedUrlError &&
            signedImage?.signedUrl
          ) {
            signedImages.push({
              ...image,
              url: signedImage.signedUrl,
            });
          } else {
            console.error(
              "Signed image URL error:",
              signedUrlError
            );
          }
        }

        setImages(signedImages);
      } else {
        setImages([]);
      }

      /* =====================================================
         AI ANALYSIS
      ===================================================== */

      const { data: aiData } = await supabase
        .from("ai_analysis")
        .select(`
          id,
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
        `)
        .eq("complaint_id", complaintData.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      setAiAnalysis(aiData || null);

      /* =====================================================
         REMARKS
      ===================================================== */

      await loadRemarks(
        complaintData.id
      );

    } catch (err) {
      console.error(
        "Staff complaint details error:",
        err
      );

      setError(
        err.message ||
          "Unable to load complaint."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD REMARKS
  ========================================================= */

  const loadRemarks = async (complaintId) => {
    try {
      const {
        data: remarkRows,
        error: remarksError,
      } = await supabase
        .from("complaint_remarks")
        .select(`
          id,
          complaint_id,
          user_id,
          remark,
          created_at
        `)
        .eq("complaint_id", complaintId)
        .order("created_at", {
          ascending: true,
        });

      if (remarksError) {
        console.error(
          "Remarks loading error:",
          remarksError
        );

        setRemarks([]);
        return;
      }

      if (!remarkRows?.length) {
        setRemarks([]);
        return;
      }

      const userIds = [
        ...new Set(
          remarkRows
            .map((remark) => remark.user_id)
            .filter(Boolean)
        ),
      ];

      let authorMap = {};

      if (userIds.length > 0) {
        const {
          data: authors,
          error: authorsError,
        } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        if (authorsError) {
          console.error(
            "Remark authors error:",
            authorsError
          );
        }

        if (authors) {
          authorMap = authors.reduce(
            (map, author) => {
              map[author.id] =
                author.full_name ||
                "Department Staff";

              return map;
            },
            {}
          );
        }
      }

      const formattedRemarks =
        remarkRows.map((remark) => ({
          ...remark,
          author_name:
            authorMap[remark.user_id] ||
            "Department Staff",
        }));

      setRemarks(formattedRemarks);
    } catch (err) {
      console.error(
        "Load remarks error:",
        err
      );

      setRemarks([]);
    }
  };

  /* =========================================================
     ADD REMARK
  ========================================================= */

  const addRemark = async () => {
    const trimmedRemark =
      remarkText.trim();

    if (!trimmedRemark) {
      return;
    }

    if (!complaint || !staffProfile) {
      return;
    }

    try {
      setSavingRemark(true);
      setError("");

      const {
        data: newRemark,
        error: insertError,
      } = await supabase
        .from("complaint_remarks")
        .insert({
          complaint_id: complaint.id,
          user_id: staffProfile.id,
          remark: trimmedRemark,
        })
        .select(`
          id,
          complaint_id,
          user_id,
          remark,
          created_at
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      setRemarks((prev) => [
        ...prev,
        {
          ...newRemark,
          author_name:
            staffProfile.full_name ||
            "Department Staff",
        },
      ]);

      setRemarkText("");
    } catch (err) {
      console.error(
        "Add remark error:",
        err
      );

      setError(
        err.message ||
          "Unable to add the remark."
      );
    } finally {
      setSavingRemark(false);
    }
  };

  /* =========================================================
     DELETE REMARK
  ========================================================= */

  const deleteRemark = async (remarkId) => {
    if (!remarkId || !staffProfile) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this remark?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const {
        error: deleteError,
      } = await supabase
        .from("complaint_remarks")
        .delete()
        .eq("id", remarkId)
        .eq("user_id", staffProfile.id);

      if (deleteError) {
        throw deleteError;
      }

      setRemarks((prev) =>
        prev.filter(
          (remark) =>
            remark.id !== remarkId
        )
      );
    } catch (err) {
      console.error(
        "Delete remark error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete the remark."
      );
    }
  };

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const updateStatus = async (newStatus) => {
    if (!complaint || updating) return;

    try {
      setUpdating(true);
      setError("");

      const updateData = {
        status: newStatus,
        updated_at:
          new Date().toISOString(),
        resolved_at:
          newStatus === "Resolved"
            ? new Date().toISOString()
            : null,
      };

      const {
        data,
        error: updateError,
      } = await supabase
        .from("complaints")
        .update(updateData)
        .eq("id", complaint.id)
        .eq(
          "department_id",
          staffProfile.department_id
        )
        .select(`
          id,
          complaint_code,
          status,
          department_id,
          updated_at,
          resolved_at
        `)
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!data) {
        throw new Error(
          "No complaint was updated. Please check staff permissions."
        );
      }

      setComplaint((prev) => ({
        ...prev,
        status: data.status,
        updated_at:
          data.updated_at,
        resolved_at:
          data.resolved_at,
      }));
    } catch (err) {
      console.error(
        "STATUS UPDATE FAILED:",
        err
      );

      setError(
        err?.message ||
          "Unable to update complaint status."
      );
    } finally {
      setUpdating(false);
    }
  };

  /* =========================================================
     OPEN MAP
  ========================================================= */

  const openMap = () => {
    if (
      complaint?.latitude === null ||
      complaint?.latitude === undefined ||
      complaint?.longitude === null ||
      complaint?.longitude === undefined
    ) {
      return;
    }

    const url =
      `https://www.google.com/maps/search/?api=1&query=` +
      `${complaint.latitude},${complaint.longitude}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  /* =========================================================
     FORMAT PRIORITY
  ========================================================= */

  const formatPriority = (priority) => {
    if (!priority) {
      return "Not specified";
    }

    return priority
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const statusClass = (status) => {
    if (status === "Resolved") {
      return "resolved";
    }

    if (status === "In Progress") {
      return "progress";
    }

    return "pending";
  };

  /* =========================================================
     STATUS DISPLAY
  ========================================================= */

  const formatStatus = (status) => {
    return status || "Pending";
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="staff-details-loading">
        <Loader2
          size={30}
          className="spin"
        />

        <p>
          Loading complaint...
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR PAGE
  ========================================================= */

  if (!complaint) {
    return (
      <div className="staff-details-error-page">
        <div className="staff-error-card">
          <AlertCircle size={40} />

          <h2>
            Unable to load complaint
          </h2>

          <p>
            {error ||
              "Complaint not found."}
          </p>

          <button
            onClick={() =>
              navigate(
                "/staff/dashboard"
              )
            }
          >
            <ArrowLeft size={16} />

            Back to Complaints
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="staff-details-page">

      {/* =====================================================
          TOP
      ===================================================== */}

      <div className="details-top">
        <button
          className="back-button"
          onClick={() =>
            navigate(
              "/staff/dashboard"
            )
          }
        >
          <ArrowLeft size={17} />

          <span>
            Back to Complaints
          </span>
        </button>

        <span className="complaint-code">
          {complaint.complaint_code ||
            complaint.id}
        </span>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="inline-error">
          <AlertCircle size={15} />

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="complaint-header">
        <div className="header-left">
          <span className="eyebrow">
            COMPLAINT
          </span>

          <h1>
            {complaint.title ||
              "Untitled Complaint"}
          </h1>

          <div className="header-info">
            <span>
              <Clock3 size={14} />

              {formatDate(
                complaint.created_at
              )}
            </span>

            {category?.name && (
              <span>
                <CircleDot size={13} />

                {category.name}
              </span>
            )}
          </div>
        </div>

        <span
          className={`status-badge ${statusClass(
            complaint.status
          )}`}
        >
          {formatStatus(
            complaint.status
          )}
        </span>
      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="details-grid">

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        <section className="info-card description-card">
          <div className="card-heading">
            <h2>
              Description
            </h2>
          </div>

          <p>
            {complaint.description ||
              "No description provided."}
          </p>
        </section>

        {/* ===================================================
            REPORTED BY
        =================================================== */}

        <section className="info-card">
          <div className="card-heading">
            <User size={16} />

            <h2>
              Reported By
            </h2>
          </div>

          <div className="reporter">
            {reporter?.profile_picture ? (
              <img
                src={
                  reporter.profile_picture
                }
                alt={
                  reporter.full_name ||
                  "Resident"
                }
              />
            ) : (
              <div className="reporter-avatar">
                <User size={17} />
              </div>
            )}

            <div>
              <strong>
                {reporter?.full_name ||
                  "Resident"}
              </strong>

              <span>
                Resident
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            PHOTOS
        =================================================== */}

        <section className="info-card photos-card">
          <div className="card-heading photo-heading">
            <div>
              <h2>
                Photos
              </h2>

              <span>
                {images.length}{" "}
                {images.length === 1
                  ? "photo"
                  : "photos"}
              </span>
            </div>
          </div>

          {images.length > 0 ? (
            <div className="photo-grid">
              {images.map((image) => (
                <button
                  type="button"
                  className="photo-item"
                  key={image.id}
                  onClick={() =>
                    setSelectedImage(
                      image
                    )
                  }
                  aria-label="View complaint photo"
                >
                  <img
                    src={image.url}
                    alt={
                      image.file_name ||
                      "Complaint photo"
                    }
                  />

                  <span className="photo-expand">
                    <Maximize2
                      size={17}
                    />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="no-photo">
              <ImageIcon size={22} />

              <span>
                No complaint photos available.
              </span>
            </div>
          )}
        </section>

        {/* ===================================================
            COMPLAINT DETAILS
        =================================================== */}

        <section className="info-card">
          <div className="card-heading">
            <Building2 size={16} />

            <h2>
              Complaint Details
            </h2>
          </div>

          <div className="detail-list">
            <div>
              <span>
                Department
              </span>

              <strong>
                {department?.name ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>
                Category
              </span>

              <strong>
                {category?.name ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>
                Priority
              </span>

              <strong
                className={`priority ${
                  complaint.priority ||
                  ""
                }`}
              >
                {formatPriority(
                  complaint.priority
                )}
              </strong>
            </div>

            <div>
              <span>
                Assignment
              </span>

              <strong>
                {complaint.automatically_assigned
                  ? "AI Assigned"
                  : "Manually Assigned"}
              </strong>
            </div>
          </div>
        </section>

        {/* ===================================================
            LOCATION
        =================================================== */}

        <section className="info-card location-card">
          <div className="card-heading">
            <MapPin size={16} />

            <h2>
              Location
            </h2>
          </div>

          <div className="location-content">
            <div className="location-icon">
              <MapPin size={19} />
            </div>

            <div className="location-text">
              <strong>
                {complaint.location_text ||
                  "Location not provided"}
              </strong>

              {complaint.latitude !== null &&
                complaint.latitude !== undefined &&
                complaint.longitude !== null &&
                complaint.longitude !==
                  undefined && (
                  <span>
                    {Number(
                      complaint.latitude
                    ).toFixed(6)}
                    ,{" "}
                    {Number(
                      complaint.longitude
                    ).toFixed(6)}
                  </span>
                )}
            </div>

            {complaint.latitude !== null &&
              complaint.latitude !== undefined &&
              complaint.longitude !== null &&
              complaint.longitude !==
                undefined && (
                <button
                  className="map-button"
                  onClick={openMap}
                >
                  <MapPin size={14} />

                  Map
                </button>
              )}
          </div>
        </section>

        {/* ===================================================
            UPDATE STATUS
        =================================================== */}

        <section className="info-card">
          <div className="card-heading">
            <CheckCircle2 size={16} />

            <h2>
              Update Status
            </h2>
          </div>

          <div className="status-buttons">
            <button
              className={
                complaint.status ===
                "Pending"
                  ? "active pending"
                  : ""
              }
              disabled={updating}
              onClick={() =>
                updateStatus(
                  "Pending"
                )
              }
            >
              <span />
              Pending
            </button>

            <button
              className={
                complaint.status ===
                "In Progress"
                  ? "active progress"
                  : ""
              }
              disabled={updating}
              onClick={() =>
                updateStatus(
                  "In Progress"
                )
              }
            >
              <span />
              In Progress
            </button>

            <button
              className={
                complaint.status ===
                "Resolved"
                  ? "active resolved"
                  : ""
              }
              disabled={updating}
              onClick={() =>
                updateStatus(
                  "Resolved"
                )
              }
            >
              <span />
              Resolved
            </button>
          </div>

          {updating && (
            <div className="updating">
              <Loader2
                size={13}
                className="spin"
              />

              Updating...
            </div>
          )}
        </section>

        {/* ===================================================
            AI ANALYSIS
        =================================================== */}

        {aiAnalysis && (
          <section className="info-card ai-card">
            <div className="card-heading">
              <Brain size={16} />

              <div>
                <h2>
                  AI Analysis
                </h2>

                <span>
                  Automated complaint insights
                </span>
              </div>
            </div>

            <div className="ai-items">
              <div>
                <span>
                  Detected Category
                </span>

                <strong>
                  {aiAnalysis.detected_category ||
                    category?.name ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Confidence
                </span>

                <strong>
                  {aiAnalysis.image_confidence !==
                    null &&
                  aiAnalysis.image_confidence !==
                    undefined
                    ? `${Math.round(
                        Number(
                          aiAnalysis.image_confidence
                        ) * 100
                      )}%`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Priority
                </span>

                <strong>
                  {formatPriority(
                    aiAnalysis.predicted_priority
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Recommended Department
                </span>

                <strong>
                  {aiAnalysis.recommended_department ||
                    "—"}
                </strong>
              </div>
            </div>

            {aiAnalysis.summary && (
              <div className="ai-summary">
                {aiAnalysis.summary}
              </div>
            )}
          </section>
        )}

        {/* ===================================================
            REMARKS
        =================================================== */}

        <section className="info-card remarks-card">
          <div className="card-heading">
            <MessageSquare size={16} />

            <div>
              <h2>
                Remarks
              </h2>

              <span className="remarks-subtitle">
                Updates from department staff
              </span>
            </div>
          </div>

          {/* ADD REMARK */}

          <div className="remark-form">
            <textarea
              value={remarkText}
              onChange={(event) =>
                setRemarkText(
                  event.target.value
                )
              }
              placeholder="Write a remark about this complaint..."
              rows={4}
              disabled={savingRemark}
            />

            <button
              type="button"
              className="add-remark-button"
              onClick={addRemark}
              disabled={
                savingRemark ||
                !remarkText.trim()
              }
            >
              {savingRemark ? (
                <>
                  <Loader2
                    size={14}
                    className="spin"
                  />

                  Adding...
                </>
              ) : (
                <>
                  <MessageSquare
                    size={14}
                  />

                  Add Remark
                </>
              )}
            </button>
          </div>

          {/* REMARK LIST */}

          {remarks.length > 0 ? (
            <div className="remarks-list">
              {remarks.map((remark) => (
                <div
                  className="remark-item"
                  key={remark.id}
                >
                  <div className="remark-meta">
                    <div className="remark-author-wrap">
                      <span className="remark-author">
                        {remark.author_name ||
                          "Department Staff"}
                      </span>

                      {remark.user_id ===
                        staffProfile?.id && (
                        <button
                          type="button"
                          className="delete-remark-button"
                          onClick={() =>
                            deleteRemark(
                              remark.id
                            )
                          }
                          title="Delete remark"
                          aria-label="Delete remark"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>
                      )}
                    </div>

                    <span className="remark-date">
                      {formatDate(
                        remark.created_at
                      )}
                    </span>
                  </div>

                  <p className="remark-text">
                    {remark.remark}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-remarks">
              No remarks have been added yet.
            </div>
          )}
        </section>

        {/* ===================================================
            TIMELINE
        =================================================== */}

        <section className="info-card timeline-card">
          <div className="card-heading">
            <Clock3 size={16} />

            <h2>
              Timeline
            </h2>
          </div>

          <div className="timeline">

            {/* REPORTED */}

            <div className="timeline-step completed">
              <div className="timeline-circle">
                <CheckCircle2
                  size={13}
                />
              </div>

              <div>
                <strong>
                  Complaint reported
                </strong>

                <span>
                  {formatDate(
                    complaint.created_at
                  )}
                </span>
              </div>
            </div>

            {/* ASSIGNED */}

            <div
              className={`timeline-step ${
                complaint.assigned_at
                  ? "completed"
                  : ""
              }`}
            >
              <div className="timeline-circle">
                {complaint.assigned_at ? (
                  <CheckCircle2
                    size={13}
                  />
                ) : (
                  <CircleDot
                    size={13}
                  />
                )}
              </div>

              <div>
                <strong>
                  Assigned to department
                </strong>

                <span>
                  {complaint.assigned_at
                    ? formatDate(
                        complaint.assigned_at
                      )
                    : "Pending assignment"}
                </span>
              </div>
            </div>

            {/* RESOLUTION */}

            <div
              className={`timeline-step ${
                complaint.status ===
                  "In Progress" ||
                complaint.status ===
                  "Resolved"
                  ? "current"
                  : ""
              }`}
            >
              <div className="timeline-circle">
                {complaint.status ===
                "Resolved" ? (
                  <CheckCircle2
                    size={13}
                  />
                ) : (
                  <CircleDot
                    size={13}
                  />
                )}
              </div>

              <div>
                <strong>
                  {complaint.status ===
                  "Resolved"
                    ? "Complaint resolved"
                    : complaint.status ===
                      "In Progress"
                    ? "Work in progress"
                    : "Resolution"}
                </strong>

                <span>
                  {complaint.status ===
                  "Resolved"
                    ? formatDate(
                        complaint.resolved_at
                      )
                    : complaint.status ===
                      "In Progress"
                    ? "Currently being handled"
                    : "Waiting for completion"}
                </span>
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* =====================================================
          IMAGE PREVIEW MODAL
      ===================================================== */}

      {selectedImage && (
        <div
          className="image-modal"
          onClick={() =>
            setSelectedImage(null)
          }
        >
          <div
            className="image-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="image-modal-close"
              onClick={() =>
                setSelectedImage(null)
              }
              aria-label="Close image"
            >
              <X size={22} />
            </button>

            <img
              src={selectedImage.url}
              alt={
                selectedImage.file_name ||
                "Complaint photo"
              }
              className="image-modal-image"
            />

            {selectedImage.file_name && (
              <div className="image-modal-caption">
                {selectedImage.file_name}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default StaffComplaintDetails;