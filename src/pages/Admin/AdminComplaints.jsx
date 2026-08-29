import React from "react";

import {
  LayoutDashboard,
  ClipboardList,
  Grid2X2,
  Users,
  Building2,
  BarChart3,
  Settings,
} from "lucide-react";

import "../../styles/AdminSidebar.css";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">

      {/* BRAND */}
      <div className="sidebar-brand">

        <div className="brand-icon">
          <Building2 size={34} strokeWidth={1.8} />
        </div>

        <div className="brand-text">
          <h1>Grievance</h1>
          <span>Management System</span>
        </div>

      </div>


      {/* NAVIGATION */}
      <nav className="sidebar-navigation">

        <button className="sidebar-item">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>


        <button className="sidebar-item active">
          <ClipboardList size={19} />
          <span>Complaints</span>
        </button>


        <button className="sidebar-item">
          <Grid2X2 size={19} />
          <span>Categories</span>
        </button>


        <button className="sidebar-item">
          <Users size={19} />
          <span>Residents</span>
        </button>


        <button className="sidebar-item">
          <Building2 size={19} />
          <span>Departments</span>
        </button>


        <button className="sidebar-item">
          <BarChart3 size={19} />
          <span>Reports</span>
        </button>


        <button className="sidebar-item">
          <Settings size={19} />
          <span>Settings</span>
        </button>

      </nav>


      {/* ILLUSTRATION */}
      <div className="sidebar-illustration">
        <div className="illustration-overlay"></div>
      </div>


      {/* ADMIN PROFILE */}
      <div className="sidebar-profile">

        <div className="profile-avatar">
          <Users size={19} />
        </div>

        <div className="profile-info">
          <strong>Admin User</strong>
          <span>Super Administrator</span>
        </div>

        <span className="profile-arrow">
          ⌄
        </span>

      </div>

    </aside>
  );
}

export default AdminSidebar;