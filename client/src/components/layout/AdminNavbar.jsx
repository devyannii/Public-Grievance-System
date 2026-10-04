import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import "../../styles/AdminLayout.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <AdminSidebar />

      {/* RIGHT SIDE */}
      <div className="admin-main">

        {/* TOP NAVBAR */}
        <AdminNavbar />

        {/* PAGE CONTENT */}
        <main className="admin-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;