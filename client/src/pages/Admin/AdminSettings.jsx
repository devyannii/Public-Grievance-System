import React, { useEffect, useState } from "react";
import {
  User,
  Camera,
  ShieldCheck,
  Bot,
  Bell,
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
  AlertCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/layout/AdminLayout";
import "../../styles/AdminSettings.css";


/* =====================================================
   STORAGE KEYS
===================================================== */

const SETTINGS_KEY =
  "unified_grievance_admin_settings";

const PROFILE_KEY =
  "unified_grievance_admin_profile";


/* =====================================================
   DEFAULT SETTINGS
===================================================== */

const DEFAULT_SETTINGS = {
  aiAutoAssignment: true,
  adminReassignment: true,
  complaintDeletion: true,

  notifications: {
    newComplaints: true,
    aiAssignments: true,
    statusUpdates: true,
    duplicateDetection: true,
    newResidents: true,
  },
};


/* =====================================================
   DEFAULT PROFILE
===================================================== */

const DEFAULT_PROFILE = {
  fullName: "",
  profileImage: "",
};


/* =====================================================
   READ SETTINGS FROM BROWSER
===================================================== */

const readSettings = () => {
  try {
    const stored =
      localStorage.getItem(
        SETTINGS_KEY
      );

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed =
      JSON.parse(stored);

    return {
      ...DEFAULT_SETTINGS,

      ...parsed,

      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(parsed.notifications || {}),
      },
    };

  } catch (error) {

    console.error(
      "Could not read settings:",
      error
    );

    return DEFAULT_SETTINGS;
  }
};


/* =====================================================
   SAVE SETTINGS TO BROWSER
===================================================== */

const writeSettings = (settings) => {
  try {

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    return true;

  } catch (error) {

    console.error(
      "Could not save settings:",
      error
    );

    return false;
  }
};


/* =====================================================
   READ PROFILE FROM BROWSER
===================================================== */

const readProfile = () => {
  try {

    const stored =
      localStorage.getItem(
        PROFILE_KEY
      );

    if (!stored) {
      return DEFAULT_PROFILE;
    }

    return {
      ...DEFAULT_PROFILE,
      ...JSON.parse(stored),
    };

  } catch (error) {

    console.error(
      "Could not read profile:",
      error
    );

    return DEFAULT_PROFILE;
  }
};


/* =====================================================
   SAVE PROFILE TO BROWSER
===================================================== */

const writeProfile = (profile) => {

  try {

    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(profile)
    );

    return true;

  } catch (error) {

    console.error(
      "Could not save profile:",
      error
    );

    return false;
  }
};


/* =====================================================
   COMPRESS PROFILE IMAGE
===================================================== */

const compressImage = (
  file,
  maxWidth = 500,
  quality = 0.75
) => {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload = (
        event
      ) => {

        const image =
          new Image();

        image.onload = () => {

          let width =
            image.width;

          let height =
            image.height;


          /* -------------------------------------------
             RESIZE
          ------------------------------------------- */

          if (
            width > maxWidth ||
            height > maxWidth
          ) {

            const ratio =
              Math.min(
                maxWidth / width,
                maxWidth / height
              );

            width =
              Math.round(
                width * ratio
              );

            height =
              Math.round(
                height * ratio
              );
          }


          /* -------------------------------------------
             CANVAS
          ------------------------------------------- */

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            width;

          canvas.height =
            height;


          const context =
            canvas.getContext(
              "2d"
            );


          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );


          /* -------------------------------------------
             RETURN COMPRESSED IMAGE
          ------------------------------------------- */

          resolve(
            canvas.toDataURL(
              "image/jpeg",
              quality
            )
          );
        };


        image.onerror = () => {

          reject(
            new Error(
              "Could not process image."
            )
          );
        };


        image.src =
          event.target.result;
      };


      reader.onerror = () => {

        reject(
          new Error(
            "Could not read image."
          )
        );
      };


      reader.readAsDataURL(
        file
      );
    }
  );
};


/* =====================================================
   COMPONENT
===================================================== */

function AdminSettings() {

  /* =====================================================
     LOADING
  ===================================================== */

  const [loading, setLoading] =
    useState(true);


  /* =====================================================
     SAVING
  ===================================================== */

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingSettings, setSavingSettings] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);


  /* =====================================================
     MESSAGE
  ===================================================== */

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("success");


  /* =====================================================
     USER
  ===================================================== */

  const [user, setUser] =
    useState(null);


  /* =====================================================
     PROFILE
  ===================================================== */

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [profileImage, setProfileImage] =
    useState("");


  /* =====================================================
     COMPLAINT SETTINGS
  ===================================================== */

  const [aiAutoAssignment, setAiAutoAssignment] =
    useState(true);

  const [adminReassignment, setAdminReassignment] =
    useState(true);

  const [complaintDeletion, setComplaintDeletion] =
    useState(true);


  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const [notifications, setNotifications] =
    useState(
      DEFAULT_SETTINGS.notifications
    );


  /* =====================================================
     MESSAGE
  ===================================================== */

  const showMessage = (
    text,
    type = "success"
  ) => {

    setMessage(text);
    setMessageType(type);

    window.clearTimeout(
      window.__settingsMessageTimeout
    );

    window.__settingsMessageTimeout =
      setTimeout(() => {

        setMessage("");

      }, 5000);
  };


  /* =====================================================
     GET ALL SETTINGS
  ===================================================== */

  const getCurrentSettings = () => {

    return {

      aiAutoAssignment,

      adminReassignment,

      complaintDeletion,

      notifications: {
        ...notifications,
      },
    };
  };


  /* =====================================================
     SAVE SETTINGS LOCALLY
  ===================================================== */

  const persistCurrentSettings = () => {

    const settings =
      getCurrentSettings();

    const success =
      writeSettings(
        settings
      );

    if (!success) {

      showMessage(
        "Could not save settings on this device.",
        "error"
      );

      return false;
    }

    return true;
  };


  /* =====================================================
     LOAD PAGE
  ===================================================== */

  useEffect(() => {

    initializePage();

    return () => {

      window.clearTimeout(
        window.__settingsMessageTimeout
      );
    };

  }, []);


  /* =====================================================
     INITIALIZE PAGE
  ===================================================== */

  const initializePage = async () => {

    try {

      setLoading(true);


      /* -----------------------------------------------
         LOAD SAVED SETTINGS
      ------------------------------------------------ */

      const savedSettings =
        readSettings();


      setAiAutoAssignment(
        Boolean(
          savedSettings.aiAutoAssignment
        )
      );


      setAdminReassignment(
        Boolean(
          savedSettings.adminReassignment
        )
      );


      setComplaintDeletion(
        Boolean(
          savedSettings.complaintDeletion
        )
      );


      setNotifications({

        ...DEFAULT_SETTINGS.notifications,

        ...savedSettings.notifications,

      });


      /* -----------------------------------------------
         LOAD SAVED PROFILE
      ------------------------------------------------ */

      const savedProfile =
        readProfile();


      setFullName(
        savedProfile.fullName || ""
      );


      setProfileImage(
        savedProfile.profileImage || ""
      );


      /* -----------------------------------------------
         GET SUPABASE USER
      ------------------------------------------------ */

      const {
        data: {
          user: currentUser,
        },
        error,
      } =
        await supabase.auth.getUser();


      if (error) {

        console.warn(
          "Supabase user error:",
          error
        );

      }


      if (currentUser) {

        setUser(
          currentUser
        );


        setEmail(
          currentUser.email || ""
        );


        /* -------------------------------------------
           PROFILE FALLBACK
        ------------------------------------------- */

        if (
          !savedProfile.fullName
        ) {

          const metadataName =
            currentUser
              .user_metadata
              ?.full_name ||
            currentUser
              .user_metadata
              ?.name ||
            "";


          if (metadataName) {

            setFullName(
              metadataName
            );
          }
        }


        /* -------------------------------------------
           PROFILE FROM SUPABASE
           ONLY IF LOCAL PROFILE DOESN'T EXIST
        ------------------------------------------- */

        if (
          !savedProfile.fullName &&
          !savedProfile.profileImage
        ) {

          try {

            const {
              data: profile,
              error:
                profileError,
            } =
              await supabase
                .from("profiles")
                .select(
                  "full_name, profile_picture"
                )
                .eq(
                  "id",
                  currentUser.id
                )
                .maybeSingle();


            if (
              !profileError &&
              profile
            ) {

              const databaseName =
                profile.full_name ||
                metadataName ||
                "";

              const databaseImage =
                profile.profile_picture ||
                "";


              setFullName(
                databaseName
              );

              setProfileImage(
                databaseImage
              );


              writeProfile({

                fullName:
                  databaseName,

                profileImage:
                  databaseImage,

              });
            }

          } catch (
            profileLoadError
          ) {

            console.warn(
              "Profile could not be loaded:",
              profileLoadError
            );
          }
        }
      }

    } catch (error) {

      console.error(
        "Settings initialization error:",
        error
      );

    } finally {

      setLoading(false);
    }
  };


  /* =====================================================
     AI TOGGLE
  ===================================================== */

  const toggleAiAssignment = () => {

    const newValue =
      !aiAutoAssignment;


    setAiAutoAssignment(
      newValue
    );


    const current =
      readSettings();


    writeSettings({

      ...current,

      aiAutoAssignment:
        newValue,

    });
  };


  /* =====================================================
     ADMIN REASSIGNMENT TOGGLE
  ===================================================== */

  const toggleAdminReassignment = () => {

    const newValue =
      !adminReassignment;


    setAdminReassignment(
      newValue
    );


    const current =
      readSettings();


    writeSettings({

      ...current,

      adminReassignment:
        newValue,

    });
  };


  /* =====================================================
     DELETE TOGGLE
  ===================================================== */

  const toggleComplaintDeletion = () => {

    const newValue =
      !complaintDeletion;


    setComplaintDeletion(
      newValue
    );


    const current =
      readSettings();


    writeSettings({

      ...current,

      complaintDeletion:
        newValue,

    });
  };


  /* =====================================================
     NOTIFICATION TOGGLE
  ===================================================== */

  const toggleNotification = (
    key
  ) => {

    const newNotifications = {

      ...notifications,

      [key]:
        !notifications[key],

    };


    setNotifications(
      newNotifications
    );


    const current =
      readSettings();


    writeSettings({

      ...current,

      notifications:
        newNotifications,

    });
  };


  /* =====================================================
     SAVE SYSTEM SETTINGS
  ===================================================== */

  const saveSystemSettings =
    async () => {

      if (savingSettings) {
        return;
      }


      try {

        setSavingSettings(
          true
        );


        setMessage("");


        /* -----------------------------------------------
           GET CURRENT SETTINGS
        ------------------------------------------------ */

        const settings = {

          aiAutoAssignment,

          adminReassignment,

          complaintDeletion,

          notifications: {
            ...notifications,
          },

        };


        /* -----------------------------------------------
           ALWAYS SAVE LOCALLY
        ------------------------------------------------ */

        const localSaved =
          writeSettings(
            settings
          );


        if (!localSaved) {

          throw new Error(
            "Browser storage is unavailable."
          );
        }


        /*
         * UI feedback first.
         */

        showMessage(
          "Settings saved successfully."
        );


        /* -----------------------------------------------
           PREPARE SUPABASE DATA
        ------------------------------------------------ */

        const databaseSettings = [

          {
            setting_key:
              "ai_auto_assignment",

            setting_value:
              aiAutoAssignment,
          },

          {
            setting_key:
              "admin_reassignment",

            setting_value:
              adminReassignment,
          },

          {
            setting_key:
              "complaint_deletion",

            setting_value:
              complaintDeletion,
          },

          {
            setting_key:
              "notification_new_complaints",

            setting_value:
              notifications.newComplaints,
          },

          {
            setting_key:
              "notification_ai_assignments",

            setting_value:
              notifications.aiAssignments,
          },

          {
            setting_key:
              "notification_status_updates",

            setting_value:
              notifications.statusUpdates,
          },

          {
            setting_key:
              "notification_duplicate_detection",

            setting_value:
              notifications.duplicateDetection,
          },

          {
            setting_key:
              "notification_new_residents",

            setting_value:
              notifications.newResidents,
          },

        ];


        /* -----------------------------------------------
           TRY DATABASE SAVE
        ------------------------------------------------ */

        try {

          const {
            error:
              databaseError,
          } =
            await supabase
              .from(
                "system_settings"
              )
              .upsert(
                databaseSettings,
                {
                  onConflict:
                    "setting_key",
                }
              );


          if (databaseError) {

            console.warn(
              "Supabase settings save failed:",
              databaseError
            );

            /*
             * Do NOT overwrite the local settings.
             *
             * The UI has already been saved successfully.
             */

            showMessage(
              "Settings saved on this device. Database sync needs to be configured.",
              "error"
            );

          } else {

            console.log(
              "Settings successfully saved to Supabase."
            );

            showMessage(
              "Settings saved successfully."
            );
          }

        } catch (
          databaseError
        ) {

          console.warn(
            "Database settings error:",
            databaseError
          );

          /*
           * Local save still remains valid.
           */

          showMessage(
            "Settings saved on this device. Database sync is unavailable.",
            "error"
          );
        }


      } catch (error) {

        console.error(
          "Settings save error:",
          error
        );


        showMessage(
          error?.message ||
            "Could not save settings.",
          "error"
        );


      } finally {

        setSavingSettings(
          false
        );
      }
    };


  /* =====================================================
     PROFILE IMAGE
  ===================================================== */

  const handleProfileImage =
    async (event) => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      if (!file.type.startsWith("image/")) {

        showMessage(
          "Please select an image file.",
          "error"
        );

        return;
      }


      try {

        setUploadingImage(
          true
        );

        setMessage("");


        /* -----------------------------------------------
           COMPRESS IMAGE
        ------------------------------------------------ */

        const compressedImage =
          await compressImage(
            file,
            500,
            0.75
          );


        /* -----------------------------------------------
           SAVE LOCALLY IMMEDIATELY
        ------------------------------------------------ */

        const savedProfile =
          readProfile();


        const updatedProfile = {

          ...savedProfile,

          fullName:
            fullName || "",

          profileImage:
            compressedImage,

        };


        const localSaved =
          writeProfile(
            updatedProfile
          );


        if (!localSaved) {

          throw new Error(
            "Could not save profile picture locally."
          );
        }


        /* -----------------------------------------------
           SHOW IMAGE IMMEDIATELY
        ------------------------------------------------ */

        setProfileImage(
          compressedImage
        );


        showMessage(
          "Profile picture updated successfully."
        );


        /* -----------------------------------------------
           TRY SUPABASE STORAGE
        ------------------------------------------------ */

        if (user) {

          try {

            /*
             * Convert compressed base64
             * back into a Blob.
             */

            const response =
              await fetch(
                compressedImage
              );


            const blob =
              await response.blob();


            const filePath =
              `admin/${user.id}.jpg`;


            const {
              error:
                uploadError,
            } =
              await supabase.storage
                .from(
                  "profile-images"
                )
                .upload(
                  filePath,
                  blob,
                  {
                    upsert: true,
                    contentType:
                      "image/jpeg",
                  }
                );


            if (
              uploadError
            ) {

              console.warn(
                "Supabase image upload failed:",
                uploadError
              );

              /*
               * Local image still works.
               */

              return;
            }


            /* -------------------------------------------
               GET PUBLIC URL
            ------------------------------------------- */

            const {
              data:
                publicUrlData,
            } =
              supabase.storage
                .from(
                  "profile-images"
                )
                .getPublicUrl(
                  filePath
                );


            const publicUrl =
              publicUrlData?.publicUrl;


            if (publicUrl) {

              /* -----------------------------------------
                 SAVE URL TO PROFILE
              ----------------------------------------- */

              const {
                error:
                  profileError,
              } =
                await supabase
                  .from(
                    "profiles"
                  )
                  .update({
                    profile_picture:
                      publicUrl,
                  })
                  .eq(
                    "id",
                    user.id
                  );


              if (
                profileError
              ) {

                console.warn(
                  "Could not save profile image URL:",
                  profileError
                );

                return;
              }


              /*
               * Keep public URL locally.
               */

              writeProfile({

                fullName:
                  fullName || "",

                profileImage:
                  publicUrl,

              });


              setProfileImage(
                `${publicUrl}?t=${Date.now()}`
              );
            }

          } catch (
            databaseImageError
          ) {

            console.warn(
              "Supabase profile image sync failed:",
              databaseImageError
            );

            /*
             * Local image remains available.
             */
          }
        }


      } catch (error) {

        console.error(
          "Profile image error:",
          error
        );


        showMessage(
          error?.message ||
            "Could not update profile picture.",
          "error"
        );


      } finally {

        setUploadingImage(
          false
        );


        /*
         * Allow selecting the same
         * image again.
         */

        event.target.value =
          "";
      }
    };


  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const saveProfile =
    async () => {

      if (!user) {

        showMessage(
          "No administrator account found.",
          "error"
        );

        return;
      }


      const cleanName =
        fullName.trim();


      if (!cleanName) {

        showMessage(
          "Please enter your name.",
          "error"
        );

        return;
      }


      try {

        setSavingProfile(
          true
        );


        setMessage("");


        /* -----------------------------------------------
           SAVE LOCALLY FIRST
        ------------------------------------------------ */

        writeProfile({

          fullName:
            cleanName,

          profileImage:
            profileImage || "",

        });


        /* -----------------------------------------------
           SAVE PROFILE DATABASE
        ------------------------------------------------ */

        const {
          error:
            profileError,
        } =
          await supabase
            .from(
              "profiles"
            )
            .update({
              full_name:
                cleanName,
            })
            .eq(
              "id",
              user.id
            );


        if (profileError) {

          console.warn(
            "Supabase profile save failed:",
            profileError
          );


          /*
           * Local profile is still saved.
           */

          showMessage(
            "Profile saved on this device. Database sync needs to be configured.",
            "error"
          );


          return;
        }


        /* -----------------------------------------------
           SAVE AUTH METADATA
        ------------------------------------------------ */

        try {

          await supabase.auth
            .updateUser({
              data: {
                full_name:
                  cleanName,
              },
            });

        } catch (
          authError
        ) {

          console.warn(
            "Auth metadata update failed:",
            authError
          );
        }


        showMessage(
          "Profile saved successfully."
        );


      } catch (error) {

        console.error(
          "Profile save error:",
          error
        );


        showMessage(
          error?.message ||
            "Could not save profile.",
          "error"
        );


      } finally {

        setSavingProfile(
          false
        );
      }
    };


  /* =====================================================
     CHANGE PASSWORD
  ===================================================== */

  const handleChangePassword =
    async () => {

      if (!email) {

        showMessage(
          "No email address found.",
          "error"
        );

        return;
      }


      try {

        const {
          error,
        } =
          await supabase.auth
            .resetPasswordForEmail(
              email
            );


        if (error) {
          throw error;
        }


        showMessage(
          "Password reset email sent."
        );


      } catch (error) {

        console.error(
          "Password reset error:",
          error
        );


        showMessage(
          error?.message ||
            "Could not send password reset email.",
          "error"
        );
      }
    };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout =
    async () => {

      try {

        const {
          error,
        } =
          await supabase.auth
            .signOut();


        if (error) {
          throw error;
        }


        window.location.href =
          "/admin/login";


      } catch (error) {

        console.error(
          "Logout error:",
          error
        );


        showMessage(
          error?.message ||
            "Could not sign out.",
          "error"
        );
      }
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <AdminLayout>

        <div
          className=
            "admin-settings-loading"
        >

          <Loader2
            size={28}
            className=
              "settings-spinner"
          />

          <span>
            Loading settings...
          </span>

        </div>

      </AdminLayout>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <AdminLayout>

      <div
        className=
          "admin-settings-page"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className=
            "settings-page-header"
        >

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

          <div
            className={
              messageType === "error"
                ? "settings-error-message"
                : "settings-success-message"
            }
          >

            {messageType === "error" ? (

              <AlertCircle
                size={17}
              />

            ) : (

              <Check
                size={17}
              />

            )}

            <span>
              {message}
            </span>

          </div>

        )}


        {/* =================================================
            PROFILE
        ================================================= */}

        <section
          className=
            "settings-card"
        >

          <div
            className=
              "settings-card-header"
          >

            <div
              className=
                "settings-section-icon"
            >

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


          <div
            className=
              "settings-profile-body"
          >

            {/* PROFILE IMAGE */}

            <div
              className=
                "settings-avatar-area"
            >

              <div
                className=
                  "settings-large-avatar"
              >

                {profileImage ? (

                  <img
                    src={
                      profileImage
                    }
                    alt=
                      "Admin profile"
                  />

                ) : (

                  <UserRound
                    size={42}
                    strokeWidth={1.5}
                  />

                )}

              </div>


              <label
                className=
                  "change-photo-button"
              >

                <Camera
                  size={15}
                />

                {uploadingImage
                  ? "Uploading..."
                  : "Change photo"}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleProfileImage
                  }
                  disabled={
                    uploadingImage
                  }
                  hidden
                />

              </label>

            </div>


            {/* PROFILE FORM */}

            <div
              className=
                "settings-profile-form"
            >

              <div
                className=
                  "settings-field"
              >

                <label>
                  Full Name
                </label>

                <div
                  className=
                    "settings-input-wrapper"
                >

                  <UserRound
                    size={17}
                  />

                  <input
                    type="text"
                    value={
                      fullName
                    }
                    onChange={
                      (event) =>
                        setFullName(
                          event.target.value
                        )
                    }
                    placeholder=
                      "Enter your name"
                  />

                </div>

              </div>


              <div
                className=
                  "settings-field"
              >

                <label>
                  Email
                </label>

                <div
                  className=
                    "settings-input-wrapper disabled"
                >

                  <Mail
                    size={17}
                  />

                  <input
                    type="email"
                    value={
                      email
                    }
                    disabled
                  />

                </div>

                <small>
                  Your login email cannot be
                  changed here.
                </small>

              </div>


              <div
                className=
                  "settings-field"
              >

                <label>
                  Role
                </label>

                <div
                  className=
                    "settings-role-badge"
                >

                  <ShieldCheck
                    size={16}
                  />

                  Administrator

                </div>

              </div>


              <div
                className=
                  "settings-profile-actions"
              >

                <button
                  type="button"
                  className=
                    "settings-primary-button"
                  onClick={
                    saveProfile
                  }
                  disabled={
                    savingProfile
                  }
                >

                  {savingProfile ? (

                    <>
                      <Loader2
                        size={17}
                        className=
                          "settings-spinner"
                      />

                      Saving...
                    </>

                  ) : (

                    <>
                      <Save
                        size={17}
                      />

                      Save Profile
                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            COMPLAINT AUTOMATION
        ================================================= */}

        <section
          className=
            "settings-card"
        >

          <div
            className=
              "settings-card-header"
          >

            <div
              className=
                "settings-section-icon ai"
            >

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


          <div
            className=
              "settings-options"
          >

            {/* AI AUTOMATIC ASSIGNMENT */}

            <div
              className=
                "settings-option"
            >

              <div
                className=
                  "settings-option-icon"
              >

                <Sparkles
                  size={19}
                />

              </div>


              <div
                className=
                  "settings-option-content"
              >

                <div
                  className=
                    "settings-option-title"
                >

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

                  <div
                    className=
                      "settings-info-note"
                  >

                    <Sparkles
                      size={15}
                    />

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
                onClick={
                  toggleAiAssignment
                }
                aria-pressed={
                  aiAutoAssignment
                }
              >

                <span />

              </button>

            </div>


            {/* ADMIN REASSIGNMENT */}

            <div
              className=
                "settings-option"
            >

              <div
                className=
                  "settings-option-icon"
              >

                <UserCog
                  size={19}
                />

              </div>


              <div
                className=
                  "settings-option-content"
              >

                <div
                  className=
                    "settings-option-title"
                >

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
                onClick={
                  toggleAdminReassignment
                }
                aria-pressed={
                  adminReassignment
                }
              >

                <span />

              </button>

            </div>


            {/* COMPLAINT DELETION */}

            <div
              className=
                "settings-option"
            >

              <div
                className=
                  "settings-option-icon danger"
              >

                <Trash2
                  size={19}
                />

              </div>


              <div
                className=
                  "settings-option-content"
              >

                <div
                  className=
                    "settings-option-title"
                >

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
                onClick={
                  toggleComplaintDeletion
                }
                aria-pressed={
                  complaintDeletion
                }
              >

                <span />

              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section
          className=
            "settings-card"
        >

          <div
            className=
              "settings-card-header"
          >

            <div
              className=
                "settings-section-icon"
            >

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


          <div
            className=
              "settings-options"
          >

            {[
              {
                key:
                  "newComplaints",

                title:
                  "New Complaints",

                description:
                  "Get notified when a resident submits a new complaint.",
              },

              {
                key:
                  "aiAssignments",

                title:
                  "AI Assignments",

                description:
                  "Get notified when AI recommends or automatically assigns a department.",
              },

              {
                key:
                  "statusUpdates",

                title:
                  "Status Updates",

                description:
                  "Get notified when a complaint status changes.",
              },

              {
                key:
                  "duplicateDetection",

                title:
                  "Duplicate Detection",

                description:
                  "Get notified when AI detects a possible duplicate complaint.",
              },

              {
                key:
                  "newResidents",

                title:
                  "New Residents",

                description:
                  "Get notified when a new resident account is created.",
              },

            ].map(
              (item) => (

                <div
                  className=
                    "settings-option"
                  key={
                    item.key
                  }
                >

                  <div
                    className=
                      "settings-option-icon"
                  >

                    <Bell
                      size={18}
                    />

                  </div>


                  <div
                    className=
                      "settings-option-content"
                  >

                    <div
                      className=
                        "settings-option-title"
                    >

                      {item.title}

                      <span
                        className={
                          `settings-status-pill ${
                            notifications[
                              item.key
                            ]
                              ? "enabled"
                              : "disabled"
                          }`
                        }
                      >

                        {notifications[
                          item.key
                        ]
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
                        notifications[
                          item.key
                        ]
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      toggleNotification(
                        item.key
                      )
                    }
                    aria-pressed={
                      notifications[
                        item.key
                      ]
                    }
                  >

                    <span />

                  </button>

                </div>

              )
            )}

          </div>

        </section>


        {/* =================================================
            SAVE SETTINGS
        ================================================= */}

        <div
          className=
            "settings-bottom-actions"
        >

          <button
            type="button"
            className=
              "settings-primary-button large"
            disabled={
              savingSettings
            }
            onClick={
              saveSystemSettings
            }
          >

            {savingSettings ? (

              <>
                <Loader2
                  size={18}
                  className=
                    "settings-spinner"
                />

                Saving...
              </>

            ) : (

              <>
                <Save
                  size={18}
                />

                Save Settings
              </>

            )}

          </button>

        </div>


        {/* =================================================
            SECURITY
        ================================================= */}

        <section
          className=
            "settings-card"
        >

          <div
            className=
              "settings-card-header"
          >

            <div
              className=
                "settings-section-icon"
            >

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


          <div
            className=
              "settings-security-row"
          >

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
              className=
                "settings-secondary-button"
              onClick={
                handleChangePassword
              }
            >

              Change Password

            </button>

          </div>

        </section>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <section
          className=
            "settings-danger-card"
        >

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
            className=
              "settings-logout-button"
            onClick={
              handleLogout
            }
          >

            <LogOut
              size={17}
            />

            Sign Out

          </button>

        </section>

      </div>

    </AdminLayout>
  );
}


export default AdminSettings;