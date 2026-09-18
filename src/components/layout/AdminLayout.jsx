import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BarChart3,
  Building2,
  ChevronDown,
  ClipboardList,
  Grid2x2,
  LayoutDashboard,
  LogOut,
  Map,
  Settings,
  UsersRound,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";
import "../../styles/AdminLayout.css";


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {
  if (!name) return "AU";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`
    .toUpperCase();
}


/* =========================================================
   ADMIN LAYOUT
========================================================= */

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [adminName, setAdminName] =
    useState("Admin User");

  const [adminEmail, setAdminEmail] =
    useState("");

  const [loggingOut, setLoggingOut] =
    useState(false);


  /* =======================================================
     LOAD LOGGED-IN ADMIN
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "Could not get logged-in admin:",
            userError
          );
          return;
        }

        if (!user || !mounted) {
          return;
        }

        setAdminEmail(user.email || "");


        /* -----------------------------------------------
           GET NAME FROM PROFILES
        ------------------------------------------------ */

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.warn(
            "Could not load admin profile:",
            profileError
          );
        }


        /* -----------------------------------------------
           FALLBACKS
        ------------------------------------------------ */

        const nameFromProfile =
          profile?.full_name;

        const nameFromMetadata =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.display_name;

        const fallbackName =
          user.email?.split("@")[0] ||
          "Admin User";


        const finalName =
          nameFromProfile ||
          nameFromMetadata ||
          fallbackName;


        if (mounted) {
          setAdminName(finalName);
        }

      } catch (error) {
        console.error(
          "Admin profile loading error:",
          error
        );
      }
    };


    loadAdmin();


    return () => {
      mounted = false;
    };

  }, []);


  /* =======================================================
     CLOSE PROFILE WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }

    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {

    if (loggingOut) {
      return;
    }

    try {

      setLoggingOut(true);


      const { error } =
        await supabase.auth.signOut();


      if (error) {
        throw error;
      }


      setProfileOpen(false);


      navigate("/admin/login", {
        replace: true,
      });

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

      alert(
        "Unable to logout. Please try again."
      );

    } finally {

      setLoggingOut(false);

    }

  };


  const initials =
    getInitials(adminName);

  /* =======================================================
     ACTIVE SIDEBAR ITEM
  ======================================================= */

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };


  return (
    <div className="admin-layout">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">


        {/* BRAND */}

        <div className="admin-sidebar-brand">

          <div className="admin-logo">
            <Building2
              size={38}
              strokeWidth={2.2}
            />
          </div>

          <h2>
            Grievance
          </h2>

          <span>
            Management System
          </span>

          <div className="admin-brand-line">
            <span></span>
          </div>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="admin-sidebar-nav">


          <button
            type="button"
            className={`admin-nav-item ${
              isActive("/admin/dashboard") ? "active" : ""
            }`}
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <span className="admin-nav-icon">
              <LayoutDashboard size={18} strokeWidth={1.8} />
            </span>

            <span>
              Dashboard
            </span>

            <span className="admin-nav-arrow">
              ›
            </span>
          </button>


          <button
            type="button"
            className={`admin-nav-item ${
              isActive("/admin/complaints") ? "active" : ""
            }`}
            onClick={() =>
              navigate("/admin/complaints")
            }
          >
            <span className="admin-nav-icon">
              <ClipboardList size={18} strokeWidth={1.8} />
            </span>

            <span>
              Complaints
            </span>

            <span className="admin-nav-arrow">
              ›
            </span>
          </button>


          <button
            type="button"
            className={`admin-nav-item ${
              isActive("/admin/categories") ? "active" : ""
            }`}
            onClick={() =>
              navigate("/admin/categories")
            }
          >
            <span className="admin-nav-icon">
              <Grid2x2 size={18} strokeWidth={1.8} />
            </span>

            <span>
              Categories
            </span>

            <span className="admin-nav-arrow">
              ›
            </span>
          </button>


          <button
            type="button"
            className={`admin-nav-item ${
              isActive("/admin/residents") ? "active" : ""
            }`}
          
            onClick={() =>
              navigate("/admin/residents")
            }
          >
            <span className="admin-nav-icon">
              <UsersRound size={18} strokeWidth={1.8} />
            </span>

            <span>
              Residents
            </span>

            <span className="admin-nav-arrow">
              ›
            </span>
          </button>


          <button
            type="button"
            className={`admin-nav-item ${
              isActive("/admin/departments") ? "active" : ""
            }`}
          
            onClick={() =>
              navigate("/admin/departments")
            }
          >
            <span className="admin-nav-icon">
              <Building2 size={18} strokeWidth={1.8} />
            </span>

            <span>
              Departments
            </span>

            <span className="admin-nav-arrow">
              ›
            </span>
          </button>


          <button
            type="button"
            className={`admin-nav-item ${
              isActive("/admin/reports") ? "active" : ""
            }`}
          
            onClick={() =>
              navigate("/admin/reports")
            }
          >
            <span className="admin-nav-icon">
              <BarChart3 size={18} strokeWidth={1.8} />
            </span>

            <span>
              Reports
            </span>

            <span className="admin-nav-arrow">
              ›
            </span>
          </button>


          <button
            type="button"
            className={`admin-nav-item ${
              isActive("/admin/map") ? "active" : ""
            }`}
            onClick={() =>
              navigate("/admin/map")
            }
          >
            <span className="admin-nav-icon">
              <Map size={18} strokeWidth={1.8} />
            </span>

            <span>
              Map View
            </span>

            <span className="admin-nav-arrow">
              ›
            </span>
          </button>


          <button
            type="button"
            className={`admin-nav-item ${
              isActive("/admin/settings") ? "active" : ""
            }`}
          
            onClick={() =>
              navigate("/admin/settings")
            }
          >
            <span className="admin-nav-icon">
              <Settings size={18} strokeWidth={1.8} />
            </span>

            <span>
              Settings
            </span>

            <span className="admin-nav-arrow">
              ›
            </span>
          </button>


        </nav>


        {/* =================================================
            LANDSCAPE
        ================================================= */}

        <div className="admin-sidebar-landscape" />


      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">


        {/* =================================================
            TOP NAVBAR
        ================================================= */}

        <header className="admin-navbar">


          {/* LEFT SIDE IS INTENTIONALLY EMPTY
              Hamburger removed
          */}

          <div className="admin-navbar-left">
          </div>


          {/* RIGHT SIDE */}

          <div className="admin-navbar-right">


            {/* =================================================
                PROFILE
            ================================================= */}

            <div
              className="admin-profile-wrapper"
              ref={profileRef}
            >


              <button
                type="button"
                className="admin-profile-button"
                onClick={() =>
                  setProfileOpen(
                    (previous) => !previous
                  )
                }
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >


                {/* AVATAR */}

                <div className="admin-avatar">
                  {initials}
                </div>


                {/* NAME */}

                <div className="admin-profile-info">

                  <strong>
                    {adminName}
                  </strong>

                  <span>
                    Super Administrator
                  </span>

                </div>


                {/* CHEVRON */}

                <ChevronDown
                  size={17}
                  className={
                    `admin-profile-chevron ${
                      profileOpen
                        ? "open"
                        : ""
                    }`
                  }
                />

              </button>


              {/* =================================================
                  DROPDOWN
              ================================================= */}

              {profileOpen && (

                <div
                  className="admin-profile-dropdown"
                  role="menu"
                >


                  <div className="admin-dropdown-user">


                    <div className="admin-dropdown-avatar">
                      {initials}
                    </div>


                    <div>

                      <strong>
                        {adminName}
                      </strong>

                      <span>
                        {adminEmail ||
                          "Administrator"}
                      </span>

                    </div>


                  </div>


                  <div className="admin-dropdown-divider" />


                  <button
                    type="button"
                    className="admin-logout-button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    role="menuitem"
                  >

                    <LogOut
                      size={17}
                    />

                    <span>
                      {loggingOut
                        ? "Logging out..."
                        : "Logout"}
                    </span>

                  </button>


                </div>

              )}

            </div>

          </div>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="admin-content">
          {children}
        </div>


      </main>

    </div>
  );
}


export default AdminLayout;