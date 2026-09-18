import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  Trash2,
  Lightbulb,
  Droplets,
  MapPin,
  Plus,
  Home,
  Map,
  FileText,
  User,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import "../../styles/ReportIssue.css";
import "../../styles/BottomNavigation.css";
import "../../styles/UserAppLayout.css";

const issueTypes = [
  {
    name: "Pothole",
    icon: CircleHelp,
  },
  {
    name: "Garbage",
    icon: Trash2,
  },
  {
    name: "Street Light",
    icon: Lightbulb,
  },
  {
    name: "Water Leakage",
    icon: Droplets,
  },
  {
    name: "Other",
    icon: CircleHelp,
  },
];

function generateComplaintCode() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `UGS-${randomNumber}`;
}

async function getReadableLocation(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        latitude
      )}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();

    const address = data.address || {};

    // Prefer a short, human-readable address.
    const parts = [
      address.road || address.pedestrian || address.neighbourhood,
      address.suburb || address.city_district,
      address.city || address.town || address.village,
      address.state,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return data.display_name || "";
  } catch (error) {
    console.warn("Could not get readable location:", error);
    return "";
  }
}


function ReportIssue() {
  const navigate = useNavigate();

  const [selectedIssue, setSelectedIssue] = useState("");
  const [letAISuggest, setLetAISuggest] = useState(true);

  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [locationText, setLocationText] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLocationEditing, setIsLocationEditing] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fileInputRef = useRef(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setSubmitError("Location detection is not supported by this browser.");
      return;
    }

    setSubmitError("");
    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        setLatitude(lat);
        setLongitude(lng);

        // Keep coordinates as the fallback, then convert them
        // into a readable street/city location.
        setLocationText(
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        );

        const readableLocation = await getReadableLocation(
          lat,
          lng
        );

        if (readableLocation) {
          setLocationText(
            `${readableLocation} (${lat.toFixed(6)}, ${lng.toFixed(6)})`
          );
        }

        setIsLocationEditing(false);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Location detection error:", error);

        let message = "Unable to detect your location.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access or enter the location manually.";
        } else if (error.code === 2) {
          message = "Your location could not be determined. Please enter it manually.";
        } else if (error.code === 3) {
          message = "Location detection timed out. Please try again or enter it manually.";
        }

        setSubmitError(message);
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const imageURL = URL.createObjectURL(file);
    setImage(imageURL);

    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");

    if (!letAISuggest && !description.trim()) {
      setSubmitError("Please enter a description or turn on AI assistance.");
      return;
    }

    if (!selectedFile) {
      setSubmitError("Please upload a photo of the issue.");
      return;
    }

    setIsSubmitting(true);

    try {
      // ---------------------------------------
      // 1. Get currently logged-in user
      // ---------------------------------------
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

      // ---------------------------------------
      // 2. Generate complaint code
      // ---------------------------------------
      const complaintCode = generateComplaintCode();

      // ---------------------------------------
      // 3. Create complaint
      // ---------------------------------------
      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .insert({
          complaint_code: complaintCode,
          user_id: user.id,
          title:
            letAISuggest
              ? "Civic Issue"
              : selectedIssue || "Other",
          description: description.trim(),
          category_id: null,
          location_text:
            locationText.trim() || "Location not provided",
          latitude,
          longitude,
          original_language: "English",
        })
        .select()
        .single();

      if (complaintError) {
        throw complaintError;
      }

      // ---------------------------------------
      // 4. Upload image to Supabase Storage
      // ---------------------------------------
      const fileExtension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/${complaint.id}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("complaint-images")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedFile.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      // ---------------------------------------
      // 5. Save image information
      // ---------------------------------------
      const { error: imageRecordError } = await supabase
        .from("complaint_images")
        .insert({
          complaint_id: complaint.id,
          storage_path: filePath,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
        });

      if (imageRecordError) {
        throw imageRecordError;
      }

      // ---------------------------------------
      // 6. Start AI analysis in the background
      // ---------------------------------------
      // Do NOT wait for Gemini here.
      // The complaint and image are already safely saved.
      // This makes submission feel immediate while the AI
      // continues processing in the background.
      try {
        const apiBaseUrl =
          import.meta.env.VITE_API_URL ||
          "http://127.0.0.1:8000";

        fetch(
          `${apiBaseUrl}/api/ai/analyze/${complaintCode}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
            // Allows the request to continue while the page
            // navigates in supported browsers.
            keepalive: true,
          }
        )
          .then(async (response) => {
            if (!response.ok) {
              const aiErrorText = await response.text();

              console.error(
                "AI analysis failed:",
                aiErrorText
              );

              return;
            }

            const aiResult = await response.json();

            console.log(
              "AI analysis completed:",
              aiResult
            );
          })
          .catch((aiError) => {
            console.error(
              "Could not connect to AI service:",
              aiError
            );
          });
      } catch (aiError) {
        console.error(
          "Could not start AI analysis:",
          aiError
        );
      }

      // ---------------------------------------
      // 7. Open complaint immediately
      // ---------------------------------------
      navigate(`/user/issue/${complaint.id}`);
    } catch (error) {
      console.error("Complaint submission error:", error);

      setSubmitError(
        error?.message ||
          "Something went wrong while submitting your complaint."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-issue-page">

      {/* HEADER */}
      <header className="report-issue-header">
        <button
          className="report-issue-back"
          onClick={() => navigate("/user")}
        >
          <ArrowLeft size={21} />
        </button>

        <h1>Report an Issue</h1>

        <div className="report-header-space"></div>
      </header>

      <main className="report-issue-content">
        <form onSubmit={handleSubmit}>

          {/* ISSUE TYPE / AI ASSIST */}
          <section className="report-form-section">
            <label className="report-section-label">Issue Type</label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px 14px",
                marginBottom: "12px",
                borderRadius: "12px",
                border: "1px solid #dce8df",
                background: letAISuggest ? "#f1f8f3" : "#fff",
                cursor: "pointer",
              }}
            >
              <span>
                <strong
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#294336",
                  }}
                >
                  ✨ Let AI handle this
                </strong>
                <span
                  style={{
                    display: "block",
                    marginTop: "3px",
                    fontSize: "11px",
                    color: "#718078",
                  }}
                >
                  AI can identify the category and write the description from
                  your photo.
                </span>
              </span>

              <input
                type="checkbox"
                checked={letAISuggest}
                onChange={(event) => {
                  const enabled = event.target.checked;
                  setLetAISuggest(enabled);

                  if (enabled) {
                    setSelectedIssue("");
                  }
                }}
              />
            </label>

            {!letAISuggest && (
              <div className="issue-type-list">
                {issueTypes.map((issue) => {
                  const Icon = issue.icon;

                  return (
                    <button
                      type="button"
                      key={issue.name}
                      className={`issue-type-card ${
                        selectedIssue === issue.name ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedIssue(issue.name);
                        setLetAISuggest(false);
                      }}
                    >
                      <Icon size={19} />
                      <span>{issue.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* LOCATION */}
          <section className="report-form-section">
            <label className="report-section-label">Location</label>

            <div className="location-field">
              <div className="location-left">
                <MapPin size={18} />
                {isLocationEditing ? (
                  <input
                    type="text"
                    value={locationText}
                    onChange={(event) => setLocationText(event.target.value)}
                    placeholder="Enter location"
                    autoFocus
                  />
                ) : (
                  <span>
                    {locationText || "Location not selected"}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginLeft: "8px",
                }}
              >
                <button
                  type="button"
                  className="change-location"
                  onClick={() => setIsLocationEditing((value) => !value)}
                >
                  {isLocationEditing ? "Done" : "Enter Manually"}
                </button>

                <button
                  type="button"
                  className="change-location"
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                >
                  {isDetectingLocation ? "Detecting..." : "Use Current"}
                </button>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="report-form-section">
            <label className="report-section-label">
              Description
              {!letAISuggest && (
                <span style={{ fontWeight: 400, fontSize: "11px", color: "#8a968f" }}>
                  {" "}Required
                </span>
              )}
            </label>

            <div className="description-wrapper">
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value.slice(0, 500))
                }
                maxLength={500}
                placeholder={
                  letAISuggest
                    ? "Optional — AI can describe the issue from your photo..."
                    : "Describe the issue..."
                }
              />

              <span className="character-count">
                {description.length}/500
              </span>
            </div>

            {letAISuggest && (
              <p
                style={{
                  margin: "7px 0 0",
                  fontSize: "11px",
                  color: "#718078",
                }}
              >
                Leave this blank and AI will generate a concise description
                after analyzing your photo.
              </p>
            )}
          </section>

          {/* PHOTO */}
          <section className="report-form-section">
            <label className="report-section-label">
              Upload Photo
            </label>

            <div className="upload-container">
              {image && (
                <div className="uploaded-image">
                  <img
                    src={image}
                    alt="Uploaded issue"
                  />
                </div>
              )}

              <button
                type="button"
                className="add-photo-button"
                onClick={() =>
                  document.getElementById("camera-input")?.click()
                }
                aria-label="Take a photo"
              >
                <Plus size={24} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                hidden
              />

              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                hidden
              />
            </div>
          </section>

          {/* ERROR */}
          {submitError && (
            <p
              style={{
                color: "#d64545",
                fontSize: "13px",
                margin: "8px 0 12px",
              }}
            >
              {submitError}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="submit-report-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="report-bottom-navigation">
        <button
          className="report-bottom-item"
          onClick={() => navigate("/user")}
        >
          <Home size={19} />
          <span>Home</span>
        </button>

        <button
          className="report-bottom-item"
          onClick={() => navigate("/user/map")}
        >
          <Map size={19} />
          <span>Map</span>
        </button>

        <button
          className="report-add-button"
          onClick={() => navigate("/user/report")}
        >
          <Plus size={27} />
        </button>

        <button
          className="report-bottom-item"
          onClick={() => navigate("/user/reports")}
        >
          <FileText size={19} />
          <span>Reports</span>
        </button>

        <button
          className="report-bottom-item"
          onClick={() => navigate("/user/profile")}
        >
          <User size={19} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default ReportIssue;