import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  MailCheck,
  KeyRound,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import loginImage from "../../assets/images/user-login-image.png";

import "../../styles/UserAuth.css";


function UserLogin() {
  const navigate = useNavigate();

  // =========================================
  // FORM VALUES
  // =========================================

  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  // =========================================
  // UI STATES
  // =========================================

  const [showPassword, setShowPassword] =
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
  // LOGIN
  // =========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------------------
    // EMAIL VALIDATION
    // -----------------------------------------

    const email =
      loginValue.trim().toLowerCase();

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!email.includes("@")) {
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
        "Please enter your password."
      );
      return;
    }


    try {
      setLoading(true);

      // -----------------------------------------
      // SUPABASE LOGIN
      // -----------------------------------------

      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });


      // -----------------------------------------
      // HANDLE LOGIN ERROR
      // -----------------------------------------

      if (loginError) {
        console.error(
          "Supabase login error:",
          loginError
        );

        const errorMessage =
          loginError.message?.toLowerCase() ||
          "";


        // ---------------------------------------
        // EMAIL NOT VERIFIED
        // ---------------------------------------

        if (
          errorMessage.includes(
            "email not confirmed"
          ) ||
          errorMessage.includes(
            "email_not_confirmed"
          )
        ) {
          setError(
            "Please verify your email address before logging in."
          );

          return;
        }


        // ---------------------------------------
        // INVALID LOGIN
        // ---------------------------------------

        setError(
          "Unable to login. Please check your email and password."
        );

        return;
      }


      // -----------------------------------------
      // LOGIN SUCCESSFUL
      // -----------------------------------------

      console.log(
        "Login successful:",
        data
      );

      navigate("/user", {
        replace: true,
      });

    } catch (loginException) {
      console.error(
        "Login exception:",
        loginException
      );

      setError(
        "Unable to login. Please check your email and password."
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

      const email =
        loginValue.trim().toLowerCase();


      if (!email) {
        setError(
          "Please enter your email address first."
        );
        return;
      }


      if (!email.includes("@")) {
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

            email: email,

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
  // FORGOT PASSWORD
  // =========================================

  const handleForgotPassword =
    async () => {

      setError("");
      setSuccess("");


      // -----------------------------------------
      // GET EMAIL
      // -----------------------------------------

      const email =
        loginValue.trim().toLowerCase();


      // -----------------------------------------
      // EMAIL REQUIRED
      // -----------------------------------------

      if (!email) {
        setError(
          "Please enter your email address first."
        );
        return;
      }


      // -----------------------------------------
      // EMAIL VALIDATION
      // -----------------------------------------

      if (!email.includes("@")) {
        setError(
          "Please enter a valid email address."
        );
        return;
      }


      try {
        setLoading(true);


        console.log(
          "Sending password reset email to:",
          email
        );


        // -----------------------------------------
        // SEND PASSWORD RESET EMAIL
        // -----------------------------------------

        const {
          error: resetError,
        } =
          await supabase.auth.resetPasswordForEmail(
            email,
            {
              redirectTo:
                `${window.location.origin}/user/reset-password`,
            }
          );


        // -----------------------------------------
        // HANDLE RESET ERROR
        // -----------------------------------------

        if (resetError) {
          console.error(
            "Password reset error:",
            resetError
          );

          setError(
            resetError.message ||
              "Unable to send the password reset email. Please try again later."
          );

          return;
        }


        // -----------------------------------------
        // SUCCESS
        // -----------------------------------------

        setSuccess(
          "Password reset email sent! Please check your inbox and follow the link to reset your password."
        );

      } catch (resetException) {
        console.error(
          "Password reset exception:",
          resetException
        );

        setError(
          "Unable to send the password reset email. Please try again later."
        );

      } finally {
        setLoading(false);
      }
    };


  // =========================================
  // GOOGLE LOGIN
  // =========================================

  const handleGoogleLogin =
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
          "Google login error:",
          googleError
        );

        setError(
          googleError.message ||
            "Unable to continue with Google."
        );
      }
    };


  // =========================================
  // REGISTER
  // =========================================

  const handleRegister = () => {
    navigate("/user/register");
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

          <div className="user-hero-overlay"></div>


          {/* SYSTEM BRANDING */}

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
            LOGIN CONTENT
        ========================================= */}

        <div className="user-auth-content">

          <h2>
            Welcome Back!
          </h2>

          <p className="auth-subtitle">
            Login to your account
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
                  RESEND VERIFICATION
              --------------------------------- */}

              {error.includes(
                "verify your email"
              ) && (

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
              LOGIN FORM
          ===================================== */}

          <form onSubmit={handleLogin}>


            {/* EMAIL */}

            <div className="user-form-group">

              <label htmlFor="user-login">
                Email Address
              </label>


              <div className="user-input-wrapper">

                <User
                  className="user-input-icon"
                  size={18}
                />

                <input
                  id="user-login"
                  type="email"
                  placeholder="Enter your email address"
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


            {/* PASSWORD */}

            <div className="user-form-group">

              <label htmlFor="user-password">
                Password
              </label>


              <div className="user-input-wrapper">

                <Lock
                  className="user-input-icon"
                  size={18}
                />

                <input
                  id="user-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
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


            {/* =====================================
                FORGOT PASSWORD
            ===================================== */}

            <div
              className="user-forgot-row"
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginTop: "-2px",
                marginBottom: "10px",
              }}
            >

              <button
                type="button"
                className="user-forgot-button"
                onClick={
                  handleForgotPassword
                }
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  color: "#111111",
                  fontSize: "14px",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >

                <KeyRound size={16} />

                <span>
                  {loading
                    ? "Sending..."
                    : "Forgot Password?"}
                </span>

              </button>

            </div>


            {/* =====================================
                LOGIN BUTTON
            ===================================== */}

            <button
              type="submit"
              className="user-login-button"
              disabled={loading}
            >

              <LogIn size={18} />

              <span>
                {loading
                  ? "Logging in..."
                  : "Login"}
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
              GOOGLE LOGIN
          ========================================= */}

          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
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
              REGISTER
          ========================================= */}

          <div className="register-link-row">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={handleRegister}
            >
              Register Now
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


export default UserLogin;