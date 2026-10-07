import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  MailCheck,
  ArrowLeft,
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

  const [email, setEmail] = useState("");

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

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const [resending, setResending] =
    useState(false);


  // =========================================
  // CLEAR MESSAGES
  // =========================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };


  // =========================================
  // GET USER LOCATION
  // =========================================

  const requestUserLocation = () => {
    return new Promise((resolve) => {

      if (!("geolocation" in navigator)) {

        console.warn(
          "Geolocation is not supported by this browser."
        );

        resolve(null);

        return;
      }


      navigator.geolocation.getCurrentPosition(

        (position) => {

          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };


          localStorage.setItem(
            "userLocation",
            JSON.stringify(locationData)
          );


          console.log(
            "User location:",
            locationData
          );


          resolve(locationData);
        },


        (locationError) => {

          console.warn(
            "Location permission/error:",
            locationError.message
          );


          // Location is optional.
          // Registration continues even if
          // location permission is denied.

          resolve(null);
        },


        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }

      );

    });
  };


  // =========================================
  // REGISTER
  // =========================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    // -----------------------------------------
    // FULL NAME VALIDATION
    // -----------------------------------------

    const cleanFullName =
      fullName.trim();


    if (!cleanFullName) {

      setError(
        "Please enter your full name."
      );

      return;
    }


    // -----------------------------------------
    // EMAIL VALIDATION
    // -----------------------------------------

    const cleanEmail =
      email.trim().toLowerCase();


    if (!cleanEmail) {

      setError(
        "Please enter your email address."
      );

      return;
    }


    if (!cleanEmail.includes("@")) {

      setError(
        "Please enter a valid email address."
      );

      return;
    }


    // -----------------------------------------
    // PASSWORD VALIDATION
    // -----------------------------------------

    if (!password) {

      setError(
        "Please enter a password."
      );

      return;
    }


    if (password.length < 6) {

      setError(
        "Password must be at least 6 characters long."
      );

      return;
    }


    // -----------------------------------------
    // CONFIRM PASSWORD
    // -----------------------------------------

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


    // =========================================
    // SUPABASE SIGNUP
    // =========================================

    try {

      setLoading(true);


      console.log(
        "Creating account for:",
        cleanEmail
      );


      const {
        data,
        error: signupError,
      } =
        await supabase.auth.signUp({

          email: cleanEmail,

          password: password,

          options: {

            emailRedirectTo:
              `${window.location.origin}/user/login`,

            data: {
              full_name: cleanFullName,
            },

          },

        });


      // -----------------------------------------
      // HANDLE SIGNUP ERROR
      // -----------------------------------------

      if (signupError) {

        console.error(
          "Supabase registration error:",
          signupError
        );


        setError(
          signupError.message ||
            "Unable to create your account. Please try again."
        );


        return;
      }


      // -----------------------------------------
      // REGISTRATION SUCCESSFUL
      // -----------------------------------------

      console.log(
        "Registration successful:",
        data
      );


      // -----------------------------------------
      // REQUEST LOCATION
      // -----------------------------------------

      await requestUserLocation();


      // -----------------------------------------
      // SHOW SUCCESS MESSAGE
      // -----------------------------------------

      setSuccess(
        "Registration successful! Please check your email and verify your account before logging in."
      );


      // -----------------------------------------
      // CLEAR PASSWORD FIELDS
      // -----------------------------------------

      setPassword("");

      setConfirmPassword("");


    } catch (registerException) {

      console.error(
        "Registration exception:",
        registerException
      );


      setError(
        "Unable to create your account. Please try again."
      );


    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // RESEND VERIFICATION EMAIL
  // =========================================

  const handleResendVerification =
    async () => {

      setError("");
      setSuccess("");


      const cleanEmail =
        email.trim().toLowerCase();


      if (!cleanEmail) {

        setError(
          "Please enter your email address first."
        );

        return;
      }


      if (!cleanEmail.includes("@")) {

        setError(
          "Please enter a valid email address."
        );

        return;
      }


      try {

        setResending(true);


        const {
          error: resendError,
        } =
          await supabase.auth.resend({

            type: "signup",

            email: cleanEmail,

            options: {

              emailRedirectTo:
                `${window.location.origin}/user/login`,

            },

          });


        if (resendError) {

          console.error(
            "Resend verification error:",
            resendError
          );


          setError(
            "Unable to resend the verification email. Please try again later."
          );


          return;
        }


        setSuccess(
          "Verification email sent. Please check your inbox and verify your email."
        );


      } catch (resendException) {

        console.error(
          "Resend verification exception:",
          resendException
        );


        setError(
          "Unable to resend the verification email. Please try again later."
        );


      } finally {

        setResending(false);

      }

    };


  // =========================================
  // GOOGLE SIGNUP
  // =========================================

  const handleGoogleSignup =
    async () => {

      setError("");
      setSuccess("");


      try {

        const {
          error: googleError,
        } =
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


      } catch (googleError) {

        console.error(
          "Google signup error:",
          googleError
        );


        setError(
          googleError.message ||
            "Unable to continue with Google."
        );

      }

    };


  // =========================================
  // GO TO LOGIN
  // =========================================

  const handleLogin = () => {

    navigate("/user/login");

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
            backgroundImage:
              `url("${loginImage}")`,
          }}
        >

          <div className="user-hero-overlay">
          </div>


          {/* SYSTEM BRANDING */}

          <div className="user-brand">

            <h1>

              UNIFIED

              <span>
                GRIEVANCE SYSTEM
              </span>

            </h1>


            <div className="brand-divider">
            </div>


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
            Register for your account
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


              {/* RESEND VERIFICATION */}

              <button
                type="button"
                onClick={
                  handleResendVerification
                }
                disabled={resending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "10px",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: resending
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: 600,
                  color: "inherit",
                }}
              >

                <MailCheck size={16} />

                {resending
                  ? "Sending..."
                  : "Resend verification email"}

              </button>

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
                  gap: "8px",
                }}
              >

                <span
                  style={{
                    fontSize: "18px",
                    lineHeight: "1",
                  }}
                >
                  ✓
                </span>


                <span>
                  {success}
                </span>

              </div>

            </div>

          )}


          {/* =====================================
              REGISTRATION FORM
          ===================================== */}

          <form onSubmit={handleRegister}>


            {/* FULL NAME */}

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


            {/* EMAIL */}

            <div className="user-form-group">

              <label htmlFor="register-email">
                Email Address
              </label>


              <div className="user-input-wrapper">

                <Mail
                  className="user-input-icon"
                  size={18}
                />


                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {

                    setEmail(
                      e.target.value
                    );

                    clearMessages();

                  }}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

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
                  placeholder="Enter your password"
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


            {/* CONFIRM PASSWORD */}

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


            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="user-login-button"
              disabled={
                loading ||
                resending
              }
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
              GOOGLE SIGNUP
          ========================================= */}

          <button
            type="button"
            className="google-login-button"
            onClick={
              handleGoogleSignup
            }
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


          {/* =========================================
              BACK TO LOGIN
          ========================================= */}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "15px",
            }}
          >

            <button
              type="button"
              onClick={handleLogin}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: "none",
                background: "transparent",
                padding: 0,
                color: "#111111",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >

              <ArrowLeft size={15} />

              Back to Login

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}


export default UserRegister;