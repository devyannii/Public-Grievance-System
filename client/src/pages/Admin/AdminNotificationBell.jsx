import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bell,
  CheckCheck,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import "../../styles/AdminNotifications.css";


function AdminNotificationBell() {

  /* =========================================================
     STATES
  ========================================================= */

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);


  /* =========================================================
     REFS
  ========================================================= */

  const notificationRef =
    useRef(null);

  const channelRef =
    useRef(null);


  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */

  const loadNotifications = async () => {

    try {

      setLoading(true);


      const {
        data: {
          user,
        },
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
        .select(
          `
          id,
          complaint_id,
          type,
          title,
          message,
          is_read,
          created_at
          `
        )
        .eq(
          "admin_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(20);


      if (error) {

        console.error(
          "Failed to load admin notifications:",
          error
        );

        return;

      }


      setNotifications(
        data || []
      );

    } catch (error) {

      console.error(
        "Notification loading error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    let mounted = true;


    const initializeNotifications =
      async () => {

        if (!mounted) {
          return;
        }

        await loadNotifications();

      };


    initializeNotifications();


    return () => {

      mounted = false;

    };

  }, []);


  /* =========================================================
     REALTIME NOTIFICATIONS
  ========================================================= */

  useEffect(() => {

    let mounted = true;


    const setupRealtime =
      async () => {

        try {

          /* -------------------------------------------------
             GET CURRENT USER
          ------------------------------------------------- */

          const {
            data: {
              user,
            },
          } = await supabase.auth.getUser();


          /* -------------------------------------------------
             COMPONENT MAY HAVE BEEN UNMOUNTED WHILE
             getUser() WAS RUNNING
          ------------------------------------------------- */

          if (
            !mounted ||
            !user
          ) {

            return;

          }


          /* -------------------------------------------------
             REMOVE ANY OLD CHANNEL

             This prevents duplicate realtime channels,
             especially during React Strict Mode.
          ------------------------------------------------- */

          if (channelRef.current) {

            try {

              await supabase.removeChannel(
                channelRef.current
              );

            } catch (removeError) {

              console.warn(
                "Previous notification channel cleanup:",
                removeError
              );

            }

            channelRef.current = null;

          }


          /* -------------------------------------------------
             CREATE CHANNEL
          ------------------------------------------------- */

          const channelName =
            `admin-notifications-${user.id}`;


          const channel =
            supabase.channel(
              channelName
            );


          /* -------------------------------------------------
             IMPORTANT:
             REGISTER POSTGRES CHANGES BEFORE SUBSCRIBE()
          ------------------------------------------------- */

          channel.on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `admin_id=eq.${user.id}`,
            },
            async () => {

              if (!mounted) {
                return;
              }


              await loadNotifications();

            }
          );


          /* -------------------------------------------------
             SAVE CHANNEL REFERENCE
          ------------------------------------------------- */

          channelRef.current =
            channel;


          /* -------------------------------------------------
             SUBSCRIBE ONLY AFTER .on()
          ------------------------------------------------- */

          const status =
            await channel.subscribe(
              (subscriptionStatus) => {

                console.log(
                  "Admin notification realtime:",
                  subscriptionStatus
                );

              }
            );


          /* -------------------------------------------------
             IF COMPONENT WAS UNMOUNTED WHILE SUBSCRIBING,
             REMOVE THE CHANNEL IMMEDIATELY.
          ------------------------------------------------- */

          if (!mounted) {

            try {

              await supabase.removeChannel(
                channel
              );

            } catch (cleanupError) {

              console.warn(
                "Realtime cleanup error:",
                cleanupError
              );

            }

            return;

          }


          console.log(
            "Admin notification realtime status:",
            status
          );

        } catch (error) {

          console.error(
            "Admin notification realtime error:",
            error
          );

        }

      };


    setupRealtime();


    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {

      mounted = false;


      const channel =
        channelRef.current;


      channelRef.current = null;


      if (channel) {

        supabase
          .removeChannel(channel)
          .catch((error) => {

            console.warn(
              "Notification channel cleanup error:",
              error
            );

          });

      }

    };

  }, []);


  /* =========================================================
     CLOSE WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {

          setOpen(false);

        }

      };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  /* =========================================================
     UNREAD COUNT
  ========================================================= */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  /* =========================================================
     MARK ONE AS READ
  ========================================================= */

  const markAsRead =
    async (id) => {

      try {

        const {
          error,
        } = await supabase
          .from("notifications")
          .update({
            is_read: true,
          })
          .eq(
            "id",
            id
          );


        if (error) {

          console.error(
            "Failed to mark notification as read:",
            error
          );

          return;

        }


        setNotifications(
          (previous) =>
            previous.map(
              (notification) =>
                notification.id === id
                  ? {
                      ...notification,
                      is_read: true,
                    }
                  : notification
            )
        );

      } catch (error) {

        console.error(
          "Mark notification read error:",
          error
        );

      }

    };


  /* =========================================================
     MARK ALL AS READ
  ========================================================= */

  const markAllAsRead =
    async () => {

      try {

        const {
          data: {
            user,
          },
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
          .eq(
            "admin_id",
            user.id
          )
          .eq(
            "is_read",
            false
          );


        if (error) {

          console.error(
            "Failed to mark all notifications as read:",
            error
          );

          return;

        }


        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                is_read: true,
              })
            )
        );

      } catch (error) {

        console.error(
          "Mark all notifications error:",
          error
        );

      }

    };


  /* =========================================================
     TIME FORMAT
  ========================================================= */

  const formatTime =
    (dateString) => {

      if (!dateString) {

        return "";

      }


      const date =
        new Date(
          dateString
        );


      const now =
        new Date();


      const difference =
        Math.floor(
          (
            now.getTime() -
            date.getTime()
          ) / 1000
        );


      if (
        difference < 60
      ) {

        return "Just now";

      }


      if (
        difference < 3600
      ) {

        return `${Math.floor(
          difference / 60
        )}m ago`;

      }


      if (
        difference < 86400
      ) {

        return `${Math.floor(
          difference / 3600
        )}h ago`;

      }


      if (
        difference < 604800
      ) {

        return `${Math.floor(
          difference / 86400
        )}d ago`;

      }


      return date.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
        }
      );

    };


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div
      className="admin-notification-wrapper"
      ref={notificationRef}
    >

      {/* =====================================================
          BELL BUTTON
      ===================================================== */}

      <button
        type="button"
        className={
          `admin-notification-button ${
            open ? "active" : ""
          }`
        }
        onClick={() =>
          setOpen(
            (previous) =>
              !previous
          )
        }
        aria-label="Notifications"
        aria-expanded={open}
      >

        <Bell
          size={21}
          strokeWidth={1.9}
        />


        {unreadCount > 0 && (

          <span className="admin-notification-badge">

            {unreadCount > 99
              ? "99+"
              : unreadCount}

          </span>

        )}

      </button>


      {/* =====================================================
          DROPDOWN
      ===================================================== */}

      {open && (

        <div className="admin-notification-dropdown">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="admin-notification-header">

            <div>

              <h3>
                Notifications
              </h3>

              <span>

                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "All caught up"}

              </span>

            </div>


            <button
              type="button"
              className="admin-notification-close"
              onClick={() =>
                setOpen(false)
              }
              aria-label="Close notifications"
            >

              <X size={18} />

            </button>

          </div>


          {/* =================================================
              MARK ALL AS READ
          ================================================= */}

          {unreadCount > 0 && (

            <div className="admin-notification-actions">

              <button
                type="button"
                className="admin-mark-all"
                onClick={
                  markAllAsRead
                }
              >

                <CheckCheck
                  size={15}
                />

                Mark all as read

              </button>

            </div>

          )}


          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="admin-notification-list">

            {/* -------------------------------------------------
                LOADING
            ------------------------------------------------- */}

            {loading ? (

              <div className="admin-notification-empty">

                <div
                  className={
                    "admin-notification-empty-icon loading"
                  }
                >

                  <Bell
                    size={24}
                    strokeWidth={1.7}
                  />

                </div>


                <strong>
                  Loading notifications
                </strong>


                <span>
                  Please wait...
                </span>

              </div>

            ) : notifications.length === 0 ? (

              /* -------------------------------------------------
                 EMPTY
              ------------------------------------------------- */

              <div className="admin-notification-empty">

                <div
                  className={
                    "admin-notification-empty-icon"
                  }
                >

                  <Bell
                    size={24}
                    strokeWidth={1.7}
                  />

                </div>


                <strong>
                  No notifications yet
                </strong>


                <span>
                  New complaints and system
                  updates will appear here.
                </span>

              </div>

            ) : (

              /* -------------------------------------------------
                 NOTIFICATION LIST
              ------------------------------------------------- */

              notifications.map(
                (notification) => (

                  <button
                    type="button"
                    key={notification.id}
                    className={
                      `admin-notification-item ${
                        notification.is_read
                          ? "read"
                          : "unread"
                      }`
                    }
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

                    <div
                      className={
                        "admin-notification-item-icon"
                      }
                    >

                      <Bell
                        size={17}
                        strokeWidth={1.8}
                      />

                    </div>


                    <div
                      className={
                        "admin-notification-item-content"
                      }
                    >

                      <div
                        className={
                          "admin-notification-item-top"
                        }
                      >

                        <strong>

                          {
                            notification.title ||
                            "Notification"
                          }

                        </strong>


                        {!notification.is_read && (

                          <span
                            className={
                              "admin-unread-dot"
                            }
                          />

                        )}

                      </div>


                      <p>

                        {
                          notification.message ||
                          "You have a new update."
                        }

                      </p>


                      <span
                        className={
                          "admin-notification-time"
                        }
                      >

                        {
                          formatTime(
                            notification.created_at
                          )
                        }

                      </span>

                    </div>

                  </button>

                )
              )

            )}

          </div>

        </div>

      )}

    </div>

  );

}


export default AdminNotificationBell;