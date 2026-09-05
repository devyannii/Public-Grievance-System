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

/* =========================
   USER AUTH
========================= */

import UserLogin from "./pages/Auth/UserLogin";
import UserRegister from "./pages/Auth/UserRegister";

/* =========================
   ADMIN PAGES
========================= */

import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminComplaints from "./pages/Admin/AdminComplaints";
import AdminCategories from "./pages/Admin/AdminCategories";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            USER
        ========================= */}

        <Route
          path="/"
          element={<UserLanding />}
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


        {/* =========================
            ADMIN LOGIN
        ========================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* =========================
            ADMIN DASHBOARD
        ========================= */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />


        {/* =========================
            ADMIN COMPLAINTS
        ========================= */}

        {/* All complaints */}
        <Route
          path="/admin/complaints"
          element={<AdminComplaints />}
        />

        {/* Individual complaint */}
        <Route
          path="/admin/complaints/:id"
          element={<AdminComplaints />}
        />

      
        {/* =========================
         ADMIN CATEGORIES
        ========================= */}

        <Route
          path="/admin/categories"
          element={<AdminCategories />}
        />
      
        {/* =========================
            ADMIN MAP
        ========================= */}

        <Route
          path="/admin/map"
          element={<MapView />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;