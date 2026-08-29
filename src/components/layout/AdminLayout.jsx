import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import "../../styles/AdminLayout.css";
import "../../styles/AdminSidebar.css";
import "../../styles/AdminNavbar.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">

      <AdminSidebar />

      <div className="admin-main">

        <AdminNavbar />

        <main className="admin-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;