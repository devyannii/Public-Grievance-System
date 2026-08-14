import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Settings,
  FileText,
  Clock3,
  Bell,
  CircleHelp,
  Info,
  LogOut,
  Home,
  Map,
  Plus,
  User,
} from "lucide-react";

import "../../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();

  return (
    <div className="user-page profile-page">

      {/* ================= HEADER ================= */}

      <header className="profile-header">

        <button
          className="profile-back"
          onClick={() => navigate("/user")}
        >
          <ArrowLeft size={21} />
        </button>

        <h1>Profile</h1>

        <button className="profile-settings">
          <Settings size={20} />
        </button>

      </header>


      {/* ================= PROFILE CONTENT ================= */}

      <main className="profile-content">

        {/* USER INFO */}

        <section className="profile-user">

          <div className="profile-avatar">
            <User size={42} />
          </div>

          <h2>Priya Sharma</h2>

          <p>+91 98765 43210</p>

          <p>priya.sharma@email.com</p>

        </section>


        {/* PROFILE MENU */}

        <section className="profile-menu">

          {/* MY REPORTS */}

          <button
            className="profile-menu-item"
            onClick={() => navigate("/user/reports")}
          >

            <div className="profile-menu-icon">
              <FileText size={19} />
            </div>

            <span>My Reports</span>

            <span className="profile-arrow">›</span>

          </button>


          {/* TRACK ISSUE */}

          <button
            className="profile-menu-item"
            onClick={() => navigate("/user/reports")}
          >

            <div className="profile-menu-icon">
              <Clock3 size={19} />
            </div>

            <span>Track an Issue</span>

            <span className="profile-arrow">›</span>

          </button>


          {/* NOTIFICATIONS */}

          <button className="profile-menu-item">

            <div className="profile-menu-icon">
              <Bell size={19} />
            </div>

            <span>Notifications</span>

            <span className="profile-arrow">›</span>

          </button>


          {/* HELP */}

          <button className="profile-menu-item">

            <div className="profile-menu-icon">
              <CircleHelp size={19} />
            </div>

            <span>Help & Support</span>

            <span className="profile-arrow">›</span>

          </button>


          {/* ABOUT */}

          <button className="profile-menu-item">

            <div className="profile-menu-icon">
              <Info size={19} />
            </div>

            <span>About Us</span>

            <span className="profile-arrow">›</span>

          </button>

        </section>


        {/* LOGOUT */}

        <button className="profile-logout">

          <LogOut size={18} />

          <span>Logout</span>

        </button>

      </main>


      {/* ================= BOTTOM NAVIGATION ================= */}

      <nav className="profile-bottom-navigation">

        {/* HOME */}

        <button
          className="profile-bottom-item"
          onClick={() => navigate("/user")}
        >

          <Home size={21} />

          <span>Home</span>

        </button>


        {/* MAP */}

        <button
          className="profile-bottom-item"
          onClick={() => navigate("/user/map")}
        >

          <Map size={21} />

          <span>Map</span>

        </button>


        {/* ADD REPORT */}

        <button
          className="profile-add-button"
          onClick={() => navigate("/user/report")}
        >

          <Plus size={28} />

        </button>


        {/* REPORTS */}

        <button
          className="profile-bottom-item"
          onClick={() => navigate("/user/reports")}
        >

          <FileText size={21} />

          <span>Reports</span>

        </button>


        {/* PROFILE */}

        <button
          className="profile-bottom-item active"
        >

          <User size={21} />

          <span>Profile</span>

        </button>

      </nav>

    </div>
  );
}

export default Profile;