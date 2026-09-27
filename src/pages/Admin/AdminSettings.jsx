import React, { useEffect, useState } from "react";
import {
  User,
  Camera,
  ShieldCheck,
  Bot,
  Bell,
  Palette,
  Lock,
  LogOut,
  Save,
  Check,
  Loader2,
  Mail,
  UserRound,
  Sparkles,
  Trash2,
  UserCog,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/layout/AdminLayout";
import "../../styles/AdminSettings.css";


function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [profileImage, setProfileImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  /* =====================================================
     AI / COMPLAINT SETTINGS
  ===================================================== */

  const [aiAutoAssignment, setAiAutoAssignment] = useState(true);
  const [adminReassignment, setAdminReassignment] = useState(true);
  const [complaintDeletion, setComplaintDeletion] = useState(true);

  /* =====================================================
     NOTIFICATION SETTINGS
  ===================================================== */

  const [notifications, setNotifications] = useState({
    newComplaints: true,
    aiAssignments: true,
    statusUpdates: true,
    duplicateDetection: true,
    newResidents: true,
  });

  /* =====================================================
     APPEARANCE
  ===================================================== */

  const [theme, setTheme] = useState("light");


  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  useEffect(() => {
    loadSettings();
  }, []);


  const loadSettings = async () => {
    try {
      setLoading(true);

      /* -----------------------------------------------
         GET CURRENT USER
      ------------------------------------------------ */

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!currentUser) {
        return;
      }

      setUser(currentUser);
      setEmail(currentUser.email || "");


      /* -----------------------------------------------
         GET PROFILE
      ------------------------------------------------ */

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("full_name, profile_picture")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.warn(
          "Could not load profile:",
          profileError
        );
      }

      if (profile) {
        setFullName(profile.full_name || "");
        setProfileImage(profile.profile_picture || "");
      } else {
        setFullName(
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          ""
        );
      }


      /* -----------------------------------------------
         GET SYSTEM SETTINGS
      ------------------------------------------------ */

      const {
        data: systemSettings,
        error: settingsError,
      } = await supabase
        .from("system_settings")
        .select("setting_key, setting_value");

      if (settingsError) {
        throw settingsError;
      }

      const settingsMap = {};

      (systemSettings || []).forEach((setting) => {
        settingsMap[setting.setting_key] =
          setting.setting_value;
      });

      setAiAutoAssignment(
        settingsMap.ai_auto_assignment ?? true
      );

      setAdminReassignment(
        settingsMap.admin_reassignment ?? true
      );

      setComplaintDeletion(
        settingsMap.complaint_deletion ?? true
      );

      setNotifications({
        newComplaints:
          settingsMap.notification_new_complaints ?? true,

        aiAssignments:
          settingsMap.notification_ai_assignments ?? true,

        statusUpdates:
          settingsMap.notification_status_updates ?? true,

        duplicateDetection:
          settingsMap.notification_duplicate_detection ?? true,

        newResidents:
          settingsMap.notification_new_residents ?? true,
      });

      setTheme(
        settingsMap.admin_theme || "light"
      );

    } catch (error) {

      console.error(
        "Settings loading error:",
        error
      );

      setMessage(
        "Unable to load settings."
      );

    } finally {

      setLoading(false);

    }
  };


  /* =====================================================
     PROFILE IMAGE
  ===================================================== */

  const handleProfileImage = async (event) => {

    const file =
      event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    try {

      setUploadingImage(true);

      const fileExtension =
        file.name.split(".").pop();

      const filePath =
        `admin/${user.id}.${fileExtension}`;


      const {
        error: uploadError,
      } = await supabase.storage
        .from("profile-images")
        .upload(
          filePath,
          file,
          {
            upsert: true,
            contentType: file.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }


      const {
        data: publicUrlData,
      } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);


      const publicUrl =
        publicUrlData?.publicUrl;


      if (!publicUrl) {
        throw new Error(
          "Could not generate profile image URL."
        );
      }


      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          profile_picture: publicUrl,
        })
        .eq("id", user.id);


      if (profileError) {
        throw profileError;
      }


      setProfileImage(
        `${publicUrl}?t=${Date.now()}`
      );

      setMessage(
        "Profile picture updated."
      );

    } catch (error) {

      console.error(
        "Profile picture upload error:",
        error
      );

      setMessage(
        "Could not update profile picture."
      );

    } finally {

      setUploadingImage(false);

    }
  };


  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const saveProfile = async () => {

    if (!user) {
      return;
    }

    try {

      setSavingProfile(true);
      setMessage("");

      const cleanName =
        fullName.trim();

      if (!cleanName) {
        setMessage(
          "Please enter your name."
        );
        return;
      }


      const {
        error,
      } = await supabase
        .from("profiles")
        .update({
          full_name: cleanName,
        })
        .eq("id", user.id);


      if (error) {
        throw error;
      }


      await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
        },
      });


      setMessage(
        "Profile saved successfully."
      );

    } catch (error) {

      console.error(
        "Profile save error:",
        error
      );

      setMessage(
        "Could not save profile."
      );

    } finally {

      setSavingProfile(false);

    }
  };


  /* =====================================================
     UPDATE ONE SYSTEM SETTING
  ===================================================== */

  const updateSetting = async (
    key,
    value
  ) => {

    const {
      error,
    } = await supabase
      .from("system_settings")
      .upsert(
        {
          setting_key: key,
          setting_value: value,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "setting_key",
        }
      );

    if (error) {
      throw error;
    }
  };


  /* =====================================================
     SAVE SYSTEM SETTINGS
  ===================================================== */

  const saveSystemSettings = async () => {

    try {

      setSavingSettings(true);
      setMessage("");

      await updateSetting(
        "ai_auto_assignment",
        aiAutoAssignment
      );

      await updateSetting(
        "admin_reassignment",
        adminReassignment
      );

      await updateSetting(
        "complaint_deletion",
        complaintDeletion
      );


      await updateSetting(
        "notification_new_complaints",
        notifications.newComplaints
      );

      await updateSetting(
        "notification_ai_assignments",
        notifications.aiAssignments
      );

      await updateSetting(
        "notification_status_updates",
        notifications.statusUpdates
      );

      await updateSetting(
        "notification_duplicate_detection",
        notifications.duplicateDetection
      );

      await updateSetting(
        "notification_new_residents",
        notifications.newResidents
      );


      await updateSetting(
        "admin_theme",
        theme
      );


      setMessage(
        "Settings saved successfully."
      );

    } catch (error) {

      console.error(
        "Settings save error:",
        error
      );

      setMessage(
        "Could not save settings."
      );

    } finally {

      setSavingSettings(false);

    }
  };


  /* =====================================================
     TOGGLE NOTIFICATION
  ===================================================== */

  const toggleNotification = (key) => {

    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));

  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {

    try {

      await supabase.auth.signOut();

      window.location.href =
        "/admin/login";

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (
      <AdminLayout>

        <div className="admin-settings-loading">

          <Loader2
            size={28}
            className="settings-spinner"
          />

          <span>
            Loading settings...
          </span>

        </div>

      </AdminLayout>
    );

  }


  return (
    <AdminLayout>

      <div className="admin-settings-page">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="settings-page-header">

          <div>

            <h1>
              Settings
            </h1>

            <p>
              Manage your administrator account
              and system preferences.
            </p>

          </div>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <div className="settings-success-message">

            <Check size={17} />

            <span>
              {message}
            </span>

          </div>

        )}


        {/* =================================================
            PROFILE
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              <User size={19} />
            </div>

            <div>

              <h2>
                Profile
              </h2>

              <p>
                Manage your administrator profile.
              </p>

            </div>

          </div>


          <div className="settings-profile-body">


            {/* PROFILE IMAGE */}

            <div className="settings-avatar-area">

              <div className="settings-large-avatar">

                {profileImage ? (

                  <img
                    src={profileImage}
                    alt="Admin profile"
                  />

                ) : (

                  <UserRound
                    size={42}
                    strokeWidth={1.5}
                  />

                )}

              </div>


              <label
                className="change-photo-button"
              >

                <Camera size={15} />

                {uploadingImage
                  ? "Uploading..."
                  : "Change photo"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImage}
                  disabled={uploadingImage}
                  hidden
                />

              </label>

            </div>


            {/* PROFILE FORM */}

            <div className="settings-profile-form">

              <div className="settings-field">

                <label>
                  Full Name
                </label>

                <div className="settings-input-wrapper">

                  <UserRound size={17} />

                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your name"
                  />

                </div>

              </div>


              <div className="settings-field">

                <label>
                  Email
                </label>

                <div className="settings-input-wrapper disabled">

                  <Mail size={17} />

                  <input
                    type="email"
                    value={email}
                    disabled
                  />

                </div>

                <small>
                  Your login email cannot be
                  changed here.
                </small>

              </div>


              <div className="settings-field">

                <label>
                  Role
                </label>

                <div className="settings-role-badge">

                  <ShieldCheck size={16} />

                  Administrator

                </div>

              </div>


              <div className="settings-profile-actions">

                <button
                  type="button"
                  className="settings-primary-button"
                  onClick={saveProfile}
                  disabled={savingProfile}
                >

                  {savingProfile ? (

                    <Loader2
                      size={17}
                      className="settings-spinner"
                    />

                  ) : (

                    <Save size={17} />

                  )}

                  {savingProfile
                    ? "Saving..."
                    : "Save Profile"}

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            COMPLAINT AUTOMATION
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon ai">
              <Bot size={19} />
            </div>

            <div>

              <h2>
                Complaint Automation
              </h2>

              <p>
                Control how AI handles complaint
                department assignment.
              </p>

            </div>

          </div>


          <div className="settings-options">


            {/* AI AUTO ASSIGNMENT */}

            <div className="settings-option">

              <div className="settings-option-icon">
                <Sparkles size={19} />
              </div>

              <div className="settings-option-content">

                <div className="settings-option-title">

                  AI Automatic Department Assignment

                  <span
                    className={
                      `settings-status-pill ${
                        aiAutoAssignment
                          ? "enabled"
                          : "disabled"
                      }`
                    }
                  >
                    {aiAutoAssignment
                      ? "ON"
                      : "OFF"}
                  </span>

                </div>

                <p>
                  When ON, AI can directly assign
                  a complaint to its recommended
                  department.
                </p>

                {!aiAutoAssignment && (

                  <div className="settings-info-note">

                    <Sparkles size={15} />

                    <span>
                      AI will still recommend a
                      department, but an admin must
                      assign it manually.
                    </span>

                  </div>

                )}

              </div>

              <button
                type="button"
                className={
                  `settings-toggle ${
                    aiAutoAssignment
                      ? "active"
                      : ""
                  }`
                }
                onClick={() =>
                  setAiAutoAssignment(
                    (previous) => !previous
                  )
                }
                aria-label="Toggle AI automatic department assignment"
              >

                <span />

              </button>

            </div>


            {/* ADMIN REASSIGNMENT */}

            <div className="settings-option">

              <div className="settings-option-icon">
                <UserCog size={19} />
              </div>

              <div className="settings-option-content">

                <div className="settings-option-title">

                  Allow Admin Reassignment

                  <span
                    className={
                      `settings-status-pill ${
                        adminReassignment
                          ? "enabled"
                          : "disabled"
                      }`
                    }
                  >
                    {adminReassignment
                      ? "ON"
                      : "OFF"}
                  </span>

                </div>

                <p>
                  Allow administrators to change
                  the department assigned to a
                  complaint.
                </p>

              </div>

              <button
                type="button"
                className={
                  `settings-toggle ${
                    adminReassignment
                      ? "active"
                      : ""
                  }`
                }
                onClick={() =>
                  setAdminReassignment(
                    (previous) => !previous
                  )
                }
                aria-label="Toggle admin reassignment"
              >

                <span />

              </button>

            </div>


            {/* DELETE COMPLAINT */}

            <div className="settings-option">

              <div className="settings-option-icon danger">
                <Trash2 size={19} />
              </div>

              <div className="settings-option-content">

                <div className="settings-option-title">

                  Allow Complaint Deletion

                  <span
                    className={
                      `settings-status-pill ${
                        complaintDeletion
                          ? "enabled"
                          : "disabled"
                      }`
                    }
                  >
                    {complaintDeletion
                      ? "ON"
                      : "OFF"}
                  </span>

                </div>

                <p>
                  Allow administrators to remove
                  complaints from the active list.
                </p>

              </div>

              <button
                type="button"
                className={
                  `settings-toggle ${
                    complaintDeletion
                      ? "active"
                      : ""
                  }`
                }
                onClick={() =>
                  setComplaintDeletion(
                    (previous) => !previous
                  )
                }
                aria-label="Toggle complaint deletion"
              >

                <span />

              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              <Bell size={19} />
            </div>

            <div>

              <h2>
                Notifications
              </h2>

              <p>
                Choose which events you want to
                receive notifications for.
              </p>

            </div>

          </div>


          <div className="settings-options">


            {[
              {
                key: "newComplaints",
                title: "New Complaints",
                description:
                  "Get notified when a resident submits a new complaint.",
              },
              {
                key: "aiAssignments",
                title: "AI Assignments",
                description:
                  "Get notified when AI recommends or automatically assigns a department.",
              },
              {
                key: "statusUpdates",
                title: "Status Updates",
                description:
                  "Get notified when a complaint status changes.",
              },
              {
                key: "duplicateDetection",
                title: "Duplicate Detection",
                description:
                  "Get notified when AI detects a possible duplicate complaint.",
              },
              {
                key: "newResidents",
                title: "New Residents",
                description:
                  "Get notified when a new resident account is created.",
              },
            ].map((item) => (

              <div
                className="settings-option"
                key={item.key}
              >

                <div className="settings-option-icon">
                  <Bell size={18} />
                </div>

                <div className="settings-option-content">

                  <div className="settings-option-title">

                    {item.title}

                    <span
                      className={
                        `settings-status-pill ${
                          notifications[item.key]
                            ? "enabled"
                            : "disabled"
                        }`
                      }
                    >
                      {notifications[item.key]
                        ? "ON"
                        : "OFF"}
                    </span>

                  </div>

                  <p>
                    {item.description}
                  </p>

                </div>

                <button
                  type="button"
                  className={
                    `settings-toggle ${
                      notifications[item.key]
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    toggleNotification(
                      item.key
                    )
                  }
                  aria-label={`Toggle ${item.title}`}
                >

                  <span />

                </button>

              </div>

            ))}

          </div>

        </section>


        {/* =================================================
            APPEARANCE
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              <Palette size={19} />
            </div>

            <div>

              <h2>
                Appearance
              </h2>

              <p>
                Choose how the administrator
                interface looks.
              </p>

            </div>

          </div>


          <div className="settings-theme-options">


            <button
              type="button"
              className={
                `settings-theme ${
                  theme === "light"
                    ? "selected"
                    : ""
                }`
              }
              onClick={() =>
                setTheme("light")
              }
            >

              <Sun size={19} />

              <span>
                Light
              </span>

              {theme === "light" && (
                <Check size={17} />
              )}

            </button>


            <button
              type="button"
              className={
                `settings-theme ${
                  theme === "dark"
                    ? "selected"
                    : ""
                }`
              }
              onClick={() =>
                setTheme("dark")
              }
            >

              <Moon size={19} />

              <span>
                Dark
              </span>

              {theme === "dark" && (
                <Check size={17} />
              )}

            </button>


            <button
              type="button"
              className={
                `settings-theme ${
                  theme === "system"
                    ? "selected"
                    : ""
                }`
              }
              onClick={() =>
                setTheme("system")
              }
            >

              <Monitor size={19} />

              <span>
                System
              </span>

              {theme === "system" && (
                <Check size={17} />
              )}

            </button>

          </div>

        </section>


        {/* =================================================
            SECURITY
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              <Lock size={19} />
            </div>

            <div>

              <h2>
                Security
              </h2>

              <p>
                Manage your administrator account
                security.
              </p>

            </div>

          </div>


          <div className="settings-security-row">

            <div>

              <strong>
                Password
              </strong>

              <p>
                Update your account password
                through the password reset flow.
              </p>

            </div>

            <button
              type="button"
              className="settings-secondary-button"
              onClick={async () => {

                if (!email) {
                  return;
                }

                const {
                  error,
                } = await supabase.auth
                  .resetPasswordForEmail(
                    email
                  );

                if (error) {

                  console.error(
                    error
                  );

                  setMessage(
                    "Could not send password reset email."
                  );

                  return;
                }

                setMessage(
                  "Password reset email sent."
                );

              }}
            >

              Change Password

            </button>

          </div>

        </section>


        {/* =================================================
            SAVE SETTINGS
        ================================================= */}

        <div className="settings-bottom-actions">

          <button
            type="button"
            className="settings-primary-button large"
            onClick={saveSystemSettings}
            disabled={savingSettings}
          >

            {savingSettings ? (

              <Loader2
                size={18}
                className="settings-spinner"
              />

            ) : (

              <Save size={18} />

            )}

            {savingSettings
              ? "Saving..."
              : "Save Settings"}

          </button>

        </div>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <section className="settings-danger-card">

          <div>

            <h3>
              Sign out
            </h3>

            <p>
              Sign out of your administrator
              account on this device.
            </p>

          </div>

          <button
            type="button"
            className="settings-logout-button"
            onClick={handleLogout}
          >

            <LogOut size={17} />

            Sign Out

          </button>

        </section>


      </div>

    </AdminLayout>
  );
}


export default AdminSettings;