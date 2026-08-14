import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* =========================
   USER PAGES
========================= */

import UserLanding from "./pages/User/UserLanding";
import MyReports from "./pages/User/MyReports";
import ReportIssue from "./pages/User/ReportIssue";
import IssueDetails from "./pages/User/IssueDetails";
import MapView from "./pages/User/MapView";
import Profile from "./pages/User/Profile";
import UserDashboard from "./pages/User/UserDashboard";

/* =========================
   AUTH PAGES
========================= */

import UserLogin from "./pages/Auth/UserLogin";
import UserRegister from "./pages/Auth/UserRegister";

/* =========================
   ADMIN PAGES
========================= */

import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            USER
        ================================================= */}

        {/* User Landing */}
        <Route
          path="/"
          element={<UserLanding />}
        />

        <Route
          path="/user"
          element={<UserLanding />}
        />


        {/* =================================================
            USER AUTHENTICATION
        ================================================= */}

        {/* User Login */}
        <Route
          path="/user/login"
          element={<UserLogin />}
        />

        {/* User Register */}
        <Route
          path="/user/register"
          element={<UserRegister />}
        />


        {/* =================================================
            USER DASHBOARD
        ================================================= */}

        <Route
          path="/user/dashboard"
          element={<UserDashboard />}
        />


        {/* =================================================
            USER REPORTS
        ================================================= */}

        <Route
          path="/user/reports"
          element={<MyReports />}
        />

        {/* Report an Issue */}
        <Route
          path="/user/report"
          element={<ReportIssue />}
        />

        {/* Issue Details */}
        <Route
          path="/user/issue/:id"
          element={<IssueDetails />}
        />


        {/* =================================================
            USER MAP
        ================================================= */}

        <Route
          path="/user/map"
          element={<MapView />}
        />


        {/* =================================================
            USER PROFILE
        ================================================= */}

        <Route
          path="/user/profile"
          element={<Profile />}
        />


        {/* =================================================
            ADMIN
        ================================================= */}

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

      </Routes>

    </BrowserRouter>
  );
}

export default App;