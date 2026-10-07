import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  CheckCheck,
  ClipboardCheck,
  Clock3,
  MessageCircle,
  Sparkles,
  AlertCircle,
  Home,
  Map,
  Plus,
  FileText,
  User,
  Check,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import "../../styles/Notifications.css";
import "../../styles/Profile.css";

function Notifications() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const loadNotifications = async (currentUser) => {
    if (!currentUser) return;

    try {
      setError("");

      const {
        data,
        error: notificationError,
      } = await supabase
        .from("notifications")
        .select(`
          id,
          complaint_id,
          title,
          message,
          type,
          is_read,
          created_at
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", {
          ascending: false,
        });

      if (notificationError) {
        console.error(
          "Notification loading error:",
          notificationError
        );

        setError(
          notificationError.message ||
            "Unable to load notifications."
        );

        setNotifications([]);
        return;
      }

      setNotifications(data || []);
    } catch (err) {
      console.error(
        "Notification error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load notifications."
      );
    }
  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setLoading(true);

        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "Authentication error:",
            userError
          );

          navigate("/user/login");
          return;
        }

        if (!currentUser) {
          navigate("/user/login");
          return;
        }

        if (!mounted) return;

        setUser(currentUser);

        await loadNotifications(
          currentUser
        );
      } catch (err) {
        console.error(
          "Notification initialization error:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load notifications."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [navigate]);


  // =========================================================
  // REALTIME NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(
        `user-notifications-${user.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(
            "Notification realtime update:",
            payload
          );

          loadNotifications(user);
        }
      )
      .subscribe((status) => {
        console.log(
          "Notification realtime status:",
          status
        );
      });

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [user]);


  // =========================================================
  // MARK ONE AS READ
  // =========================================================

  const markAsRead = async (
    notificationId
  ) => {
    if (!user) return;

    const notification =
      notifications.find(
        (item) =>
          item.id === notificationId
      );

    if (
      !notification ||
      notification.is_read
    ) {
      return;
    }

    const {
      error: updateError,
    } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error(
        "Mark notification read error:",
        updateError
      );

      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              is_read: true,
            }
          : item
      )
    );
  };


  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const markAllAsRead = async () => {
    if (!user) return;

    if (unreadCount === 0) {
      return;
    }

    const {
      error: updateError,
    } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (updateError) {
      console.error(
        "Mark all notifications read error:",
        updateError
      );

      return;
    }

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        is_read: true,
      }))
    );
  };


  // =========================================================
  // OPEN NOTIFICATION
  // =========================================================

  const openNotification = async (
    notification
  ) => {
    await markAsRead(
      notification.id
    );

    if (notification.complaint_id) {
      navigate(
        `/user/issue/${notification.complaint_id}`
      );
    }
  };


  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (
    dateString
  ) => {
    if (!dateString) return "";

    const date =
      new Date(dateString);

    const now = new Date();

    const seconds = Math.floor(
      (now.getTime() -
        date.getTime()) /
        1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    if (seconds < 3600) {
      const minutes =
        Math.floor(
          seconds / 60
        );

      return `${minutes} ${
        minutes === 1
          ? "minute"
          : "minutes"
      } ago`;
    }

    if (seconds < 86400) {
      const hours =
        Math.floor(
          seconds / 3600
        );

      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;
    }

    if (seconds < 604800) {
      const days =
        Math.floor(
          seconds / 86400
        );

      return `${days} ${
        days === 1
          ? "day"
          : "days"
      } ago`;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  const getIcon = (type) => {
    switch (type) {
      case "status_update":
        return (
          <Clock3 size={19} />
        );

      case "assignment":
        return (
          <ClipboardCheck
            size={19}
          />
        );

      case "resolved":
        return (
          <Check size={19} />
        );

      case "remark":
        return (
          <MessageCircle
            size={19}
          />
        );

      case "ai_analysis":
        return (
          <Sparkles size={19} />
        );

      case "warning":
        return (
          <AlertCircle
            size={19}
          />
        );

      default:
        return (
          <Bell size={19} />
        );
    }
  };


  // =========================================================
  // ICON CLASS
  // =========================================================

  const getIconClass = (type) => {
    switch (type) {
      case "resolved":
        return "notification-icon resolved";

      case "status_update":
        return "notification-icon status";

      case "assignment":
        return "notification-icon assignment";

      case "remark":
        return "notification-icon remark";

      case "ai_analysis":
        return "notification-icon ai";

      case "warning":
        return "notification-icon warning";

      default:
        return "notification-icon";
    }
  };


  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="notifications-page">

        <div className="notifications-app">

          <header className="notifications-header">

            <button
              type="button"
              className="notifications-back"
              onClick={() =>
                navigate(
                  "/user/profile"
                )
              }
            >
              <ArrowLeft size={21} />
            </button>

            <h1>
              Notifications
            </h1>

            <div className="notifications-header-space" />

          </header>

          <main className="notifications-loading">

            <Bell size={27} />

            <p>
              Loading notifications...
            </p>

          </main>

        </div>

      </div>
    );
  }


  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="notifications-page">

      <div className="notifications-app">

        {/* ================================================
            HEADER
        ================================================= */}

        <header className="notifications-header">

          <button
            type="button"
            className="notifications-back"
            onClick={() =>
              navigate(
                "/user/profile"
              )
            }
            aria-label="Go back"
          >
            <ArrowLeft size={21} />
          </button>


          <h1>
            Notifications
          </h1>


          <button
            type="button"
            className="mark-all-button"
            onClick={markAllAsRead}
            disabled={
              unreadCount === 0
            }
            aria-label="Mark all as read"
            title="Mark all as read"
          >
            <CheckCheck size={20} />
          </button>

        </header>


        {/* ================================================
            CONTENT
        ================================================= */}

        <main className="notifications-content">

          {/* ERROR */}

          {error && (
            <div className="notifications-error">
              {error}
            </div>
          )}


          {/* UNREAD COUNT */}

          {unreadCount > 0 && (
            <div className="notifications-top-row">

              <span>
                {unreadCount} unread{" "}
                {unreadCount === 1
                  ? "notification"
                  : "notifications"}
              </span>

              <button
                type="button"
                onClick={
                  markAllAsRead
                }
              >
                Mark all as read
              </button>

            </div>
          )}


          {/* EMPTY STATE */}

          {notifications.length === 0 &&
            !error && (
              <div className="notifications-empty">

                <div className="notifications-empty-icon">
                  <Bell size={31} />
                </div>

                <h2>
                  You're all caught up
                </h2>

                <p>
                  You don't have any
                  notifications yet.
                  We'll let you know when
                  there is an update on
                  your complaints.
                </p>

              </div>
            )}


          {/* NOTIFICATION LIST */}

          {notifications.length > 0 && (
            <div className="notification-list">

              {notifications.map(
                (notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`notification-item ${
                      notification.is_read
                        ? "read"
                        : "unread"
                    }`}
                    onClick={() =>
                      openNotification(
                        notification
                      )
                    }
                  >

                    {/* ICON */}

                    <div
                      className={getIconClass(
                        notification.type
                      )}
                    >
                      {getIcon(
                        notification.type
                      )}
                    </div>


                    {/* BODY */}

                    <div className="notification-body">

                      <div className="notification-title-row">

                        <h3>
                          {
                            notification.title
                          }
                        </h3>

                        {!notification.is_read && (
                          <span className="unread-dot" />
                        )}

                      </div>


                      <p>
                        {
                          notification.message
                        }
                      </p>


                      <span className="notification-time">
                        {formatTime(
                          notification.created_at
                        )}
                      </span>

                    </div>


                    {/* ARROW */}

                    {notification.complaint_id && (
                      <span className="notification-arrow">
                        →
                      </span>
                    )}

                  </button>
                )
              )}

            </div>
          )}

        </main>


        {/* ================================================
            BOTTOM NAVIGATION
            EXACT SAME CLASSES AS PROFILE
        ================================================= */}

        <nav className="profile-bottom-navigation">

          {/* HOME */}

          <button
            className="profile-bottom-item"
            onClick={() =>
              navigate("/user")
            }
          >
            <Home size={21} />

            <span>
              Home
            </span>
          </button>


          {/* MAP */}

          <button
            className="profile-bottom-item"
            onClick={() =>
              navigate("/user/map")
            }
          >
            <Map size={21} />

            <span>
              Map
            </span>
          </button>


          {/* ADD REPORT */}

          <button
            className="profile-add-button"
            onClick={() =>
              navigate("/user/report")
            }
            aria-label="Report an issue"
          >
            <Plus size={28} />
          </button>


          {/* REPORTS */}

          <button
            className="profile-bottom-item"
            onClick={() =>
              navigate("/user/reports")
            }
          >
            <FileText size={21} />

            <span>
              Reports
            </span>
          </button>


          {/* PROFILE */}

          <button
            className="profile-bottom-item active"
            onClick={() =>
              navigate(
                "/user/profile"
              )
            }
          >
            <User size={21} />

            <span>
              Profile
            </span>
          </button>

        </nav>

      </div>

    </div>
  );
}

export default Notifications;