import React, { useEffect, useMemo, useState } from "react";

import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  Hourglass,
  TrendingUp,
  TrendingDown,
  MapPin,
  MoreVertical,
  UserPlus,
  BarChart3,
  Megaphone,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/layout/AdminLayout";
import { supabase } from "../../lib/supabaseClient";

import "../../styles/AdminDashboard.css";


/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateString) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startText = start.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

  const endText = end.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startText} – ${endText}`;
}


function getStartDate(range) {
  const now = new Date();

  if (range === "month") {
    const date = new Date(now);

    date.setDate(now.getDate() - 29);

    date.setHours(0, 0, 0, 0);

    return date;
  }

  const date = new Date(now);

  date.setDate(now.getDate() - 6);

  date.setHours(0, 0, 0, 0);

  return date;
}


function getStatusClass(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}


/* =========================================================
   COMPONENT
========================================================= */

function AdminDashboard() {

  const navigate = useNavigate();


  /* =======================================================
     STATE
  ======================================================= */

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [range, setRange] = useState("week");


  /* =======================================================
     LOAD COMPLAINTS FROM SUPABASE
  ======================================================= */

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
          updated_at,
          resolved_at,
          profiles(full_name),
          categories(name)
        `)
        .order("created_at", {
          ascending: false,
        });


      if (complaintsError) {
        throw complaintsError;
      }


      setComplaints(data || []);


    } catch (err) {

      console.error(
        "Dashboard complaint loading error:",
        err
      );

      setError(
        err.message ||
        "Unable to load dashboard data."
      );


    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    loadComplaints();

  }, []);


  /* =======================================================
     REALTIME UPDATES
  ======================================================= */

  useEffect(() => {

    const channel = supabase
      .channel("admin-dashboard-complaints")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
        },
        () => {

          loadComplaints();

        }
      )

      .subscribe();


    return () => {

      supabase.removeChannel(channel);

    };

  }, []);


  /* =======================================================
     COUNTS
  ======================================================= */

  const totalComplaints =
    complaints.length;


  const pendingComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "Pending"
    ).length;


  const resolvedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "Resolved"
    ).length;


  const inProgressComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "In Progress"
    ).length;


  /* =======================================================
     CATEGORY DATA
  ======================================================= */

  const categoryData = useMemo(() => {

    const counts = {};


    complaints.forEach((complaint) => {

      const category =
        complaint.categories?.name ||
        "Other";


      counts[category] =
        (counts[category] || 0) + 1;

    });


    const total =
      complaints.length || 1;


    const colors = [
      "green",
      "blue",
      "orange",
      "purple",
      "gray",
      "teal",
    ];


    return Object.entries(counts)

      .sort(
        (a, b) =>
          b[1] - a[1]
      )

      .slice(0, 6)

      .map(
        ([name, value], index) => ({

          name,

          value,

          percentage:
            `${(
              (value / total) *
              100
            ).toFixed(1)}%`,

          color:
            colors[
              index %
              colors.length
            ],

        })
      );

  }, [complaints]);


  /* =======================================================
     DATE RANGE
  ======================================================= */

  const chartStartDate =
    getStartDate(range);


  const chartEndDate =
    new Date();


  /* =======================================================
     CHART DATA
  ======================================================= */

  const chartData = useMemo(() => {

    const days =
      range === "week"
        ? 7
        : 30;


    const result = [];


    for (
      let i = days - 1;
      i >= 0;
      i--
    ) {

      const date =
        new Date();


      date.setDate(
        date.getDate() - i
      );


      date.setHours(
        0,
        0,
        0,
        0
      );


      const nextDate =
        new Date(date);


      nextDate.setDate(
        date.getDate() + 1
      );


      /* ---------------------------------------------
         RECEIVED
      --------------------------------------------- */

      const received =
        complaints.filter(
          (complaint) => {

            const created =
              new Date(
                complaint.created_at
              );


            return (
              created >= date &&
              created < nextDate
            );

          }
        ).length;


      /* ---------------------------------------------
         RESOLVED
      --------------------------------------------- */

      const resolved =
        complaints.filter(
          (complaint) => {

            const resolvedAt =
              complaint.resolved_at
                ? new Date(
                    complaint.resolved_at
                  )
                : null;


            return (
              resolvedAt &&
              resolvedAt >= date &&
              resolvedAt < nextDate
            );

          }
        ).length;


      /* ---------------------------------------------
         PENDING
      --------------------------------------------- */

      const pending =
        complaints.filter(
          (complaint) => {

            const created =
              new Date(
                complaint.created_at
              );


            return (
              created >= date &&
              created < nextDate &&
              complaint.status ===
                "Pending"
            );

          }
        ).length;


      result.push({

        date,

        label:
          date.toLocaleDateString(
            "en-IN",
            {
              month: "short",
              day: "numeric",
            }
          ),

        received,

        resolved,

        pending,

      });

    }


    return result;

  }, [
    complaints,
    range,
  ]);


  /* =======================================================
     CHART POINTS
  ======================================================= */

  const chartPoints = useMemo(() => {

    if (!chartData.length) {

      return {
        received: "",
        resolved: "",
        pending: "",
      };

    }


    const width = 800;

    const height = 230;

    const padding = 10;


    const maximum =
      Math.max(
        1,

        ...chartData.flatMap(
          (item) => [
            item.received,
            item.resolved,
            item.pending,
          ]
        )
      );


    const makePoints = (key) => {

      return chartData
        .map(
          (item, index) => {

            const x =
              chartData.length === 1
                ? width / 2
                : (
                    index /
                    (chartData.length - 1)
                  ) *
                  width;


            const y =
              height -
              padding -
              (
                (
                  item[key] /
                  maximum
                ) *
                (
                  height -
                  padding * 2
                )
              );


            return `${x},${y}`;

          }
        )
        .join(" ");

    };


    return {

      received:
        makePoints("received"),

      resolved:
        makePoints("resolved"),

      pending:
        makePoints("pending"),

    };

  }, [chartData]);


  /* =======================================================
     RECENT COMPLAINTS
  ======================================================= */

  const recentComplaints =
    complaints.slice(0, 5);


  /* =======================================================
     DOWNLOAD CSV REPORT
  ======================================================= */

  const downloadReport = () => {

    if (!complaints.length) {

      alert(
        "There are no complaints to export."
      );

      return;

    }


    const headers = [

      "Complaint ID",

      "Title",

      "Category",

      "Status",

      "Priority",

      "Location",

      "Reported By",

      "Created At",

    ];


    const rows =
      complaints.map(
        (complaint) => [

          complaint.complaint_code ||
            "",

          complaint.title ||
            "",

          complaint.categories?.name ||
            "Other",

          complaint.status ||
            "",

          complaint.priority ||
            "",

          complaint.location_text ||
            "",

          complaint.profiles?.full_name ||
            "Citizen",

          complaint.created_at ||
            "",

        ]
      );


    const csv = [

      headers,

      ...rows,

    ]

      .map(
        (row) =>
          row
            .map(
              (value) =>
                `"${String(value)
                  .replace(
                    /"/g,
                    '""'
                  )}"`
            )
            .join(",")
      )

      .join("\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href = url;

    link.download =
      "unified-grievance-report.csv";


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );

  };


  /* =======================================================
     QUICK ACTIONS
  ======================================================= */

  const handleAssignComplaint =
    () => {

      navigate(
        "/admin/complaints"
      );

    };


  const handleAnnouncement =
    () => {

      alert(
        "Announcement management will be connected after the announcements table is added to Supabase."
      );

    };


  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {

    return (

      <AdminLayout>

        <div className="admin-dashboard">

          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >

            Loading dashboard...

          </div>

        </div>

      </AdminLayout>

    );

  }


  /* =======================================================
     ERROR SCREEN
  ======================================================= */

  if (error) {

    return (

      <AdminLayout>

        <div className="admin-dashboard">

          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >

            <h2>
              Unable to load dashboard
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={
                loadComplaints
              }
            >
              Try Again
            </button>

          </div>

        </div>

      </AdminLayout>

    );

  }


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (

    <AdminLayout>

      <div className="admin-dashboard">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="dashboard-header">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back, Admin! Here's what's happening in your community.
            </p>

          </div>


          <div className="dashboard-header-actions">


            <button
              className="date-button"
              onClick={() =>
                setRange(
                  range === "week"
                    ? "month"
                    : "week"
                )
              }
              title="Switch date range"
            >

              {formatDateRange(
                chartStartDate,
                chartEndDate
              )}

            </button>


            <button
              className="download-button"
              onClick={
                downloadReport
              }
            >

              Download Report

            </button>


          </div>

        </div>


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="dashboard-stats">


          {/* TOTAL */}

          <div className="stat-card total">

            <div className="stat-icon">

              <ClipboardList
                size={22}
              />

            </div>


            <div className="stat-content">

              <span className="stat-title">

                Total Complaints

              </span>


              <strong className="stat-value">

                {totalComplaints}

              </strong>


              <span className="stat-change up">

                <TrendingUp
                  size={14}
                />

                Live from Supabase

              </span>

            </div>

          </div>


          {/* PENDING */}

          <div className="stat-card pending">

            <div className="stat-icon">

              <Clock3
                size={22}
              />

            </div>


            <div className="stat-content">

              <span className="stat-title">

                Pending Complaints

              </span>


              <strong className="stat-value">

                {pendingComplaints}

              </strong>


              <span className="stat-change up">

                <TrendingUp
                  size={14}
                />

                Current status

              </span>

            </div>

          </div>


          {/* RESOLVED */}

          <div className="stat-card resolved">

            <div className="stat-icon">

              <CheckCircle2
                size={22}
              />

            </div>


            <div className="stat-content">

              <span className="stat-title">

                Resolved Complaints

              </span>


              <strong className="stat-value">

                {resolvedComplaints}

              </strong>


              <span className="stat-change up">

                <TrendingUp
                  size={14}
                />

                Current status

              </span>

            </div>

          </div>


          {/* IN PROGRESS */}

          <div className="stat-card progress">

            <div className="stat-icon">

              <Hourglass
                size={22}
              />

            </div>


            <div className="stat-content">

              <span className="stat-title">

                In Progress

              </span>


              <strong className="stat-value">

                {inProgressComplaints}

              </strong>


              <span className="stat-change down">

                <TrendingDown
                  size={14}
                />

                Current status

              </span>

            </div>

          </div>


        </div>


        {/* =================================================
            ANALYTICS ROW
        ================================================= */}

        <div className="dashboard-analytics">


          {/* =================================================
              COMPLAINT OVERVIEW
          ================================================= */}

          <section className="dashboard-card overview-card">


            <div className="card-header">

              <div>

                <h2>
                  Complaints Overview
                </h2>


                <div className="chart-legend">


                  <span>

                    <i className="legend-dot received"></i>

                    Received

                  </span>


                  <span>

                    <i className="legend-dot resolved"></i>

                    Resolved

                  </span>


                  <span>

                    <i className="legend-dot pending"></i>

                    Pending

                  </span>


                </div>

              </div>


              <select
                value={range}
                onChange={(event) =>
                  setRange(
                    event.target.value
                  )
                }
              >

                <option value="week">
                  This Week
                </option>

                <option value="month">
                  This Month
                </option>

              </select>

            </div>


            <div className="chart-area">


              <div className="chart-grid">

                <span></span>

                <span></span>

                <span></span>

                <span></span>

                <span></span>

              </div>


              <svg
                className="complaint-chart"
                viewBox="0 0 800 230"
                preserveAspectRatio="none"
              >


                {/* RECEIVED */}

                <polyline
                  points={
                    chartPoints.received
                  }
                  fill="none"
                  stroke="#1c9a50"
                  strokeWidth="3"
                />


                {/* RESOLVED */}

                <polyline
                  points={
                    chartPoints.resolved
                  }
                  fill="none"
                  stroke="#347fe5"
                  strokeWidth="3"
                />


                {/* PENDING */}

                <polyline
                  points={
                    chartPoints.pending
                  }
                  fill="none"
                  stroke="#f0a000"
                  strokeWidth="3"
                />


              </svg>


              <div className="chart-labels">

                {chartData.map(
                  (item) => (

                    <span
                      key={
                        item.label
                      }
                    >

                      {item.label}

                    </span>

                  )
                )}

              </div>


            </div>


          </section>


          {/* =================================================
              CATEGORY CHART
          ================================================= */}

          <section className="dashboard-card category-card">


            <div className="card-header">

              <h2>
                Complaints by Category
              </h2>


              <select
                defaultValue="month"
              >

                <option value="month">
                  This Month
                </option>

                <option value="week">
                  This Week
                </option>

              </select>

            </div>


            <div className="category-content">


              {/* DONUT */}

              <div className="donut-wrapper">

                <div className="donut-chart">

                  <div className="donut-center">

                    <strong>

                      {totalComplaints}

                    </strong>


                    <span>
                      Total
                    </span>

                  </div>

                </div>

              </div>


              {/* CATEGORY LIST */}

              <div className="category-list">


                {categoryData.length === 0 ? (

                  <p>
                    No category data yet.
                  </p>

                ) : (

                  categoryData.map(
                    (item) => (

                      <div
                        className="category-row"
                        key={
                          item.name
                        }
                      >


                        <div className="category-name">

                          <i
                            className={`category-dot ${item.color}`}
                          ></i>


                          <span>
                            {item.name}
                          </span>

                        </div>


                        <div className="category-number">

                          <strong>

                            {item.value}

                          </strong>


                          <span>

                            ({item.percentage})

                          </span>

                        </div>


                      </div>

                    )
                  )

                )}

              </div>


            </div>


          </section>


        </div>


        {/* =================================================
            BOTTOM ROW
        ================================================= */}

        <div className="dashboard-bottom">


          {/* =================================================
              RECENT COMPLAINTS
          ================================================= */}

          <section className="dashboard-card recent-card">


            <div className="card-header">

              <h2>
                Recent Complaints
              </h2>


              <button
                className="view-all"
                onClick={() =>
                  navigate(
                    "/admin/complaints"
                  )
                }
              >

                View All

              </button>

            </div>


            <div className="complaints-table-wrapper">


              <table className="complaints-table">


                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      Complaint
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Date
                    </th>

                    <th></th>

                  </tr>

                </thead>


                <tbody>


                  {recentComplaints.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "30px",
                        }}
                      >

                        No complaints found.

                      </td>

                    </tr>

                  ) : (

                    recentComplaints.map(
                      (complaint) => (

                        <tr
                          key={
                            complaint.id
                          }
                        >


                          {/* ID */}

                          <td className="complaint-id">

                            {complaint.complaint_code ||
                              complaint.id}

                          </td>


                          {/* TITLE */}

                          <td className="complaint-title">

                            {complaint.title ||
                              "Untitled complaint"}

                          </td>


                          {/* CATEGORY */}

                          <td>

                            <span className="category-badge">

                              {complaint.categories?.name ||
                                "Other"}

                            </span>

                          </td>


                          {/* LOCATION */}

                          <td>

                            <span className="location-cell">

                              <MapPin
                                size={14}
                              />

                              {complaint.location_text ||
                                "Location not provided"}

                            </span>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`status-badge ${getStatusClass(
                                complaint.status
                              )}`}
                            >

                              {complaint.status ||
                                "Pending"}

                            </span>

                          </td>


                          {/* DATE */}

                          <td className="date-cell">

                            {formatDate(
                              complaint.created_at
                            )}

                          </td>


                          {/* VIEW */}

                          <td>

                            <button
                              className="more-button"
                              onClick={() =>
                                navigate(
                                  `/admin/complaints/${complaint.id}`
                                )
                              }
                              title="View complaint"
                            >

                              <MoreVertical
                                size={17}
                              />

                            </button>

                          </td>


                        </tr>

                      )
                    )

                  )}


                </tbody>


              </table>


            </div>


          </section>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="dashboard-card quick-card">


            <div className="card-header">

              <h2>
                Quick Actions
              </h2>

            </div>


            <div className="quick-actions">


              {/* ASSIGN */}

              <button
                className="quick-action assign"
                onClick={
                  handleAssignComplaint
                }
              >

                <div className="quick-icon">

                  <UserPlus
                    size={22}
                  />

                </div>


                <div>

                  <strong>
                    Assign Complaint
                  </strong>

                  <span>
                    Assign to staff/department
                  </span>

                </div>

              </button>


              {/* REPORTS */}

              <button
                className="quick-action reports"
                onClick={() =>
                  navigate(
                    "/admin/reports"
                  )
                }
              >

                <div className="quick-icon">

                  <BarChart3
                    size={22}
                  />

                </div>


                <div>

                  <strong>
                    View All Reports
                  </strong>

                  <span>
                    Check detailed reports
                  </span>

                </div>

              </button>


              {/* ANNOUNCEMENT */}

              <button
                className="quick-action announcement"
                onClick={
                  handleAnnouncement
                }
              >

                <div className="quick-icon">

                  <Megaphone
                    size={22}
                  />

                </div>


                <div>

                  <strong>
                    Add Announcement
                  </strong>

                  <span>
                    Send an announcement
                  </span>

                </div>

              </button>


            </div>


          </section>


        </div>


      </div>

    </AdminLayout>

  );

}


export default AdminDashboard;