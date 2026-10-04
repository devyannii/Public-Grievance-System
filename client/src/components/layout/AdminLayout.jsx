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
  Loader2,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";

import "../../styles/AdminLayout.css";

// CORRECT NOTIFICATION BELL IMPORT
import AdminNotificationBell from "../../pages/Admin/AdminNotificationBell";


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

  if (!name) {
    return "AU";
  }

  const parts =
    name
      .trim()
      .split(/\s+/);


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

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const profileRef =
    useRef(null);


  /* =======================================================
     PROFILE DROPDOWN
  ======================================================= */

  const [profileOpen, setProfileOpen] =
    useState(false);


  /* =======================================================
     ADMIN PROFILE
  ======================================================= */

  const [adminName, setAdminName] =
    useState("Admin User");

  const [adminEmail, setAdminEmail] =
    useState("");

  const [adminProfilePicture, setAdminProfilePicture] =
    useState("");


  /* =======================================================
     AUTH / LOADING
  ======================================================= */

  const [checkingAdmin, setCheckingAdmin] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);


  /* =======================================================
     CHECK ADMIN AUTHENTICATION
  ======================================================= */

  useEffect(() => {

    let mounted = true;


    /* -----------------------------------------------------
       LOAD ADMIN
    ----------------------------------------------------- */

    const loadAdmin = async () => {

      try {

        if (mounted) {
          setCheckingAdmin(true);
        }


        /* ===============================================
           GET CURRENT AUTH USER
        =============================================== */

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();


        console.log(
          "================================="
        );

        console.log(
          "ADMIN LAYOUT AUTH CHECK"
        );

        console.log(
          "AUTH USER ID:",
          user?.id
        );

        console.log(
          "AUTH USER EMAIL:",
          user?.email
        );

        console.log(
          "================================="
        );


        /* ===============================================
           AUTH ERROR
        =============================================== */

        if (userError) {

          console.error(
            "Could not get logged-in user:",
            userError
          );

          if (mounted) {
            setIsAdmin(false);
          }

          navigate(
            "/admin/login",
            {
              replace: true,
            }
          );

          return;

        }


        /* ===============================================
           NO USER
        =============================================== */

        if (!user) {

          console.warn(
            "No authenticated user found."
          );

          if (mounted) {
            setIsAdmin(false);
          }

          navigate(
            "/admin/login",
            {
              replace: true,
            }
          );

          return;

        }


        /* ===============================================
           LOAD PROFILE
        =============================================== */

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select(`
              id,
              full_name,
              profile_picture,
              role
            `)
            .eq(
              "id",
              user.id
            )
            .maybeSingle();


        console.log(
          "================================="
        );

        console.log(
          "ADMIN PROFILE CHECK"
        );

        console.log(
          "PROFILE:",
          profile
        );

        console.log(
          "PROFILE ROLE:",
          profile?.role
        );

        console.log(
          "PROFILE ERROR:",
          profileError
        );

        console.log(
          "================================="
        );


        /* ===============================================
           PROFILE ERROR
        =============================================== */

        if (profileError) {

          console.error(
            "Could not load user profile:",
            profileError
          );

          if (mounted) {
            setIsAdmin(false);
          }

          navigate(
            "/admin/login",
            {
              replace: true,
            }
          );

          return;

        }


        /* ===============================================
           PROFILE DOES NOT EXIST
        =============================================== */

        if (!profile) {

          console.warn(
            "No profile found for authenticated user."
          );

          if (mounted) {
            setIsAdmin(false);
          }

          navigate(
            "/admin/login",
            {
              replace: true,
            }
          );

          return;

        }


        /* ===============================================
           CHECK ROLE
        =============================================== */

        if (profile.role !== "admin") {

          console.warn(
            "Unauthorized admin access attempt."
          );

          console.warn(
            "User role:",
            profile.role
          );

          console.warn(
            "User email:",
            user.email
          );


          if (mounted) {
            setIsAdmin(false);
          }


          /*
             This is important.

             A resident account should NEVER be allowed
             to render the admin dashboard.
          */

          navigate(
            "/admin/login",
            {
              replace: true,
            }
          );

          return;

        }


        /* ===============================================
           ADMIN CONFIRMED
        =============================================== */

        console.log(
          "ADMIN ACCESS CONFIRMED"
        );


        if (!mounted) {
          return;
        }


        setIsAdmin(true);


        /* ===============================================
           EMAIL
        =============================================== */

        setAdminEmail(
          user.email || ""
        );


        /* ===============================================
           PROFILE PICTURE
        =============================================== */

        setAdminProfilePicture(
          profile.profile_picture || ""
        );


        /* ===============================================
           NAME
        =============================================== */

        const nameFromProfile =
          profile.full_name;


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


        setAdminName(
          finalName
        );


      } catch (error) {

        console.error(
          "Admin authentication error:",
          error
        );


        if (mounted) {
          setIsAdmin(false);
        }


        navigate(
          "/admin/login",
          {
            replace: true,
          }
        );


      } finally {

        if (mounted) {
          setCheckingAdmin(false);
        }

      }

    };


    /* -----------------------------------------------------
       INITIAL CHECK
    ----------------------------------------------------- */

    loadAdmin();


    /* -----------------------------------------------------
       AUTH STATE LISTENER
    ----------------------------------------------------- */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {

          console.log(
            "ADMIN AUTH EVENT:",
            event
          );


          /*
             If the user signs out, immediately leave
             the admin section.
          */

          if (
            event === "SIGNED_OUT" ||
            !session?.user
          ) {

            if (mounted) {

              setIsAdmin(false);

              setAdminName(
                "Admin User"
              );

              setAdminEmail(
                ""
              );

              setAdminProfilePicture(
                ""
              );

            }


            navigate(
              "/admin/login",
              {
                replace: true,
              }
            );

            return;

          }


          /*
             Don't reload everything for every token
             refresh. The initial load already verified
             the admin profile.
          */

          if (
            event === "INITIAL_SESSION"
          ) {
            return;
          }

        }
      );


    /* -----------------------------------------------------
       CLEANUP
    ----------------------------------------------------- */

    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, [navigate]);


  /* =======================================================
     CLOSE PROFILE WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {

          setProfileOpen(
            false
          );

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

  const handleLogout =
    async () => {

      if (loggingOut) {
        return;
      }


      try {

        setLoggingOut(true);


        const {
          error,
        } =
          await supabase.auth.signOut();


        if (error) {
          throw error;
        }


        setProfileOpen(
          false
        );


        setIsAdmin(
          false
        );


        navigate(
          "/admin/login",
          {
            replace: true,
          }
        );


      } catch (error) {

        console.error(
          "Logout failed:",
          error
        );


        alert(
          "Unable to logout. Please try again."
        );


      } finally {

        setLoggingOut(
          false
        );

      }

    };


  /* =======================================================
     INITIALS
  ======================================================= */

  const initials =
    getInitials(
      adminName
    );


  /* =======================================================
     ACTIVE SIDEBAR ITEM
  ======================================================= */

  const isActive =
    (path) => {

      if (
        path ===
        "/admin/dashboard"
      ) {

        return (
          location.pathname ===
          path
        );

      }


      return (
        location.pathname ===
          path ||
        location.pathname.startsWith(
          `${path}/`
        )
      );

    };


  /* =======================================================
     AUTH LOADING SCREEN
  ======================================================= */

  if (checkingAdmin) {

    return (

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5faf7",
          fontFamily:
            '"Inter", Arial, sans-serif',
          color: "#168b47",
        }}
      >

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >

          <Loader2
            size={30}
            style={{
              animation:
                "adminAuthSpin 1s linear infinite",
            }}
          />

          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Checking administrator access...
          </span>

        </div>


        <style>
          {`
            @keyframes adminAuthSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>

      </div>

    );

  }


  /* =======================================================
     DO NOT RENDER ADMIN CONTENT IF NOT ADMIN
  ======================================================= */

  if (!isAdmin) {

    return null;

  }


  /* =======================================================
     RENDER ADMIN LAYOUT
  ======================================================= */

  return (

    <div className="admin-layout">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">


        {/* =================================================
            BRAND
        ================================================= */}

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


          {/* DASHBOARD */}

          <button
            type="button"
            className={`admin-nav-item ${
              isActive(
                "/admin/dashboard"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
          >

            <span className="admin-nav-icon">

              <LayoutDashboard
                size={18}
                strokeWidth={1.8}
              />

            </span>


            <span>
              Dashboard
            </span>


            <span className="admin-nav-arrow">
              ›
            </span>

          </button>


          {/* COMPLAINTS */}

          <button
            type="button"
            className={`admin-nav-item ${
              isActive(
                "/admin/complaints"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/admin/complaints"
              )
            }
          >

            <span className="admin-nav-icon">

              <ClipboardList
                size={18}
                strokeWidth={1.8}
              />

            </span>


            <span>
              Complaints
            </span>


            <span className="admin-nav-arrow">
              ›
            </span>

          </button>


          {/* CATEGORIES */}

          <button
            type="button"
            className={`admin-nav-item ${
              isActive(
                "/admin/categories"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/admin/categories"
              )
            }
          >

            <span className="admin-nav-icon">

              <Grid2x2
                size={18}
                strokeWidth={1.8}
              />

            </span>


            <span>
              Categories
            </span>


            <span className="admin-nav-arrow">
              ›
            </span>

          </button>


          {/* RESIDENTS */}

          <button
            type="button"
            className={`admin-nav-item ${
              isActive(
                "/admin/residents"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/admin/residents"
              )
            }
          >

            <span className="admin-nav-icon">

              <UsersRound
                size={18}
                strokeWidth={1.8}
              />

            </span>


            <span>
              Residents
            </span>


            <span className="admin-nav-arrow">
              ›
            </span>

          </button>


          {/* DEPARTMENTS */}

          <button
            type="button"
            className={`admin-nav-item ${
              isActive(
                "/admin/departments"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/admin/departments"
              )
            }
          >

            <span className="admin-nav-icon">

              <Building2
                size={18}
                strokeWidth={1.8}
              />

            </span>


            <span>
              Departments
            </span>


            <span className="admin-nav-arrow">
              ›
            </span>

          </button>


          {/* REPORTS */}

          <button
            type="button"
            className={`admin-nav-item ${
              isActive(
                "/admin/reports"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/admin/reports"
              )
            }
          >

            <span className="admin-nav-icon">

              <BarChart3
                size={18}
                strokeWidth={1.8}
              />

            </span>


            <span>
              Reports
            </span>


            <span className="admin-nav-arrow">
              ›
            </span>

          </button>


          {/* MAP VIEW */}

          <button
            type="button"
            className={`admin-nav-item ${
              isActive(
                "/admin/map"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/admin/map"
              )
            }
          >

            <span className="admin-nav-icon">

              <Map
                size={18}
                strokeWidth={1.8}
              />

            </span>


            <span>
              Map View
            </span>


            <span className="admin-nav-arrow">
              ›
            </span>

          </button>


          {/* SETTINGS */}

          <button
            type="button"
            className={`admin-nav-item ${
              isActive(
                "/admin/settings"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(
                "/admin/settings"
              )
            }
          >

            <span className="admin-nav-icon">

              <Settings
                size={18}
                strokeWidth={1.8}
              />

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


          {/* LEFT */}

          <div className="admin-navbar-left">
          </div>


          {/* RIGHT */}

          <div className="admin-navbar-right">


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <AdminNotificationBell />


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
                    (previous) =>
                      !previous
                  )
                }
                aria-expanded={
                  profileOpen
                }
                aria-haspopup="true"
              >


                {/* AVATAR */}

                <div className="admin-avatar">

                  {adminProfilePicture ? (

                    <img
                      src={
                        adminProfilePicture
                      }
                      alt="Admin"
                    />

                  ) : (

                    initials

                  )}

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

                      {adminProfilePicture ? (

                        <img
                          src={
                            adminProfilePicture
                          }
                          alt="Admin"
                        />

                      ) : (

                        initials

                      )}

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


                  {/* LOGOUT */}

                  <button
                    type="button"
                    className="admin-logout-button"
                    onClick={
                      handleLogout
                    }
                    disabled={
                      loggingOut
                    }
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