import React, {
  useEffect,
  useState,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { supabase } from "./lib/supabaseClient";


/* =========================================================
   PUBLIC LANDING PAGE
========================================================= */

import LandingPage from "./pages/LandingPage";


/* =========================================================
   USER / RESIDENT PAGES
========================================================= */

import UserLogin from "./pages/Auth/UserLogin";
import UserRegister from "./pages/Auth/UserRegister";
import ResetPassword from "./pages/Auth/ResetPassword";

import UserLanding from "./pages/User/UserLanding";
import UserDashboard from "./pages/User/UserDashboard";
import MyReports from "./pages/User/MyReports";
import ReportIssue from "./pages/User/ReportIssue";
import IssueDetails from "./pages/User/IssueDetails";
import MapView from "./pages/User/MapView";
import Profile from "./pages/User/Profile";
import TrackIssue from "./pages/User/TrackIssue";
import Notifications from "./pages/User/Notifications";


/* =========================================================
   ADMIN PAGES
========================================================= */

import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminComplaints from "./pages/Admin/AdminComplaints";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminResidents from "./pages/Admin/AdminResidents";
import AdminDepartments from "./pages/Admin/AdminDepartments";
import AdminReports from "./pages/Admin/AdminReports";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminMapView from "./pages/Admin/AdminMapView";


/* =========================================================
   STAFF PAGES
========================================================= */

import StaffLogin from "./pages/Staff/StaffLogin";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import StaffComplaintDetails from "./pages/Staff/StaffComplaintDetails";
import StaffProfile from "./pages/Staff/StaffProfile";


/* =========================================================
   USER AUTH GUARD
========================================================= */

function RequireUserAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setAuthenticated(!!session);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error checking user session:",
          error
        );

        if (!mounted) return;

        setAuthenticated(false);
        setLoading(false);
      }
    };

    checkSession();


    /* =====================================================
       LISTEN FOR LOGIN / LOGOUT CHANGES
    ===================================================== */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setAuthenticated(!!session);
        setLoading(false);
      }
    );


    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);


  /* =======================================================
     CHECKING SESSION
  ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#188442",
          fontFamily:
            '"Inter", Arial, sans-serif',
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        Checking account...
      </div>
    );
  }


  /* =======================================================
     NOT LOGGED IN
  ======================================================= */

  if (!authenticated) {
    return (
      <Navigate
        to="/user/login"
        replace
      />
    );
  }


  /* =======================================================
     LOGGED IN
  ======================================================= */

  return children;
}


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>


        {/* =====================================================
            PUBLIC LANDING PAGE
        ===================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />


        {/* =====================================================
            USER / RESIDENT
        ===================================================== */}

        {/* User landing / home */}

        <Route
          path="/user"
          element={
            <RequireUserAuth>
              <UserLanding />
            </RequireUserAuth>
          }
        />


        {/* User login */}

        <Route
          path="/user/login"
          element={<UserLogin />}
        />


        {/* User registration */}

        <Route
          path="/user/register"
          element={<UserRegister />}
        />


        {/* Password reset */}

        <Route
          path="/user/reset-password"
          element={<ResetPassword />}
        />


        {/* User dashboard */}

        <Route
          path="/user/dashboard"
          element={
            <RequireUserAuth>
              <UserDashboard />
            </RequireUserAuth>
          }
        />


        {/* My Reports */}

        <Route
          path="/user/reports"
          element={
            <RequireUserAuth>
              <MyReports />
            </RequireUserAuth>
          }
        />


        {/* Report an Issue */}

        <Route
          path="/user/report"
          element={
            <RequireUserAuth>
              <ReportIssue />
            </RequireUserAuth>
          }
        />


        {/* Individual Complaint */}

        <Route
          path="/user/issue/:id"
          element={
            <RequireUserAuth>
              <IssueDetails />
            </RequireUserAuth>
          }
        />


        {/* Resident Map */}

        <Route
          path="/user/map"
          element={
            <RequireUserAuth>
              <MapView />
            </RequireUserAuth>
          }
        />


        {/* Resident Profile */}

        <Route
          path="/user/profile"
          element={
            <RequireUserAuth>
              <Profile />
            </RequireUserAuth>
          }
        />


        {/* =====================================================
            USER NOTIFICATIONS
        ===================================================== */}

        <Route
          path="/user/notifications"
          element={
            <RequireUserAuth>
              <Notifications />
            </RequireUserAuth>
          }
        />


        {/* =====================================================
            COMPLAINT ID TRACKING
        ===================================================== */}

        <Route
          path="/user/track"
          element={
            <RequireUserAuth>
              <TrackIssue />
            </RequireUserAuth>
          }
        />


        {/* =====================================================
            ADMIN
        ===================================================== */}

        {/* Admin Login */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* Admin Dashboard */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />


        {/* Admin Complaints */}

        <Route
          path="/admin/complaints"
          element={<AdminComplaints />}
        />


        {/* Admin Categories */}

        <Route
          path="/admin/categories"
          element={<AdminCategories />}
        />


        {/* Admin Residents */}

        <Route
          path="/admin/residents"
          element={<AdminResidents />}
        />


        {/* Admin Departments */}

        <Route
          path="/admin/departments"
          element={<AdminDepartments />}
        />


        {/* Admin Reports */}

        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />


        {/* Admin Notifications */}

        <Route
          path="/admin/notifications"
          element={<AdminNotifications />}
        />


        {/* Admin Settings */}

        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />


        {/* Admin Map */}

        <Route
          path="/admin/map"
          element={<AdminMapView />}
        />


        {/* =====================================================
            DEPARTMENT STAFF
        ===================================================== */}

        {/* Staff Login */}

        <Route
          path="/staff/login"
          element={<StaffLogin />}
        />


        {/* Staff Dashboard */}

        <Route
          path="/staff/dashboard"
          element={<StaffDashboard />}
        />


        {/* Staff Complaint Details */}

        <Route
          path="/staff/complaint/:id"
          element={<StaffComplaintDetails />}
        />


        {/* Staff Profile */}

        <Route
          path="/staff/profile"
          element={<StaffProfile />}
        />


      </Routes>

    </BrowserRouter>
  );
}


export default App;