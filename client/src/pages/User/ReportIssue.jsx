import React, { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  Trash2,
  Lightbulb,
  Droplets,
  MapPin,
  Plus,
  Home,
  Map,
  FileText,
  User,
  Mic,
  MicOff,
  Languages,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import "../../styles/ReportIssue.css";
import "../../styles/BottomNavigation.css";
import "../../styles/UserAppLayout.css";

const LANGUAGES = {
  English: {
    code: "en-US",
    title: "Report an Issue",
    issueType: "Issue Type",
    aiTitle: "✨ Let AI handle this",
    aiDescription:
      "AI can identify the category and write the description from your photo.",
    location: "Location",
    locationNotSelected: "Location not selected",
    enterManually: "Enter Manually",
    done: "Done",
    useCurrent: "Use Current",
    detecting: "Detecting...",
    description: "Description",
    required: "Required",
    aiPlaceholder:
      "Optional — AI can describe the issue from your photo...",
    normalPlaceholder: "Describe the issue...",
    aiHint:
      "Leave this blank and AI will generate a concise description after analyzing your photo.",
    uploadPhoto: "Upload Photo",
    submit: "Submit Report",
    submitting: "Submitting...",
    listening:
      "Listening... Speak your complaint and tap the microphone again when you're done.",
    speechUnsupported:
      "Speech-to-text is not supported by this browser. Please use a supported browser such as Chrome.",
    microphoneDenied:
      "Microphone permission was denied. Please allow microphone access and try again.",
    noSpeech: "No speech was detected. Please try speaking again.",
    speechError: "Speech recognition could not start. Please try again.",
    locationUnsupported:
      "Location detection is not supported by this browser.",
    locationDenied:
      "Location permission was denied. Please allow location access or enter the location manually.",
    locationUnavailable:
      "Your location could not be determined. Please enter it manually.",
    locationTimeout:
      "Location detection timed out. Please try again or enter it manually.",
    locationError: "Unable to detect your location.",
    descriptionRequired:
      "Please enter a description or turn on AI assistance.",
    photoRequired: "Please upload a photo of the issue.",
    genericError:
      "Something went wrong while submitting your complaint.",
    issueNames: {
      Pothole: "Pothole",
      Garbage: "Garbage",
      "Street Light": "Street Light",
      "Water Leakage": "Water Leakage",
      Other: "Other",
    },
  },

  Hindi: {
    code: "hi-IN",
    title: "समस्या की रिपोर्ट करें",
    issueType: "समस्या का प्रकार",
    aiTitle: "✨ AI को संभालने दें",
    aiDescription:
      "AI आपकी फोटो से समस्या की श्रेणी और विवरण पहचान सकता है।",
    location: "स्थान",
    locationNotSelected: "स्थान चुना नहीं गया",
    enterManually: "मैन्युअल रूप से दर्ज करें",
    done: "हो गया",
    useCurrent: "वर्तमान स्थान",
    detecting: "पता लगाया जा रहा है...",
    description: "विवरण",
    required: "आवश्यक",
    aiPlaceholder:
      "वैकल्पिक — AI आपकी फोटो से समस्या का विवरण बनाएगा...",
    normalPlaceholder: "समस्या का विवरण दें...",
    aiHint:
      "इसे खाली छोड़ें और AI आपकी फोटो का विश्लेषण करके संक्षिप्त विवरण बनाएगा।",
    uploadPhoto: "फोटो अपलोड करें",
    submit: "रिपोर्ट भेजें",
    submitting: "भेजा जा रहा है...",
    listening:
      "सुन रहा है... अपनी समस्या बोलें और पूरा होने पर माइक्रोफोन फिर से दबाएं।",
    speechUnsupported:
      "इस ब्राउज़र में स्पीच-टू-टेक्स्ट उपलब्ध नहीं है। Chrome जैसे समर्थित ब्राउज़र का उपयोग करें।",
    microphoneDenied:
      "माइक्रोफोन की अनुमति नहीं मिली। कृपया माइक्रोफोन की अनुमति दें और फिर प्रयास करें।",
    noSpeech:
      "कोई आवाज़ नहीं मिली। कृपया फिर से बोलने का प्रयास करें।",
    speechError:
      "स्पीच रिकग्निशन शुरू नहीं हो सका। कृपया फिर से प्रयास करें।",
    locationUnsupported:
      "इस ब्राउज़र में स्थान पता करने की सुविधा उपलब्ध नहीं है।",
    locationDenied:
      "स्थान की अनुमति नहीं मिली। कृपया स्थान की अनुमति दें या स्थान मैन्युअली दर्ज करें।",
    locationUnavailable:
      "आपका स्थान पता नहीं चल सका। कृपया इसे मैन्युअली दर्ज करें।",
    locationTimeout:
      "स्थान पता करने में समय समाप्त हो गया। कृपया फिर से प्रयास करें।",
    locationError: "स्थान पता नहीं किया जा सका।",
    descriptionRequired:
      "कृपया विवरण दर्ज करें या AI सहायता चालू करें।",
    photoRequired: "कृपया समस्या की फोटो अपलोड करें।",
    genericError: "रिपोर्ट भेजते समय कुछ गलत हो गया।",
    issueNames: {
      Pothole: "गड्ढा",
      Garbage: "कचरा",
      "Street Light": "स्ट्रीट लाइट",
      "Water Leakage": "पानी का रिसाव",
      Other: "अन्य",
    },
  },

  Marathi: {
    code: "mr-IN",
    title: "समस्येची तक्रार करा",
    issueType: "समस्येचा प्रकार",
    aiTitle: "✨ AI ला हे हाताळू द्या",
    aiDescription:
      "AI तुमच्या फोटोवरून समस्येचा प्रकार आणि वर्णन ओळखू शकतो.",
    location: "स्थान",
    locationNotSelected: "स्थान निवडलेले नाही",
    enterManually: "स्वतः स्थान भरा",
    done: "पूर्ण",
    useCurrent: "सध्याचे स्थान",
    detecting: "स्थान शोधत आहे...",
    description: "वर्णन",
    required: "आवश्यक",
    aiPlaceholder:
      "पर्यायी — AI तुमच्या फोटोवरून समस्येचे वर्णन तयार करेल...",
    normalPlaceholder: "समस्येचे वर्णन करा...",
    aiHint:
      "हे रिकामे सोडा आणि AI तुमच्या फोटोचे विश्लेषण करून संक्षिप्त वर्णन तयार करेल.",
    uploadPhoto: "फोटो अपलोड करा",
    submit: "तक्रार पाठवा",
    submitting: "पाठवत आहे...",
    listening:
      "ऐकत आहे... तुमची समस्या बोला आणि पूर्ण झाल्यावर मायक्रोफोन पुन्हा दाबा.",
    speechUnsupported:
      "या ब्राउझरमध्ये स्पीच-टू-टेक्स्ट उपलब्ध नाही. Chrome सारखा समर्थित ब्राउझर वापरा.",
    microphoneDenied:
      "मायक्रोफोनची परवानगी नाकारली गेली. कृपया मायक्रोफोनची परवानगी द्या आणि पुन्हा प्रयत्न करा.",
    noSpeech:
      "आवाज आढळला नाही. कृपया पुन्हा बोलण्याचा प्रयत्न करा.",
    speechError:
      "स्पीच रिकग्निशन सुरू होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.",
    locationUnsupported:
      "या ब्राउझरमध्ये स्थान शोधण्याची सुविधा उपलब्ध नाही.",
    locationDenied:
      "स्थानाची परवानगी नाकारली गेली. कृपया स्थानाची परवानगी द्या किंवा स्थान स्वतः भरा.",
    locationUnavailable:
      "तुमचे स्थान शोधता आले नाही. कृपया ते स्वतः भरा.",
    locationTimeout:
      "स्थान शोधण्यास वेळ लागला. कृपया पुन्हा प्रयत्न करा.",
    locationError: "स्थान शोधता आले नाही.",
    descriptionRequired:
      "कृपया वर्णन भरा किंवा AI सहाय्य सुरू करा.",
    photoRequired: "कृपया समस्येचा फोटो अपलोड करा.",
    genericError: "तक्रार पाठवताना काहीतरी चूक झाली.",
    issueNames: {
      Pothole: "रस्त्यावरील खड्डा",
      Garbage: "कचरा",
      "Street Light": "स्ट्रीट लाइट",
      "Water Leakage": "पाण्याची गळती",
      Other: "इतर",
    },
  },
};

const issueTypes = [
  {
    name: "Pothole",
    icon: CircleHelp,
  },
  {
    name: "Garbage",
    icon: Trash2,
  },
  {
    name: "Street Light",
    icon: Lightbulb,
  },
  {
    name: "Water Leakage",
    icon: Droplets,
  },
  {
    name: "Other",
    icon: CircleHelp,
  },
];

function generateComplaintCode() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `UGS-${randomNumber}`;
}

async function getReadableLocation(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        latitude
      )}&lon=${encodeURIComponent(
        longitude
      )}&zoom=18&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();

    const address = data.address || {};

    const parts = [
      address.road || address.pedestrian || address.neighbourhood,
      address.suburb || address.city_district,
      address.city || address.town || address.village,
      address.state,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return data.display_name || "";
  } catch (error) {
    console.warn("Could not get readable location:", error);
    return "";
  }
}

function ReportIssue() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("ugs_language") || "English";
  });

  const t = LANGUAGES[language];

  const [selectedIssue, setSelectedIssue] = useState("");
  const [letAISuggest, setLetAISuggest] = useState(true);

  const [description, setDescription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [locationText, setLocationText] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLocationEditing, setIsLocationEditing] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);

  useEffect(() => {
    localStorage.setItem("ugs_language", language);

    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGES[language].code;
    }
  }, [language]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = LANGUAGES[language].code;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setSubmitError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      if (transcript.trim()) {
        setDescription((current) => {
          const combined = current.trim()
            ? `${current.trim()} ${transcript.trim()}`
            : transcript.trim();

          return combined.slice(0, 500);
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setSubmitError(t.microphoneDenied);
      } else if (event.error === "no-speech") {
        setSubmitError(t.noSpeech);
      } else if (event.error !== "aborted") {
        setSubmitError(t.speechError);
      }

      shouldKeepListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (shouldKeepListeningRef.current) {
        try {
          recognition.lang = LANGUAGES[language].code;
          recognition.start();
        } catch (error) {
          console.warn("Could not restart speech recognition:", error);
          shouldKeepListeningRef.current = false;
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldKeepListeningRef.current = false;

      try {
        recognition.stop();
      } catch (error) {
        console.warn("Could not stop speech recognition:", error);
      }

      recognitionRef.current = null;
    };
  }, [language]);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;

    if (isListening && recognitionRef.current) {
      shouldKeepListeningRef.current = false;

      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn(error);
      }

      setIsListening(false);
    }

    setLanguage(newLanguage);
    setSubmitError("");
  };

  const toggleSpeechToText = () => {
    if (!speechSupported) {
      setSubmitError(t.speechUnsupported);
      return;
    }

    const recognition = recognitionRef.current;

    if (!recognition) {
      setSubmitError(t.speechError);
      return;
    }

    if (isListening) {
      shouldKeepListeningRef.current = false;

      try {
        recognition.stop();
      } catch (error) {
        console.warn("Could not stop speech recognition:", error);
      }

      setIsListening(false);
      return;
    }

    setSubmitError("");
    shouldKeepListeningRef.current = true;
    recognition.lang = t.code;

    try {
      recognition.start();
    } catch (error) {
      console.warn("Could not start speech recognition:", error);

      shouldKeepListeningRef.current = false;
      setIsListening(false);

      setSubmitError(t.speechError);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setSubmitError(t.locationUnsupported);
      return;
    }

    setSubmitError("");
    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        setLatitude(lat);
        setLongitude(lng);

        setLocationText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);

        const readableLocation = await getReadableLocation(lat, lng);

        if (readableLocation) {
          setLocationText(
            `${readableLocation} (${lat.toFixed(6)}, ${lng.toFixed(6)})`
          );
        }

        setIsLocationEditing(false);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Location detection error:", error);

        let message = t.locationError;

        if (error.code === 1) {
          message = t.locationDenied;
        } else if (error.code === 2) {
          message = t.locationUnavailable;
        } else if (error.code === 3) {
          message = t.locationTimeout;
        }

        setSubmitError(message);
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const imageURL = URL.createObjectURL(file);
    setImage(imageURL);

    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");

    if (!letAISuggest && !description.trim()) {
      setSubmitError(t.descriptionRequired);
      return;
    }

    if (!selectedFile) {
      setSubmitError(t.photoRequired);
      return;
    }

    setIsSubmitting(true);

    try {
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

      const complaintCode = generateComplaintCode();

      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .insert({
          complaint_code: complaintCode,
          user_id: user.id,
          title: letAISuggest ? "Civic Issue" : selectedIssue || "Other",
          description: description.trim(),
          category_id: null,
          location_text: locationText.trim() || "Location not provided",
          latitude,
          longitude,
          original_language: language,
        })
        .select()
        .single();

      if (complaintError) {
        throw complaintError;
      }

      const fileExtension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/${complaint.id}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("complaint-images")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedFile.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: imageRecordError } = await supabase
        .from("complaint_images")
        .insert({
          complaint_id: complaint.id,
          storage_path: filePath,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
        });

      if (imageRecordError) {
        throw imageRecordError;
      }

      try {
        const apiBaseUrl =
          import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

        fetch(`${apiBaseUrl}/api/ai/analyze/${complaintCode}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          keepalive: true,
        })
          .then(async (response) => {
            if (!response.ok) {
              const aiErrorText = await response.text();

              console.error("AI analysis failed:", aiErrorText);

              return;
            }

            const aiResult = await response.json();

            console.log("AI analysis completed:", aiResult);
          })
          .catch((aiError) => {
            console.error("Could not connect to AI service:", aiError);
          });
      } catch (aiError) {
        console.error("Could not start AI analysis:", aiError);
      }

      navigate(`/user/issue/${complaint.id}`);
    } catch (error) {
      console.error("Complaint submission error:", error);

      setSubmitError(error?.message || t.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-issue-page">
      {/* HEADER */}

      <header className="report-issue-header">
        <button
          className="report-issue-back"
          onClick={() => navigate("/user")}
        >
          <ArrowLeft size={21} />
        </button>

        <h1>{t.title}</h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              border: "1px solid #dce8df",
              borderRadius: "8px",
              padding: "3px 6px",
              background: "#f7fbf8",
            }}
          >
            <Languages size={14} color="#009f7f" />

            <select
              value={language}
              onChange={handleLanguageChange}
              aria-label="Select language"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#294336",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी</option>
              <option value="Marathi">मराठी</option>
            </select>
          </div>
        </div>
      </header>

      <main className="report-issue-content">
        <form onSubmit={handleSubmit}>
          {/* ISSUE TYPE / AI ASSIST */}

          <section className="report-form-section">
            <label className="report-section-label">{t.issueType}</label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px 14px",
                marginBottom: "12px",
                borderRadius: "12px",
                border: "1px solid #dce8df",
                background: letAISuggest ? "#f1f8f3" : "#fff",
                cursor: "pointer",
              }}
            >
              <span>
                <strong
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#294336",
                  }}
                >
                  {t.aiTitle}
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: "3px",
                    fontSize: "11px",
                    color: "#718078",
                  }}
                >
                  {t.aiDescription}
                </span>
              </span>

              <input
                type="checkbox"
                checked={letAISuggest}
                onChange={(event) => {
                  const enabled = event.target.checked;

                  setLetAISuggest(enabled);

                  if (enabled) {
                    setSelectedIssue("");
                  }
                }}
              />
            </label>

            {!letAISuggest && (
              <div className="issue-type-list">
                {issueTypes.map((issue) => {
                  const Icon = issue.icon;

                  return (
                    <button
                      type="button"
                      key={issue.name}
                      className={`issue-type-card ${
                        selectedIssue === issue.name ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedIssue(issue.name);
                        setLetAISuggest(false);
                      }}
                    >
                      <Icon size={19} />
                      <span>{t.issueNames[issue.name]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* LOCATION */}

          <section className="report-form-section">
            <label className="report-section-label">{t.location}</label>

            <div className="location-field">
              <div className="location-left">
                <MapPin size={18} />

                {isLocationEditing ? (
                  <input
                    type="text"
                    value={locationText}
                    onChange={(event) => setLocationText(event.target.value)}
                    placeholder={t.location}
                    autoFocus
                  />
                ) : (
                  <span>
                    {locationText || t.locationNotSelected}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginLeft: "8px",
                }}
              >
                <button
                  type="button"
                  className="change-location"
                  onClick={() => setIsLocationEditing((value) => !value)}
                >
                  {isLocationEditing ? t.done : t.enterManually}
                </button>

                <button
                  type="button"
                  className="change-location"
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                >
                  {isDetectingLocation ? t.detecting : t.useCurrent}
                </button>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}

          <section className="report-form-section">
            <label className="report-section-label">
              {t.description}

              {!letAISuggest && (
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: "11px",
                    color: "#8a968f",
                  }}
                >
                  {" "}
                  {t.required}
                </span>
              )}
            </label>

            <div
              className="description-wrapper"
              style={{ position: "relative" }}
            >
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value.slice(0, 500))
                }
                maxLength={500}
                placeholder={
                  letAISuggest ? t.aiPlaceholder : t.normalPlaceholder
                }
                style={{
                  paddingRight: "48px",
                  paddingBottom: "28px",
                }}
              />

              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleSpeechToText}
                  aria-label={
                    isListening
                      ? "Stop speech to text"
                      : "Start speech to text"
                  }
                  title={isListening ? "Stop listening" : "Speak"}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border: "none",
                    background: isListening ? "#dc5a5a" : "#eaf6ef",
                    color: isListening ? "#ffffff" : "#009f7f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: isListening
                      ? "0 0 0 4px rgba(220, 90, 90, 0.12)"
                      : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isListening ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
              )}

              <span className="character-count">
                {description.length}/500
              </span>
            </div>

            {isListening && (
              <p
                style={{
                  margin: "7px 0 0",
                  fontSize: "11px",
                  color: "#dc5a5a",
                  fontWeight: 600,
                }}
              >
                ● {t.listening}
              </p>
            )}

            {letAISuggest && (
              <p
                style={{
                  margin: "7px 0 0",
                  fontSize: "11px",
                  color: "#718078",
                }}
              >
                {t.aiHint}
              </p>
            )}
          </section>

          {/* PHOTO */}

          <section className="report-form-section">
            <label className="report-section-label">
              {t.uploadPhoto}
            </label>

            <div className="upload-container">
              {image && (
                <div className="uploaded-image">
                  <img src={image} alt="Uploaded issue" />
                </div>
              )}

              <button
                type="button"
                className="add-photo-button"
                onClick={() =>
                  document.getElementById("camera-input")?.click()
                }
                aria-label={t.uploadPhoto}
              >
                <Plus size={24} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                hidden
              />

              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                hidden
              />
            </div>
          </section>

          {/* ERROR */}

          {submitError && (
            <p
              style={{
                color: "#d64545",
                fontSize: "13px",
                margin: "8px 0 12px",
              }}
            >
              {submitError}
            </p>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="submit-report-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        </form>
      </main>

      {/* BOTTOM NAVIGATION */}

      <nav className="report-bottom-navigation">
        <button
          className="report-bottom-item"
          onClick={() => navigate("/user")}
        >
          <Home size={19} />
          <span>Home</span>
        </button>

        <button
          className="report-bottom-item"
          onClick={() => navigate("/user/map")}
        >
          <Map size={19} />
          <span>Map</span>
        </button>

        <button
          className="report-add-button"
          onClick={() => navigate("/user/report")}
        >
          <Plus size={27} />
        </button>

        <button
          className="report-bottom-item"
          onClick={() => navigate("/user/reports")}
        >
          <FileText size={19} />
          <span>Reports</span>
        </button>

        <button
          className="report-bottom-item"
          onClick={() => navigate("/user/profile")}
        >
          <User size={19} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default ReportIssue;