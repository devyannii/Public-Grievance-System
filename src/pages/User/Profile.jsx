import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Settings,
  FileText,
  Clock3,
  Bell,
  CircleHelp,
  Info,
  LogOut,
  Home,
  Map,
  Plus,
  User,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import "../../styles/Profile.css";
import "../../styles/UserAppLayout.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================
  // LOAD CURRENT USER + PROFILE
  // =========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        // Get currently logged-in Supabase user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          navigate("/user/login");
          return;
        }

        setUser(user);

        // Get profile information from profiles table
        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("full_name, phone, preferred_language")
            .eq("id", user.id)
            .single();

        if (profileError) {
          console.error(
            "Profile loading error:",
            profileError
          );

          // Still show Auth information if profile
          // isn't available
          setProfile({
            full_name:
              user.user_metadata?.full_name || "User",
            phone: user.phone || "",
            preferred_language:
              user.user_metadata?.preferred_language ||
              "English",
          });

          return;
        }

        setProfile(profileData);

      } catch (error) {
        console.error(
          "Unable to load profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      navigate("/user/login");

    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };


  // =========================================
  // DISPLAY VALUES
  // =========================================

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    "User";

  const displayPhone =
    profile?.phone ||
    user?.phone ||
    "Phone number not added";

  const displayEmail =
    user?.email ||
    "Email not available";


  return (
    <div className="user-page profile-page">

      {/* ================= HEADER ================= */}

      <header className="profile-header">

        <button
          className="profile-back"
          onClick={() => navigate("/user")}
        >
          <ArrowLeft size={21} />
        </button>

        <h1>Profile</h1>

        <button className="profile-settings">
          <Settings size={20} />
        </button>

      </header>


      {/* ================= PROFILE CONTENT ================= */}

      <main className="profile-content">

        {/* USER INFO */}

        <section className="profile-user">

          <div className="profile-avatar">
            <User size={42} />
          </div>

          {loading ? (
            <>
              <h2>Loading...</h2>
              <p>Loading profile...</p>
            </>
          ) : (
            <>
              <h2>{displayName}</h2>

              <p>{displayPhone}</p>

              <p>{displayEmail}</p>
            </>
          )}

        </section>


        {/* PROFILE MENU */}

        <section className="profile-menu">

          {/* MY REPORTS */}

          <button
            className="profile-menu-item"
            onClick={() => navigate("/user/reports")}
          >

            <div className="profile-menu-icon">
              <FileText size={19} />
            </div>

            <span>My Reports</span>

            <span className="profile-arrow">›</span>

          </button>


          {/* TRACK ISSUE */}

          <button
            className="profile-menu-item"
            onClick={() => navigate("/user/reports")}
          >

            <div className="profile-menu-icon">
              <Clock3 size={19} />
            </div>

            <span>Track an Issue</span>

            <span className="profile-arrow">›</span>

          </button>


          {/* NOTIFICATIONS */}

          <button className="profile-menu-item">

            <div className="profile-menu-icon">
              <Bell size={19} />
            </div>

            <span>Notifications</span>

            <span className="profile-arrow">›</span>

          </button>


          {/* HELP */}

          <button className="profile-menu-item">

            <div className="profile-menu-icon">
              <CircleHelp size={19} />
            </div>

            <span>Help & Support</span>

            <span className="profile-arrow">›</span>

          </button>


          {/* ABOUT */}

          <button className="profile-menu-item">

            <div className="profile-menu-icon">
              <Info size={19} />
            </div>

            <span>About Us</span>

            <span className="profile-arrow">›</span>

          </button>

        </section>


        {/* LOGOUT */}

        <button
          className="profile-logout"
          onClick={handleLogout}
        >

          <LogOut size={18} />

          <span>Logout</span>

        </button>

      </main>


      {/* ================= BOTTOM NAVIGATION ================= */}

      <nav className="profile-bottom-navigation">

        {/* HOME */}

        <button
          className="profile-bottom-item"
          onClick={() => navigate("/user")}
        >

          <Home size={21} />

          <span>Home</span>

        </button>


        {/* MAP */}

        <button
          className="profile-bottom-item"
          onClick={() => navigate("/user/map")}
        >

          <Map size={21} />

          <span>Map</span>

        </button>


        {/* ADD REPORT */}

        <button
          className="profile-add-button"
          onClick={() => navigate("/user/report")}
        >

          <Plus size={28} />

        </button>


        {/* REPORTS */}

        <button
          className="profile-bottom-item"
          onClick={() => navigate("/user/reports")}
        >

          <FileText size={21} />

          <span>Reports</span>

        </button>


        {/* PROFILE */}

        <button
          className="profile-bottom-item active"
        >

          <User size={21} />

          <span>Profile</span>

        </button>

      </nav>

    </div>
  );
}

export default Profile;