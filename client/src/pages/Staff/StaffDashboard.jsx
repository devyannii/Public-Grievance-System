import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  RefreshCw,
  Search,
  UserCircle,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import StaffNotifications from "./StaffNotifications";

import "./StaffDashboard.css";


/* =========================================================
   HELPERS
========================================================= */

const getInitials = (name = "") => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "S"
  );
};


const formatStatus = (status) => {
  if (!status) return "Pending";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const normalizeStatus = (status) => {
  if (!status) return "pending";

  return status
    .toLowerCase()
    .replace(/\s+/g, "_");
};


/* =========================================================
   COMPONENT
========================================================= */

function StaffDashboard() {
  const navigate = useNavigate();


  /* =======================================================
     AUTH / PROFILE
  ======================================================= */

  const [user, setUser] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [department, setDepartment] = useState(null);


  /* =======================================================
     DATA
  ======================================================= */

  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState({});


  /* =======================================================
     UI
  ======================================================= */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [error, setError] = useState("");


  /* =======================================================
     LOAD STAFF DATA
  ======================================================= */

  const loadStaffData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");


      /* ---------------------------------------------------
         1. GET CURRENT AUTH USER
      --------------------------------------------------- */

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!currentUser) {
        navigate("/staff/login");
        return;
      }

      setUser(currentUser);


      /* ---------------------------------------------------
         2. GET STAFF PROFILE
      --------------------------------------------------- */

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, role, department_id, profile_picture"
        )
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (
        !profile ||
        profile.role !== "department_staff" ||
        !profile.department_id
      ) {
        navigate("/staff/login");
        return;
      }

      setStaffProfile(profile);


      /* ---------------------------------------------------
         3. GET DEPARTMENT
      --------------------------------------------------- */

      const {
        data: departmentData,
        error: departmentError,
      } = await supabase
        .from("departments")
        .select(
          "id, name, description, is_active"
        )
        .eq("id", profile.department_id)
        .maybeSingle();

      if (departmentError) {
        throw departmentError;
      }

      setDepartment(departmentData);


      /* ---------------------------------------------------
         4. GET COMPLAINTS FOR THIS DEPARTMENT ONLY
      --------------------------------------------------- */

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
        .eq(
          "department_id",
          profile.department_id
        )
        .is("deleted_at", null)
        .order("created_at", {
          ascending: false,
        });

      if (complaintError) {
        throw complaintError;
      }

      setComplaints(complaintData || []);


      /* ---------------------------------------------------
         5. LOAD CATEGORY NAMES SEPARATELY
      --------------------------------------------------- */

      const categoryIds = [
        ...new Set(
          (complaintData || [])
            .map(
              (complaint) =>
                complaint.category_id
            )
            .filter(Boolean)
        ),
      ];

      if (categoryIds.length > 0) {
        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", categoryIds);

        if (categoryError) {
          console.error(
            "Unable to load categories:",
            categoryError
          );
        }

        const categoryMap = {};

        (categoryData || []).forEach(
          (category) => {
            categoryMap[category.id] =
              category.name;
          }
        );

        setCategories(categoryMap);
      } else {
        setCategories({});
      }

    } catch (err) {
      console.error(
        "Staff dashboard error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load staff dashboard."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadStaffData();
  }, []);


  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const total = complaints.length;

    const pending = complaints.filter(
      (complaint) =>
        normalizeStatus(
          complaint.status
        ) === "pending"
    ).length;

    const inProgress = complaints.filter(
      (complaint) =>
        normalizeStatus(
          complaint.status
        ) === "in_progress"
    ).length;

    const resolved = complaints.filter(
      (complaint) =>
        normalizeStatus(
          complaint.status
        ) === "resolved"
    ).length;

    return {
      total,
      pending,
      inProgress,
      resolved,
    };
  }, [complaints]);


  /* =======================================================
     FILTERED COMPLAINTS
  ======================================================= */

  const filteredComplaints = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return complaints.filter(
      (complaint) => {
        const normalizedStatus =
          normalizeStatus(
            complaint.status
          );

        const matchesStatus =
          statusFilter === "all" ||
          normalizedStatus === statusFilter;

        if (!matchesStatus) {
          return false;
        }

        if (!search) {
          return true;
        }

        const categoryName =
          categories[
            complaint.category_id
          ] || "";

        const searchableText = [
          complaint.complaint_code,
          complaint.title,
          complaint.description,
          complaint.location_text,
          categoryName,
          complaint.priority,
          complaint.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          search
        );
      }
    );
  }, [
    complaints,
    categories,
    searchTerm,
    statusFilter,
  ]);


  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleDashboardClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setMobileMenuOpen(false);
  };


  const handleComplaintsClick = () => {
    document
      .getElementById(
        "staff-complaints-section"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    setMobileMenuOpen(false);
  };


  /* =======================================================
     STAFF PROFILE
  ======================================================= */

  const handleProfileClick = () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);

    navigate("/staff/profile");
  };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      navigate("/staff/login");
    } catch (err) {
      console.error(
        "Logout error:",
        err
      );
    }
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="staff-dashboard-loading">

        <Loader2
          size={34}
          className="staff-dashboard-loader"
        />

        <p>
          Loading staff dashboard...
        </p>

      </div>
    );
  }


  /* =======================================================
     MAIN DASHBOARD
  ======================================================= */

  return (
    <div className="staff-dashboard">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`staff-sidebar ${
          mobileMenuOpen
            ? "mobile-open"
            : ""
        }`}
      >


        {/* BRAND */}

        <div className="staff-brand">

          <div className="staff-brand-icon">
            <Building2 size={29} />
          </div>

          <div className="staff-brand-text">

            <h1>
              Grievance
            </h1>

            <span>
              Management System
            </span>

          </div>

        </div>


        {/* BRAND LINE */}

        <div className="staff-brand-line">

          <span></span>

          <div className="staff-brand-diamond"></div>

          <span></span>

        </div>


        {/* NAVIGATION */}

        <nav className="staff-sidebar-nav">

          <button
            className="staff-nav-item active"
            onClick={
              handleDashboardClick
            }
          >
            <LayoutDashboard size={19} />

            <span>
              Dashboard
            </span>

            <ChevronRight size={17} />
          </button>


          <button
            className="staff-nav-item"
            onClick={
              handleComplaintsClick
            }
          >
            <ClipboardList size={19} />

            <span>
              Complaints
            </span>

            <ChevronRight size={17} />
          </button>


          <button
            className="staff-nav-item"
            onClick={
              handleProfileClick
            }
          >
            <UserCircle size={19} />

            <span>
              My Profile
            </span>

            <ChevronRight size={17} />
          </button>

        </nav>


        {/* CLOSE MOBILE MENU */}

        <button
          className="staff-mobile-close"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          <X size={22} />
        </button>


        {/* LANDSCAPE */}

        <div className="staff-sidebar-landscape"></div>

      </aside>


      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileMenuOpen && (
        <div
          className="staff-sidebar-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}


      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="staff-main">


        {/* =================================================
            TOP NAVBAR
        ================================================= */}

        <header className="staff-topbar">


          {/* MOBILE MENU */}

          <div className="staff-mobile-menu-button">

            <button
              onClick={() =>
                setMobileMenuOpen(true)
              }
            >
              <Menu size={22} />
            </button>

          </div>


          {/* SPACER */}

          <div className="staff-topbar-spacer"></div>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <StaffNotifications
            complaints={complaints}
          />


          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="staff-profile-wrapper">

            <button
              className="staff-top-profile"
              onClick={() =>
                setProfileOpen(
                  (previous) =>
                    !previous
                )
              }
            >

              {staffProfile?.profile_picture ? (

                <img
                  src={
                    staffProfile.profile_picture
                  }
                  alt={
                    staffProfile.full_name ||
                    "Staff"
                  }
                  className="staff-profile-image"
                />

              ) : (

                <div className="staff-profile-avatar">

                  {getInitials(
                    staffProfile?.full_name ||
                      "Staff"
                  )}

                </div>

              )}


              <div className="staff-profile-info">

                <strong>
                  {staffProfile?.full_name ||
                    "Staff"}
                </strong>

                <span>
                  {department?.name ||
                    "Department Staff"}
                </span>

              </div>


              <ChevronDown
                size={16}
                className={`staff-profile-chevron ${
                  profileOpen
                    ? "open"
                    : ""
                }`}
              />

            </button>


            {/* PROFILE DROPDOWN */}

            {profileOpen && (

              <div className="staff-profile-dropdown">


                {/* DROPDOWN HEADER */}

                <div className="staff-dropdown-header">

                  {staffProfile?.profile_picture ? (

                    <img
                      src={
                        staffProfile.profile_picture
                      }
                      alt={
                        staffProfile.full_name ||
                        "Staff"
                      }
                    />

                  ) : (

                    <div className="staff-dropdown-avatar">

                      {getInitials(
                        staffProfile?.full_name ||
                          "Staff"
                      )}

                    </div>

                  )}


                  <div>

                    <strong>
                      {staffProfile?.full_name ||
                        "Staff"}
                    </strong>

                    <span>
                      {user?.email || ""}
                    </span>

                  </div>

                </div>


                <div className="staff-dropdown-divider"></div>


                {/* PROFILE */}

                <button
                  onClick={
                    handleProfileClick
                  }
                  className="staff-dropdown-item"
                >

                  <UserCircle size={17} />

                  My Profile

                </button>


                {/* LOGOUT */}

                <button
                  onClick={handleLogout}
                  className="staff-dropdown-item logout"
                >

                  <LogOut size={17} />

                  Logout

                </button>

              </div>

            )}

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="staff-content">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="staff-page-header">

            <div>

              <p className="staff-page-eyebrow">
                DEPARTMENT STAFF
              </p>

              <h1>
                Welcome,{" "}
                {staffProfile?.full_name
                  ?.split(" ")[0] ||
                  "Staff"}
              </h1>

              <p>
                Manage and resolve complaints
                assigned to{" "}
                <strong>
                  {department?.name ||
                    "your department"}
                </strong>
                .
              </p>

            </div>


            <button
              className="staff-refresh-button"
              onClick={() =>
                loadStaffData(true)
              }
              disabled={refreshing}
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "staff-refresh-spinning"
                    : ""
                }
              />

              Refresh

            </button>

          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="staff-error-banner">

              <AlertCircle size={19} />

              <span>
                {error}
              </span>

              <button
                onClick={() =>
                  loadStaffData(true)
                }
              >
                Try Again
              </button>

            </div>

          )}


          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="staff-stats-grid">


            {/* TOTAL */}

            <div className="staff-stat-card">

              <div className="staff-stat-icon total">
                <ClipboardList size={21} />
              </div>

              <div className="staff-stat-content">

                <span>
                  Total Complaints
                </span>

                <strong>
                  {stats.total}
                </strong>

              </div>

            </div>


            {/* PENDING */}

            <div className="staff-stat-card">

              <div className="staff-stat-icon pending">
                <AlertCircle size={21} />
              </div>

              <div className="staff-stat-content">

                <span>
                  Pending
                </span>

                <strong>
                  {stats.pending}
                </strong>

              </div>

            </div>


            {/* IN PROGRESS */}

            <div className="staff-stat-card">

              <div className="staff-stat-icon progress">
                <Clock3 size={21} />
              </div>

              <div className="staff-stat-content">

                <span>
                  In Progress
                </span>

                <strong>
                  {stats.inProgress}
                </strong>

              </div>

            </div>


            {/* RESOLVED */}

            <div className="staff-stat-card">

              <div className="staff-stat-icon resolved">
                <CheckCircle2 size={21} />
              </div>

              <div className="staff-stat-content">

                <span>
                  Resolved
                </span>

                <strong>
                  {stats.resolved}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              DEPARTMENT STRIP
          ================================================= */}

          <section className="staff-department-strip">

            <div className="staff-department-left">

              <div className="staff-department-icon">
                <Building2 size={20} />
              </div>

              <div>

                <span>
                  Your Department
                </span>

                <strong>
                  {department?.name ||
                    "Department Staff"}
                </strong>

              </div>

            </div>


            <div className="staff-department-count">

              <strong>
                {complaints.length}
              </strong>

              <span>
                assigned{" "}
                {complaints.length === 1
                  ? "complaint"
                  : "complaints"}
              </span>

            </div>

          </section>


          {/* =================================================
              COMPLAINTS
          ================================================= */}

          <section
            className="staff-complaints-section"
            id="staff-complaints-section"
          >


            {/* SECTION HEADER */}

            <div className="staff-complaints-header">

              <div>

                <h2>
                  Assigned Complaints
                </h2>

                <p>
                  Complaints currently assigned
                  to{" "}
                  {department?.name ||
                    "your department"}
                </p>

              </div>


              <button
                className="staff-view-all-button"
                onClick={() => {

                  setStatusFilter("all");
                  setSearchTerm("");

                  document
                    .getElementById(
                      "staff-complaints-section"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });

                }}
              >
                View All
              </button>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="staff-complaints-toolbar">


              {/* SEARCH */}

              <div className="staff-search-wrapper">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

                {searchTerm && (

                  <button
                    className="staff-clear-search"
                    onClick={() =>
                      setSearchTerm("")
                    }
                  >
                    <X size={15} />
                  </button>

                )}

              </div>


              {/* STATUS FILTERS */}

              <div className="staff-status-filters">


                <button
                  className={
                    statusFilter === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter("all")
                  }
                >
                  All
                </button>


                <button
                  className={
                    statusFilter === "pending"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter("pending")
                  }
                >
                  Pending
                </button>


                <button
                  className={
                    statusFilter ===
                    "in_progress"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(
                      "in_progress"
                    )
                  }
                >
                  In Progress
                </button>


                <button
                  className={
                    statusFilter === "resolved"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter("resolved")
                  }
                >
                  Resolved
                </button>

              </div>

            </div>


            {/* =================================================
                COMPLAINT LIST
            ================================================= */}

            <div className="staff-complaints-list">


              {filteredComplaints.length === 0 ? (

                <div className="staff-no-complaints">

                  <div className="staff-no-complaints-icon">
                    <ClipboardList size={28} />
                  </div>

                  <h3>
                    No complaints found
                  </h3>

                  <p>
                    {searchTerm
                      ? "Try changing your search or filter."
                      : "There are currently no complaints assigned to your department."}
                  </p>

                </div>

              ) : (

                filteredComplaints.map(
                  (complaint) => {

                    const normalizedStatus =
                      normalizeStatus(
                        complaint.status
                      );

                    const categoryName =
                      categories[
                        complaint.category_id
                      ] || "General";


                    return (

                      <div
                        className="staff-complaint-row"
                        key={complaint.id}
                      >


                        {/* LEFT */}

                        <div className="staff-complaint-main">

                          <div className="staff-complaint-code">

                            {complaint.complaint_code ||
                              `#${complaint.id}`}

                          </div>


                          <h3>

                            {complaint.title ||
                              "Untitled Complaint"}

                          </h3>


                          <div className="staff-complaint-meta">


                            <span>
                              {categoryName}
                            </span>


                            <span>

                              <CalendarDays
                                size={14}
                              />

                              {formatDate(
                                complaint.created_at
                              )}

                            </span>


                            <span>

                              <MapPin
                                size={14}
                              />

                              {complaint.location_text ||
                                "Location not provided"}

                            </span>

                          </div>

                        </div>


                        {/* RIGHT */}

                        <div className="staff-complaint-actions">


                          <div className="staff-complaint-status-wrapper">

                            <span
                              className={`staff-complaint-status ${normalizedStatus}`}
                            >

                              {formatStatus(
                                normalizedStatus
                              )}

                            </span>


                            <small>

                              {complaint.priority
                                ? formatStatus(
                                    complaint.priority
                                  )
                                : "Normal"}

                            </small>

                          </div>


                          {/* VIEW */}

                          <button
                            className="staff-view-button"
                            onClick={() =>
                              navigate(
                                `/staff/complaint/${complaint.id}`
                              )
                            }
                          >

                            View

                            <ChevronRight
                              size={16}
                            />

                          </button>

                        </div>

                      </div>

                    );

                  }
                )

              )}

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}


export default StaffDashboard;