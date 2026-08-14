import {
  Menu,
  Bell,
  ChevronDown,
} from "lucide-react";

import "../../styles/AdminNavbar.css";

function AdminNavbar() {
  return (
    <header className="admin-navbar">

      {/* Left */}
      <button className="navbar-menu-button" type="button">
        <Menu size={22} />
      </button>


      {/* Right */}
      <div className="navbar-right">

        {/* Notifications */}
        <button
          className="navbar-notification"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className="notification-count">
            3
          </span>
        </button>


        {/* Admin Profile */}
        <button
          className="navbar-profile"
          type="button"
        >

          <div className="navbar-avatar">
            <span>AU</span>
          </div>

          <div className="navbar-user-info">
            <strong>Admin User</strong>
            <span>Super Administrator</span>
          </div>

          <ChevronDown
            className="navbar-chevron"
            size={17}
          />

        </button>

      </div>

    </header>
  );
}

export default AdminNavbar;