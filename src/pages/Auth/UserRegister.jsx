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

import loginImage from "../../assets/images/user-login-image.png";
import "../../styles/UserAuth.css";

function UserRegister() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();

    console.log("User registration submitted");

    // After successful registration
    navigate("/user");
  };

  const handleLogin = () => {
    navigate("/user/login");
  };

  const handleGoogleRegister = () => {
    console.log("Google registration clicked");
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
            >

              <UserPlus size={18} />

              <span>
                Create Account
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