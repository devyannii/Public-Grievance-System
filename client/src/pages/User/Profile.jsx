import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Settings,
  FileText,
  Clock3,
  Bell,
  CircleHelp,
  Info,
  LogOut,
  Home,
  Map,
  Plus,
  User,
  Camera,
  Trash2,
  Save,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import "../../styles/Profile.css";
import "../../styles/UserAppLayout.css";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // EDIT PROFILE
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");

  // PROFILE PICTURE
  const [profilePicture, setProfilePicture] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // SAVE STATES
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // MESSAGE
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");


  // =========================================
  // LOAD CURRENT USER + PROFILE
  // =========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          navigate("/user/login");
          return;
        }

        setUser(user);

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "full_name, phone, preferred_language, profile_picture"
          )
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error(
            "Profile loading error:",
            profileError
          );

          const fallbackName =
            user.user_metadata?.full_name ||
            "User";

          setProfile({
            full_name: fallbackName,
            phone: user.phone || "",
            preferred_language:
              user.user_metadata
                ?.preferred_language || "English",
            profile_picture:
              user.user_metadata
                ?.profile_picture || "",
          });

          setEditedName(fallbackName);

          setProfilePicture(
            user.user_metadata
              ?.profile_picture || ""
          );

          return;
        }

        setProfile(profileData);

        setEditedName(
          profileData.full_name || ""
        );

        setProfilePicture(
          profileData.profile_picture || ""
        );

      } catch (error) {
        console.error(
          "Unable to load profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);


  // =========================================
  // MESSAGE HELPER
  // =========================================

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };


  // =========================================
  // OPEN EDIT PROFILE
  // =========================================

  const openEditProfile = () => {
    setEditedName(
      profile?.full_name ||
        user?.user_metadata?.full_name ||
        ""
    );

    setSelectedImage(null);

    setEditMode(true);
    setMessage("");
  };


  // =========================================
  // CLOSE EDIT PROFILE
  // =========================================

  const closeEditProfile = () => {
    setEditedName(
      profile?.full_name ||
        user?.user_metadata?.full_name ||
        ""
    );

    setSelectedImage(null);

    setEditMode(false);
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // =========================================
  // SELECT PROFILE PICTURE
  // =========================================

  const handleImageSelect = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {
      showMessage(
        "Please select an image file.",
        "error"
      );

      return;
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      showMessage(
        "Profile picture must be less than 5 MB.",
        "error"
      );

      return;
    }

    setSelectedImage(file);

    // Show preview immediately
    const previewUrl =
      URL.createObjectURL(file);

    setProfilePicture(previewUrl);
  };


  // =========================================
  // REMOVE PROFILE PICTURE
  // =========================================

  const handleRemovePicture = () => {
    setSelectedImage(null);
    setProfilePicture("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // =========================================
  // SAVE PROFILE PICTURE
  // =========================================

  const uploadProfilePicture = async () => {
    if (!selectedImage || !user) {
      return profilePicture;
    }

    try {
      setImageUploading(true);

      const extension =
        selectedImage.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const filePath =
        `${user.id}/profile-${Date.now()}.${extension}`;


      // Upload to Supabase Storage
      const {
        error: uploadError,
      } = await supabase.storage
        .from("profile-images")
        .upload(
          filePath,
          selectedImage,
          {
            upsert: true,
            contentType:
              selectedImage.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }


      // Get public URL
      const {
        data: publicUrlData,
      } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      const imageUrl =
        publicUrlData?.publicUrl;

      if (!imageUrl) {
        throw new Error(
          "Could not create image URL."
        );
      }

      return imageUrl;

    } catch (error) {
      console.error(
        "Profile picture upload error:",
        error
      );

      throw error;

    } finally {
      setImageUploading(false);
    }
  };


  // =========================================
  // SAVE CHANGES
  // =========================================

  const handleSaveChanges = async () => {
    if (!user) {
      return;
    }

    const cleanName =
      editedName.trim();

    if (!cleanName) {
      showMessage(
        "Please enter your name.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);
      setMessage("");


      // =======================================
      // PROFILE PICTURE
      // =======================================

      let finalProfilePicture =
        profilePicture;


      // If user selected a new image
      if (selectedImage) {
        finalProfilePicture =
          await uploadProfilePicture();
      }


      // =======================================
      // UPDATE PROFILES TABLE
      // =======================================

      const {
        data: updatedProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          full_name: cleanName,
          profile_picture:
            finalProfilePicture || null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", user.id)
        .select(
          "full_name, phone, preferred_language, profile_picture"
        )
        .single();

      if (profileError) {
        throw profileError;
      }


      // =======================================
      // UPDATE SUPABASE AUTH NAME
      // =======================================

      const {
        error: authError,
      } = await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
          profile_picture:
            finalProfilePicture || null,
        },
      });

      if (authError) {
        console.warn(
          "Auth metadata update failed:",
          authError
        );
      }


      // =======================================
      // UPDATE LOCAL STATE
      // =======================================

      setProfile(updatedProfile);

      setEditedName(
        updatedProfile.full_name || ""
      );

      setProfilePicture(
        updatedProfile.profile_picture || ""
      );

      setSelectedImage(null);

      setEditMode(false);

      showMessage(
        "Profile updated successfully."
      );

    } catch (error) {
      console.error(
        "Save profile error:",
        error
      );

      showMessage(
        error?.message ||
          "Could not save profile changes.",
        "error"
      );

    } finally {
      setSaving(false);
    }
  };


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      navigate("/user/login");

    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };


  // =========================================
  // LANDING PAGE SECTION NAVIGATION
  // =========================================

  const openLandingSection = (section) => {
    window.location.href =
      `/#${section}`;
  };


  // =========================================
  // DISPLAY VALUES
  // =========================================

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    "User";

  const displayPhone =
    profile?.phone ||
    user?.phone ||
    "Phone number not added";

  const displayEmail =
    user?.email ||
    "Email not available";


  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="user-page profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }


  return (
    <div className="user-page profile-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="profile-header">

        <button
          className="profile-back"
          onClick={() =>
            navigate("/user")
          }
        >
          <ArrowLeft size={21} />
        </button>

        <h1>
          Profile
        </h1>

        <button
          className="profile-settings"
          onClick={openEditProfile}
          title="Edit Profile"
        >
          <Settings size={20} />
        </button>

      </header>


      {/* =========================================
          PROFILE CONTENT
      ========================================= */}

      <main className="profile-content">

        {/* =======================================
            USER INFORMATION
        ======================================= */}

        <section className="profile-user">

          {/* PROFILE PICTURE */}

          <div className="profile-avatar-wrapper">

            <div className="profile-avatar">

              {profilePicture ? (

                <img
                  src={profilePicture}
                  alt="Profile"
                  className="profile-picture"
                />

              ) : (

                <User size={42} />

              )}

            </div>

          </div>


          {editMode ? (

            <div className="profile-edit-area">

              {/* NAME */}

              <label className="profile-edit-label">
                Name
              </label>

              <input
                type="text"
                className="profile-name-input"
                value={editedName}
                onChange={(event) =>
                  setEditedName(
                    event.target.value
                  )
                }
                placeholder="Enter your name"
                maxLength={80}
              />


              {/* PROFILE PICTURE */}

              <label className="profile-edit-label">
                Profile Picture
              </label>

              <div className="profile-picture-buttons">

                <button
                  type="button"
                  className="profile-picture-change"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={saving}
                >
                  <Camera size={15} />
                  Change Picture
                </button>

                {profilePicture && (

                  <button
                    type="button"
                    className="profile-picture-remove"
                    onClick={
                      handleRemovePicture
                    }
                    disabled={saving}
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>

                )}

              </div>


              {/* HIDDEN FILE INPUT */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={
                  handleImageSelect
                }
                style={{
                  display: "none",
                }}
              />


              {/* SAVE / CANCEL */}

              <div className="profile-edit-actions">

                <button
                  type="button"
                  className="profile-save-button"
                  onClick={
                    handleSaveChanges
                  }
                  disabled={
                    saving ||
                    imageUploading
                  }
                >
                  <Save size={15} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={
                    closeEditProfile
                  }
                  disabled={
                    saving ||
                    imageUploading
                  }
                >
                  <X size={15} />

                  Cancel
                </button>

              </div>

            </div>

          ) : (

            <>
              <h2>
                {displayName}
              </h2>

              <p>
                {displayPhone}
              </p>

              <p>
                {displayEmail}
              </p>
            </>

          )}

        </section>


        {/* =======================================
            MESSAGE
        ======================================= */}

        {message && (
          <div
            className={`profile-message ${
              messageType === "error"
                ? "profile-message-error"
                : "profile-message-success"
            }`}
          >
            {message}
          </div>
        )}


        {/* =========================================
            PROFILE MENU
        ========================================= */}

        {!editMode && (

          <section className="profile-menu">

            {/* MY REPORTS */}

            <button
              className="profile-menu-item"
              onClick={() =>
                navigate(
                  "/user/reports"
                )
              }
            >

              <div className="profile-menu-icon">
                <FileText size={19} />
              </div>

              <span>
                My Reports
              </span>

              <span className="profile-arrow">
                ›
              </span>

            </button>


            {/* TRACK ISSUE */}

            <button
              className="profile-menu-item"
              onClick={() =>
                navigate(
                  "/user/track"
                )
              }
            >

              <div className="profile-menu-icon">
                <Clock3 size={19} />
              </div>

              <span>
                Track an Issue
              </span>

              <span className="profile-arrow">
                ›
              </span>

            </button>


            {/* NOTIFICATIONS */}

            <button
              className="profile-menu-item"
              onClick={() =>
                navigate(
                  "/user/notifications"
                )
              }
            >

              <div className="profile-menu-icon">
                <Bell size={19} />
              </div>

              <span>
                Notifications
              </span>

              <span className="profile-arrow">
                ›
              </span>

            </button>


            {/* HELP & SUPPORT */}

            <button
              type="button"
              className="profile-menu-item"
              onClick={() =>
                openLandingSection(
                  "contact"
                )
              }
            >

              <div className="profile-menu-icon">
                <CircleHelp size={19} />
              </div>

              <span>
                Help &amp; Support
              </span>

              <span className="profile-arrow">
                ›
              </span>

            </button>


            {/* ABOUT US */}

            <button
              type="button"
              className="profile-menu-item"
              onClick={() =>
                openLandingSection(
                  "issues"
                )
              }
            >

              <div className="profile-menu-icon">
                <Info size={19} />
              </div>

              <span>
                About Us
              </span>

              <span className="profile-arrow">
                ›
              </span>

            </button>

          </section>

        )}


        {/* =========================================
            LOGOUT
        ========================================= */}

        <button
          className="profile-logout"
          onClick={handleLogout}
        >

          <LogOut size={18} />

          <span>
            Logout
          </span>

        </button>

      </main>


      {/* =========================================
          BOTTOM NAVIGATION
      ========================================= */}

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
        >
          <User size={21} />

          <span>
            Profile
          </span>
        </button>

      </nav>

    </div>
  );
}

export default Profile;