import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  Users,
  Check,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import loginBackground from "../../assets/images/login-background.jpeg.jpeg";
import "../../styles/AdminLogin.css";


function AdminLogin() {

  const navigate = useNavigate();


  /* =========================================================
     FORM STATES
  ========================================================= */

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");


  /* =========================================================
     UI STATES
  ========================================================= */

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     ADMIN LOGIN
  ========================================================= */

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");


    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!email.trim()) {

      setError(
        "Please enter your email address."
      );

      return;
    }


    if (!password) {

      setError(
        "Please enter your password."
      );

      return;
    }


    try {

      setLoading(true);


      /* =====================================================
         SUPABASE AUTHENTICATION
      ===================================================== */

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });


      if (loginError) {
        throw loginError;
      }


      if (!data?.user) {

        throw new Error(
          "Unable to create an admin session."
        );

      }


      /* =====================================================
         VERIFY ADMIN ROLE
      ===================================================== */

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", data.user.id)
        .maybeSingle();


      if (profileError) {

        console.error(
          "Admin profile lookup error:",
          profileError
        );

        await supabase.auth.signOut();

        throw new Error(
          "Unable to verify your administrator account."
        );
      }


      /* -----------------------------------------------------
         USER EXISTS BUT IS NOT ADMIN
      ----------------------------------------------------- */

      if (
        !profile ||
        profile.role !== "admin"
      ) {

        await supabase.auth.signOut();

        throw new Error(
          "This account does not have administrator access."
        );

      }


      /* =====================================================
         ADMIN LOGIN SUCCESSFUL
      ===================================================== */

      console.log(
        "Admin login successful:",
        data.user.email
      );


      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );


    } catch (loginError) {

      console.error(
        "Admin login error:",
        loginError
      );


      setError(
        loginError.message ||
        "Unable to login. Please check your email and password."
      );


    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword = () => {

    console.log(
      "Forgot password clicked"
    );

  };


  return (

    <div className="admin-login-page">


      {/* =====================================================
          LEFT PANEL
      ===================================================== */}

      <section
        className="admin-login-left"
        style={{
          backgroundImage:
            `url("${loginBackground}")`,
        }}
      >

        <div className="login-background-overlay"></div>


        <div className="left-content">


          {/* LOGO */}

          <div className="government-logo">

            <ShieldCheck
              size={62}
              strokeWidth={1.8}
            />

          </div>


          {/* HEADING */}

          <h1>

            Grievance

            <span>
              Management System
            </span>

          </h1>


          {/* TAGLINE */}

          <p className="left-tagline">
            Building a better community together
          </p>


          {/* DIVIDER */}

          <div className="green-divider"></div>


          {/* FEATURE 1 */}

          <div className="left-feature">

            <div className="feature-icon">

              <ClipboardList
                size={27}
              />

            </div>


            <div className="feature-text">

              <h3>
                Track &amp; Manage
              </h3>

              <p>
                Monitor and manage all
                grievances efficiently
              </p>

            </div>

          </div>


          {/* FEATURE 2 */}

          <div className="left-feature">

            <div className="feature-icon">

              <BarChart3
                size={27}
              />

            </div>


            <div className="feature-text">

              <h3>
                Analytics &amp; Insights
              </h3>

              <p>
                Get real-time insights
                and reports
              </p>

            </div>

          </div>


          {/* FEATURE 3 */}

          <div className="left-feature">

            <div className="feature-icon">

              <Users
                size={27}
              />

            </div>


            <div className="feature-text">

              <h3>
                Citizen Satisfaction
              </h3>

              <p>
                Improve transparency
                and public trust
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RIGHT PANEL
      ===================================================== */}

      <section className="admin-login-right">

        <div className="login-card">


          {/* LOGIN ICON */}

          <div className="login-icon">

            <Lock
              size={38}
              strokeWidth={1.8}
            />

          </div>


          {/* HEADING */}

          <h2>
            Admin Login
          </h2>


          {/* SUBTITLE */}

          <p className="login-subtitle">
            Welcome back! Please login to your admin account
          </p>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              className="auth-error-message"
              style={{
                marginBottom: "18px",
              }}
            >

              {error}

            </div>

          )}


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form onSubmit={handleLogin}>


            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>


              <div className="input-wrapper">

                <User
                  className="input-icon"
                  size={21}
                />


                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>


              <div className="input-wrapper">

                <Lock
                  className="input-icon"
                  size={21}
                />


                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  required
                />


                <button
                  type="button"
                  className="password-toggle"
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

                    <EyeOff
                      size={21}
                    />

                  ) : (

                    <Eye
                      size={21}
                    />

                  )}

                </button>

              </div>

            </div>


            {/* =================================================
                REMEMBER + FORGOT
            ================================================= */}

            <div className="login-options">


              <label className="remember-option">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                />


                <span className="custom-checkbox">

                  {rememberMe && (

                    <Check
                      size={14}
                    />

                  )}

                </span>


                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="forgot-password"
                onClick={
                  handleForgotPassword
                }
                disabled={loading}
              >
                Forgot Password?
              </button>

            </div>


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              <LogIn
                size={22}
              />


              <span>

                {loading
                  ? "Logging in..."
                  : "Login"}

              </span>

            </button>

          </form>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="login-footer">

            <ShieldCheck
              size={17}
            />

            <span>

              © 2026 Unified Public
              Grievance System.
              All rights reserved.

            </span>

          </div>

        </div>

      </section>

    </div>

  );

}


export default AdminLogin;