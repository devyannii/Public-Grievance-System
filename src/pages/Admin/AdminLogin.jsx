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

import loginBackground from "../../assets/images/login-background.jpeg.jpeg";
import "../../styles/AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e) => {
    e.preventDefault();

    // Backend authentication will be connected later.
    console.log("Admin login submitted");

    // Navigate to admin dashboard
    navigate("/admin/dashboard");
  };

  return (
    <div className="admin-login-page">

      {/* =========================================
          LEFT PANEL
      ========================================= */}

      <section
        className="admin-login-left"
        style={{
          backgroundImage: `url("${loginBackground}")`,
        }}
      >

        {/* Soft overlay */}

        <div className="login-background-overlay"></div>


        {/* Left Content */}

        <div className="left-content">

          {/* Logo */}

          <div className="government-logo">

            <ShieldCheck
              size={62}
              strokeWidth={1.8}
            />

          </div>


          {/* Main Heading */}

          <h1>
            Grievance
            <span>Management System</span>
          </h1>


          {/* Tagline */}

          <p className="left-tagline">
            Building a better community together
          </p>


          {/* Divider */}

          <div className="green-divider"></div>


          {/* FEATURE 1 */}

          <div className="left-feature">

            <div className="feature-icon">
              <ClipboardList size={27} />
            </div>

            <div className="feature-text">

              <h3>
                Track &amp; Manage
              </h3>

              <p>
                Monitor and manage all grievances efficiently
              </p>

            </div>

          </div>


          {/* FEATURE 2 */}

          <div className="left-feature">

            <div className="feature-icon">
              <BarChart3 size={27} />
            </div>

            <div className="feature-text">

              <h3>
                Analytics &amp; Insights
              </h3>

              <p>
                Get real-time insights and reports
              </p>

            </div>

          </div>


          {/* FEATURE 3 */}

          <div className="left-feature">

            <div className="feature-icon">
              <Users size={27} />
            </div>

            <div className="feature-text">

              <h3>
                Citizen Satisfaction
              </h3>

              <p>
                Improve transparency and public trust
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          RIGHT PANEL
      ========================================= */}

      <section className="admin-login-right">

        <div className="login-card">

          {/* Login Icon */}

          <div className="login-icon">

            <Lock
              size={38}
              strokeWidth={1.8}
            />

          </div>


          {/* Heading */}

          <h2>
            Admin Login
          </h2>


          {/* Subtitle */}

          <p className="login-subtitle">
            Welcome back! Please login to your admin account
          </p>


          {/* =====================================
              LOGIN FORM
          ===================================== */}

          <form onSubmit={handleLogin}>

            {/* Email */}

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
                  required
                />

              </div>

            </div>


            {/* Password */}

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
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
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
                    <EyeOff size={21} />
                  ) : (
                    <Eye size={21} />
                  )}

                </button>

              </div>

            </div>


            {/* =================================
                REMEMBER + FORGOT
            ================================= */}

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
                />

                <span className="custom-checkbox">

                  {rememberMe && (
                    <Check size={14} />
                  )}

                </span>

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  console.log(
                    "Forgot password clicked"
                  )
                }
              >
                Forgot Password?
              </button>

            </div>


            {/* =================================
                LOGIN BUTTON
            ================================= */}

            <button
              type="submit"
              className="login-button"
            >

              <LogIn size={22} />

              <span>
                Login
              </span>

            </button>

          </form>


          {/* =================================
              FOOTER
          ================================= */}

          <div className="login-footer">

            <ShieldCheck size={17} />

            <span>
              © 2026 Unified Public Grievance System.
              All rights reserved.
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AdminLogin;