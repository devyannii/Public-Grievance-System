import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      name: "Complaints",
      icon: ClipboardList,
      path: "/admin/complaints",
    },
    {
      name: "Categories",
      icon: Grid2X2,
      path: "/admin/categories",
    },
    {
      name: "Residents",
      icon: Users,
      path: "/admin/residents",
    },
    {
      name: "Departments",
      icon: Building2,
      path: "/admin/departments",
    },
    {
      name: "Reports",
      icon: BarChart3,
      path: "/admin/reports",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  return (
    <aside className="admin-sidebar">

      {/* =========================
          BRAND
      ========================= */}

      <div className="sidebar-brand">

        <div className="brand-icon">
          <Building2
            size={34}
            strokeWidth={1.7}
          />
        </div>

        <div className="brand-text">

          <h1>
            Grievance
          </h1>

          <span>
            Management System
          </span>

        </div>

      </div>


      {/* =========================
          NAVIGATION
      ========================= */}

      <nav className="sidebar-navigation">

        {navigationItems.map((item) => {

          const Icon = item.icon;

          const isActive =
            location.pathname === item.path;

          return (
            <button
              key={item.name}
              className={`sidebar-item ${
                isActive ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >

              <Icon size={19} />

              <span>
                {item.name}
              </span>

            </button>
          );

        })}

      </nav>


      {/* =========================
          BOTTOM ILLUSTRATION
      ========================= */}

      <div className="sidebar-illustration">

        <div className="illustration-overlay"></div>

      </div>


      {/* =========================
          ADMIN PROFILE
      ========================= */}

      <div className="sidebar-profile">

        <div className="profile-avatar">

          <Users size={19} />

        </div>

        <div className="profile-info">

          <strong>
            Admin User
          </strong>

          <span>
            Super Administrator
          </span>

        </div>

        <span className="profile-arrow">
          ⌄
        </span>

      </div>

    </aside>
  );
}

export default AdminSidebar;