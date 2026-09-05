import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Menu,
  MapPin,
  Navigation,
  Home,
  Map as MapIcon,
  FileText,
  User,
  Plus,
  Trash2,
  Lightbulb,
  Droplets,
  AlertTriangle,
} from "lucide-react";

import "../../styles/MapView.css";
import "../../styles/UserAppLayout.css";

const filters = [
  { name: "All", icon: null },
  { name: "Potholes", icon: AlertTriangle },
  { name: "Garbage", icon: Trash2 },
  { name: "Street Light", icon: Lightbulb },
  { name: "Water Leakage", icon: Droplets },
];

const markers = [
  { id: 1, type: "Potholes", x: 26, y: 28 },
  { id: 2, type: "Garbage", x: 71, y: 22 },
  { id: 3, type: "Street Light", x: 48, y: 35 },
  { id: 4, type: "Water Leakage", x: 77, y: 48 },
  { id: 5, type: "Potholes", x: 30, y: 59 },
  { id: 6, type: "Garbage", x: 61, y: 65 },
  { id: 7, type: "Street Light", x: 84, y: 72 },
  { id: 8, type: "Water Leakage", x: 22, y: 78 },
];

function MapView() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("All");

  const visibleMarkers =
    activeFilter === "All"
      ? markers
      : markers.filter((marker) => marker.type === activeFilter);

  return (
    <div className="user-page map-view-page">

      {/* ================= HEADER ================= */}

      <header className="map-view-header">

        <button className="map-menu-button">
          <Menu size={23} />
        </button>

        <h1>Map View</h1>

        <button className="map-location-button">
          <Navigation size={21} />
        </button>

      </header>


      {/* ================= FILTERS ================= */}

      <div className="map-filter-container">

        {filters.map((filter) => {
          const Icon = filter.icon;

          return (
            <button
              key={filter.name}
              className={`map-filter ${
                activeFilter === filter.name ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter.name)}
            >
              {Icon && <Icon size={15} />}

              <span>{filter.name}</span>
            </button>
          );
        })}

      </div>


      {/* ================= MAP ================= */}

      <main className="map-container">

        <iframe
          title="Map"
          className="real-map"
          src="https://www.openstreetmap.org/export/embed.html?bbox=73.80%2C18.45%2C73.92%2C18.57&layer=mapnik"
        />

        {/* CURRENT USER LOCATION */}

        <div className="current-location">
          <div className="current-location-dot"></div>
        </div>


        {/* ISSUE MARKERS */}

        {visibleMarkers.map((marker) => (
          <button
            key={marker.id}
            className={`map-marker marker-${marker.type
              .toLowerCase()
              .replace(" ", "-")}`}
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
            }}
          >
            <MapPin
              size={22}
              fill="currentColor"
            />
          </button>
        ))}


        {/* CURRENT LOCATION BUTTON */}

        <button className="map-current-location-button">
          <Navigation size={21} />
        </button>

      </main>


      {/* ================= BOTTOM NAVIGATION ================= */}

      <nav className="map-bottom-navigation">

        {/* HOME */}

        <button
          className="map-bottom-item"
          onClick={() => navigate("/user")}
        >
          <Home size={23} />
          <span>Home</span>
        </button>


        {/* MAP */}

        <button className="map-bottom-item active">
          <MapIcon size={23} />
          <span>Map</span>
        </button>


        {/* ADD REPORT */}

        <button
          className="map-add-button"
          onClick={() => navigate("/user/report")}
        >
          <Plus size={30} />
        </button>


        {/* REPORTS */}

        <button
          className="map-bottom-item"
          onClick={() => navigate("/user/reports")}
        >
          <FileText size={23} />
          <span>Reports</span>
        </button>


        {/* PROFILE */}

        <button
          className="map-bottom-item"
          onClick={() => navigate("/user/profile")}
        >
          <User size={23} />
          <span>Profile</span>
        </button>

      </nav>

    </div>
  );
}

export default MapView;