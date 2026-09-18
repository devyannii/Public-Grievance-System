import React from "react";
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ClipboardList,
  Grid2X2,
  UsersRound,
  Building2,
  BarChart3,
  Map,
  Settings,
  ChevronRight,
  UserRound,
  ChevronDown,
  Leaf,
} from "lucide-react";

import landscapeImage from "../../assets/images/admin-landscape.png.png";

import "../../styles/AdminSidebar.css";


function AdminSidebar() {

  const navigation = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Complaints",
      path: "/admin/complaints",
      icon: ClipboardList,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Grid2X2,
    },
    {
      name: "Residents",
      path: "/admin/residents",
      icon: UsersRound,
    },
    {
      name: "Departments",
      path: "/admin/departments",
      icon: Building2,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: BarChart3,
    },
    {
      name: "Map View",
      path: "/admin/map",
      icon: Map,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];


  return (
    <aside className="admin-sidebar">

      {/* =====================================
          BRAND
      ===================================== */}

      <div className="sidebar-brand">

        <div className="brand-icon">
          <Building2
            size={40}
            strokeWidth={1.8}
          />
        </div>

        <h1>Grievance</h1>

        <p>Management System</p>


        {/* Small nature divider */}

        <div className="brand-divider">

          <span></span>

          <Leaf
            size={14}
            strokeWidth={1.8}
          />

          <span></span>

        </div>

      </div>


      {/* =====================================
          NAVIGATION
      ===================================== */}

      <nav className="sidebar-navigation">

        {navigation.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >

              <div className="sidebar-link-left">

                <div className="sidebar-icon">

                  <Icon
                    size={19}
                    strokeWidth={1.8}
                  />

                </div>

                <span>{item.name}</span>

              </div>


              <ChevronRight
                className="sidebar-arrow"
                size={16}
                strokeWidth={1.8}
              />

            </NavLink>
          );

        })}

      </nav>


      {/* =====================================
          LOWER LANDSCAPE
      ===================================== */}

      <div className="sidebar-bottom">

        {/* Uses YOUR existing image */}

        <div
          className="sidebar-landscape"
          style={{
            backgroundImage: `url(${landscapeImage})`,
          }}
        ></div>

      </div>

    </aside>
  );
}


export default AdminSidebar;