import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import loginImage from "../../assets/images/user-login-image.png";
import "../../styles/UserAuth.css";

function UserRegister() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form values
  const [fullName, setFullName] = useState("");
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // -----------------------------
    // Basic validation
    // -----------------------------

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!loginValue.trim()) {
      setError("Please enter your email or mobile number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // -----------------------------
    // Currently Supabase Email Auth
    // -----------------------------

    const isEmail = loginValue.includes("@");

    if (!isEmail) {
      setError(
        "Phone registration will be available after we configure SMS/Phone authentication. Please use an email address for now."
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: loginValue.trim(),
          password: password,

          options: {
            data: {
              full_name: fullName.trim(),
              preferred_language: "English",
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      console.log("Supabase registration successful:", data);

      // --------------------------------------
      // Email confirmation handling
      // --------------------------------------

      if (data.user && !data.session) {
        setMessage(
          "Account created successfully! Please check your email to verify your account."
        );

        return;
      }

      // --------------------------------------
      // If email confirmation is disabled
      // --------------------------------------

      if (data.session) {
        navigate("/user");
      }
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/user/login");
  };

  const handleGoogleRegister = async () => {
    setError("");
    setMessage("");

    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/user`,
          },
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google registration error:", error);

      setError(
        error.message ||
          "Unable to continue with Google."
      );
    }
  };

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
              <span>GRIEVANCE SYSTEM</span>
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
            Create Your Account
          </h2>

          <p className="auth-subtitle">
            Fill in the details to get started
          </p>


          {/* =====================================
              ERROR / SUCCESS MESSAGE
          ===================================== */}

          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success-message">
              {message}
            </div>
          )}


          {/* =====================================
              REGISTRATION FORM
          ===================================== */}

          <form onSubmit={handleRegister}>

            {/* FULL NAME */}

            <div className="user-form-group">

              <label htmlFor="full-name">
                Full Name
              </label>

              <div className="user-input-wrapper">

                <User
                  className="user-input-icon"
                  size={18}
                />

                <input
                  id="full-name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* EMAIL / MOBILE */}

            <div className="user-form-group">

              <label htmlFor="register-login">
                Email or Mobile Number
              </label>

              <div className="user-input-wrapper">

                <Mail
                  className="user-input-icon"
                  size={18}
                />

                <input
                  id="register-login"
                  type="text"
                  placeholder="Enter your email or mobile number"
                  autoComplete="email"
                  value={loginValue}
                  onChange={(e) =>
                    setLoginValue(e.target.value)
                  }
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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="user-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
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

              <label htmlFor="confirm-password">
                Confirm Password
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
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
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


            {/* CREATE ACCOUNT */}

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
              LOGIN LINK
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