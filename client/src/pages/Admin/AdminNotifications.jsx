import React, {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  CheckCheck,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import { supabase } from "../../lib/supabaseClient";

import "../../styles/AdminNotifications.css";


function AdminNotifications() {

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  const loadNotifications = async () => {

    try {

      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {

        setNotifications([]);

        return;
      }


      const {
        data,
        error,
      } = await supabase
        .from("notifications")
        .select(`
          id,
          complaint_id,
          type,
          title,
          message,
          is_read,
          created_at
        `)
        .eq("admin_id", user.id)
        .order("created_at", {
          ascending: false,
        });


      if (error) {

        console.error(
          "Error loading notifications:",
          error
        );

        return;
      }


      setNotifications(data || []);

    } catch (error) {

      console.error(
        "Notification loading error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     INITIAL LOAD + REALTIME
  ===================================================== */

  useEffect(() => {

    loadNotifications();

    let channel;


    const setupRealtime = async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }


      channel = supabase
        .channel(
          `admin-notifications-page-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `admin_id=eq.${user.id}`,
          },
          () => {
            loadNotifications();
          }
        )
        .subscribe();

    };


    setupRealtime();


    return () => {

      if (channel) {
        supabase.removeChannel(channel);
      }

    };

  }, []);


  /* =====================================================
     MARK ONE AS READ
  ===================================================== */

  const markAsRead = async (id) => {

    const {
      error,
    } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", id);


    if (error) {

      console.error(
        "Error marking notification as read:",
        error
      );

      return;
    }


    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    );

  };


  /* =====================================================
     MARK ALL AS READ
  ===================================================== */

  const markAllAsRead = async () => {

    const {
      data: { user },
    } = await supabase.auth.getUser();


    if (!user) {
      return;
    }


    const {
      error,
    } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("admin_id", user.id)
      .eq("is_read", false);


    if (error) {

      console.error(
        "Error marking all notifications as read:",
        error
      );

      return;
    }


    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );

  };


  /* =====================================================
     UNREAD COUNT
  ===================================================== */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  /* =====================================================
     TIME
  ===================================================== */

  const formatTime = (dateString) => {

    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);
    const now = new Date();

    const difference =
      Math.floor(
        (now - date) / 1000
      );


    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      return `${Math.floor(
        difference / 60
      )}m ago`;
    }

    if (difference < 86400) {
      return `${Math.floor(
        difference / 3600
      )}h ago`;
    }

    if (difference < 604800) {
      return `${Math.floor(
        difference / 86400
      )}d ago`;
    }

    return date.toLocaleDateString();

  };


  return (

    <AdminLayout>

      <div className="admin-notifications-page">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="admin-notifications-page-header">

          <div>

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated with complaints
              and system activity.
            </p>

          </div>


          {unreadCount > 0 && (

            <button
              type="button"
              className="admin-notifications-mark-all"
              onClick={markAllAsRead}
            >

              <CheckCheck size={17} />

              Mark all as read

            </button>

          )}

        </div>


        {/* =================================================
            NOTIFICATION CARD
        ================================================= */}

        <div className="admin-notifications-card">

          {loading ? (

            <div className="admin-notifications-empty">
              Loading notifications...
            </div>

          ) : notifications.length === 0 ? (

            <div className="admin-notifications-empty">

              <Bell size={38} />

              <h3>
                No notifications yet
              </h3>

              <p>
                New complaints and system
                updates will appear here.
              </p>

            </div>

          ) : (

            <div className="admin-notifications-list">

              {notifications.map(
                (notification) => (

                  <button
                    type="button"
                    key={notification.id}
                    className={`admin-notification-page-item ${
                      !notification.is_read
                        ? "unread"
                        : ""
                    }`}
                    onClick={() => {

                      if (
                        !notification.is_read
                      ) {

                        markAsRead(
                          notification.id
                        );

                      }

                    }}
                  >

                    <div className="admin-notification-page-icon">

                      <Bell size={18} />

                    </div>


                    <div className="admin-notification-page-content">

                      <div className="admin-notification-page-title">

                        <strong>
                          {notification.title}
                        </strong>


                        {!notification.is_read && (

                          <span className="admin-notification-unread-dot" />

                        )}

                      </div>


                      <p>
                        {notification.message}
                      </p>


                      <small>
                        {formatTime(
                          notification.created_at
                        )}
                      </small>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </AdminLayout>

  );
}


export default AdminNotifications;