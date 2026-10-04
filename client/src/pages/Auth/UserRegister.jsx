import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Phone,
  CheckCircle,
  LogIn,
  KeyRound,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import loginImage from "../../assets/images/user-login-image.png";
import "../../styles/UserAuth.css";

function UserRegister() {
  const navigate = useNavigate();

  // =========================================
  // FORM VALUES
  // =========================================

  const [fullName, setFullName] = useState("");
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  // =========================================
  // UI STATES
  // =========================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // REGISTER
  // =========================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =========================================
    // BASIC VALIDATION
    // =========================================

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!loginValue.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    const email = loginValue.trim().toLowerCase();

    // =========================================
    // EMAIL ONLY FOR NOW
    // =========================================

    if (!email.includes("@")) {
      setError(
        "Phone registration will be available after we configure Phone Authentication."
      );
      return;
    }

    // =========================================
    // PASSWORD VALIDATION
    // =========================================

    if (!password) {
      setError("Please enter a password.");
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
        "Please confirm your password."
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
      setLoading(true);

      // =========================================
      // CREATE ACCOUNT
      // =========================================

      const {
        data,
        error: signupError,
      } = await supabase.auth.signUp({
        email: email,
        password: password,

        options: {
          emailRedirectTo:
            `${window.location.origin}/user/login`,

          data: {
            full_name: fullName.trim(),
            preferred_language: "English",
          },
        },
      });

      // =========================================
      // HANDLE SIGNUP ERROR
      // =========================================

      if (signupError) {
        console.error(
          "Supabase signup error:",
          signupError
        );

        const errorMessage =
          signupError.message?.toLowerCase() || "";

        // =======================================
        // DUPLICATE ACCOUNT
        // =======================================

        if (
          errorMessage.includes(
            "already registered"
          ) ||
          errorMessage.includes(
            "already exists"
          ) ||
          errorMessage.includes(
            "user already registered"
          ) ||
          errorMessage.includes(
            "email already"
          )
        ) {
          setError(
            "This email or mobile number is already in use."
          );

          return;
        }

        // =======================================
        // WEAK PASSWORD
        // =======================================

        if (
          errorMessage.includes("password") &&
          (
            errorMessage.includes("weak") ||
            errorMessage.includes("short")
          )
        ) {
          setError(
            "Please choose a stronger password."
          );

          return;
        }

        // =======================================
        // INVALID EMAIL
        // =======================================

        if (
          errorMessage.includes(
            "invalid email"
          )
        ) {
          setError(
            "Please enter a valid email address."
          );

          return;
        }

        // =======================================
        // GENERIC ERROR
        // =======================================

        setError(
          signupError.message ||
            "Unable to create your account. Please try again."
        );

        return;
      }

      // =========================================
      // NEW ACCOUNT / EMAIL VERIFICATION
      // =========================================

      if (data?.user && !data?.session) {

        setSuccess(true);

        // Clear password fields
        setPassword("");
        setConfirmPassword("");

        return;
      }

      // =========================================
      // SESSION EXISTS
      // =========================================

      if (data?.session) {

        setSuccess(false);

        setTimeout(() => {
          navigate("/user", {
            replace: true,
          });
        }, 1000);

        return;
      }

      // =========================================
      // FALLBACK
      // =========================================

      setSuccess(true);

      setPassword("");
      setConfirmPassword("");

    } catch (registerException) {
      console.error(
        "Registration exception:",
        registerException
      );

      const errorMessage =
        registerException?.message?.toLowerCase() ||
        "";

      if (
        errorMessage.includes(
          "already registered"
        ) ||
        errorMessage.includes(
          "already exists"
        )
      ) {
        setError(
          "This email or mobile number is already in use."
        );

        return;
      }

      setError(
        "Unable to create your account. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GOOGLE
  // =========================================

  const handleGoogleRegister = async () => {
    setError("");
    setSuccess(false);

    try {
      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",

          options: {
            redirectTo:
              `${window.location.origin}/user`,
          },
        });

      if (googleError) {
        throw googleError;
      }

    } catch (googleException) {
      console.error(
        "Google registration error:",
        googleException
      );

      setError(
        googleException.message ||
          "Unable to continue with Google."
      );
    }
  };

  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = () => {
    navigate("/user/login");
  };

  // =========================================
  // FORGOT PASSWORD
  // =========================================

  const handleForgotPassword = () => {
    /*
     * If the user entered an email before
     * clicking Forgot Password, carry it to
     * the login page.
     */

    if (loginValue.trim()) {
      navigate("/user/login", {
        state: {
          email: loginValue.trim(),
          forgotPassword: true,
        },
      });

      return;
    }

    navigate("/user/login");
  };

  // =========================================
  // INPUT CHANGE
  // =========================================

  const clearMessages = () => {
    setError("");
    setSuccess(false);
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="user-auth-page">

      <div className="user-auth-card">

        {/* =========================================
            HEADER IMAGE
        ========================================= */}

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


        {/* =========================================
            REGISTER CONTENT
        ========================================= */}

        <div className="user-auth-content">

          <h2>
            Create Account
          </h2>

          <p className="auth-subtitle">
            Register to report and track civic issues
          </p>


          {/* =====================================
              ERROR MESSAGE
          ===================================== */}

          {error && (
            <div
              className="auth-error-message"
              style={{
                display: "block",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >

                <span
                  style={{
                    fontSize: "18px",
                    lineHeight: "1",
                  }}
                >
                  ⚠
                </span>

                <span>
                  {error}
                </span>

              </div>

              {/* ---------------------------------
                  DUPLICATE ACCOUNT ACTIONS
              --------------------------------- */}

              {error.includes(
                "already in use"
              ) && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "14px",
                  }}
                >

                  <button
                    type="button"
                    onClick={handleLogin}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "7px",
                      background:
                        "#16834b",
                      color: "#ffffff",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >

                    <LogIn size={15} />

                    Login

                  </button>


                  <button
                    type="button"
                    onClick={
                      handleForgotPassword
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      border:
                        "1px solid #16834b",
                      borderRadius: "7px",
                      background:
                        "transparent",
                      color: "#16834b",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >

                    <KeyRound size={15} />

                    Forgot Password

                  </button>

                </div>
              )}

            </div>
          )}


          {/* =====================================
              SUCCESS MESSAGE
          ===================================== */}

          {success && (
            <div
              className="auth-success-message"
              style={{
                display: "block",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9px",
                }}
              >

                <CheckCircle
                  size={19}
                  style={{
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />

                <div>

                  <strong>
                    Account setup
                  </strong>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      lineHeight: "1.5",
                    }}
                  >
                    If this email is new,
                    your account has been
                    created. Please check
                    your inbox to verify
                    your email.
                  </p>

                </div>

              </div>


              {/* ---------------------------------
                  ACTIONS
              --------------------------------- */}

              <div
                style={{
                  marginTop: "12px",
                  paddingLeft: "28px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >

                Already have an account?

                <button
                  type="button"
                  onClick={handleLogin}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color: "#16834b",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding:
                      "0 4px",
                  }}
                >
                  Login
                </button>

                or use

                <button
                  type="button"
                  onClick={
                    handleForgotPassword
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color: "#16834b",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding:
                      "0 4px",
                  }}
                >
                  Forgot Password
                </button>

                .

              </div>

            </div>
          )}


          {/* =====================================
              REGISTER FORM
          ===================================== */}

          <form onSubmit={handleRegister}>

            {/* ===================================
                FULL NAME
            =================================== */}

            <div className="user-form-group">

              <label htmlFor="register-name">
                Full Name
              </label>

              <div className="user-input-wrapper">

                <User
                  className="user-input-icon"
                  size={18}
                />

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(
                      e.target.value
                    );
                    clearMessages();
                  }}
                  required
                />

              </div>

            </div>


            {/* ===================================
                EMAIL / MOBILE
            =================================== */}

            <div className="user-form-group">

              <label htmlFor="register-login">
                Email or Mobile Number
              </label>

              <div className="user-input-wrapper">

                {loginValue.includes("@") ||
                loginValue === "" ? (
                  <Mail
                    className="user-input-icon"
                    size={18}
                  />
                ) : (
                  <Phone
                    className="user-input-icon"
                    size={18}
                  />
                )}

                <input
                  id="register-login"
                  type="text"
                  placeholder="Enter your email or mobile number"
                  autoComplete="email"
                  value={loginValue}
                  onChange={(e) => {
                    setLoginValue(
                      e.target.value
                    );
                    clearMessages();
                  }}
                  required
                />

              </div>

            </div>


            {/* ===================================
                PASSWORD
            =================================== */}

            <div className="user-form-group">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="user-input-wrapper">

                <Lock
                  className="user-input-icon"
                  size={18}
                />

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(
                      e.target.value
                    );
                    clearMessages();
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


            {/* ===================================
                CONFIRM PASSWORD
            =================================== */}

            <div className="user-form-group">

              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>

              <div className="user-input-wrapper">

                <Lock
                  className="user-input-icon"
                  size={18}
                />

                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );
                    clearMessages();
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


            {/* ===================================
                REGISTER BUTTON
            =================================== */}

            <button
              type="submit"
              className="user-login-button"
              disabled={loading}
            >

              <UserPlus size={18} />

              <span>
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </span>

            </button>

          </form>


          {/* =========================================
              DIVIDER
          ========================================= */}

          <div className="user-divider">

            <span></span>

            <p>or</p>

            <span></span>

          </div>


          {/* =========================================
              GOOGLE
          ========================================= */}

          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleRegister}
            disabled={loading}
          >

            <span className="google-icon">
              G
            </span>

            <span>
              Continue with Google
            </span>

          </button>


          {/* =========================================
              LOGIN
          ========================================= */}

          <div className="register-link-row">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={handleLogin}
            >
              Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default UserRegister;