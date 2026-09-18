import React, { useMemo, useState } from "react";
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

import "../../styles/MapView.css";
import "../../styles/BottomNavigation.css";
import "../../styles/UserAppLayout.css";

// ======================================================
// MAP CENTER
// ======================================================

const NAGPUR_CENTER = [21.1458, 79.0882];

// ======================================================
// MAP COMPLAINT DATA
// ======================================================

const mapIssues = [
  {
    id: "UGS-1287",
    category: "Potholes",
    title: "Deep pothole on road",
    location: "Wadi, Nagpur",
    status: "Pending",
    position: [21.1615, 79.0830],
  },

  {
    id: "UGS-1286",
    category: "Garbage",
    title: "Garbage overflow",
    location: "Bharat Nagar, Nagpur",
    status: "In Progress",
    position: [21.1390, 79.0710],
  },

  {
    id: "UGS-1285",
    category: "Garbage",
    title: "Garbage collection issue",
    location: "Nildoh, Nagpur",
    status: "Pending",
    position: [21.1180, 78.9970],
  },

  {
    id: "UGS-1284",
    category: "Street Light",
    title: "Street light not working",
    location: "Hingna, Nagpur",
    status: "In Progress",
    position: [21.1160, 78.9920],
  },

  {
    id: "UGS-1283",
    category: "Water Leakage",
    title: "Water leakage",
    location: "Dighori, Nagpur",
    status: "Resolved",
    position: [21.1110, 79.1240],
  },
];

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
// MAP CONTROLLER
// ======================================================

function MapController({ location }) {
  const map = useMap();

  React.useEffect(() => {
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

  const [activeFilter, setActiveFilter] = useState("All");

  const [currentLocation, setCurrentLocation] = useState(null);

  const [locationLoading, setLocationLoading] = useState(false);

  // ====================================================
  // FILTER ISSUES
  // ====================================================

  const filteredIssues = useMemo(() => {
    if (activeFilter === "All") {
      return mapIssues;
    }

    return mapIssues.filter(
      (issue) => issue.category === activeFilter
    );
  }, [activeFilter]);

  // ====================================================
  // CURRENT LOCATION
  // ====================================================

  const locateUser = () => {
    // --------------------------------------------------
    // Check if browser supports location
    // --------------------------------------------------

    if (!navigator.geolocation) {
      alert(
        "Location is not supported by this browser. Please use Chrome, Safari, or another modern browser."
      );

      return;
    }

    // --------------------------------------------------
    // Check secure connection
    // --------------------------------------------------

    const isSecure =
      window.isSecureContext ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isSecure) {
      alert(
        "Location access requires a secure connection (HTTPS).\n\nPlease open this website using HTTPS and try again."
      );

      return;
    }

    // --------------------------------------------------
    // Start loading
    // --------------------------------------------------

    setLocationLoading(true);

    // --------------------------------------------------
    // Request phone location
    // --------------------------------------------------

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        console.log("Current location:", {
          latitude,
          longitude,
          accuracy,
        });

        // ------------------------------------------------
        // Save location
        // ------------------------------------------------

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

        // ------------------------------------------------
        // Handle specific location errors
        // ------------------------------------------------

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location permission was denied.\n\nPlease allow location access for this website in your browser settings and try again."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            alert(
              "Your location could not be determined.\n\nPlease make sure Location/GPS is turned ON on your phone and try again."
            );
            break;

          case error.TIMEOUT:
            alert(
              "Getting your location took too long.\n\nPlease make sure GPS/Location is ON and try again."
            );
            break;

          default:
            alert(
              "Unable to get your location.\n\nPlease check your phone's Location settings and try again."
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

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // ====================================================
  // OPEN COMPLAINT
  // ====================================================

  const viewComplaint = (issue) => {
    navigate(`/user/issue/${issue.id}`);
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
          onClick={() => navigate("/user")}
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
              handleFilterChange(filter)
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
              center={currentLocation}
              radius={10}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillColor: "#1689e8",
                fillOpacity: 1,
              }}
            >
              <Popup>
                <strong>Your Location</strong>
              </Popup>
            </CircleMarker>
          )}

          {/* ==================================================
              COMPLAINT MARKERS
          ================================================== */}

          {filteredIssues.map((issue) => (

            <CircleMarker
              key={issue.id}
              center={issue.position}
              radius={11}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillColor:
                  markerColors[issue.category] ||
                  "#00a982",
                fillOpacity: 1,
              }}
            >

              <Popup>

                <div className="leaflet-complaint-popup">

                  {/* STATUS */}

                  <span
                    className={`map-popup-status ${
                      issue.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                    }`}
                  >
                    {issue.status}
                  </span>

                  {/* TITLE */}

                  <h3>
                    {issue.title}
                  </h3>

                  {/* LOCATION */}

                  <p className="map-popup-location">

                    <MapPin size={14} />

                    {issue.location}

                  </p>

                  {/* ID */}

                  <span className="map-popup-id">
                    #{issue.id}
                  </span>

                  {/* VIEW BUTTON */}

                  <button
                    type="button"
                    className="map-popup-view-button"
                    onClick={() =>
                      viewComplaint(issue)
                    }
                  >
                    View Complaint
                  </button>

                </div>

              </Popup>

            </CircleMarker>

          ))}

        </MapContainer>

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
          onClick={() => navigate("/user")}
        >
          <Home size={19} />
          <span>Home</span>
        </button>

        {/* MAP */}

        <button
          type="button"
          className="map-bottom-item active"
          onClick={() => navigate("/user/map")}
        >
          <MapIcon size={19} />
          <span>Map</span>
        </button>

        {/* PLUS */}

        <button
          type="button"
          className="map-add-button"
          onClick={() => navigate("/user/report")}
          aria-label="Report an issue"
        >
          <Plus size={27} />
        </button>

        {/* REPORTS */}

        <button
          type="button"
          className="map-bottom-item"
          onClick={() => navigate("/user/reports")}
        >
          <FileText size={19} />
          <span>Reports</span>
        </button>

        {/* PROFILE */}

        <button
          type="button"
          className="map-bottom-item"
          onClick={() => navigate("/user/profile")}
        >
          <User size={19} />
          <span>Profile</span>
        </button>

      </nav>

    </div>
  );
}

export default MapView;;