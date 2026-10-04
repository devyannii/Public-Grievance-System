import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  Plus,
  Home,
  Map as MapIcon,
  FileText,
  User,
  LocateFixed,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { supabase } from "../../lib/supabaseClient";

import "../../styles/MapView.css";
import "../../styles/BottomNavigation.css";
import "../../styles/UserAppLayout.css";


// ======================================================
// MAP CENTER
// ======================================================

const NAGPUR_CENTER = [21.1458, 79.0882];


// ======================================================
// FILTERS
// ======================================================

const filters = [
  "All",
  "Potholes",
  "Garbage",
  "Street Light",
  "Water Leakage",
];


// ======================================================
// MARKER COLORS
// ======================================================

const markerColors = {
  Potholes: "#ef4444",
  Garbage: "#22a447",
  "Street Light": "#f5a623",
  "Water Leakage": "#8b5cf6",
};


// ======================================================
// CATEGORY NORMALIZER
// ======================================================

const normalizeCategory = (categoryName = "") => {
  const value = categoryName.trim().toLowerCase();

  if (
    value.includes("pothole") ||
    value.includes("potholes")
  ) {
    return "Potholes";
  }

  if (
    value.includes("garbage") ||
    value.includes("waste") ||
    value.includes("trash")
  ) {
    return "Garbage";
  }

  if (
    value.includes("street light") ||
    value.includes("streetlight") ||
    value.includes("lighting")
  ) {
    return "Street Light";
  }

  if (
    value.includes("water") &&
    (
      value.includes("leak") ||
      value.includes("leakage")
    )
  ) {
    return "Water Leakage";
  }

  return categoryName || "Other";
};


// ======================================================
// MAP CONTROLLER
// ======================================================

function MapController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.flyTo(location, 16, {
      duration: 1.2,
    });
  }, [location, map]);

  return null;
}


// ======================================================
// MAIN COMPONENT
// ======================================================

function MapView() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] =
    useState("All");

  const [currentLocation, setCurrentLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [complaints, setComplaints] =
    useState([]);

  const [loadingComplaints, setLoadingComplaints] =
    useState(true);

  const [mapError, setMapError] =
    useState("");

  // ====================================================
  // LOAD REAL COMPLAINTS
  // ====================================================

  useEffect(() => {
    const loadComplaints = async () => {
      setLoadingComplaints(true);
      setMapError("");

      try {
        // ----------------------------------------------
        // LOAD COMPLAINTS
        // ----------------------------------------------

        const {
          data: complaintData,
          error: complaintError,
        } = await supabase
          .from("complaints")
          .select(
            `
              id,
              complaint_code,
              title,
              description,
              category_id,
              status,
              latitude,
              longitude,
              location_text,
              created_at,
              deleted_at
            `
          )
          .is("deleted_at", null)
          .not("latitude", "is", null)
          .not("longitude", "is", null)
          .order("created_at", {
            ascending: false,
          });

        if (complaintError) {
          console.error(
            "Complaint map error:",
            complaintError
          );

          setMapError(
            "Unable to load complaints on the map."
          );

          return;
        }

        // ----------------------------------------------
        // LOAD CATEGORIES
        // ----------------------------------------------

        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("categories")
          .select("id, name");

        if (categoryError) {
          console.error(
            "Category map error:",
            categoryError
          );
        }

        // ----------------------------------------------
        // CREATE CATEGORY LOOKUP
        // ----------------------------------------------

        const categoryLookup = {};

        (categoryData || []).forEach(
          (category) => {
            categoryLookup[category.id] =
              category.name;
          }
        );

        // ----------------------------------------------
        // FORMAT COMPLAINTS FOR MAP
        // ----------------------------------------------

        const formattedComplaints = (
          complaintData || []
        )
          .map((complaint) => {
            const latitude = Number(
              complaint.latitude
            );

            const longitude = Number(
              complaint.longitude
            );

            if (
              !Number.isFinite(latitude) ||
              !Number.isFinite(longitude)
            ) {
              return null;
            }

            const originalCategory =
              categoryLookup[
                complaint.category_id
              ] || "Other";

            const category =
              normalizeCategory(
                originalCategory
              );

            return {
              id: complaint.id,

              complaintCode:
                complaint.complaint_code ||
                complaint.id,

              category,

              title:
                complaint.title ||
                "Civic Issue",

              description:
                complaint.description || "",

              location:
                complaint.location_text ||
                "Location not provided",

              status:
                complaint.status ||
                "Pending",

              position: [
                latitude,
                longitude,
              ],

              createdAt:
                complaint.created_at,
            };
          })
          .filter(Boolean);

        setComplaints(
          formattedComplaints
        );
      } catch (error) {
        console.error(
          "Unexpected map error:",
          error
        );

        setMapError(
          "Something went wrong while loading the map."
        );
      } finally {
        setLoadingComplaints(false);
      }
    };

    loadComplaints();
  }, []);

  // ====================================================
  // FILTER ISSUES
  // ====================================================

  const filteredIssues = useMemo(() => {
    if (activeFilter === "All") {
      return complaints;
    }

    return complaints.filter(
      (issue) =>
        issue.category === activeFilter
    );
  }, [
    activeFilter,
    complaints,
  ]);

  // ====================================================
  // CURRENT LOCATION
  // ====================================================

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert(
        "Location is not supported by this browser."
      );

      return;
    }

    const isSecure =
      window.isSecureContext ||
      window.location.hostname ===
        "localhost" ||
      window.location.hostname ===
        "127.0.0.1";

    if (!isSecure) {
      alert(
        "Location access requires a secure connection (HTTPS)."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
        } = position.coords;

        console.log(
          "Current location:",
          {
            latitude,
            longitude,
            accuracy:
              position.coords.accuracy,
          }
        );

        setCurrentLocation([
          latitude,
          longitude,
        ]);

        setLocationLoading(false);
      },

      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location permission was denied. Please allow location access for this website."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            alert(
              "Your location could not be determined. Please make sure Location/GPS is turned on."
            );
            break;

          case error.TIMEOUT:
            alert(
              "Getting your location took too long. Please try again."
            );
            break;

          default:
            alert(
              "Unable to get your location."
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // ====================================================
  // FILTER CHANGE
  // ====================================================

  const handleFilterChange = (
    filter
  ) => {
    setActiveFilter(filter);
  };

  // ====================================================
  // OPEN COMPLAINT
  // ====================================================

  const viewComplaint = (issue) => {
    navigate(
      `/user/issue/${issue.id}`
    );
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="map-view-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="map-view-header">

        <button
          type="button"
          className="map-back-button"
          onClick={() =>
            navigate("/user")
          }
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>

        <h1>Map View</h1>

        <button
          type="button"
          className="map-location-header-button"
          onClick={locateUser}
          disabled={locationLoading}
          aria-label="Current location"
        >
          <MapPin size={23} />
        </button>

      </header>


      {/* ==================================================
          CATEGORY FILTERS
      ================================================== */}

      <div className="map-filter-container">

        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`map-filter ${
              activeFilter === filter
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleFilterChange(
                filter
              )
            }
          >
            {filter}
          </button>
        ))}

      </div>


      {/* ==================================================
          MAP
      ================================================== */}

      <main className="map-container">

        <MapContainer
          center={NAGPUR_CENTER}
          zoom={12}
          minZoom={10}
          maxZoom={18}
          scrollWheelZoom={true}
          zoomControl={true}
          className="real-map"
        >

          {/* ==================================================
              OPENSTREETMAP TILES
          ================================================== */}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {/* ==================================================
              MOVE MAP TO CURRENT LOCATION
          ================================================== */}

          <MapController
            location={currentLocation}
          />


          {/* ==================================================
              CURRENT USER LOCATION
          ================================================== */}

          {currentLocation && (
            <CircleMarker
              center={
                currentLocation
              }
              radius={10}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillColor:
                  "#1689e8",
                fillOpacity: 1,
              }}
            >
              <Popup>
                <strong>
                  Your Location
                </strong>
              </Popup>
            </CircleMarker>
          )}


          {/* ==================================================
              REAL COMPLAINT MARKERS
          ================================================== */}

          {filteredIssues.map(
            (issue) => (
              <CircleMarker
                key={issue.id}
                center={
                  issue.position
                }
                radius={11}
                pathOptions={{
                  color:
                    "#ffffff",
                  weight: 3,
                  fillColor:
                    markerColors[
                      issue.category
                    ] ||
                    "#00a982",
                  fillOpacity: 1,
                }}
              >

                <Popup>

                  <div className="leaflet-complaint-popup">

                    {/* STATUS */}

                    <span
                      className={`map-popup-status ${(
                        issue.status ||
                        "Pending"
                      )
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          "-"
                        )}`}
                    >
                      {issue.status}
                    </span>


                    {/* TITLE */}

                    <h3>
                      {issue.title}
                    </h3>


                    {/* LOCATION */}

                    <p className="map-popup-location">

                      <MapPin
                        size={14}
                      />

                      {issue.location}

                    </p>


                    {/* ID */}

                    <span className="map-popup-id">
                      #
                      {
                        issue.complaintCode
                      }
                    </span>


                    {/* VIEW BUTTON */}

                    <button
                      type="button"
                      className="map-popup-view-button"
                      onClick={() =>
                        viewComplaint(
                          issue
                        )
                      }
                    >
                      View Complaint
                    </button>

                  </div>

                </Popup>

              </CircleMarker>
            )
          )}

        </MapContainer>


        {/* ==================================================
            LOADING MESSAGE
        ================================================== */}

        {loadingComplaints && (
          <div className="map-loading-message">
            Loading complaints...
          </div>
        )}


        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {!loadingComplaints &&
          mapError && (
            <div className="map-error-message">
              {mapError}
            </div>
          )}


        {/* ==================================================
            NO COMPLAINTS MESSAGE
        ================================================== */}

        {!loadingComplaints &&
          !mapError &&
          filteredIssues.length ===
            0 && (
            <div className="map-empty-message">
              No complaints found
              for this category.
            </div>
          )}


        {/* ==================================================
            CURRENT LOCATION BUTTON
        ================================================== */}

        <button
          type="button"
          className={`map-current-location-button ${
            locationLoading
              ? "loading"
              : ""
          }`}
          onClick={locateUser}
          disabled={locationLoading}
          aria-label="Find my location"
        >
          <LocateFixed
            size={21}
            className={
              locationLoading
                ? "location-icon-loading"
                : ""
            }
          />
        </button>

      </main>


      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <nav className="map-bottom-navigation">

        {/* HOME */}

        <button
          type="button"
          className="map-bottom-item"
          onClick={() =>
            navigate("/user")
          }
        >
          <Home size={19} />
          <span>Home</span>
        </button>


        {/* MAP */}

        <button
          type="button"
          className="map-bottom-item active"
          onClick={() =>
            navigate("/user/map")
          }
        >
          <MapIcon size={19} />
          <span>Map</span>
        </button>


        {/* PLUS */}

        <button
          type="button"
          className="map-add-button"
          onClick={() =>
            navigate("/user/report")
          }
          aria-label="Report an issue"
        >
          <Plus size={27} />
        </button>


        {/* REPORTS */}

        <button
          type="button"
          className="map-bottom-item"
          onClick={() =>
            navigate("/user/reports")
          }
        >
          <FileText size={19} />
          <span>Reports</span>
        </button>


        {/* PROFILE */}

        <button
          type="button"
          className="map-bottom-item"
          onClick={() =>
            navigate("/user/profile")
          }
        >
          <User size={19} />
          <span>Profile</span>
        </button>

      </nav>

    </div>
  );
}


export default MapView;