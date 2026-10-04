import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import loginImage from "../../assets/images/user-login-image.png";
import "../../styles/UserAuth.css";

function ResetPassword() {
  const navigate = useNavigate();

  // =========================================
  // FORM
  // =========================================

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  // =========================================
  // UI
  // =========================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [validSession, setValidSession] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // CHECK PASSWORD RECOVERY SESSION
  // =========================================

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      try {
        /*
         * Supabase may restore the recovery session
         * asynchronously after the page loads.
         *
         * So we listen for PASSWORD_RECOVERY first
         * instead of immediately declaring the link
         * invalid.
         */

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session && mounted) {
          setValidSession(true);
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "Recovery session error:",
          err
        );
      }
    };

    checkRecoverySession();

    // =========================================
    // LISTEN FOR PASSWORD RECOVERY EVENT
    // =========================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "Auth event:",
          event
        );

        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setValidSession(true);
          setLoading(false);
          setError("");
        }

        if (
          event === "SIGNED_IN" &&
          session
        ) {
          /*
           * Sometimes the recovery flow can arrive
           * as a signed-in session.
           */
          setValidSession(true);
          setLoading(false);
        }
      }
    );

    // =========================================
    // GIVE SUPABASE TIME TO PROCESS THE URL
    // =========================================

    const timeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);

        /*
         * Only show invalid-link message if we still
         * don't have a valid session.
         */
        setValidSession((current) => {
          if (!current) {
            setError(
              "This password reset link is invalid or has expired. Please request a new one."
            );
          }

          return current;
        });
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // =========================================
  // UPDATE PASSWORD
  // =========================================

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------------------
    // VALIDATE
    // -----------------------------------------

    if (!password) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setUpdating(true);

      // =========================================
      // UPDATE PASSWORD IN SUPABASE
      // =========================================

      const { error: updateError } =
        await supabase.auth.updateUser({
          password: password,
        });

      if (updateError) {
        console.error(
          "Password update error:",
          updateError
        );

        setError(
          updateError.message ||
            "Unable to update your password. Please request a new reset link."
        );

        return;
      }

      // =========================================
      // SUCCESS
      // =========================================

      setSuccess(
        "Your password has been updated successfully!"
      );

      setPassword("");
      setConfirmPassword("");

      // =========================================
      // SIGN OUT RECOVERY SESSION
      // =========================================

      await supabase.auth.signOut();

      // =========================================
      // GO TO LOGIN
      // =========================================

      setTimeout(() => {
        navigate("/user/login", {
          replace: true,
        });
      }, 1800);

    } catch (updateException) {
      console.error(
        "Password update exception:",
        updateException
      );

      setError(
        "Unable to update your password. Please try requesting a new reset link."
      );

    } finally {
      setUpdating(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="user-auth-page">

        <div className="user-auth-card">

          <div
            className="user-auth-hero"
            style={{
              backgroundImage: `url("${loginImage}")`,
            }}
          >
            <div className="user-hero-overlay"></div>

            <div className="user-brand">

              <h1>
                UNIFIED
                <span>
                  GRIEVANCE SYSTEM
                </span>
              </h1>

              <div className="brand-divider"></div>

              <p>
                Building Better Communities
              </p>

            </div>
          </div>

          <div
            className="user-auth-content"
            style={{
              textAlign: "center",
              paddingTop: "45px",
            }}
          >

            <h2>
              Reset Password
            </h2>

            <p className="auth-subtitle">
              Verifying your password reset link...
            </p>

            <div
              style={{
                marginTop: "30px",
                fontSize: "14px",
                color: "#718096",
              }}
            >
              Please wait...
            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================
  // INVALID / EXPIRED LINK
  // =========================================

  if (!validSession) {
    return (
      <div className="user-auth-page">

        <div className="user-auth-card">

          {/* =====================================
              HERO
          ===================================== */}

          <div
            className="user-auth-hero"
            style={{
              backgroundImage: `url("${loginImage}")`,
            }}
          >

            <div className="user-hero-overlay"></div>

            <div className="user-brand">

              <h1>
                UNIFIED
                <span>
                  GRIEVANCE SYSTEM
                </span>
              </h1>

              <div className="brand-divider"></div>

              <p>
                Building Better Communities
              </p>

            </div>

          </div>


          {/* =====================================
              ERROR CONTENT
          ===================================== */}

          <div
            className="user-auth-content"
            style={{
              paddingTop: "40px",
            }}
          >

            <h2>
              Reset Password
            </h2>

            <p className="auth-subtitle">
              Create a new password for your account
            </p>


            {error && (
              <div
                className="auth-error-message"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  textAlign: "left",
                }}
              >

                <AlertCircle
                  size={20}
                  style={{
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                />

                <span>
                  {error}
                </span>

              </div>
            )}


            <div
              style={{
                marginTop: "22px",
                textAlign: "center",
                fontSize: "13px",
                color: "#718096",
              }}
            >

              Please request a new password reset
              link from the login page.

            </div>


            <button
              type="button"
              className="user-login-button"
              style={{
                marginTop: "22px",
              }}
              onClick={() =>
                navigate("/user/login")
              }
            >
              Request New Link
            </button>


            <div
              className="register-link-row"
              style={{
                marginTop: "18px",
              }}
            >

              <span>
                Remember your password?
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate("/user/login")
                }
              >
                Login
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================
  // VALID RESET SESSION
  // =========================================

  return (
    <div className="user-auth-page">

      <div className="user-auth-card">

        {/* =====================================
            HERO
        ===================================== */}

        <div
          className="user-auth-hero"
          style={{
            backgroundImage: `url("${loginImage}")`,
          }}
        >

          <div className="user-hero-overlay"></div>

          <div className="user-brand">

            <h1>
              UNIFIED
              <span>
                GRIEVANCE SYSTEM
              </span>
            </h1>

            <div className="brand-divider"></div>

            <p>
              Building Better Communities
            </p>

          </div>

        </div>


        {/* =====================================
            RESET FORM
        ===================================== */}

        <div className="user-auth-content">

          <h2>
            Reset Password
          </h2>

          <p className="auth-subtitle">
            Create a new password for your account
          </p>


          {/* ===================================
              ERROR
          =================================== */}

          {error && (
            <div
              className="auth-error-message"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                textAlign: "left",
              }}
            >

              <AlertCircle
                size={20}
                style={{
                  flexShrink: 0,
                }}
              />

              <span>
                {error}
              </span>

            </div>
          )}


          {/* ===================================
              SUCCESS
          =================================== */}

          {success && (
            <div
              className="auth-success-message"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textAlign: "left",
              }}
            >

              <CheckCircle
                size={20}
                style={{
                  flexShrink: 0,
                }}
              />

              <span>
                {success}
              </span>

            </div>
          )}


          {/* ===================================
              FORM
          =================================== */}

          {!success && (
            <form
              onSubmit={
                handleUpdatePassword
              }
            >

              {/* ===============================
                  NEW PASSWORD
              =============================== */}

              <div className="user-form-group">

                <label htmlFor="new-password">
                  New Password
                </label>

                <div className="user-input-wrapper">

                  <Lock
                    className="user-input-icon"
                    size={18}
                  />

                  <input
                    id="new-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(
                        e.target.value
                      );
                      setError("");
                    }}
                    required
                  />

                  <button
                    type="button"
                    className="user-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}

                  </button>

                </div>

              </div>


              {/* ===============================
                  CONFIRM PASSWORD
              =============================== */}

              <div className="user-form-group">

                <label htmlFor="confirm-password">
                  Confirm New Password
                </label>

                <div className="user-input-wrapper">

                  <Lock
                    className="user-input-icon"
                    size={18}
                  />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(
                        e.target.value
                      );
                      setError("");
                    }}
                    required
                  />

                  <button
                    type="button"
                    className="user-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}

                  </button>

                </div>

              </div>


              {/* ===============================
                  UPDATE PASSWORD
              =============================== */}

              <button
                type="submit"
                className="user-login-button"
                disabled={updating}
              >

                <Lock size={18} />

                <span>
                  {updating
                    ? "Updating Password..."
                    : "Update Password"}
                </span>

              </button>

            </form>
          )}


          {/* ===================================
              LOGIN
          =================================== */}

          <div
            className="register-link-row"
            style={{
              marginTop: "20px",
            }}
          >

            <span>
              Remember your password?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/user/login")
              }
            >
              Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;