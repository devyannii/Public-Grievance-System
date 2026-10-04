import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  UserCircle,
  Building2,
  Mail,
  ShieldCheck,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import "./StaffProfile.css";

function StaffProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [department, setDepartment] = useState(null);

  const [fullName, setFullName] = useState("");

  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!currentUser) {
        navigate("/staff/login");
        return;
      }

      setUser(currentUser);

      /* =====================================================
         STAFF PROFILE
      ===================================================== */

      const {
        data: staffProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, role, department_id, profile_picture"
        )
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (
        !staffProfile ||
        staffProfile.role !==
          "department_staff"
      ) {
        navigate("/staff/login");
        return;
      }

      setProfile(staffProfile);
      setFullName(
        staffProfile.full_name || ""
      );

      /* =====================================================
         DEPARTMENT
      ===================================================== */

      if (staffProfile.department_id) {
        const {
          data: departmentData,
          error: departmentError,
        } = await supabase
          .from("departments")
          .select(
            "id, name, description, is_active"
          )
          .eq(
            "id",
            staffProfile.department_id
          )
          .maybeSingle();

        if (departmentError) {
          throw departmentError;
        }

        setDepartment(departmentData);
      }
    } catch (err) {
      console.error(
        "Staff profile error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSaveProfile = async () => {
    const trimmedName =
      fullName.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const {
        data: updatedProfile,
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select(
          "id, full_name, role, department_id, profile_picture"
        )
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(updatedProfile);
      setFullName(
        updatedProfile.full_name || ""
      );

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!newPassword) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const {
        error: passwordError,
      } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) {
        throw passwordError;
      }

      setNewPassword("");
      setConfirmPassword("");

      setSuccess(
        "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "Password change error:",
        err
      );

      setError(
        err?.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/staff/login");
    } catch (err) {
      console.error(
        "Logout error:",
        err
      );
    }
  };

  /* =========================================================
     INITIALS
  ========================================================= */

  const getInitials = (
    name = ""
  ) => {
    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) =>
          word
            .charAt(0)
            .toUpperCase()
        )
        .join("") || "S"
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="staff-profile-loading">
        <Loader2
          size={34}
          className="staff-profile-loader"
        />

        <p>
          Loading profile...
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR WITHOUT PROFILE
  ========================================================= */

  if (!profile) {
    return (
      <div className="staff-profile-error-page">
        <div className="staff-profile-error-card">
          <AlertCircle size={40} />

          <h2>
            Unable to load profile
          </h2>

          <p>
            {error ||
              "Your staff profile could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/staff/dashboard"
              )
            }
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <div className="staff-profile-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="staff-profile-topbar">
        <button
          type="button"
          className="staff-profile-back"
          onClick={() =>
            navigate(
              "/staff/dashboard"
            )
          }
        >
          <ArrowLeft size={17} />
          <span>
            Back to Dashboard
          </span>
        </button>

        <div className="staff-profile-top-title">
          <span>
            DEPARTMENT STAFF
          </span>

          <strong>
            My Profile
          </strong>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="staff-profile-content">

        {/* PAGE TITLE */}

        <section className="staff-profile-heading">
          <div>
            <p>
              STAFF ACCOUNT
            </p>

            <h1>
              My Profile
            </h1>

            <span>
              View and manage your department staff account.
            </span>
          </div>
        </section>

        {/* ===================================================
            ALERTS
        =================================================== */}

        {error && (
          <div className="staff-profile-alert error">
            <AlertCircle size={17} />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="staff-profile-alert success">
            <CheckCircle2 size={17} />

            <span>
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* ===================================================
            PROFILE OVERVIEW
        =================================================== */}

        <section className="staff-profile-card profile-overview-card">

          <div className="staff-profile-avatar-large">
            {profile.profile_picture ? (
              <img
                src={
                  profile.profile_picture
                }
                alt={
                  profile.full_name ||
                  "Staff"
                }
              />
            ) : (
              getInitials(
                profile.full_name
              )
            )}
          </div>

          <div className="staff-profile-overview-info">

            <h2>
              {profile.full_name ||
                "Department Staff"}
            </h2>

            <p>
              {user?.email || "—"}
            </p>

            <div className="staff-profile-badges">
              <span>
                <ShieldCheck size={13} />
                Department Staff
              </span>

              <span>
                <Building2 size={13} />
                {department?.name ||
                  "Department"}
              </span>
            </div>

          </div>

        </section>

        {/* ===================================================
            PERSONAL INFORMATION
        =================================================== */}

        <section className="staff-profile-card">

          <div className="staff-profile-card-heading">
            <div className="staff-profile-heading-icon">
              <UserCircle size={18} />
            </div>

            <div>
              <h2>
                Personal Information
              </h2>

              <p>
                Update your basic profile information.
              </p>
            </div>
          </div>

          <div className="staff-profile-form">

            <div className="staff-profile-field">
              <label>
                Full Name
              </label>

              <div className="staff-profile-input-wrapper">
                <UserCircle size={16} />

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="staff-profile-field">
              <label>
                Email Address
              </label>

              <div className="staff-profile-input-wrapper disabled">
                <Mail size={16} />

                <input
                  type="email"
                  value={
                    user?.email || ""
                  }
                  disabled
                  readOnly
                />
              </div>

              <small>
                Your login email is managed through authentication.
              </small>
            </div>

            <div className="staff-profile-field">
              <label>
                Role
              </label>

              <div className="staff-profile-input-wrapper disabled">
                <ShieldCheck size={16} />

                <input
                  type="text"
                  value="Department Staff"
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div className="staff-profile-field">
              <label>
                Department
              </label>

              <div className="staff-profile-input-wrapper disabled">
                <Building2 size={16} />

                <input
                  type="text"
                  value={
                    department?.name ||
                    "Not assigned"
                  }
                  disabled
                  readOnly
                />
              </div>
            </div>

          </div>

          <div className="staff-profile-card-footer">
            <button
              type="button"
              className="staff-save-button"
              onClick={
                handleSaveProfile
              }
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2
                    size={15}
                    className="spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </section>

        {/* ===================================================
            DEPARTMENT INFORMATION
        =================================================== */}

        <section className="staff-profile-card">

          <div className="staff-profile-card-heading">
            <div className="staff-profile-heading-icon">
              <Building2 size={18} />
            </div>

            <div>
              <h2>
                Department Information
              </h2>

              <p>
                Your current department assignment.
              </p>
            </div>
          </div>

          <div className="staff-department-profile">

            <div className="staff-department-profile-icon">
              <Building2 size={24} />
            </div>

            <div className="staff-department-profile-info">
              <span>
                Assigned Department
              </span>

              <strong>
                {department?.name ||
                  "Not assigned"}
              </strong>

              {department?.description && (
                <p>
                  {department.description}
                </p>
              )}
            </div>

            <span
              className={
                department?.is_active
                  ? "department-active"
                  : "department-inactive"
              }
            >
              {department?.is_active
                ? "Active"
                : "Inactive"}
            </span>

          </div>

        </section>

        {/* ===================================================
            CHANGE PASSWORD
        =================================================== */}

        <section className="staff-profile-card">

          <div className="staff-profile-card-heading">
            <div className="staff-profile-heading-icon">
              <Lock size={18} />
            </div>

            <div>
              <h2>
                Change Password
              </h2>

              <p>
                Update your staff account password.
              </p>
            </div>
          </div>

          <div className="staff-password-form">

            <div className="staff-profile-field">
              <label>
                New Password
              </label>

              <div className="staff-profile-input-wrapper">
                <Lock size={16} />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowNewPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showNewPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="staff-profile-field">
              <label>
                Confirm New Password
              </label>

              <div className="staff-profile-input-wrapper">
                <Lock size={16} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

          </div>

          <div className="staff-password-note">
            Password must contain at least 6 characters.
          </div>

          <div className="staff-profile-card-footer">
            <button
              type="button"
              className="staff-save-button"
              onClick={
                handleChangePassword
              }
              disabled={
                changingPassword
              }
            >
              {changingPassword ? (
                <>
                  <Loader2
                    size={15}
                    className="spin"
                  />

                  Updating...
                </>
              ) : (
                <>
                  <Lock size={15} />

                  Change Password
                </>
              )}
            </button>
          </div>

        </section>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <section className="staff-profile-card staff-logout-card">

          <div>
            <h2>
              Sign out
            </h2>

            <p>
              Sign out of your department staff account on this device.
            </p>
          </div>

          <button
            type="button"
            className="staff-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </section>

      </main>
    </div>
  );
}

export default StaffProfile;