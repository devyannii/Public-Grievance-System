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

import potholeImage from "../../assets/images/pothole.png";

import "../../styles/ReportIssue.css";

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

function ReportIssue() {
  const navigate = useNavigate();

  const [selectedIssue, setSelectedIssue] = useState("Pothole");

  const [description, setDescription] = useState(
    "There is a deep pothole on the road causing traffic and vehicle damage."
  );

  const [image, setImage] = useState(potholeImage);

  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log({
      issueType: selectedIssue,
      location: "MG Road, Pune, Maharashtra",
      description,
      image,
    });
  };

  return (
    <div className="report-issue-page">

      {/* =========================================
          HEADER
      ========================================= */}

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


      {/* =========================================
          FORM
      ========================================= */}

      <main className="report-issue-content">

        <form onSubmit={handleSubmit}>

          {/* ISSUE TYPE */}

          <section className="report-form-section">

            <label className="report-section-label">
              Issue Type
            </label>

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
                    onClick={() => setSelectedIssue(issue.name)}
                  >
                    <Icon size={19} />

                    <span>{issue.name}</span>
                  </button>
                );
              })}

            </div>

          </section>


          {/* LOCATION */}

          <section className="report-form-section">

            <label className="report-section-label">
              Location
            </label>

            <button
              type="button"
              className="location-field"
            >
              <div className="location-left">

                <MapPin size={18} />

                <span>
                  MG Road, Nagpur, Maharashtra
                </span>

              </div>

              <span className="change-location">
                Change Location
              </span>

            </button>

          </section>


          {/* DESCRIPTION */}

          <section className="report-form-section">

            <label className="report-section-label">
              Description
            </label>

            <div className="description-wrapper">

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value.slice(0, 500))
                }
                maxLength={500}
                placeholder="Describe the issue..."
              />

              <span className="character-count">
                {description.length}/500
              </span>

            </div>

          </section>


          {/* UPLOAD PHOTO */}

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
                onClick={() => fileInputRef.current.click()}
              >
                <Plus size={24} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />

            </div>

          </section>


          {/* SUBMIT */}

          <button
            type="submit"
            className="submit-report-button"
          >
            Submit Report
          </button>

        </form>

      </main>


      {/* =========================================
          BOTTOM NAVIGATION
      ========================================= */}

      <nav className="report-bottom-navigation">

        {/* HOME */}

        <button
          className="report-bottom-item"
          onClick={() => navigate("/user")}
        >
          <Home size={19} />
          <span>Home</span>
        </button>


        {/* MAP */}

        <button
          className="report-bottom-item"
          onClick={() => navigate("/user/map")}
        >
          <Map size={19} />
          <span>Map</span>
        </button>


        {/* ADD REPORT */}

        <button
          className="report-add-button"
          onClick={() => navigate("/user/report")}
        >
          <Plus size={27} />
        </button>


        {/* REPORTS */}

        <button
          className="report-bottom-item"
          onClick={() => navigate("/user/reports")}
        >
          <FileText size={19} />
          <span>Reports</span>
        </button>


        {/* PROFILE */}

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