import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import loginImage from "../../assets/images/user-login-image.png";
import "../../styles/UserAuth.css";

function UserLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  // =========================================
  // FORM VALUES
  // =========================================

  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  // =========================================
  // UI STATES
  // =========================================

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!loginValue.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    // -----------------------------------------
    // Email login for now
    // -----------------------------------------

    const isEmail = loginValue.includes("@");

    if (!isEmail) {
      setError(
        "Phone login will be available after we configure Phone Authentication."
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: loginValue.trim(),
          password: password,
        });

      if (loginError) {
        throw loginError;
      }

      console.log("Login successful:", data);

      // -----------------------------------------
      // Supabase session now exists
      // -----------------------------------------

      navigate("/user");

    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message ||
          "Unable to login. Please check your email and password."
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================================
  // REGISTER
  // =========================================

  const handleRegister = () => {
    navigate("/user/register");
  };


  // =========================================
  // FORGOT PASSWORD
  // =========================================

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
  };


  // =========================================
  // GOOGLE LOGIN
  // =========================================

  const handleGoogleLogin = async () => {
    setError("");

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
      console.error(
        "Google login error:",
        error
      );

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

          {/* SYSTEM BRANDING */}

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
            <div className="auth-error-message">
              {error}
            </div>
          )}


          {/* =====================================
              LOGIN FORM
          ===================================== */}

          <form onSubmit={handleLogin}>

            {/* EMAIL / MOBILE */}

            <div className="user-form-group">

              <label htmlFor="user-login">
                Email or Mobile Number
              </label>

              <div className="user-input-wrapper">

                <User
                  className="user-input-icon"
                  size={18}
                />

                <input
                  id="user-login"
                  type="text"
                  placeholder="Enter your email or mobile number"
                  autoComplete="username"
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


            {/* FORGOT PASSWORD */}

            <div className="user-forgot-row">

              <button
                type="button"
                className="user-forgot-button"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>

            </div>


            {/* LOGIN */}

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