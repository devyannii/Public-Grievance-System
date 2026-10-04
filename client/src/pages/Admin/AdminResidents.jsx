import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  UsersRound,
  Phone,
  Globe2,
  CalendarDays,
  FileText,
  CheckCircle2,
  Ban,
  X,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
  MapPin,
  Clock3,
  Sparkles,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import AdminLayout from "../../components/layout/AdminLayout";

import "../../styles/AdminResidents.css";


/* =========================================================
   ADMIN RESIDENTS
========================================================= */

function AdminResidents() {

  /* =======================================================
     STATES
  ======================================================= */

  const [residents, setResidents] =
    useState([]);

  const [complaintCounts, setComplaintCounts] =
    useState({});

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [selectedResident, setSelectedResident] =
    useState(null);

  const [selectedComplaints, setSelectedComplaints] =
    useState([]);

  const [complaintsLoading, setComplaintsLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(null);


  /* =======================================================
     LOAD RESIDENTS
  ======================================================= */

  const loadResidents = async (
    isRefresh = false
  ) => {

    try {

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");


      /* ---------------------------------------------------
         CURRENT USER
      --------------------------------------------------- */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError) {
        console.error(
          "Unable to get current user:",
          userError
        );
      }


      if (!user) {

        setError(
          "Unable to identify the logged-in administrator."
        );

        return;
      }


      /* ---------------------------------------------------
         LOAD RESIDENT PROFILES
      --------------------------------------------------- */

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone,
          role,
          preferred_language,
          created_at,
          updated_at,
          is_blocked
        `)
        .eq("role", "user")
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


      if (profileError) {
        throw profileError;
      }


      /* ---------------------------------------------------
         LOAD COMPLAINT OWNERS
      --------------------------------------------------- */

      const {
        data: complaintData,
        error: complaintError,
      } = await supabase
        .from("complaints")
        .select("user_id");


      if (complaintError) {
        throw complaintError;
      }


      /* ---------------------------------------------------
         CALCULATE COUNTS
      --------------------------------------------------- */

      const counts = {};


      (complaintData || []).forEach(
        (complaint) => {

          if (!complaint.user_id) {
            return;
          }

          counts[complaint.user_id] =
            (
              counts[complaint.user_id] ||
              0
            ) + 1;

        }
      );


      setComplaintCounts(counts);

      setResidents(
        profileData || []
      );


    } catch (err) {

      console.error(
        "Error loading residents:",
        err
      );

      setError(
        err.message ||
        "Unable to load residents."
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };


  /* =======================================================
     LOAD ON PAGE OPEN
  ======================================================= */

  useEffect(() => {

    loadResidents();

  }, []);


  /* =======================================================
     LOAD SELECTED RESIDENT COMPLAINTS
  ======================================================= */

  const loadResidentComplaints = async (
    residentId
  ) => {

    if (!residentId) {
      return;
    }


    try {

      setComplaintsLoading(true);

      setSelectedComplaints([]);


      const {
        data,
        error: complaintError,
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
          latitude,
          longitude,
          ai_summary,
          created_at,
          updated_at,
          resolved_at
        `)
        .eq(
          "user_id",
          residentId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


      if (complaintError) {
        throw complaintError;
      }


      setSelectedComplaints(
        data || []
      );


    } catch (err) {

      console.error(
        "Unable to load resident complaints:",
        err
      );

      setSelectedComplaints([]);

    } finally {

      setComplaintsLoading(false);

    }

  };


  /* =======================================================
     OPEN RESIDENT
  ======================================================= */

  const openResident = async (
    resident
  ) => {

    setSelectedResident(
      resident
    );

    await loadResidentComplaints(
      resident.id
    );

  };


  /* =======================================================
     CLOSE RESIDENT
  ======================================================= */

  const closeResident = () => {

    setSelectedResident(null);

    setSelectedComplaints([]);

  };


  /* =======================================================
     FILTER RESIDENTS
  ======================================================= */

  const filteredResidents =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return residents.filter(
        (resident) => {

          const name =
            resident.full_name ||
            "";

          const phone =
            resident.phone ||
            "";

          const language =
            resident.preferred_language ||
            "";


          const matchesSearch =
            !query ||
            name
              .toLowerCase()
              .includes(query) ||
            phone
              .toLowerCase()
              .includes(query) ||
            language
              .toLowerCase()
              .includes(query);


          const matchesFilter =
            filter === "all" ||
            (
              filter === "active" &&
              !resident.is_blocked
            ) ||
            (
              filter === "blocked" &&
              resident.is_blocked
            );


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );

    }, [
      residents,
      search,
      filter,
    ]);


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalResidents =
    residents.length;


  const activeResidents =
    residents.filter(
      (resident) =>
        !resident.is_blocked
    ).length;


  const blockedResidents =
    residents.filter(
      (resident) =>
        resident.is_blocked
    ).length;


  const totalComplaints =
    Object.values(
      complaintCounts
    ).reduce(
      (sum, count) =>
        sum + count,
      0
    );


  /* =======================================================
     BLOCK / UNBLOCK
  ======================================================= */

  const toggleBlock = async (
    resident
  ) => {

    if (!resident?.id) {
      return;
    }


    const nextBlockedState =
      !resident.is_blocked;


    try {

      setActionLoading(
        resident.id
      );

      setError("");


      const {
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          is_blocked:
            nextBlockedState,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          resident.id
        );


      if (updateError) {
        throw updateError;
      }


      const updatedResident = {
        ...resident,

        is_blocked:
          nextBlockedState,

        updated_at:
          new Date().toISOString(),
      };


      setResidents(
        (currentResidents) =>
          currentResidents.map(
            (item) =>
              item.id === resident.id
                ? updatedResident
                : item
          )
      );


      setSelectedResident(
        (currentResident) => {

          if (
            currentResident?.id !==
            resident.id
          ) {
            return currentResident;
          }

          return updatedResident;

        }
      );


    } catch (err) {

      console.error(
        "Block/unblock error:",
        err
      );

      setError(
        err.message ||
        `Unable to ${
          nextBlockedState
            ? "block"
            : "unblock"
        } resident.`
      );

    } finally {

      setActionLoading(null);

    }

  };


  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "—";
    }


    try {

      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    } catch {

      return "—";

    }

  };


  /* =======================================================
     FORMAT DATE + TIME
  ======================================================= */

  const formatDateTime = (
    date
  ) => {

    if (!date) {
      return "—";
    }


    try {

      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      );

    } catch {

      return "—";

    }

  };


  /* =======================================================
     STATUS CLASS
  ======================================================= */

  const getComplaintStatusClass = (
    status
  ) => {

    const normalized =
      (status || "pending")
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        );

    return normalized;

  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <AdminLayout>

      <div className="admin-residents-page">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="residents-header">

          <div className="residents-title-row">

            <div className="residents-title-icon">

              <UsersRound
                size={22}
              />

            </div>


            <div>

              <h1>
                Residents
              </h1>

              <p>
                Manage registered residents
                and monitor their complaint
                activity.
              </p>

            </div>

          </div>


          <button
            type="button"
            className="residents-refresh-btn"
            onClick={() =>
              loadResidents(true)
            }
            disabled={refreshing}
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "residents-spin"
                  : ""
              }
            />

            <span>
              Refresh
            </span>

          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="residents-error">

            <span>
              {error}
            </span>


            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >

              <X size={16} />

            </button>

          </div>

        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="resident-stats">


          <div className="resident-stat-card">

            <div className="resident-stat-icon">

              <UsersRound
                size={20}
              />

            </div>

            <div>

              <span>
                Total Residents
              </span>

              <strong>
                {totalResidents}
              </strong>

            </div>

          </div>


          <div className="resident-stat-card">

            <div className="resident-stat-icon active">

              <UserCheck
                size={20}
              />

            </div>

            <div>

              <span>
                Active
              </span>

              <strong>
                {activeResidents}
              </strong>

            </div>

          </div>


          <div className="resident-stat-card">

            <div className="resident-stat-icon blocked">

              <UserX
                size={20}
              />

            </div>

            <div>

              <span>
                Blocked
              </span>

              <strong>
                {blockedResidents}
              </strong>

            </div>

          </div>


          <div className="resident-stat-card">

            <div className="resident-stat-icon complaints">

              <FileText
                size={20}
              />

            </div>

            <div>

              <span>
                Total Complaints
              </span>

              <strong>
                {totalComplaints}
              </strong>

            </div>

          </div>

        </div>


        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="residents-toolbar">

          <div className="residents-search">

            <Search
              size={18}
            />

            <input
              type="text"
              placeholder="Search residents..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (

              <button
                type="button"
                className="search-clear"
                onClick={() =>
                  setSearch("")
                }
              >

                <X
                  size={15}
                />

              </button>

            )}

          </div>


          <div className="resident-filters">

            <button
              type="button"
              className={
                filter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>


            <button
              type="button"
              className={
                filter === "active"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("active")
              }
            >
              Active
            </button>


            <button
              type="button"
              className={
                filter === "blocked"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("blocked")
              }
            >
              Blocked
            </button>

          </div>

        </div>


        {/* =================================================
            RESIDENT TABLE
        ================================================= */}

        <div className="residents-table-card">

          <div className="residents-table-header">

            <div>

              <h2>
                Registered Residents
              </h2>

              <span>

                {filteredResidents.length}{" "}

                resident
                {filteredResidents.length !== 1
                  ? "s"
                  : ""}

              </span>

            </div>

          </div>


          {loading ? (

            <div className="residents-loading">

              <div className="residents-loader" />

              <p>
                Loading residents...
              </p>

            </div>


          ) : filteredResidents.length === 0 ? (

            <div className="residents-empty">

              <div className="residents-empty-icon">

                <UsersRound
                  size={28}
                />

              </div>

              <h3>
                No residents found
              </h3>

              <p>

                {search
                  ? "Try changing your search or filter."
                  : "No registered residents are available yet."}

              </p>

            </div>


          ) : (

            <div className="residents-table-wrapper">

              <table className="residents-table">

                <thead>

                  <tr>

                    <th>
                      Resident
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Language
                    </th>

                    <th>
                      Complaints
                    </th>

                    <th>
                      Joined
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredResidents.map(
                    (resident) => {

                      const complaintCount =
                        complaintCounts[
                          resident.id
                        ] || 0;


                      const isActionLoading =
                        actionLoading ===
                        resident.id;


                      return (

                        <tr
                          key={
                            resident.id
                          }
                        >

                          <td>

                            <div className="resident-name-cell">

                              <div className="resident-avatar">

                                {resident.full_name
                                  ? resident.full_name
                                      .charAt(0)
                                      .toUpperCase()
                                  : "U"}

                              </div>


                              <div>

                                <strong>

                                  {
                                    resident.full_name ||
                                    "Unnamed Resident"
                                  }

                                </strong>

                                <span>
                                  Resident
                                </span>

                              </div>

                            </div>

                          </td>


                          <td>

                            <div className="resident-info-cell">

                              <Phone
                                size={15}
                              />

                              <span>

                                {
                                  resident.phone ||
                                  "Not provided"
                                }

                              </span>

                            </div>

                          </td>


                          <td>

                            <div className="resident-info-cell">

                              <Globe2
                                size={15}
                              />

                              <span>

                                {
                                  resident.preferred_language ||
                                  "English"
                                }

                              </span>

                            </div>

                          </td>


                          <td>

                            <div className="complaint-count">

                              <FileText
                                size={15}
                              />

                              <strong>
                                {complaintCount}
                              </strong>

                            </div>

                          </td>


                          <td>

                            <div className="resident-date">

                              <CalendarDays
                                size={15}
                              />

                              {
                                formatDate(
                                  resident.created_at
                                )
                              }

                            </div>

                          </td>


                          <td>

                            {resident.is_blocked ? (

                              <span className="resident-status blocked">

                                <Ban
                                  size={13}
                                />

                                Blocked

                              </span>

                            ) : (

                              <span className="resident-status active">

                                <CheckCircle2
                                  size={13}
                                />

                                Active

                              </span>

                            )}

                          </td>


                          <td>

                            <div className="resident-actions">

                              <button
                                type="button"
                                className="resident-view-btn"
                                title="View resident"
                                onClick={() =>
                                  openResident(
                                    resident
                                  )
                                }
                              >

                                <Eye
                                  size={16}
                                />

                              </button>


                              <button
                                type="button"
                                className={
                                  `resident-block-btn ${
                                    resident.is_blocked
                                      ? "unblock"
                                      : ""
                                  }`
                                }
                                title={
                                  resident.is_blocked
                                    ? "Unblock resident"
                                    : "Block resident"
                                }
                                disabled={
                                  isActionLoading
                                }
                                onClick={() =>
                                  toggleBlock(
                                    resident
                                  )
                                }
                              >

                                {resident.is_blocked ? (

                                  <UserCheck
                                    size={16}
                                  />

                                ) : (

                                  <Ban
                                    size={16}
                                  />

                                )}

                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =================================================
            RESIDENT DETAILS MODAL
        ================================================= */}

        {selectedResident && (

          <div
            className="resident-modal-overlay"
            onClick={closeResident}
          >

            <div
              className="resident-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >


              {/* ===========================================
                  HEADER
              =========================================== */}

              <div className="resident-modal-header">

                <div>

                  <span>
                    Resident Details
                  </span>

                  <h2>

                    {
                      selectedResident.full_name ||
                      "Unnamed Resident"
                    }

                  </h2>

                </div>


                <button
                  type="button"
                  className="resident-modal-close"
                  onClick={closeResident}
                >

                  <X
                    size={19}
                  />

                </button>

              </div>


              {/* ===========================================
                  SCROLLABLE BODY
              =========================================== */}

              <div className="resident-modal-body">


                {/* =========================================
                    PROFILE SUMMARY
                ========================================= */}

                <div className="resident-modal-profile">

                  <div className="resident-modal-avatar">

                    {selectedResident.full_name
                      ? selectedResident.full_name
                          .charAt(0)
                          .toUpperCase()
                      : "U"}

                  </div>


                  <div>

                    <strong>

                      {
                        selectedResident.full_name ||
                        "Unnamed Resident"
                      }

                    </strong>


                    {selectedResident.is_blocked ? (

                      <span className="resident-status blocked">

                        <Ban
                          size={12}
                        />

                        Blocked

                      </span>

                    ) : (

                      <span className="resident-status active">

                        <CheckCircle2
                          size={12}
                        />

                        Active

                      </span>

                    )}

                  </div>

                </div>


                {/* =========================================
                    DETAILS
                ========================================= */}

                <div className="resident-details-grid">


                  <div className="resident-detail-item">

                    <span>

                      <Phone
                        size={15}
                      />

                      Phone

                    </span>

                    <strong>

                      {
                        selectedResident.phone ||
                        "Not provided"
                      }

                    </strong>

                  </div>


                  <div className="resident-detail-item">

                    <span>

                      <Globe2
                        size={15}
                      />

                      Preferred Language

                    </span>

                    <strong>

                      {
                        selectedResident.preferred_language ||
                        "English"
                      }

                    </strong>

                  </div>


                  <div className="resident-detail-item">

                    <span>

                      <CalendarDays
                        size={15}
                      />

                      Registered

                    </span>

                    <strong>

                      {
                        formatDate(
                          selectedResident.created_at
                        )
                      }

                    </strong>

                  </div>


                  <div className="resident-detail-item">

                    <span>

                      <FileText
                        size={15}
                      />

                      Complaints

                    </span>

                    <strong>

                      {
                        complaintCounts[
                          selectedResident.id
                        ] || 0
                      }

                    </strong>

                  </div>

                </div>


                {/* =========================================
                    COMPLAINTS
                ========================================= */}

                <div className="resident-complaints-section">

                  <div className="resident-complaints-header">

                    <div className="resident-complaints-title">

                      <FileText
                        size={17}
                      />

                      <h3>
                        Complaints Submitted
                      </h3>

                    </div>


                    <span className="resident-complaints-count">

                      {
                        selectedComplaints.length
                      }

                    </span>

                  </div>


                  {complaintsLoading ? (

                    <div className="resident-complaints-loading">

                      <div className="resident-loader" />

                      <span>
                        Loading complaints...
                      </span>

                    </div>


                  ) : selectedComplaints.length === 0 ? (

                    <div className="resident-no-complaints">

                      <div className="resident-no-complaints-icon">

                        <FileText
                          size={19}
                        />

                      </div>

                      <strong>
                        No complaints submitted
                      </strong>

                      <p>
                        This resident has not submitted
                        any complaints yet.
                      </p>

                    </div>


                  ) : (

                    <div className="resident-complaints-list">

                      {selectedComplaints.map(
                        (complaint) => {

                          const statusClass =
                            getComplaintStatusClass(
                              complaint.status
                            );


                          return (

                            <div
                              className="resident-complaint-card"
                              key={
                                complaint.id
                              }
                            >


                              {/* TOP */}

                              <div className="resident-complaint-top">

                                <div>

                                  <div className="resident-complaint-code">

                                    {
                                      complaint.complaint_code ||
                                      "Complaint"
                                    }

                                  </div>


                                  <h4 className="resident-complaint-title">

                                    {
                                      complaint.title ||
                                      "Civic Issue"
                                    }

                                  </h4>

                                </div>


                                <span
                                  className={
                                    `resident-complaint-status ${statusClass}`
                                  }
                                >

                                  <span className="status-dot" />

                                  {
                                    complaint.status ||
                                    "Pending"
                                  }

                                </span>

                              </div>


                              {/* META */}

                              <div className="resident-complaint-meta">

                                <span className="resident-complaint-meta-item">

                                  <span className="complaint-priority-dot" />

                                  {
                                    complaint.priority ||
                                    "Medium"
                                  }

                                </span>


                                <span className="resident-complaint-meta-item">

                                  <Clock3
                                    size={13}
                                  />

                                  {
                                    formatDateTime(
                                      complaint.created_at
                                    )
                                  }

                                </span>

                              </div>


                              {/* DESCRIPTION */}

                              {complaint.description && (

                                <p className="resident-complaint-description">

                                  {
                                    complaint.description
                                  }

                                </p>

                              )}


                              {/* LOCATION */}

                              {(complaint.location_text ||
                                complaint.latitude ||
                                complaint.longitude) && (

                                <div className="resident-complaint-location">

                                  <MapPin
                                    size={13}
                                  />

                                  <span>

                                    {
                                      complaint.location_text ||
                                      (
                                        complaint.latitude &&
                                        complaint.longitude
                                      )
                                        ? complaint.location_text ||
                                          `${complaint.latitude}, ${complaint.longitude}`
                                        : "Location not provided"
                                    }

                                  </span>

                                </div>

                              )}


                              {/* AI ANALYSIS */}

                              {complaint.ai_summary && (

                                <div className="resident-complaint-ai">

                                  <div className="resident-complaint-ai-label">

                                    <Sparkles
                                      size={13}
                                    />

                                    AI Analysis

                                  </div>


                                  <p>

                                    {
                                      complaint.ai_summary
                                    }

                                  </p>

                                </div>

                              )}

                            </div>

                          );

                        }
                      )}

                    </div>

                  )}

                </div>

              </div>


              {/* =========================================
                  ACTIONS
              ========================================= */}

              <div className="resident-modal-actions">

                <button
                  type="button"
                  className={
                    selectedResident.is_blocked
                      ? "resident-unblock-large"
                      : "resident-block-large"
                  }
                  disabled={
                    actionLoading ===
                    selectedResident.id
                  }
                  onClick={() =>
                    toggleBlock(
                      selectedResident
                    )
                  }
                >

                  {selectedResident.is_blocked ? (

                    <>
                      <UserCheck
                        size={16}
                      />

                      Unblock Resident
                    </>

                  ) : (

                    <>
                      <Ban
                        size={16}
                      />

                      Block Resident
                    </>

                  )}

                </button>


                <button
                  type="button"
                  className="resident-cancel-btn"
                  onClick={closeResident}
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </AdminLayout>

  );

}


export default AdminResidents;