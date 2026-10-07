import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/LandingPage.css";

import landingTree from "../assets/images/landing-tree.jpeg";
import potholeImage from "../assets/images/pothole.png";
import garbageImage from "../assets/images/garbage.png";
import waterLeakageImage from "../assets/images/water-leakage.png";
import environmentImage from "../assets/images/environment.png";
import communityImage from "../assets/images/community.png";

function LandingPage() {
  const navigate = useNavigate();

  // =========================================
  // SCROLL TO SECTION
  // =========================================

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };


  // =========================================
  // HANDLE SECTION WHEN LANDING PAGE OPENS
  // =========================================

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const sectionId = hash.substring(1);

    setTimeout(() => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

  }, []);


  return (
    <div className="landing-page">


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="landing-navbar">

        <div
          className="landing-logo"
          onClick={() => scrollToSection("home")}
        >
          <span className="logo-unified">
            Unified
          </span>{" "}

          <span className="logo-grievance">
            Grievance
          </span>{" "}

          <span className="logo-system">
            System
          </span>
        </div>


        <nav className="landing-nav-links">

          <button
            onClick={() => scrollToSection("home")}
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection("features")}
          >
            Features
          </button>

          <button
            onClick={() => scrollToSection("how-it-works")}
          >
            How It Works
          </button>

          <button
            onClick={() => scrollToSection("about")}
          >
            About
          </button>

          <button
            onClick={() => scrollToSection("contact")}
          >
            Contact
          </button>

        </nav>


        <div className="landing-nav-actions">

          {/* RESIDENT LOGIN */}

          <button
            className="landing-login-button"
            onClick={() => navigate("/user/login")}
          >
            Login
          </button>


          {/* RESIDENT REGISTRATION */}

          <button
            className="landing-get-started"
            onClick={() => navigate("/user/register")}
          >
            Get Started
          </button>

        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="home"
        className="landing-hero"
        style={{
          backgroundImage: `url(${landingTree})`,
        }}
      >

        <div className="landing-hero-overlay"></div>


        <div className="landing-hero-content">

          <p className="landing-hero-small">
            TOGETHER FOR BETTER COMMUNITIES
          </p>


          <h1>
            Report.
            <br />

            Track.
            <br />

            <span>
              Resolve.
            </span>
          </h1>


          <p className="landing-hero-description">
            A simpler way to report civic issues and help build
            cleaner, safer communities.
          </p>


          <div className="landing-hero-buttons">

            <button
              className="hero-primary-button"
              onClick={() => navigate("/user/report")}
            >
              Report an Issue

              <span>
                →
              </span>
            </button>


            <button
              className="hero-secondary-button"
              onClick={() => navigate("/user/track")}
            >
              Track a Complaint

              <span>
                →
              </span>
            </button>

          </div>

        </div>


        <div className="hero-scroll-indicator">

          <span>
            Scroll to explore
          </span>

          <span className="scroll-arrow">
            ↓
          </span>

        </div>

      </section>


      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="landing-intro">

        <div className="landing-section-container">

          <p className="section-eyebrow">
            CIVIC PARTICIPATION MADE SIMPLE
          </p>


          <h2>
            Your voice can make
            <br />

            <span>
              a difference.
            </span>
          </h2>


          <p className="landing-intro-text">
            From a broken street light to overflowing garbage,
            reporting everyday civic issues shouldn't be difficult.
            Unified Grievance System brings reporting, tracking,
            and resolution together in one simple platform.
          </p>

        </div>

      </section>


      {/* =====================================================
          FEATURES / COMMON ISSUES
      ===================================================== */}

      <section
        id="features"
        className="landing-features"
      >

        <div className="landing-section-container">


          {/* =================================================
              ABOUT US TARGET
          ================================================= */}

          <div
            id="issues"
            className="section-heading-row"
          >

            <div>

              <p className="section-eyebrow">
                WHAT CAN YOU REPORT?
              </p>


              <h2>
                Common issues.
                <br />

                <span>
                  Real solutions.
                </span>
              </h2>

            </div>


            <p className="section-heading-description">
              Spot something that needs attention?
              Report it and help your community get
              the right issue to the right department.
            </p>

          </div>


          {/* =================================================
              ISSUE CARDS
          ================================================= */}

          <div className="issue-cards">


            {/* POTHOLE */}

            <div className="issue-card">

              <div className="issue-image-wrapper">

                <img
                  src={potholeImage}
                  alt="Road and pothole issue"
                />

                <div className="issue-number">
                  01
                </div>

              </div>


              <div className="issue-card-content">

                <p className="issue-category">
                  INFRASTRUCTURE
                </p>

                <h3>
                  Road &amp; Pothole Issues
                </h3>

                <p>
                  Report damaged roads, potholes,
                  broken pavements and other
                  infrastructure problems.
                </p>

              </div>

            </div>


            {/* GARBAGE */}

            <div className="issue-card">

              <div className="issue-image-wrapper">

                <img
                  src={garbageImage}
                  alt="Waste and garbage issue"
                />

                <div className="issue-number">
                  02
                </div>

              </div>


              <div className="issue-card-content">

                <p className="issue-category">
                  CLEANLINESS
                </p>

                <h3>
                  Waste &amp; Garbage
                </h3>

                <p>
                  Help keep your surroundings clean
                  by reporting overflowing bins,
                  dumped waste and litter.
                </p>

              </div>

            </div>


            {/* WATER */}

            <div className="issue-card">

              <div className="issue-image-wrapper">

                <img
                  src={waterLeakageImage}
                  alt="Water leakage issue"
                />

                <div className="issue-number">
                  03
                </div>

              </div>


              <div className="issue-card-content">

                <p className="issue-category">
                  WATER
                </p>

                <h3>
                  Water Leakage
                </h3>

                <p>
                  Report leaking pipelines,
                  damaged water infrastructure
                  and other water-related issues.
                </p>

              </div>

            </div>


            {/* ENVIRONMENT */}

            <div className="issue-card">

              <div className="issue-image-wrapper">

                <img
                  src={environmentImage}
                  alt="Environmental issue"
                />

                <div className="issue-number">
                  04
                </div>

              </div>


              <div className="issue-card-content">

                <p className="issue-category">
                  ENVIRONMENT
                </p>

                <h3>
                  Environmental Issues
                </h3>

                <p>
                  Report issues affecting green
                  spaces, public surroundings and
                  the local environment.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="how-it-works"
      >

        <div className="landing-section-container">


          <div className="how-heading">

            <p className="section-eyebrow">
              HOW IT WORKS
            </p>


            <h2>
              From problem
              <br />

              <span>
                to resolution.
              </span>
            </h2>


            <p>
              Reporting an issue takes just a few simple steps.
            </p>

          </div>


          <div className="steps-container">


            {/* STEP 1 */}

            <div className="step-item">

              <div className="step-number">
                01
              </div>


              <div className="step-content">

                <h3>
                  Report
                </h3>

                <p>
                  Tell us what is wrong. Add a photo,
                  description and location so the issue
                  can be understood clearly.
                </p>

              </div>

            </div>


            <div className="step-line"></div>


            {/* STEP 2 */}

            <div className="step-item">

              <div className="step-number">
                02
              </div>


              <div className="step-content">

                <h3>
                  Track
                </h3>

                <p>
                  Get a unique complaint ID and follow
                  the progress of your report as it moves
                  through the resolution process.
                </p>

              </div>

            </div>


            <div className="step-line"></div>


            {/* STEP 3 */}

            <div className="step-item">

              <div className="step-number">
                03
              </div>


              <div className="step-content">

                <h3>
                  Resolve
                </h3>

                <p>
                  The appropriate department reviews
                  the issue, takes action and updates
                  its status until it is resolved.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT / COMMUNITY
      ===================================================== */}

      <section
        id="about"
        className="community-section"
        style={{
          backgroundImage: `url(${communityImage})`,
        }}
      >

        <div className="community-overlay"></div>


        <div className="community-content">

          <p className="section-eyebrow community-eyebrow">
            BUILT FOR COMMUNITIES
          </p>


          <h2>
            A better city starts
            <br />

            with people who care.
          </h2>


          <p>
            Every report is a small step toward making
            our neighbourhoods cleaner, safer and better
            for everyone.
          </p>


          <button
            className="community-button"
            onClick={() => navigate("/user/report")}
          >
            Report an Issue

            <span>
              →
            </span>
          </button>

        </div>

      </section>


      {/* =====================================================
          CONTACT / HELP & SUPPORT
      ===================================================== */}

      <section
        id="contact"
        className="contact-section"
      >

        <div className="landing-section-container">

          <div className="contact-content">


            <div>

              <p className="section-eyebrow">
                HAVE A QUESTION?
              </p>


              <h2>
                We're here to
                <br />

                <span>
                  help.
                </span>
              </h2>

            </div>


            <div className="contact-info">

              <p>
                For help with reporting an issue,
                tracking a complaint or using the
                platform, get in touch with us.
              </p>


              <a href="mailto:support@unifiedgrievance.com">
                support@unifiedgrievance.com
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="landing-footer">

        <div className="footer-inner">


          {/* FOOTER BRAND */}

          <div className="footer-brand">

            <div className="landing-logo footer-logo">

              <span className="logo-unified">
                Unified
              </span>{" "}

              <span className="logo-grievance">
                Grievance
              </span>{" "}

              <span className="logo-system">
                System
              </span>

            </div>


            <p>
              Report. Track. Resolve.
            </p>

          </div>


          {/* FOOTER NAVIGATION */}

          <div className="footer-links">

            <button
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>


            <button
              onClick={() => scrollToSection("features")}
            >
              Features
            </button>


            <button
              onClick={() => scrollToSection("how-it-works")}
            >
              How It Works
            </button>


            <button
              onClick={() => scrollToSection("about")}
            >
              About
            </button>


            <button
              onClick={() => scrollToSection("contact")}
            >
              Contact
            </button>

          </div>


          {/* =================================================
              ADMIN / STAFF LOGIN
          ================================================= */}

          <div className="footer-login-links">

            <button
              type="button"
              onClick={() => navigate("/admin/login")}
            >
              Admin Login
            </button>


            <button
              type="button"
              onClick={() => navigate("/staff/login")}
            >
              Staff Login
            </button>

          </div>


          {/* COPYRIGHT */}

          <div className="footer-right">

            <p>
              © {new Date().getFullYear()} Unified Grievance System
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default LandingPage;