import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import "./StaffLogin.css";

function StaffLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
  ============================================================
  CHECK IF STAFF IS ALREADY LOGGED IN
  ============================================================
  */

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setCheckingSession(false);
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, role, department_id, full_name"
        )
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "Staff profile check error:",
          profileError
        );

        await supabase.auth.signOut();

        setCheckingSession(false);
        return;
      }

      if (
        profile?.role === "department_staff" &&
        profile?.department_id
      ) {
        navigate(
          "/staff/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      // Logged in, but not a department staff member.
      await supabase.auth.signOut();

    } catch (err) {

      console.error(
        "Session check error:",
        err
      );
    }

    setCheckingSession(false);
  };


  /*
  ============================================================
  STAFF LOGIN
  ============================================================
  */

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (
      !email.trim() ||
      !password
    ) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    setLoading(true);


    try {

      /*
      ----------------------------------------------------------
      STEP 1: AUTHENTICATE WITH SUPABASE
      ----------------------------------------------------------
      */

      const {
        data,
        error: loginError,
      } =
        await supabase.auth
          .signInWithPassword({

            email:
              email.trim(),

            password,

          });


      if (loginError) {

        throw new Error(
          "Invalid email or password."
        );
      }


      const user =
        data?.user;


      if (!user) {

        throw new Error(
          "Unable to sign in. Please try again."
        );
      }


      /*
      ----------------------------------------------------------
      STEP 2: GET STAFF PROFILE
      ----------------------------------------------------------
      */

      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from("profiles")
          .select(
            "id, full_name, role, department_id"
          )
          .eq(
            "id",
            user.id
          )
          .maybeSingle();


      if (profileError) {

        console.error(
          "Profile error:",
          profileError
        );


        await supabase.auth.signOut();


        throw new Error(
          "Unable to load your staff profile."
        );
      }


      /*
      ----------------------------------------------------------
      STEP 3: VERIFY STAFF ROLE
      ----------------------------------------------------------
      */

      if (
        profile?.role !==
        "department_staff"
      ) {

        await supabase.auth.signOut();


        throw new Error(
          "This account is not registered as department staff."
        );
      }


      /*
      ----------------------------------------------------------
      STEP 4: MAKE SURE STAFF HAS A DEPARTMENT
      ----------------------------------------------------------
      */

      if (
        !profile?.department_id
      ) {

        await supabase.auth.signOut();


        throw new Error(
          "No department has been assigned to this staff account. Please contact the administrator."
        );
      }


      /*
      ----------------------------------------------------------
      LOGIN SUCCESS
      ----------------------------------------------------------
      */

      setSuccess(
        "Login successful. Redirecting..."
      );


      setTimeout(() => {

        navigate(
          "/staff/dashboard",
          {
            replace: true,
          }
        );

      }, 500);


    } catch (err) {

      console.error(
        "Staff login error:",
        err
      );


      setError(
        err?.message ||
          "Unable to sign in. Please try again."
      );


    } finally {

      setLoading(false);

    }
  };


  /*
  ============================================================
  LOADING SESSION
  ============================================================
  */

  if (checkingSession) {

    return (

      <div
        className=
          "staff-login-loading"
      >

        <Loader2
          size={32}
          className=
            "staff-spinner"
        />

        <p>
          Checking staff access...
        </p>

      </div>
    );
  }


  /*
  ============================================================
  UI
  ============================================================
  */

  return (

    <div
      className=
        "staff-login-page"
    >

      {/* ======================================================
          LEFT SIDE
      ====================================================== */}

      <div
        className=
          "staff-login-brand"
      >

        <div
          className=
            "staff-brand-content"
        >

          <div
            className=
              "staff-brand-icon"
          >

            <Building2
              size={34}
            />

          </div>


          <h1>

            Unified
            <br />
            Grievance System

          </h1>


          <p>
            Department Staff Portal
          </p>


          <div
            className=
              "staff-brand-line"
          ></div>


          <span>

            Manage and resolve complaints
            assigned to your department.

          </span>

        </div>

      </div>


      {/* ======================================================
          RIGHT SIDE
      ====================================================== */}

      <div
        className=
          "staff-login-form-section"
      >

        <div
          className=
            "staff-login-card"
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <div
            className=
              "staff-login-header"
          >

            <div
              className=
                "staff-login-icon"
            >

              <Building2
                size={25}
              />

            </div>


            <h2>
              Staff Login
            </h2>


            <p>
              Sign in to manage your department's
              complaints.
            </p>

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div
              className=
                "staff-message staff-error"
            >

              <AlertCircle
                size={18}
              />

              <span>
                {error}
              </span>

            </div>

          )}


          {/* ==================================================
              SUCCESS
          ================================================== */}

          {success && (

            <div
              className=
                "staff-message staff-success"
            >

              <CheckCircle2
                size={18}
              />

              <span>
                {success}
              </span>

            </div>

          )}


          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={
              handleLogin
            }
          >

            {/* EMAIL */}

            <div
              className=
                "staff-input-group"
            >

              <label
                htmlFor=
                  "staff-email"
              >
                Email Address
              </label>


              <div
                className=
                  "staff-input-wrapper"
              >

                <Mail
                  size={18}
                  className=
                    "staff-input-icon"
                />


                <input
                  id=
                    "staff-email"
                  type=
                    "email"
                  placeholder=
                    "Enter your staff email"
                  value={
                    email
                  }
                  onChange={
                    (e) =>
                      setEmail(
                        e.target.value
                      )
                  }
                  autoComplete=
                    "email"
                  disabled={
                    loading
                  }
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div
              className=
                "staff-input-group"
            >

              <label
                htmlFor=
                  "staff-password"
              >
                Password
              </label>


              <div
                className=
                  "staff-input-wrapper"
              >

                <Lock
                  size={18}
                  className=
                    "staff-input-icon"
                />


                <input
                  id=
                    "staff-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder=
                    "Enter your password"
                  value={
                    password
                  }
                  onChange={
                    (e) =>
                      setPassword(
                        e.target.value
                      )
                  }
                  autoComplete=
                    "current-password"
                  disabled={
                    loading
                  }
                />


                <button
                  type=
                    "button"
                  className=
                    "staff-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={
                    loading
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (

                    <EyeOff
                      size={18}
                    />

                  ) : (

                    <Eye
                      size={18}
                    />

                  )}

                </button>

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type=
                "submit"
              className=
                "staff-login-button"
              disabled={
                loading
              }
            >

              {loading ? (

                <>
                  <Loader2
                    size={19}
                    className=
                      "staff-spinner"
                  />

                  Signing in...
                </>

              ) : (

                <>
                  <LogIn
                    size={19}
                  />

                  Sign In
                </>

              )}

            </button>

          </form>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className=
              "staff-login-footer"
          >

            <p>
              Staff access is provided by the
              system administrator.
            </p>


            <button
              type=
                "button"
              onClick={() =>
                navigate(
                  "/user/login"
                )
              }
            >
              Resident Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


export default StaffLogin;