import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileBarChart,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { supabase } from "../../lib/supabaseClient";
import "../../styles/AdminReports.css";

const PERIODS = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 3 Months" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

const STATUS_COLORS = {
  submitted: "#e8a12f",
  pending: "#e8a12f",
  under_review: "#758fd1",
  assigned: "#69a1d8",
  in_progress: "#e8893e",
  resolved: "#4d9f69",
  rejected: "#d86464",
};

const CHART_COLORS = [
  "#4d9f69",
  "#79b98e",
  "#88b7d9",
  "#e7b34e",
  "#e78c62",
  "#8aa6d4",
  "#a78bc5",
];

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysDifference(start, end) {
  if (!start || !end) return null;

  const diff =
    new Date(end).getTime() -
    new Date(start).getTime();

  return diff / (1000 * 60 * 60 * 24);
}

function getCategoryName(category) {
  return (
    category?.name ||
    category?.category_name ||
    category?.title ||
    "Uncategorized"
  );
}

function getDepartmentName(department) {
  return (
    department?.name ||
    department?.department_name ||
    department?.title ||
    "Unassigned"
  );
}

function getPriorityName(priority) {
  if (!priority) return "Medium";

  return (
    String(priority).charAt(0).toUpperCase() +
    String(priority).slice(1).toLowerCase()
  );
}

function getDateRange(period) {
  const now = new Date();

  if (period === "all") {
    return null;
  }

  if (period === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  const days = Number(period);

  const date = new Date(now);
  date.setDate(date.getDate() - (days - 1));

  date.setHours(0, 0, 0, 0);

  return date;
}

function escapeCsv(value) {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export default function AdminReports() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("30");
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data, error: complaintsError } = await supabase
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
          automatically_assigned,
          assigned_at,
          created_at,
          updated_at,
          resolved_at,
          assignment_source,
          deleted_at
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .range(0, 9999);

      if (complaintsError) {
        throw complaintsError;
      }

      const rawComplaints = data || [];

      const categoryIds = [
        ...new Set(
          rawComplaints
            .map((item) => item.category_id)
            .filter(Boolean)
        ),
      ];

      const departmentIds = [
        ...new Set(
          rawComplaints
            .map((item) => item.department_id)
            .filter(Boolean)
        ),
      ];

      let categories = [];
      let departments = [];

      if (categoryIds.length > 0) {
        const { data: categoryData, error: categoryError } =
          await supabase
            .from("categories")
            .select("*")
            .in("id", categoryIds);

        if (categoryError) {
          console.warn("Category lookup failed:", categoryError);
        } else {
          categories = categoryData || [];
        }
      }

      if (departmentIds.length > 0) {
        const { data: departmentData, error: departmentError } =
          await supabase
            .from("departments")
            .select("*")
            .in("id", departmentIds);

        if (departmentError) {
          console.warn("Department lookup failed:", departmentError);
        } else {
          departments = departmentData || [];
        }
      }

      const categoryMap = new Map(
        categories.map((category) => [
          category.id,
          category,
        ])
      );

      const departmentMap = new Map(
        departments.map((department) => [
          department.id,
          department,
        ])
      );

      const enriched = rawComplaints.map((complaint) => ({
        ...complaint,
        category: categoryMap.get(complaint.category_id) || null,
        department:
          departmentMap.get(complaint.department_id) || null,
      }));

      setComplaints(enriched);
    } catch (err) {
      console.error("Reports loading error:", err);

      setError(
        err?.message ||
          "Unable to load reports and analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredComplaints = useMemo(() => {
    const startDate = getDateRange(period);

    if (!startDate) {
      return complaints;
    }

    return complaints.filter((complaint) => {
      return new Date(complaint.created_at) >= startDate;
    });
  }, [complaints, period]);

  const stats = useMemo(() => {
    const total = filteredComplaints.length;

    let resolved = 0;
    let pending = 0;
    let underReview = 0;
    let assigned = 0;
    let inProgress = 0;
    let rejected = 0;
    let submitted = 0;

    let resolutionDays = 0;
    let resolutionCount = 0;

    let aiAssigned = 0;
    let manualAssigned = 0;

    filteredComplaints.forEach((complaint) => {
      const status = normalizeStatus(complaint.status);

      if (status === "resolved") {
        resolved++;
      }

      if (
        status === "pending" ||
        status === "submitted"
      ) {
        pending++;
      }

      if (
        status === "under_review" ||
        status === "review"
      ) {
        underReview++;
      }

      if (status === "assigned") {
        assigned++;
      }

      if (status === "in_progress") {
        inProgress++;
      }

      if (status === "rejected") {
        rejected++;
      }

      if (status === "submitted") {
        submitted++;
      }

      if (complaint.resolved_at) {
        const days = getDaysDifference(
          complaint.created_at,
          complaint.resolved_at
        );

        if (days !== null && days >= 0) {
          resolutionDays += days;
          resolutionCount++;
        }
      }

      if (
        complaint.automatically_assigned === true ||
        complaint.assignment_source === "ai"
      ) {
        aiAssigned++;
      } else if (
        complaint.department_id ||
        complaint.assigned_at
      ) {
        manualAssigned++;
      }
    });

    const resolutionRate =
      total > 0 ? (resolved / total) * 100 : 0;

    const averageResolution =
      resolutionCount > 0
        ? resolutionDays / resolutionCount
        : 0;

    const assignedTotal =
      aiAssigned + manualAssigned;

    const aiAssignmentRate =
      assignedTotal > 0
        ? (aiAssigned / assignedTotal) * 100
        : 0;

    return {
      total,
      resolved,
      pending,
      underReview,
      assigned,
      inProgress,
      rejected,
      submitted,
      resolutionRate,
      averageResolution,
      aiAssigned,
      manualAssigned,
      aiAssignmentRate,
    };
  }, [filteredComplaints]);

  const categoryData = useMemo(() => {
    const map = {};

    filteredComplaints.forEach((complaint) => {
      const name = getCategoryName(complaint.category);

      map[name] = (map[name] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredComplaints]);

  const departmentData = useMemo(() => {
    const map = {};

    filteredComplaints.forEach((complaint) => {
      const name = getDepartmentName(
        complaint.department
      );

      map[name] = (map[name] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredComplaints]);

  const priorityData = useMemo(() => {
    const map = {};

    filteredComplaints.forEach((complaint) => {
      const name = getPriorityName(
        complaint.priority
      );

      map[name] = (map[name] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredComplaints]);

  const trendData = useMemo(() => {
    const map = {};

    filteredComplaints.forEach((complaint) => {
      const date = new Date(complaint.created_at);

      const key = date.toISOString().slice(0, 10);

      if (!map[key]) {
        map[key] = {
          date: key,
          Submitted: 0,
          "In Progress": 0,
          Resolved: 0,
        };
      }

      const status = normalizeStatus(
        complaint.status
      );

      if (status === "resolved") {
        map[key].Resolved++;
      } else if (status === "in_progress") {
        map[key]["In Progress"]++;
      } else {
        map[key].Submitted++;
      }
    });

    return Object.values(map)
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      )
      .map((item) => ({
        ...item,
        label: new Date(
          `${item.date}T00:00:00`
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      }));
  }, [filteredComplaints]);

  const topIssues = categoryData.slice(0, 5);

  const dateRangeText = useMemo(() => {
    if (!filteredComplaints.length) {
      return "No complaints in selected period";
    }

    const dates = filteredComplaints.map(
      (item) => new Date(item.created_at)
    );

    const earliest = new Date(
      Math.min(...dates.map((date) => date.getTime()))
    );

    const latest = new Date(
      Math.max(...dates.map((date) => date.getTime()))
    );

    return `${formatDate(
      earliest
    )} – ${formatDate(latest)}`;
  }, [filteredComplaints]);

  const exportCsv = () => {
    if (!filteredComplaints.length) {
      return;
    }

    const headers = [
      "Complaint ID",
      "Title",
      "Category",
      "Department",
      "Status",
      "Priority",
      "AI Assigned",
      "Created At",
      "Resolved At",
    ];

    const rows = filteredComplaints.map(
      (complaint) => [
        complaint.complaint_code ||
          complaint.id,
        complaint.title,
        getCategoryName(
          complaint.category
        ),
        getDepartmentName(
          complaint.department
        ),
        complaint.status,
        getPriorityName(
          complaint.priority
        ),
        complaint.automatically_assigned
          ? "Yes"
          : "No",
        complaint.created_at,
        complaint.resolved_at || "",
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row.map(escapeCsv).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `grievance-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <RefreshCw
            size={24}
            className="reports-spin"
          />
          <p>
            Loading reports and analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* ================= HEADER ================= */}

      <header className="reports-header">

        <div className="reports-header-left">

          <button
            className="reports-back-button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>

          <div className="reports-title-row">

            <div className="reports-title-icon">
              <FileBarChart size={23} />
            </div>

            <div>
              <h1>
                Reports & Analytics
              </h1>

              <p>
                Complaint trends and system performance.
              </p>
            </div>

          </div>

        </div>

        <div className="reports-header-actions">

          <div className="reports-date-display">
            <CalendarDays size={16} />
            <span>
              {dateRangeText}
            </span>
          </div>

          <select
            className="reports-period-select"
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value)
            }
          >
            {PERIODS.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>

          <button
            className="reports-action-button secondary"
            onClick={() =>
              loadReports(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "reports-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            className="reports-action-button primary"
            onClick={exportCsv}
            disabled={
              !filteredComplaints.length
            }
          >
            <Download size={16} />
            Export
          </button>

        </div>

      </header>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      {/* ================= KPI CARDS ================= */}

      <section className="reports-kpi-grid">

        <div className="reports-kpi-card">

          <div className="reports-kpi-icon green">
            <BarChart3 size={21} />
          </div>

          <div>
            <span className="reports-kpi-label">
              Total Complaints
            </span>

            <strong>
              {formatNumber(stats.total)}
            </strong>

            <small>
              In selected period
            </small>
          </div>

        </div>

        <div className="reports-kpi-card">

          <div className="reports-kpi-icon blue">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span className="reports-kpi-label">
              Resolved
            </span>

            <strong>
              {formatNumber(stats.resolved)}
            </strong>

            <small>
              {formatPercent(
                stats.resolutionRate
              )}{" "}
              resolution rate
            </small>
          </div>

        </div>

        <div className="reports-kpi-card">

          <div className="reports-kpi-icon orange">
            <Clock3 size={21} />
          </div>

          <div>
            <span className="reports-kpi-label">
              Avg. Resolution Time
            </span>

            <strong>
              {stats.averageResolution > 0
                ? `${stats.averageResolution.toFixed(
                    1
                  )} days`
                : "—"}
            </strong>

            <small>
              Based on resolved complaints
            </small>
          </div>

        </div>

      </section>

      {/* ================= STATUS SUMMARY ================= */}

      <section className="reports-status-card">

        <div className="status-item">
          <span className="status-dot pending" />
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>

        <div className="status-item">
          <span className="status-dot review" />
          <span>Under Review</span>
          <strong>{stats.underReview}</strong>
        </div>

        <div className="status-item">
          <span className="status-dot assigned" />
          <span>Assigned</span>
          <strong>{stats.assigned}</strong>
        </div>

        <div className="status-item">
          <span className="status-dot progress" />
          <span>In Progress</span>
          <strong>{stats.inProgress}</strong>
        </div>

        <div className="status-item">
          <span className="status-dot resolved" />
          <span>Resolved</span>
          <strong>{stats.resolved}</strong>
        </div>

        <div className="status-item">
          <span className="status-dot rejected" />
          <span>Rejected</span>
          <strong>{stats.rejected}</strong>
        </div>

      </section>

      {/* ================= MAIN CHARTS ================= */}

      <section className="reports-main-grid">

        {/* TREND */}

        <div className="reports-card trend-card">

          <div className="reports-card-header">

            <div>
              <h2>
                Complaints Over Time
              </h2>

              <p>
                Complaint activity during the selected period.
              </p>
            </div>

            <div className="reports-small-icon">
              <TrendingUp size={18} />
            </div>

          </div>

          <div className="reports-chart reports-trend-chart">

            {trendData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={trendData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5ebe7"
                  />

                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                      fill: "#718078",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: "#718078",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="Submitted"
                    stroke="#4d9f69"
                    strokeWidth={2.5}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="In Progress"
                    stroke="#e8893e"
                    strokeWidth={2.5}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="Resolved"
                    stroke="#758fd1"
                    strokeWidth={2.5}
                    dot={false}
                  />

                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="reports-empty">
                No complaint activity found.
              </div>
            )}

          </div>

          <div className="chart-legend">

            <span>
              <i className="legend-dot green" />
              Submitted
            </span>

            <span>
              <i className="legend-dot orange" />
              In Progress
            </span>

            <span>
              <i className="legend-dot blue" />
              Resolved
            </span>

          </div>

        </div>

        {/* CATEGORY */}

        <div className="reports-card category-card">

          <div className="reports-card-header">

            <div>
              <h2>
                Complaints by Category
              </h2>

              <p>
                Distribution of reported issue types.
              </p>
            </div>

            <div className="reports-small-icon">
              <BarChart3 size={18} />
            </div>

          </div>

          <div className="category-content">

            <div className="category-chart">

              {categoryData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="58%"
                      outerRadius="82%"
                      paddingAngle={2}
                    >
                      {categoryData.map(
                        (_, index) => (
                          <Cell
                            key={index}
                            fill={
                              CHART_COLORS[
                                index %
                                  CHART_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="reports-empty">
                  No data
                </div>
              )}

            </div>

            <div className="category-list">

              {categoryData
                .slice(0, 6)
                .map((item, index) => {

                  const percentage =
                    stats.total > 0
                      ? (item.value /
                          stats.total) *
                        100
                      : 0;

                  return (
                    <div
                      className="category-item"
                      key={item.name}
                    >

                      <div className="category-name">

                        <span
                          className="category-color"
                          style={{
                            background:
                              CHART_COLORS[
                                index %
                                  CHART_COLORS.length
                              ],
                          }}
                        />

                        <span>
                          {item.name}
                        </span>

                      </div>

                      <strong>
                        {item.value}
                      </strong>

                      <small>
                        {percentage.toFixed(1)}%
                      </small>

                    </div>
                  );
                })}

            </div>

          </div>

        </div>

      </section>

      {/* ================= DEPARTMENT + TOP ISSUES ================= */}

      <section className="reports-two-column">

        <div className="reports-card">

          <div className="reports-card-header">

            <div>
              <h2>
                Complaints by Department
              </h2>

              <p>
                Current complaint workload.
              </p>
            </div>

            <div className="reports-small-icon">
              <Users size={18} />
            </div>

          </div>

          <div className="reports-department-chart">

            {departmentData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={departmentData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 15,
                    left: 10,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e5ebe7"
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: "#718078",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={105}
                    tick={{
                      fontSize: 11,
                      fill: "#52615a",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#4d9f69"
                    radius={[
                      0,
                      5,
                      5,
                      0,
                    ]}
                    barSize={22}
                  />

                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="reports-empty">
                No department data.
              </div>
            )}

          </div>

        </div>

        <div className="reports-card">

          <div className="reports-card-header">

            <div>
              <h2>
                Most Reported Issues
              </h2>

              <p>
                Top complaint categories.
              </p>
            </div>

            <div className="reports-small-icon">
              <TrendingUp size={18} />
            </div>

          </div>

          <div className="top-issues-list">

            {topIssues.length > 0 ? (
              topIssues.map(
                (issue, index) => {

                  const percentage =
                    stats.total > 0
                      ? (issue.value /
                          stats.total) *
                        100
                      : 0;

                  return (
                    <div
                      className="top-issue"
                      key={issue.name}
                    >

                      <div className="issue-rank">
                        {index + 1}
                      </div>

                      <div className="issue-content">

                        <div className="issue-title-row">

                          <span>
                            {issue.name}
                          </span>

                          <strong>
                            {issue.value}
                          </strong>

                        </div>

                        <div className="issue-progress">

                          <span
                            style={{
                              width: `${Math.max(
                                percentage,
                                3
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  );
                }
              )
            ) : (
              <div className="reports-empty">
                No issue data.
              </div>
            )}

          </div>

        </div>

      </section>

      {/* ================= BOTTOM ANALYTICS ================= */}

      <section className="reports-two-column">

        {/* RESOLUTION */}

        <div className="reports-card resolution-card">

          <div className="reports-card-header">

            <div>
              <h2>
                Resolution Analysis
              </h2>

              <p>
                Current complaint resolution performance.
              </p>
            </div>

            <div className="reports-small-icon">
              <CheckCircle2 size={18} />
            </div>

          </div>

          <div className="resolution-main">

            <div>

              <span className="resolution-value">
                {formatPercent(
                  stats.resolutionRate
                )}
              </span>

              <span className="resolution-label">
                Resolution rate
              </span>

            </div>

            <div className="resolution-bar">

              <span
                style={{
                  width: `${Math.min(
                    stats.resolutionRate,
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

          <div className="resolution-mini-grid">

            <div>
              <span>Pending</span>
              <strong>
                {stats.pending}
              </strong>
            </div>

            <div>
              <span>In Progress</span>
              <strong>
                {stats.inProgress}
              </strong>
            </div>

            <div>
              <span>Resolved</span>
              <strong>
                {stats.resolved}
              </strong>
            </div>

          </div>

        </div>

        {/* AI */}

        <div className="reports-card ai-card">

          <div className="reports-card-header">

            <div>
              <h2>
                AI Assignment
              </h2>

              <p>
                Automatic vs manual department assignment.
              </p>
            </div>

            <div className="reports-small-icon">
              <TrendingUp size={18} />
            </div>

          </div>

          <div className="ai-content">

            <div className="ai-chart">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={[
                      {
                        name: "AI Assigned",
                        value:
                          stats.aiAssigned,
                      },
                      {
                        name: "Manual",
                        value:
                          stats.manualAssigned,
                      },
                    ]}
                    dataKey="value"
                    innerRadius="66%"
                    outerRadius="88%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                  >

                    <Cell fill="#4d9f69" />
                    <Cell fill="#9aadc1" />

                  </Pie>

                </PieChart>
              </ResponsiveContainer>

              <div className="ai-center">

                <strong>
                  {formatPercent(
                    stats.aiAssignmentRate
                  )}
                </strong>

                <span>
                  AI
                </span>

              </div>

            </div>

            <div className="ai-stats">

              <div className="ai-stat">

                <span>
                  <i className="legend-dot green" />
                  Automatically Assigned
                </span>

                <strong>
                  {stats.aiAssigned}
                </strong>

              </div>

              <div className="ai-stat">

                <span>
                  <i className="legend-dot gray" />
                  Manual Assignment
                </span>

                <strong>
                  {stats.manualAssigned}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <div className="reports-footer">
        <span>
          Showing {formatNumber(
            filteredComplaints.length
          )} complaints
        </span>

        <span>
          {dateRangeText}
        </span>
      </div>

    </div>
  );
}