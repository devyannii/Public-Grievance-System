import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, ClipboardList, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./StaffNotifications.css";

function StaffNotifications({ complaints = [] }) {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("staff_read_notifications") || "[]"
      );
    } catch {
      return [];
    }
  });

  const notificationRef = useRef(null);

  const notifications = useMemo(() => {
    return complaints
      .filter((complaint) => complaint.id)
      .slice(0, 20)
      .map((complaint) => ({
        id: complaint.id,
        complaint_id: complaint.id,
        title: "Complaint Assigned",
        message: complaint.title || "A complaint has been assigned to your department.",
        created_at:
          complaint.assigned_at ||
          complaint.created_at,
        complaint_code:
          complaint.complaint_code ||
          `#${complaint.id}`,
      }));
  }, [complaints]);

  const unreadCount = notifications.filter(
    (notification) => !readIds.includes(notification.id)
  ).length;

  useEffect(() => {
    localStorage.setItem(
      "staff_read_notifications",
      JSON.stringify(readIds)
    );
  }, [readIds]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const markAsRead = (id) => {
    setReadIds((previous) => {
      if (previous.includes(id)) {
        return previous;
      }

      return [...previous, id];
    });
  };

  const markAllAsRead = () => {
    setReadIds((previous) => [
      ...new Set([
        ...previous,
        ...notifications.map(
          (notification) => notification.id
        ),
      ]),
    ]);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setOpen(false);

    navigate(
      `/staff/complaint/${notification.complaint_id}`
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const difference = Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      return `${Math.floor(difference / 60)}m ago`;
    }

    if (difference < 86400) {
      return `${Math.floor(difference / 3600)}h ago`;
    }

    if (difference < 604800) {
      return `${Math.floor(difference / 86400)}d ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div
      className="staff-notification-wrapper"
      ref={notificationRef}
    >
      <button
        type="button"
        className={`staff-notification-button ${
          open ? "active" : ""
        }`}
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="staff-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="staff-notification-dropdown">

          <div className="staff-notification-header">
            <div>
              <h3>Notifications</h3>

              <span>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </span>
            </div>

            <button
              type="button"
              className="staff-notification-close"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {unreadCount > 0 && (
            <div className="staff-notification-actions">
              <button
                type="button"
                onClick={markAllAsRead}
              >
                <CheckCheck size={15} />
                Mark all as read
              </button>
            </div>
          )}

          <div className="staff-notification-list">

            {notifications.length === 0 ? (
              <div className="staff-notification-empty">

                <div className="staff-notification-empty-icon">
                  <Bell size={24} />
                </div>

                <strong>
                  No notifications yet
                </strong>

                <span>
                  New complaints assigned to your
                  department will appear here.
                </span>

              </div>
            ) : (
              notifications.map((notification) => {
                const isRead = readIds.includes(
                  notification.id
                );

                return (
                  <button
                    type="button"
                    key={notification.id}
                    className={`staff-notification-item ${
                      isRead ? "read" : "unread"
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >

                    <div className="staff-notification-item-icon">
                      <ClipboardList size={17} />
                    </div>

                    <div className="staff-notification-item-content">

                      <div className="staff-notification-item-top">

                        <strong>
                          {notification.title}
                        </strong>

                        {!isRead && (
                          <span className="staff-unread-dot" />
                        )}

                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <div className="staff-notification-meta">
                        <span>
                          {notification.complaint_code}
                        </span>

                        <span>
                          {formatTime(
                            notification.created_at
                          )}
                        </span>
                      </div>

                    </div>

                  </button>
                );
              })
            )}

          </div>

        </div>
      )}
    </div>
  );
}

export default StaffNotifications;