import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Mail,
} from "lucide-react";

import loginImage from "../../assets/images/user-login-image.png";
import "../../styles/UserAuth.css";

function UserLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("User login submitted");

    // After successful login
    navigate("/user");
  };

  const handleRegister = () => {
    navigate("/user/register");
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
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
            >

              <LogIn size={18} />

              <span>
                Login
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