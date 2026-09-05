import React, { useMemo, useState } from "react";
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

import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../components/layout/AdminLayout";
import "../../styles/AdminComplaints.css";


// ======================================================
// EXISTING PROJECT IMAGES
// ======================================================

import potholeImage from "../../assets/images/pothole.png";
import garbageImage from "../../assets/images/garbage-overflow.png";
import streetlightImage from "../../assets/images/broken-streetlight.png";
import leakageImage from "../../assets/images/leaking-pipe.png";


// ======================================================
// COMPLAINT DATA
// ======================================================

const complaints = [
  {
    id: "UGS-1287",
    title: "Pothole on MG Road",
    shortTitle: "Pothole on MG Road",
    reportedBy: "Priya Sharma",
    category: "Pothole",
    location: "MG Road, Near Gate 2",
    date: "15 May 2024",
    time: "10:30 AM",
    status: "In Progress",
    department: "Road Maintenance",
    description:
      "There is a deep pothole on the road causing traffic and vehicle damage.",
    image: potholeImage,
    photos: [potholeImage, potholeImage, potholeImage],
    aiAnalysis: {
      summary: "The image appears to show a significant road-surface defect that may affect vehicle safety.",
      suggestedCategory: "Pothole",
      priority: "High",
      confidence: "94%",
      department: "Road Maintenance",
      duplicateRisk: "Low",
    },
    timeline: [
      {
        title: "Reported",
        date: "15 May 2024",
        time: "10:30 AM",
        type: "reported",
      },
      {
        title: "Assigned to: Maintenance Team",
        date: "15 May 2024",
        time: "11:00 AM",
        type: "assigned",
      },
      {
        title: "In Progress",
        date: "15 May 2024",
        time: "09:45 AM",
        type: "progress",
      },
      {
        title: "Resolved",
        date: "-",
        time: "",
        type: "resolved",
      },
    ],
  },

  {
    id: "UGS-1286",
    title: "Garbage Overflow near Park Area",
    reportedBy: "Amit Kumar",
    category: "Garbage",
    location: "Civil Lines, Pune",
    date: "14 May 2024",
    time: "09:15 AM",
    status: "Resolved",
    department: "Sanitation",
    description:
      "Garbage bins near the park area are overflowing and require immediate cleaning.",
    image: garbageImage,
    photos: [garbageImage, garbageImage],
    aiAnalysis: {
      summary: "The image appears to show accumulated waste around a collection point.",
      suggestedCategory: "Garbage",
      priority: "Medium",
      confidence: "91%",
      department: "Sanitation",
      duplicateRisk: "Low",
    },
    timeline: [
      {
        title: "Reported",
        date: "14 May 2024",
        time: "09:15 AM",
        type: "reported",
      },
      {
        title: "Assigned to: Sanitation Team",
        date: "14 May 2024",
        time: "10:00 AM",
        type: "assigned",
      },
      {
        title: "In Progress",
        date: "14 May 2024",
        time: "11:30 AM",
        type: "progress",
      },
      {
        title: "Resolved",
        date: "14 May 2024",
        time: "03:20 PM",
        type: "resolved",
      },
    ],
  },

  {
    id: "UGS-1285",
    title: "Broken Street Light near Gate 2",
    reportedBy: "Sneha Patil",
    category: "Street Light",
    location: "MG Road, Pune",
    date: "13 May 2026",
    time: "08:45 PM",
    status: "Pending",
    department: "Electrical Department",
    description:
      "The street light near Gate 2 is not functioning and the area becomes very dark at night.",
    image: streetlightImage,
    photos: [streetlightImage],
    aiAnalysis: {
      summary: "The image appears consistent with a damaged or non-functioning street light.",
      suggestedCategory: "Street Light",
      priority: "Medium",
      confidence: "89%",
      department: "Electrical Department",
      duplicateRisk: "Low",
    },
    timeline: [
      {
        title: "Reported",
        date: "13 May 2024",
        time: "08:45 PM",
        type: "reported",
      },
      {
        title: "Assigned to: Electrical Department",
        date: "-",
        time: "",
        type: "assigned",
      },
      {
        title: "In Progress",
        date: "-",
        time: "",
        type: "progress",
      },
      {
        title: "Resolved",
        date: "-",
        time: "",
        type: "resolved",
      },
    ],
  },

  {
    id: "UGS-1284",
    title: "Water Leakage in Road 4",
    reportedBy: "Rahul Mehta",
    category: "Water Leakage",
    location: "Road 4, Pune",
    date: "12 May 2026",
    time: "11:20 AM",
    status: "In Progress",
    department: "Water Department",
    description:
      "A water pipe is leaking on Road 4 and water is collecting near the roadside.",
    image: leakageImage,
    photos: [leakageImage, leakageImage],
    aiAnalysis: {
      summary: "The image appears to show water escaping from infrastructure and collecting near the road.",
      suggestedCategory: "Water Leakage",
      priority: "High",
      confidence: "92%",
      department: "Water Department",
      duplicateRisk: "Low",
    },
    timeline: [
      {
        title: "Reported",
        date: "12 May 2024",
        time: "11:20 AM",
        type: "reported",
      },
      {
        title: "Assigned to: Water Department",
        date: "12 May 2024",
        time: "01:00 PM",
        type: "assigned",
      },
      {
        title: "In Progress",
        date: "13 May 2024",
        time: "09:00 AM",
        type: "progress",
      },
      {
        title: "Resolved",
        date: "-",
        time: "",
        type: "resolved",
      },
    ],
  },

  {
    id: "UGS-1283",
    title: "Garbage Overflow near Community Hall",
    reportedBy: "Neha Thakur",
    category: "Garbage",
    location: "Community Hall, Pune",
    date: "11 May 2026",
    time: "05:30 PM",
    status: "Resolved",
    department: "Sanitation",
    description:
      "Garbage has accumulated near the community hall and needs to be cleared.",
    image: garbageImage,
    photos: [garbageImage],
    aiAnalysis: {
      summary: "The image appears to show accumulated waste requiring sanitation attention.",
      suggestedCategory: "Garbage",
      priority: "Medium",
      confidence: "90%",
      department: "Sanitation",
      duplicateRisk: "Low",
    },
    timeline: [
      {
        title: "Reported",
        date: "11 May 2026",
        time: "05:30 PM",
        type: "reported",
      },
      {
        title: "Assigned to: Sanitation Team",
        date: "11 May 2026",
        time: "06:00 PM",
        type: "assigned",
      },
      {
        title: "In Progress",
        date: "12 May 2026",
        time: "09:00 AM",
        type: "progress",
      },
      {
        title: "Resolved",
        date: "12 May 2026",
        time: "12:30 PM",
        type: "resolved",
      },
    ],
  },
];


// ======================================================
// STATUS CLASS
// ======================================================

function getStatusClass(status) {
  if (status === "Resolved") return "status-resolved";
  if (status === "Pending") return "status-pending";
  return "status-progress";
}


// ======================================================
// MAIN COMPONENT
// ======================================================

function AdminComplaints() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState({});

  // ----------------------------------------------------
  // FILTER COMPLAINTS
  // ----------------------------------------------------

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesSearch =
        complaint.title.toLowerCase().includes(search.toLowerCase()) ||
        complaint.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
        complaint.category.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" ||
        complaint.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);


  // ----------------------------------------------------
  // SELECTED COMPLAINT
  // ----------------------------------------------------

  const baseSelectedComplaint =
    complaints.find((complaint) => complaint.id === id) ||
    complaints[0];

  const selectedComplaint = {
    ...baseSelectedComplaint,
    status:
      statusOverrides[baseSelectedComplaint.id] ??
      baseSelectedComplaint.status,
  };


  // ----------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------

  const openComplaint = (complaintId) => {
    navigate(`/admin/complaints/${complaintId}`);
  };

  const goBackToComplaints = () => {
    navigate("/admin/complaints");
  };

  const goToMap = () => {
    navigate("/admin/map");
  };


  // ----------------------------------------------------
  // EDIT STATUS
  // ----------------------------------------------------

  const changeStatus = (newStatus) => {
    setShowStatusMenu(false);

    // Frontend-only for now.
    // Later this will call the Django/API endpoint.
    setStatusOverrides((previous) => ({
      ...previous,
      [selectedComplaint.id]: newStatus,
    }));
  };


  return (
    <AdminLayout>

      <div className="complaints-page">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="complaints-header">

          <div>

            <button
              className="back-button"
              onClick={goBackToComplaints}
            >
              <ArrowLeft size={18} />
            </button>

            <div className="header-title">

              <h1>All Complaints</h1>

              <p>
                Manage and track citizen complaints
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            TWO COLUMN CONTENT
        ================================================= */}

        <div className="complaints-layout">


          {/* =================================================
              LEFT — COMPLAINT LIST
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
                  onChange={(e) => setSearch(e.target.value)}
                />

              </div>

              <button className="filter-button">
                <SlidersHorizontal size={17} />
                Filter
              </button>

            </div>


            {/* FILTER TABS */}

            <div className="complaint-tabs">

              <button
                className={activeFilter === "All" ? "active" : ""}
                onClick={() => setActiveFilter("All")}
              >
                All <span>(124)</span>
              </button>

              <button
                className={
                  activeFilter === "In Progress"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveFilter("In Progress")
                }
              >
                In Progress <span>(38)</span>
              </button>

              <button
                className={
                  activeFilter === "Pending"
                    ? "active"
                    : ""
                }
                onClick={() => setActiveFilter("Pending")}
              >
                Pending <span>(27)</span>
              </button>

              <button
                className={
                  activeFilter === "Resolved"
                    ? "active"
                    : ""
                }
                onClick={() => setActiveFilter("Resolved")}
              >
                Resolved <span>(59)</span>
              </button>

            </div>


            {/* COMPLAINT CARDS */}

            <div className="complaint-cards">

              {filteredComplaints.map((complaint) => (

                <button
                  key={complaint.id}
                  className={`complaint-card ${
                    complaint.id === selectedComplaint.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    openComplaint(complaint.id)
                  }
                >

                  <img
                    src={complaint.image}
                    alt={complaint.title}
                    className="complaint-thumbnail"
                  />

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
                      <strong>
                        {complaint.reportedBy}
                      </strong>
                    </p>

                    <div className="complaint-meta">

                      <span>
                        <CalendarDays size={14} />
                        {complaint.date}
                      </span>

                      <span>
                        • {complaint.time}
                      </span>

                    </div>

                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      complaint.status
                    )}`}
                  >
                    {complaint.status}
                  </span>

                </button>

              ))}

            </div>


          </section>


          {/* =================================================
              RIGHT — DETAILS
          ================================================= */}

          <section className="complaint-details-panel">

            {/* DETAILS HEADER */}

            <div className="details-header">

              <div className="details-heading">

                <button
                  className="details-back"
                  onClick={goBackToComplaints}
                >
                  <ArrowLeft size={20} />
                </button>

                <h2>Complaint Details</h2>

              </div>


              <div className="status-wrapper">

                <button
                  className="edit-status-button"
                  onClick={() =>
                    setShowStatusMenu(!showStatusMenu)
                  }
                >
                  <Edit3 size={15} />
                  Edit Status
                </button>


                {showStatusMenu && (

                  <div className="status-menu">

                    <button
                      onClick={() =>
                        changeStatus("Pending")
                      }
                    >
                      Pending
                    </button>

                    <button
                      onClick={() =>
                        changeStatus("In Progress")
                      }
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() =>
                        changeStatus("Resolved")
                      }
                    >
                      Resolved
                    </button>

                  </div>

                )}

              </div>

            </div>


            {/* COMPLAINT SUMMARY */}

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
                  {selectedComplaint.location}
                </span>

                <button onClick={goToMap}>
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
                {selectedComplaint.description}
              </p>

            </div>


            {/* PHOTOS */}

            <div className="detail-section">

              <div className="section-heading">

                <h3>Photos</h3>

                <span>
                  {selectedComplaint.photos.length} photos
                </span>

              </div>

              <div className="photo-grid">

                {selectedComplaint.photos.map(
                  (photo, index) => (

                    <img
                      key={index}
                      src={photo}
                      alt={`Complaint photo ${index + 1}`}
                    />

                  )
                )}

              </div>

            </div>


            {/* ASSIGNMENT */}

            <div className="assignment-card">

              <div className="assignment-icon">
                <Users size={19} />
              </div>

              <div>

                <span>Assigned Department</span>

                <strong>
                  {selectedComplaint.department}
                </strong>

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
                    <strong>{selectedComplaint.aiAnalysis.suggestedCategory}</strong>
                  </div>
                </div>

                <div className="ai-insight">
                  <AlertTriangle size={15} />
                  <div>
                    <span>Priority</span>
                    <strong className={`ai-priority ai-${selectedComplaint.aiAnalysis.priority.toLowerCase()}`}>
                      {selectedComplaint.aiAnalysis.priority}
                    </strong>
                  </div>
                </div>

                <div className="ai-insight">
                  <ShieldCheck size={15} />
                  <div>
                    <span>Duplicate Risk</span>
                    <strong>{selectedComplaint.aiAnalysis.duplicateRisk}</strong>
                  </div>
                </div>
              </div>

              <div className="ai-recommendation">
                <Sparkles size={14} />
                <span>
                  Recommended department:{" "}
                  <strong>{selectedComplaint.aiAnalysis.department}</strong>
                </span>
              </div>
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
                      item.type === "reported" ||
                      item.type === "assigned" ||
                      (
                        item.type === "progress" &&
                        selectedComplaint.status !== "Pending"
                      ) ||
                      (
                        item.type === "resolved" &&
                        selectedComplaint.status === "Resolved"
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
                            <CheckCircle2 size={16} />
                          ) : (
                            <Circle size={16} />
                          )}
                        </div>


                        {index <
                          selectedComplaint.timeline.length -
                            1 && (
                          <div className="timeline-line"></div>
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

      </div>

    </AdminLayout>
  );
}

export default AdminComplaints;