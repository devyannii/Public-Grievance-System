import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* =========================================================
   USER
========================================================= */

import UserLanding from "./pages/User/UserLanding";
import MyReports from "./pages/User/MyReports";
import IssueDetails from "./pages/User/IssueDetails";
import MapView from "./pages/User/MapView";
import Profile from "./pages/User/Profile";
import ReportIssue from "./pages/User/ReportIssue";

/* =========================================================
   USER AUTH
========================================================= */

import UserLogin from "./pages/Auth/UserLogin";
import UserRegister from "./pages/Auth/UserRegister";
import ResetPassword from "./pages/Auth/ResetPassword";

/* =========================================================
   ADMIN
========================================================= */

import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminComplaints from "./pages/Admin/AdminComplaints";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminDepartments from "./pages/Admin/AdminDepartments";
import AdminResidents from "./pages/Admin/AdminResidents";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminMapView from "./pages/Admin/AdminMapView";
import AdminReports from "./pages/Admin/AdminReports";

/* =========================================================
   STAFF
========================================================= */

import StaffLogin from "./pages/Staff/StaffLogin";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import StaffComplaintDetails from "./pages/Staff/StaffComplaintDetails";
import StaffProfile from "./pages/Staff/StaffProfile";

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ===================================================
            USER ROUTES
        =================================================== */}

        <Route
          path="/"
          element={<UserLogin />}
        />

        <Route
          path="/user"
          element={<UserLanding />}
        />

        <Route
          path="/user/login"
          element={<UserLogin />}
        />

        <Route
          path="/user/register"
          element={<UserRegister />}
        />

        <Route
          path="/user/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/user/reports"
          element={<MyReports />}
        />

        <Route
          path="/user/report"
          element={<ReportIssue />}
        />

        <Route
          path="/user/issue/:id"
          element={<IssueDetails />}
        />

        <Route
          path="/user/map"
          element={<MapView />}
        />

        <Route
          path="/user/profile"
          element={<Profile />}
        />

        {/* ===================================================
            ADMIN ROUTES
        =================================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/complaints"
          element={<AdminComplaints />}
        />

        <Route
          path="/admin/categories"
          element={<AdminCategories />}
        />

        <Route
          path="/admin/residents"
          element={<AdminResidents />}
        />

        <Route
          path="/admin/departments"
          element={<AdminDepartments />}
        />

        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />

        <Route
          path="/admin/notifications"
          element={<AdminNotifications />}
        />

        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />

        <Route
          path="/admin/map"
          element={<AdminMapView />}
        />

        {/* ===================================================
            STAFF ROUTES
        =================================================== */}

        <Route
          path="/staff/login"
          element={<StaffLogin />}
        />

        <Route
          path="/staff/dashboard"
          element={<StaffDashboard />}
        />

        <Route
          path="/staff/complaint/:id"
          element={<StaffComplaintDetails />}
        />

        <Route
          path="/staff/profile"
          element={<StaffProfile />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;