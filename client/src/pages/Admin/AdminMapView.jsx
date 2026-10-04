import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock3,
  X,
  Navigation,
  Loader2,
  Brain,
  ChevronRight,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import "../../styles/AdminMapView.css";

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN;

/* =========================================================
   NAGPUR MAP CONFIGURATION
========================================================= */

const NAGPUR_CENTER = [79.0882, 21.1458];

const NAGPUR_BOUNDS = {
  west: 78.85,
  south: 20.95,
  east: 79.35,
  north: 21.35,
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const isValidCoordinate = (lat, lng) => {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

const isInsideNagpur = (lat, lng) => {
  return (
    lat >= NAGPUR_BOUNDS.south &&
    lat <= NAGPUR_BOUNDS.north &&
    lng >= NAGPUR_BOUNDS.west &&
    lng <= NAGPUR_BOUNDS.east
  );
};

const normalizeStatus = (status = "") => {
  return status
    .toString()
    .toLowerCase()
    .replace(/_/g, " ")
    .trim();
};

const formatStatus = (status = "") => {
  const value = normalizeStatus(status);

  if (!value) {
    return "Unknown";
  }

  return value
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

const getStatusClass = (status = "") => {
  const value = normalizeStatus(status);

  if (
    value.includes("resolved") ||
    value.includes("closed")
  ) {
    return "resolved";
  }

  if (
    value.includes("progress") ||
    value.includes("assigned") ||
    value.includes("working")
  ) {
    return "progress";
  }

  if (
    value.includes("pending") ||
    value.includes("open")
  ) {
    return "pending";
  }

  return "default";
};

const getPriorityClass = (priority = "") => {
  const value =
    priority.toString().toLowerCase();

  if (
    value === "critical" ||
    value === "high"
  ) {
    return "high";
  }

  if (value === "medium") {
    return "medium";
  }

  return "low";
};

const getComplaintWeight = (
  complaint
) => {
  const priority =
    complaint.priority
      ?.toString()
      .toLowerCase();

  if (priority === "critical") {
    return 1;
  }

  if (priority === "high") {
    return 0.9;
  }

  if (priority === "medium") {
    return 0.65;
  }

  return 0.4;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminMapView() {
  const navigate = useNavigate();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const complaintsRef = useRef([]);

  const lastFittedDataRef =
    useRef("");

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [mapReady, setMapReady] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [showFilters, setShowFilters] =
    useState(false);

  /* =======================================================
     KEEP REF UPDATED
  ======================================================= */

  useEffect(() => {
    complaintsRef.current =
      complaints;
  }, [complaints]);

  /* =======================================================
     LOAD COMPLAINTS
  ======================================================= */

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      /* ===================================================
         LOAD COMPLAINTS ONLY
         
         IMPORTANT:
         We deliberately DO NOT use:
         
         departments(...)
         
         inside this query because the complaints table
         has more than one relationship with departments.
      =================================================== */

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
        .is("deleted_at", null)
        .order("created_at", {
          ascending: false,
        })
        .range(0, 999);

      if (complaintError) {
        console.error(
          "ADMIN MAP COMPLAINT ERROR:",
          complaintError
        );

        throw complaintError;
      }

      const complaintsData =
        complaintData || [];

      console.log(
        "ADMIN MAP - complaints loaded:",
        complaintsData.length
      );

      /* ===================================================
         CATEGORY IDS
      =================================================== */

      const categoryIds = [
        ...new Set(
          complaintsData
            .map(
              (complaint) =>
                complaint.category_id
            )
            .filter(Boolean)
        ),
      ];

      /* ===================================================
         DEPARTMENT IDS
      =================================================== */

      const departmentIds = [
        ...new Set(
          complaintsData
            .map(
              (complaint) =>
                complaint.department_id
            )
            .filter(Boolean)
        ),
      ];

      /* ===================================================
         LOAD CATEGORIES
      =================================================== */

      let categoryMap = {};

      if (categoryIds.length > 0) {
        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("categories")
          .select("id, name")
          .in(
            "id",
            categoryIds
          );

        if (categoryError) {
          console.warn(
            "ADMIN MAP CATEGORY ERROR:",
            categoryError
          );
        } else {
          categoryMap =
            Object.fromEntries(
              (categoryData || []).map(
                (category) => [
                  category.id,
                  category,
                ]
              )
            );
        }
      }

      /* ===================================================
         LOAD DEPARTMENTS
      =================================================== */

      let departmentMap = {};

      if (departmentIds.length > 0) {
        const {
          data: departmentData,
          error: departmentError,
        } = await supabase
          .from("departments")
          .select("id, name")
          .in(
            "id",
            departmentIds
          );

        if (departmentError) {
          console.warn(
            "ADMIN MAP DEPARTMENT ERROR:",
            departmentError
          );
        } else {
          departmentMap =
            Object.fromEntries(
              (departmentData || []).map(
                (department) => [
                  department.id,
                  department,
                ]
              )
            );
        }
      }

      /* ===================================================
         COMBINE DATA
      =================================================== */

      const finalComplaints =
        complaintsData.map(
          (complaint) => ({
            ...complaint,

            categories:
              categoryMap[
                complaint.category_id
              ] || null,

            departments:
              departmentMap[
                complaint.department_id
              ] || null,
          })
        );

      console.log(
        "ADMIN MAP - final complaints:",
        finalComplaints.length
      );

      setComplaints(
        finalComplaints
      );

      complaintsRef.current =
        finalComplaints;
    } catch (err) {
      console.error(
        "ADMIN MAP LOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load complaints. Please check your Supabase connection."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL DATA LOAD
  ======================================================= */

  useEffect(() => {
    loadComplaints();
  }, []);

  /* =======================================================
     FILTER COMPLAINTS
  ======================================================= */

  const filteredComplaints =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return complaints.filter(
        (complaint) => {
          const matchesSearch =
            !search ||
            complaint.complaint_code
              ?.toLowerCase()
              .includes(search) ||
            complaint.title
              ?.toLowerCase()
              .includes(search) ||
            complaint.description
              ?.toLowerCase()
              .includes(search) ||
            complaint.location_text
              ?.toLowerCase()
              .includes(search) ||
            complaint.categories?.name
              ?.toLowerCase()
              .includes(search) ||
            complaint.departments?.name
              ?.toLowerCase()
              .includes(search);

          const complaintStatus =
            normalizeStatus(
              complaint.status
            );

          const matchesStatus =
            statusFilter === "all" ||
            complaintStatus ===
              normalizeStatus(
                statusFilter
              );

          const complaintPriority =
            complaint.priority
              ?.toString()
              .toLowerCase() || "";

          const matchesPriority =
            priorityFilter ===
              "all" ||
            complaintPriority ===
              priorityFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
          );
        }
      );
    }, [
      complaints,
      searchTerm,
      statusFilter,
      priorityFilter,
    ]);

  /* =======================================================
     VALID COORDINATES
  ======================================================= */

  const mappedComplaints =
    useMemo(() => {
      return filteredComplaints
        .map((complaint) => ({
          ...complaint,

          lat: Number(
            complaint.latitude
          ),

          lng: Number(
            complaint.longitude
          ),
        }))
        .filter((complaint) =>
          isValidCoordinate(
            complaint.lat,
            complaint.lng
          )
        );
    }, [
      filteredComplaints,
    ]);

  /* =======================================================
     LOCAL NAGPUR COMPLAINTS
  ======================================================= */

  const localMappedComplaints =
    useMemo(() => {
      return mappedComplaints.filter(
        (complaint) =>
          isInsideNagpur(
            complaint.lat,
            complaint.lng
          )
      );
    }, [
      mappedComplaints,
    ]);

  const outsideLocalCount =
    mappedComplaints.length -
    localMappedComplaints.length;

  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const pending =
      complaints.filter(
        (complaint) => {
          const status =
            normalizeStatus(
              complaint.status
            );

          return (
            status.includes(
              "pending"
            ) ||
            status === "open" ||
            status.includes(
              "assigned"
            ) ||
            status.includes(
              "progress"
            )
          );
        }
      ).length;

    const resolved =
      complaints.filter(
        (complaint) => {
          const status =
            normalizeStatus(
              complaint.status
            );

          return (
            status.includes(
              "resolved"
            ) ||
            status.includes(
              "closed"
            )
          );
        }
      ).length;

    return {
      total: complaints.length,
      pending,
      resolved,
      mapped:
        mappedComplaints.length,
      localMapped:
        localMappedComplaints.length,
    };
  }, [
    complaints,
    mappedComplaints,
    localMappedComplaints,
  ]);

  /* =======================================================
     GEOJSON
  ======================================================= */

  const buildGeoJSON = (
    items
  ) => {
    return {
      type: "FeatureCollection",

      features: items.map(
        (complaint) => ({
          type: "Feature",

          geometry: {
            type: "Point",

            coordinates: [
              complaint.lng,
              complaint.lat,
            ],
          },

          properties: {
            id: complaint.id,

            complaint_code:
              complaint.complaint_code ||
              "",

            title:
              complaint.title ||
              "Complaint",

            description:
              complaint.description ||
              "",

            status:
              complaint.status ||
              "",

            priority:
              complaint.priority ||
              "",

            location_text:
              complaint.location_text ||
              "",

            category:
              complaint.categories
                ?.name ||
              "Uncategorized",

            department:
              complaint.departments
                ?.name ||
              "Unassigned",

            weight:
              getComplaintWeight(
                complaint
              ),
          },
        })
      ),
    };
  };

  /* =======================================================
     INITIALIZE MAPBOX
  ======================================================= */

  useEffect(() => {
    const container =
      mapContainerRef.current;

    if (!container) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    if (!mapboxgl.accessToken) {
      setError(
        "Mapbox token is missing. Add VITE_MAPBOX_TOKEN to your .env file."
      );

      return;
    }

    console.log(
      "ADMIN MAP: initializing Mapbox"
    );

    const map =
      new mapboxgl.Map({
        container,

        style:
          "mapbox://styles/mapbox/standard",

        center:
          NAGPUR_CENTER,

        zoom: 12,

        minZoom: 9,

        maxZoom: 18,

        attributionControl: true,
      });

    mapRef.current = map;

    /* =====================================================
       NAVIGATION CONTROLS
    ===================================================== */

    map.addControl(
      new mapboxgl.NavigationControl(
        {
          visualizePitch: false,
        }
      ),
      "top-left"
    );

    /* =====================================================
       MAP LOADED
    ===================================================== */

    map.on("load", () => {
      console.log(
        "ADMIN MAP: Mapbox loaded successfully"
      );

      setMapReady(true);

      setTimeout(() => {
        map.resize();
      }, 150);
    });

    /* =====================================================
       MAP ERROR
    ===================================================== */

    map.on("error", (event) => {
      console.error(
        "MAPBOX ERROR:",
        event?.error ||
          event
      );
    });

    /* =====================================================
       CLICK COMPLAINT POINT
    ===================================================== */

    map.on(
      "click",
      "complaints-points",
      (event) => {
        const feature =
          event.features?.[0];

        if (!feature) {
          return;
        }

        const id =
          feature.properties?.id;

        const complaint =
          complaintsRef.current.find(
            (item) =>
              String(item.id) ===
              String(id)
          );

        if (complaint) {
          setSelectedComplaint(
            complaint
          );
        }
      }
    );

    /* =====================================================
       POINTER
    ===================================================== */

    map.on(
      "mouseenter",
      "complaints-points",
      () => {
        map.getCanvas().style.cursor =
          "pointer";
      }
    );

    map.on(
      "mouseleave",
      "complaints-points",
      () => {
        map.getCanvas().style.cursor =
          "";
      }
    );

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      console.log(
        "ADMIN MAP: destroying Mapbox"
      );

      map.remove();

      mapRef.current =
        null;

      setMapReady(false);
    };
  }, []);

  /* =======================================================
     UPDATE MAP DATA
  ======================================================= */

  useEffect(() => {
    if (
      !mapReady ||
      !mapRef.current
    ) {
      return;
    }

    const map =
      mapRef.current;

    if (!map.isStyleLoaded()) {
      return;
    }

    const geojson =
      buildGeoJSON(
        localMappedComplaints
      );

    /* =====================================================
       CREATE SOURCE
    ===================================================== */

    if (
      !map.getSource(
        "complaints"
      )
    ) {
      map.addSource(
        "complaints",
        {
          type: "geojson",
          data: geojson,
        }
      );

      /* ===================================================
         HEATMAP
      =================================================== */

      map.addLayer({
        id: "complaints-heat",

        type: "heatmap",

        source: "complaints",

        maxzoom: 17,

        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "weight"],

            0,
            0.25,

            0.4,
            0.45,

            0.65,
            0.7,

            0.9,
            0.9,

            1,
            1,
          ],

          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],

            9,
            0.8,

            11,
            1.2,

            13,
            1.8,

            15,
            2.6,

            17,
            3.5,
          ],

          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],

            9,
            18,

            11,
            24,

            13,
            30,

            15,
            38,

            17,
            45,
          ],

          "heatmap-opacity":
            0.9,

          /* =============================================
             YELLOW → ORANGE → RED
          ============================================= */

          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],

            0,
            "rgba(255,247,188,0)",

            0.12,
            "#fff7bc",

            0.25,
            "#fee391",

            0.42,
            "#fec44f",

            0.58,
            "#fe9929",

            0.72,
            "#ec7014",

            0.86,
            "#d7301f",

            1,
            "#99000d",
          ],
        },
      });

      /* ===================================================
         INDIVIDUAL COMPLAINT POINTS
      =================================================== */

      map.addLayer({
        id: "complaints-points",

        type: "circle",

        source: "complaints",

        minzoom: 12.5,

        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],

            12.5,
            3,

            16,
            6,
          ],

          "circle-color": [
            "match",
            ["get", "priority"],

            "critical",
            "#8b0000",

            "high",
            "#d7301f",

            "medium",
            "#fe9929",

            "#fff7bc",
          ],

          "circle-stroke-color":
            "#ffffff",

          "circle-stroke-width":
            1.5,

          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],

            12.5,
            0.15,

            14,
            0.55,

            16,
            0.9,
          ],
        },
      });
    } else {
      /* ===================================================
         UPDATE EXISTING SOURCE
      =================================================== */

      map
        .getSource(
          "complaints"
        )
        .setData(geojson);
    }

    /* =====================================================
       FIT MAP TO DATA
    ===================================================== */

    if (
      localMappedComplaints.length >
      0
    ) {
      const fitKey =
        localMappedComplaints
          .map(
            (complaint) =>
              `${complaint.id}:${complaint.lat}:${complaint.lng}`
          )
          .join("|");

      if (
        fitKey !==
        lastFittedDataRef.current
      ) {
        const bounds =
          new mapboxgl.LngLatBounds();

        localMappedComplaints.forEach(
          (complaint) => {
            bounds.extend([
              complaint.lng,
              complaint.lat,
            ]);
          }
        );

        map.fitBounds(
          bounds,
          {
            padding: {
              top: 70,
              bottom: 70,
              left: 70,
              right: 70,
            },

            maxZoom: 14,

            duration: 900,
          }
        );

        lastFittedDataRef.current =
          fitKey;
      }
    } else {
      map.flyTo({
        center:
          NAGPUR_CENTER,

        zoom: 12,

        duration: 700,
      });

      lastFittedDataRef.current =
        "";
    }

    setTimeout(() => {
      map.resize();
    }, 100);
  }, [
    mapReady,
    localMappedComplaints,
  ]);

  /* =======================================================
     FOCUS COMPLAINT
  ======================================================= */

  const focusComplaint = (
    complaint
  ) => {
    const lat = Number(
      complaint.latitude
    );

    const lng = Number(
      complaint.longitude
    );

    if (
      !isValidCoordinate(
        lat,
        lng
      )
    ) {
      setSelectedComplaint(
        complaint
      );

      return;
    }

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [
          lng,
          lat,
        ],

        zoom: 16,

        duration: 900,
      });
    }

    setSelectedComplaint(
      complaint
    );
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearchTerm("");

    setStatusFilter("all");

    setPriorityFilter("all");
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
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="admin-map-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="admin-map-header">

        <div className="admin-map-header-left">

          <button
            className="admin-map-back-btn"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
            title="Back to Admin Dashboard"
          >
            <ArrowLeft
              size={19}
            />
          </button>

          <div className="admin-map-title-row">

            <div className="admin-map-title-icon">
              <MapPin size={22} />
            </div>

            <div>
              <h1>
                Complaints Map
              </h1>

              <p>
                Visualize complaint density
                and identify problem areas
              </p>
            </div>

          </div>

        </div>

        <button
          className="admin-map-refresh-btn"
          onClick={
            loadComplaints
          }
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ==================================================
          STATS
      ================================================== */}

      <div className="admin-map-stats">

        <div className="admin-map-stat-card">

          <div className="admin-map-stat-icon total">
            <MapPin size={19} />
          </div>

          <div>
            <span>
              Total Complaints
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>

        <div className="admin-map-stat-card">

          <div className="admin-map-stat-icon pending">
            <Clock3 size={19} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {stats.pending}
            </strong>
          </div>

        </div>

        <div className="admin-map-stat-card">

          <div className="admin-map-stat-icon resolved">
            <CheckCircle2
              size={19}
            />
          </div>

          <div>
            <span>
              Resolved
            </span>

            <strong>
              {stats.resolved}
            </strong>
          </div>

        </div>

        <div className="admin-map-stat-card">

          <div className="admin-map-stat-icon mapped">
            <Navigation size={19} />
          </div>

          <div>
            <span>
              Mapped Locally
            </span>

            <strong>
              {stats.localMapped}
            </strong>
          </div>

        </div>

      </div>

      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="admin-map-toolbar">

        <div className="admin-map-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search complaint, location, category..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          {searchTerm && (
            <button
              className="admin-map-clear-search"
              onClick={() =>
                setSearchTerm("")
              }
            >
              <X size={15} />
            </button>
          )}

        </div>

        <button
          className={`admin-map-filter-toggle ${
            showFilters
              ? "active"
              : ""
          }`}
          onClick={() =>
            setShowFilters(
              (value) =>
                !value
            )
          }
        >
          <Filter size={17} />

          Filters
        </button>

      </div>

      {/* ==================================================
          FILTERS
      ================================================== */}

      {showFilters && (
        <div className="admin-map-filter-panel">

          <div className="admin-map-filter-field">

            <label>
              Status
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="all">
                All Statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="assigned">
                Assigned
              </option>

              <option value="in progress">
                In Progress
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="closed">
                Closed
              </option>
            </select>

          </div>

          <div className="admin-map-filter-field">

            <label>
              Priority
            </label>

            <select
              value={
                priorityFilter
              }
              onChange={(
                event
              ) =>
                setPriorityFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="all">
                All Priorities
              </option>

              <option value="critical">
                Critical
              </option>

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>
            </select>

          </div>

          <button
            className="admin-map-clear-filters"
            onClick={
              clearFilters
            }
          >
            Clear Filters
          </button>

        </div>
      )}

      {/* ==================================================
          MAP
      ================================================== */}

      <div className="admin-map-wrapper">

        <div
          ref={mapContainerRef}
          className="admin-map"
        />

        {(loading ||
          !mapReady) &&
          !error && (
            <div className="admin-map-loading">

              <Loader2
                size={30}
                className="spin"
              />

              <span>
                Loading complaint map...
              </span>

            </div>
          )}

        {error && (
          <div className="admin-map-error">

            <AlertCircle
              size={28}
            />

            <div>

              <strong>
                Map could not be loaded
              </strong>

              <p>
                {error}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            HEATMAP LEGEND
        ================================================= */}

        <div className="admin-map-density-legend">

          <div className="admin-map-legend-title">
            Complaint Density
          </div>

          <div className="admin-map-gradient" />

          <div className="admin-map-gradient-labels">

            <span>
              Low
            </span>

            <span>
              Medium
            </span>

            <span>
              High
            </span>

          </div>

          <div className="admin-map-density-note">
            Yellow → Orange → Red
          </div>

        </div>

        {/* =================================================
            PRIORITY LEGEND
        ================================================= */}

        <div className="admin-map-marker-key">

          <div className="admin-map-marker-key-title">
            Priority
          </div>

          <div>
            <i className="map-key-dot critical" />
            Critical
          </div>

          <div>
            <i className="map-key-dot high" />
            High
          </div>

          <div>
            <i className="map-key-dot medium" />
            Medium
          </div>

        </div>

      </div>

      {/* ==================================================
          OUTSIDE NAGPUR
      ================================================== */}

      {outsideLocalCount >
        0 && (
        <div className="admin-map-outside-info">

          <AlertCircle
            size={18}
          />

          <span>

            <strong>
              {outsideLocalCount}
            </strong>{" "}

            complaint location
            {outsideLocalCount !==
            1
              ? "s"
              : ""}{" "}

            fall outside the
            current Nagpur map
            area and are not
            shown on the local
            heatmap.

          </span>

        </div>
      )}

      {/* ==================================================
          RESULTS HEADER
      ================================================== */}

      <div className="admin-map-results-header">

        <div>

          <h2>
            Mapped Complaints
          </h2>

          <span>
            Showing{" "}
            {
              localMappedComplaints.length
            }{" "}
            of{" "}
            {
              filteredComplaints.length
            }{" "}
            filtered complaints
          </span>

        </div>

      </div>

      {/* ==================================================
          COMPLAINT LIST
      ================================================== */}

      {localMappedComplaints.length >
      0 ? (
        <div className="admin-map-complaint-list">

          {localMappedComplaints.map(
            (complaint) => (
              <button
                key={
                  complaint.id
                }
                className="admin-map-complaint-item"
                onClick={() =>
                  focusComplaint(
                    complaint
                  )
                }
              >

                <div className="admin-map-complaint-item-left">

                  <div
                    className={`admin-map-list-icon ${getPriorityClass(
                      complaint.priority
                    )}`}
                  >
                    <MapPin
                      size={18}
                    />
                  </div>

                  <div className="admin-map-complaint-content">

                    <div className="admin-map-complaint-code">
                      {complaint.complaint_code ||
                        "No Code"}
                    </div>

                    <h3>
                      {complaint.title ||
                        "Untitled Complaint"}
                    </h3>

                    <div className="admin-map-complaint-meta">

                      <span>
                        {complaint
                          .categories
                          ?.name ||
                          "Uncategorized"}
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        {complaint.location_text ||
                          "Location unavailable"}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="admin-map-complaint-item-right">

                  <span
                    className={`admin-map-status-badge ${getStatusClass(
                      complaint.status
                    )}`}
                  >
                    {formatStatus(
                      complaint.status
                    )}
                  </span>

                  <ChevronRight
                    size={18}
                  />

                </div>

              </button>
            )
          )}

        </div>
      ) : (
        <div className="admin-map-empty">

          <MapPin
            size={34}
          />

          <h3>
            No mapped complaints
            found
          </h3>

          <p>
            Try changing your
            search or filters.
          </p>

          {(searchTerm ||
            statusFilter !==
              "all" ||
            priorityFilter !==
              "all") && (
            <button
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>
          )}

        </div>
      )}

      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="admin-map-footer">

        <Brain size={16} />

        <span>
          Heatmap intensity
          represents complaint
          concentration. Higher
          density areas appear
          red.
        </span>

      </div>

      {/* ==================================================
          COMPLAINT MODAL
      ================================================== */}

      {selectedComplaint && (
        <div
          className="admin-map-modal-backdrop"
          onClick={() =>
            setSelectedComplaint(
              null
            )
          }
        >

          <div
            className="admin-map-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-map-modal-header">

              <div>

                <span className="admin-map-modal-code">
                  {selectedComplaint.complaint_code ||
                    "Complaint"}
                </span>

                <h2>
                  {selectedComplaint.title ||
                    "Untitled Complaint"}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedComplaint(
                    null
                  )
                }
                className="admin-map-modal-close"
              >
                <X size={19} />
              </button>

            </div>

            <div className="admin-map-modal-body">

              <div className="admin-map-modal-badges">

                <span
                  className={`admin-map-status-badge ${getStatusClass(
                    selectedComplaint.status
                  )}`}
                >
                  {formatStatus(
                    selectedComplaint.status
                  )}
                </span>

                <span
                  className={`admin-map-priority-badge ${getPriorityClass(
                    selectedComplaint.priority
                  )}`}
                >
                  {selectedComplaint.priority ||
                    "Low"}{" "}
                  Priority
                </span>

              </div>

              <div className="admin-map-modal-section">

                <label>
                  Description
                </label>

                <p>
                  {selectedComplaint.description ||
                    "No description provided."}
                </p>

              </div>

              <div className="admin-map-modal-grid">

                <div>

                  <label>
                    Category
                  </label>

                  <span>
                    {selectedComplaint
                      .categories
                      ?.name ||
                      "Uncategorized"}
                  </span>

                </div>

                <div>

                  <label>
                    Department
                  </label>

                  <span>
                    {selectedComplaint
                      .departments
                      ?.name ||
                      "Unassigned"}
                  </span>

                </div>

                <div>

                  <label>
                    Location
                  </label>

                  <span>
                    {selectedComplaint.location_text ||
                      "Not provided"}
                  </span>

                </div>

                <div>

                  <label>
                    Reported On
                  </label>

                  <span>
                    {formatDate(
                      selectedComplaint.created_at
                    )}
                  </span>

                </div>

              </div>

              <div className="admin-map-modal-section">

                <label>
                  Coordinates
                </label>

                <div className="admin-map-coordinates">

                  <span>
                    Latitude:{" "}
                    {selectedComplaint.latitude ??
                      "—"}
                  </span>

                  <span>
                    Longitude:{" "}
                    {selectedComplaint.longitude ??
                      "—"}
                  </span>

                </div>

              </div>

              {selectedComplaint.ai_summary && (
                <div className="admin-map-ai-box">

                  <div className="admin-map-ai-title">

                    <Brain
                      size={17}
                    />

                    AI Analysis

                  </div>

                  <p>
                    {
                      selectedComplaint.ai_summary
                    }
                  </p>

                </div>
              )}

              {selectedComplaint.automatically_assigned && (
                <div className="admin-map-ai-assigned">

                  <Brain
                    size={16}
                  />

                  Automatically assigned
                  by AI

                </div>
              )}

            </div>

            <div className="admin-map-modal-footer">

              <button
                className="admin-map-modal-secondary"
                onClick={() =>
                  setSelectedComplaint(
                    null
                  )
                }
              >
                Close
              </button>

              <button
                className="admin-map-modal-primary"
                onClick={() => {
                  const lat =
                    Number(
                      selectedComplaint.latitude
                    );

                  const lng =
                    Number(
                      selectedComplaint.longitude
                    );

                  if (
                    mapRef.current &&
                    isValidCoordinate(
                      lat,
                      lng
                    )
                  ) {
                    mapRef.current.flyTo(
                      {
                        center: [
                          lng,
                          lat,
                        ],

                        zoom: 17,

                        duration: 800,
                      }
                    );
                  }
                }}
              >
                <Navigation
                  size={16}
                />

                Focus on Map
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}