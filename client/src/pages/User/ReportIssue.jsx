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
  Camera,
  Image as ImageIcon,
  X,
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
      address.road ||
        address.pedestrian ||
        address.neighbourhood,

      address.suburb || address.city_district,

      address.city ||
        address.town ||
        address.village,

      address.state,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return data.display_name || "";
  } catch (error) {
    console.warn(
      "Could not get readable location:",
      error
    );

    return "";
  }
}

function ReportIssue() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(() => {
    return (
      localStorage.getItem("ugs_language") ||
      "English"
    );
  });

  const t = LANGUAGES[language];

  const [selectedIssue, setSelectedIssue] =
    useState("");

  const [letAISuggest, setLetAISuggest] =
    useState(true);

  const [description, setDescription] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [speechSupported, setSpeechSupported] =
    useState(true);

  const [image, setImage] = useState(null);

  /*
   * This state is kept for compatibility with the
   * existing component.
   *
   * The authoritative file used for upload is now
   * selectedFileRef.current.
   */
  const [selectedFile, setSelectedFile] =
    useState(null);

  const [locationText, setLocationText] =
    useState("");

  const [latitude, setLatitude] =
    useState(null);

  const [longitude, setLongitude] =
    useState(null);

  const [isLocationEditing, setIsLocationEditing] =
    useState(false);

  const [isDetectingLocation, setIsDetectingLocation] =
    useState(false);

  const [showLocationPopup, setShowLocationPopup] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isProcessingImage, setIsProcessingImage] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const fileInputRef = useRef(null);

  const cameraInputRef = useRef(null);

  /*
   * IMPORTANT:
   *
   * This ref stores the exact processed file that
   * the user currently sees in the preview.
   *
   * The submit function uses this ref instead of
   * relying only on React state.
   */
  const selectedFileRef = useRef(null);

  /*
   * Every image selection gets a unique number.
   *
   * If image A is still being compressed and the user
   * selects image B, image A is not allowed to overwrite
   * image B when its processing finishes.
   */
  const imageSelectionIdRef = useRef(0);

  const recognitionRef = useRef(null);

  const shouldKeepListeningRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(
      "ugs_language",
      language
    );

    if (recognitionRef.current) {
      recognitionRef.current.lang =
        LANGUAGES[language].code;
    }
  }, [language]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = false;

    recognition.lang =
      LANGUAGES[language].code;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setSubmitError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i += 1
      ) {
        if (event.results[i].isFinal) {
          transcript +=
            event.results[i][0].transcript;
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
      console.error(
        "Speech recognition error:",
        event.error
      );

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setSubmitError(
          t.microphoneDenied
        );
      } else if (
        event.error === "no-speech"
      ) {
        setSubmitError(t.noSpeech);
      } else if (
        event.error !== "aborted"
      ) {
        setSubmitError(
          t.speechError
        );
      }

      shouldKeepListeningRef.current =
        false;

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (
        shouldKeepListeningRef.current
      ) {
        try {
          recognition.lang =
            LANGUAGES[language].code;

          recognition.start();
        } catch (error) {
          console.warn(
            "Could not restart speech recognition:",
            error
          );

          shouldKeepListeningRef.current =
            false;
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldKeepListeningRef.current =
        false;

      try {
        recognition.stop();
      } catch (error) {
        console.warn(
          "Could not stop speech recognition:",
          error
        );
      }

      recognitionRef.current = null;
    };
  }, [language]);

  const handleLanguageChange = (event) => {
    const newLanguage =
      event.target.value;

    if (
      isListening &&
      recognitionRef.current
    ) {
      shouldKeepListeningRef.current =
        false;

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
      setSubmitError(
        t.speechUnsupported
      );

      return;
    }

    const recognition =
      recognitionRef.current;

    if (!recognition) {
      setSubmitError(
        t.speechError
      );

      return;
    }

    if (isListening) {
      shouldKeepListeningRef.current =
        false;

      try {
        recognition.stop();
      } catch (error) {
        console.warn(
          "Could not stop speech recognition:",
          error
        );
      }

      setIsListening(false);

      return;
    }

    setSubmitError("");

    shouldKeepListeningRef.current =
      true;

    recognition.lang = t.code;

    try {
      recognition.start();
    } catch (error) {
      console.warn(
        "Could not start speech recognition:",
        error
      );

      shouldKeepListeningRef.current =
        false;

      setIsListening(false);

      setSubmitError(
        t.speechError
      );
    }
  };

  /* =========================================================
     LOCATION
  ========================================================= */

  const detectLocation = () => {
    console.log(
      "================================="
    );

    console.log(
      "LOCATION REQUEST STARTED"
    );

    console.log(
      "================================="
    );

    if (!window.isSecureContext) {
      console.error(
        "Website is not running in HTTPS."
      );

      setSubmitError(
        "Location requires a secure HTTPS connection."
      );

      return;
    }

    if (!navigator.geolocation) {
      console.error(
        "Geolocation is not supported."
      );

      setSubmitError(
        "Location is not supported on this device/browser."
      );

      return;
    }

    setSubmitError("");

    setIsDetectingLocation(true);

    setLocationText(
      "Getting your location..."
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log(
          "================================="
        );

        console.log(
          "LOCATION SUCCESS"
        );

        console.log(
          "================================="
        );

        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        console.log(
          "Latitude:",
          lat
        );

        console.log(
          "Longitude:",
          lng
        );

        console.log(
          "Accuracy:",
          position.coords.accuracy
        );

        setLatitude(lat);

        setLongitude(lng);

        setLocationText(
          `Location captured (${lat.toFixed(
            6
          )}, ${lng.toFixed(6)})`
        );

        setShowLocationPopup(false);

        setIsLocationEditing(false);

        try {
          const readableLocation =
            await getReadableLocation(
              lat,
              lng
            );

          if (readableLocation) {
            setLocationText(
              `${readableLocation} (${lat.toFixed(
                6
              )}, ${lng.toFixed(6)})`
            );
          }
        } catch (error) {
          console.warn(
            "Readable address lookup failed:",
            error
          );
        }

        setIsDetectingLocation(false);
      },

      (error) => {
        console.error(
          "================================="
        );

        console.error(
          "LOCATION ERROR"
        );

        console.error(
          "================================="
        );

        console.error(
          "Error code:",
          error.code
        );

        console.error(
          "Error message:",
          error.message
        );

        setIsDetectingLocation(false);

        if (error.code === 1) {
          setSubmitError(
            "Location permission was denied. Please allow location access for this website in your browser settings."
          );
        } else if (error.code === 2) {
          setSubmitError(
            "Your device could not determine your location. Turn on GPS/Location and try again."
          );
        } else if (error.code === 3) {
          setSubmitError(
            "Location request timed out. Please try again."
          );
        } else {
          setSubmitError(
            `Unable to get your location: ${error.message}`
          );
        }
      },

      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
      }
    );
  };

  /* =========================================================
     PHOTO HANDLING
  ========================================================= */

  const compressImage = (file) => {
    return new Promise(
      (resolve, reject) => {
        const maxDimension = 2560;

        const maxBytes =
          10 * 1024 * 1024;

        const objectUrl =
          URL.createObjectURL(file);

        const img = new Image();

        img.onload = () => {
          try {
            const scale = Math.min(
              1,
              maxDimension /
                Math.max(
                  img.naturalWidth,
                  img.naturalHeight
                )
            );

            let width = Math.max(
              1,
              Math.round(
                img.naturalWidth *
                  scale
              )
            );

            let height = Math.max(
              1,
              Math.round(
                img.naturalHeight *
                  scale
              )
            );

            const canvas =
              document.createElement(
                "canvas"
              );

            const ctx =
              canvas.getContext(
                "2d",
                {
                  alpha: false,
                }
              );

            if (!ctx) {
              throw new Error(
                "Could not prepare the image for upload."
              );
            }

            const render = (
              w,
              h,
              quality
            ) =>
              new Promise(
                (
                  resolveBlob,
                  rejectBlob
                ) => {
                  canvas.width = w;

                  canvas.height = h;

                  ctx.fillStyle =
                    "#ffffff";

                  ctx.fillRect(
                    0,
                    0,
                    w,
                    h
                  );

                  ctx.drawImage(
                    img,
                    0,
                    0,
                    w,
                    h
                  );

                  canvas.toBlob(
                    (blob) => {
                      if (!blob) {
                        rejectBlob(
                          new Error(
                            "Could not compress the image."
                          )
                        );

                        return;
                      }

                      resolveBlob(
                        blob
                      );
                    },
                    "image/jpeg",
                    quality
                  );
                }
              );

            const finish =
              async () => {
                let quality =
                  0.90;

                let blob =
                  await render(
                    width,
                    height,
                    quality
                  );

                while (
                  blob.size >
                    maxBytes &&
                  quality > 0.45
                ) {
                  quality -= 0.07;

                  blob =
                    await render(
                      width,
                      height,
                      quality
                    );
                }

                while (
                  blob.size >
                    maxBytes &&
                  Math.max(
                    width,
                    height
                  ) > 900
                ) {
                  width = Math.max(
                    900,
                    Math.round(
                      width * 0.85
                    )
                  );

                  height = Math.max(
                    900,
                    Math.round(
                      height * 0.85
                    )
                  );

                  quality = 0.72;

                  blob =
                    await render(
                      width,
                      height,
                      quality
                    );

                  while (
                    blob.size >
                      maxBytes &&
                    quality > 0.4
                  ) {
                    quality -=
                      0.06;

                    blob =
                      await render(
                        width,
                        height,
                        quality
                      );
                  }
                }

                const baseName =
                  file.name.replace(
                    /\.[^/.]+$/,
                    ""
                  ) ||
                  "complaint-photo";

                resolve(
                  new File(
                    [blob],
                    `${baseName}.jpg`,
                    {
                      type:
                        "image/jpeg",

                      lastModified:
                        Date.now(),
                    }
                  )
                );
              };

            finish().catch(
              reject
            );
          } catch (error) {
            reject(error);
          } finally {
            URL.revokeObjectURL(
              objectUrl
            );
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(
            objectUrl
          );

          reject(
            new Error(
              "This image format could not be processed. Please choose another photo."
            )
          );
        };

        img.src = objectUrl;
      }
    );
  };

  /*
   * IMAGE UPLOAD
   *
   * The important fix is here:
   *
   * 1. Every selected image gets an ID.
   * 2. The exact selected file is processed.
   * 3. If the user selects another image while
   *    processing is still happening, the old result
   *    is discarded.
   * 4. The processed file is stored in selectedFileRef.
   * 5. handleSubmit uploads selectedFileRef.current.
   */

  const handleImageUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setSubmitError(
        "Please select an image file."
      );

      event.target.value = "";

      return;
    }

    /*
     * Give this image selection a
     * unique operation ID.
     */
    const selectionId =
      ++imageSelectionIdRef.current;

    /*
     * Immediately invalidate the
     * previous selected file.
     */
    selectedFileRef.current =
      null;

    setSelectedFile(null);

    /*
     * Remove the previous preview.
     */
    if (image) {
      URL.revokeObjectURL(
        image
      );
    }

    setImage(null);

    setIsProcessingImage(
      true
    );

    setSubmitError("");

    console.log(
      "========================================"
    );

    console.log(
      "NEW IMAGE SELECTED"
    );

    console.log(
      "Selection ID:",
      selectionId
    );

    console.log(
      "Original file:",
      file.name
    );

    console.log(
      "Original type:",
      file.type
    );

    console.log(
      "Original size:",
      file.size
    );

    console.log(
      "========================================"
    );

    try {
      /*
       * Process THIS exact file.
       */
      const compressedFile =
        await compressImage(
          file
        );

      /*
       * If another image was selected
       * while this image was processing,
       * ignore this old result.
       */
      if (
        selectionId !==
        imageSelectionIdRef.current
      ) {
        console.log(
          "Ignoring outdated image processing result:",
          selectionId
        );

        return;
      }

      const imageURL =
        URL.createObjectURL(
          compressedFile
        );

      /*
       * Store the exact processed
       * file in the ref.
       */
      selectedFileRef.current =
        compressedFile;

      /*
       * Keep React state updated too.
       */
      setSelectedFile(
        compressedFile
      );

      setImage(imageURL);

      console.log(
        "========================================"
      );

      console.log(
        "IMAGE READY FOR SUBMISSION"
      );

      console.log(
        "Selection ID:",
        selectionId
      );

      console.log(
        "Processed file:",
        compressedFile.name
      );

      console.log(
        "Processed type:",
        compressedFile.type
      );

      console.log(
        "Processed size:",
        compressedFile.size
      );

      console.log(
        "========================================"
      );
    } catch (error) {
      /*
       * Only clear the image if this
       * is still the newest selection.
       */
      if (
        selectionId ===
        imageSelectionIdRef.current
      ) {
        selectedFileRef.current =
          null;

        setSelectedFile(null);

        setImage(null);

        console.error(
          "Image processing error:",
          error
        );

        setSubmitError(
          error?.message ||
            "Could not process this photo. Please choose another image."
        );
      }
    } finally {
      /*
       * Only the newest image operation
       * is allowed to change this state.
       */
      if (
        selectionId ===
        imageSelectionIdRef.current
      ) {
        setIsProcessingImage(
          false
        );
      }

      /*
       * Allow the same file to be
       * selected again.
       */
      event.target.value = "";
    }
  };

  const deletePhoto = () => {
    /*
     * Invalidate any image-processing
     * operation that is still running.
     */
    imageSelectionIdRef.current +=
      1;

    if (image) {
      URL.revokeObjectURL(
        image
      );
    }

    selectedFileRef.current =
      null;

    setImage(null);

    setSelectedFile(null);

    setIsProcessingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    if (
      cameraInputRef.current
    ) {
      cameraInputRef.current.value =
        "";
    }

    setSubmitError("");
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    /*
     * Do not allow submission while
     * the selected image is still
     * being processed.
     */
    if (isProcessingImage) {
      setSubmitError(
        "Please wait for the photo to finish processing."
      );

      return;
    }

    setSubmitError("");

    if (
      !letAISuggest &&
      !description.trim()
    ) {
      setSubmitError(
        t.descriptionRequired
      );

      return;
    }

    /*
     * IMPORTANT:
     *
     * Use the exact file stored in the ref.
     * This prevents React state timing from
     * changing which file gets uploaded.
     */
    const fileToUpload =
      selectedFileRef.current;

    if (!fileToUpload) {
      setSubmitError(
        t.photoRequired
      );

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

      const complaintCode =
        generateComplaintCode();

      /*
       * CREATE COMPLAINT
       */
      const {
        data: complaint,
        error: complaintError,
      } = await supabase
        .from("complaints")
        .insert({
          complaint_code:
            complaintCode,

          user_id: user.id,

          title: letAISuggest
            ? "Civic Issue"
            : selectedIssue ||
              "Other",

          description:
            description.trim(),

          category_id: null,

          location_text:
            locationText.trim() ||
            "Location not provided",

          latitude,

          longitude,

          original_language:
            language,
        })
        .select()
        .single();

      if (complaintError) {
        throw complaintError;
      }

      /*
       * CREATE UNIQUE STORAGE PATH
       *
       * The complaint UUID guarantees
       * that this complaint gets its own
       * image path.
       */
      const fileExtension =
        fileToUpload.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const filePath =
        `${user.id}/${complaint.id}.${fileExtension}`;

      console.log(
        "========================================"
      );

      console.log(
        "UPLOADING COMPLAINT IMAGE"
      );

      console.log(
        "User ID:",
        user.id
      );

      console.log(
        "Complaint ID:",
        complaint.id
      );

      console.log(
        "Complaint Code:",
        complaintCode
      );

      console.log(
        "File name:",
        fileToUpload.name
      );

      console.log(
        "File type:",
        fileToUpload.type
      );

      console.log(
        "File size:",
        fileToUpload.size
      );

      console.log(
        "Storage path:",
        filePath
      );

      console.log(
        "========================================"
      );

      /*
       * UPLOAD EXACT FILE
       */
      const {
        error: uploadError,
      } = await supabase.storage
        .from(
          "complaint-images"
        )
        .upload(
          filePath,
          fileToUpload,
          {
            cacheControl: "3600",

            /*
             * Never overwrite another
             * object accidentally.
             */
            upsert: false,

            contentType:
              fileToUpload.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      console.log(
        "IMAGE UPLOAD SUCCESS:",
        filePath
      );

      /*
       * SAVE IMAGE RECORD
       */
      const {
        error: imageRecordError,
      } = await supabase
        .from(
          "complaint_images"
        )
        .insert({
          complaint_id:
            complaint.id,

          storage_path:
            filePath,

          file_name:
            fileToUpload.name,

          file_type:
            fileToUpload.type,

          file_size:
            fileToUpload.size,
        });

      if (imageRecordError) {
        throw imageRecordError;
      }

      console.log(
        "COMPLAINT IMAGE RECORD CREATED:",
        {
          complaintId:
            complaint.id,

          storagePath:
            filePath,

          fileName:
            fileToUpload.name,
        }
      );

      /* =====================================================
         AI ANALYSIS
      ===================================================== */

      try {
        const apiBaseUrl =
          import.meta.env
            .VITE_API_URL ||
          "http://127.0.0.1:8000";

        fetch(
          `${apiBaseUrl}/api/ai/analyze/${complaintCode}`,
          {
            method: "POST",

            headers: {
              Accept:
                "application/json",
            },

            keepalive: true,
          }
        )
          .then(
            async (
              response
            ) => {
              if (!response.ok) {
                const aiErrorText =
                  await response.text();

                console.error(
                  "AI analysis failed:",
                  aiErrorText
                );

                return;
              }

              const aiResult =
                await response.json();

              console.log(
                "AI analysis completed:",
                aiResult
              );
            }
          )
          .catch(
            (aiError) => {
              console.error(
                "Could not connect to AI service:",
                aiError
              );
            }
          );
      } catch (aiError) {
        console.error(
          "Could not start AI analysis:",
          aiError
        );
      }

      /*
       * Navigate only after:
       *
       * 1. Complaint created
       * 2. Exact image uploaded
       * 3. complaint_images record created
       */
      navigate(
        `/user/issue/${complaint.id}`
      );
    } catch (error) {
      console.error(
        "Complaint submission error:",
        error
      );

      setSubmitError(
        error?.message ||
          t.genericError
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="report-issue-page"
      style={{
        minHeight: "100vh",
        height: "auto",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling:
          "touch",
        paddingBottom: "110px",
        touchAction: "pan-y",
      }}
    >
      {/* =====================================================
          LOCATION PERMISSION POPUP
      ===================================================== */}

      {showLocationPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "360px",
              background: "#fff",
              borderRadius: "20px",
              padding: "26px",
              textAlign: "center",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                margin:
                  "0 auto 16px",
                borderRadius:
                  "50%",
                background:
                  "#eaf6ef",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <MapPin
                size={28}
                color="#009f7f"
              />
            </div>

            <h2
              style={{
                margin:
                  "0 0 8px",
                color: "#294336",
                fontSize: "20px",
              }}
            >
              Allow Location Access?
            </h2>

            <p
              style={{
                margin:
                  "0 0 22px",
                color: "#718078",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              We use your location
              to accurately identify
              where the issue was
              reported.
            </p>

            <button
              type="button"
              onClick={() => {
                setSubmitError("");
                detectLocation();
              }}
              disabled={
                isDetectingLocation
              }
              style={{
                width: "100%",
                border: "none",
                borderRadius:
                  "12px",
                padding: "13px",
                background:
                  "#009f7f",
                color: "#fff",
                fontWeight: 700,
                cursor:
                  isDetectingLocation
                    ? "default"
                    : "pointer",
                marginBottom:
                  "10px",
              }}
            >
              {isDetectingLocation
                ? "Getting Location..."
                : "Allow Location"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowLocationPopup(
                  false
                );

                setSubmitError("");
              }}
              style={{
                width: "100%",
                border:
                  "1px solid #dce8df",
                borderRadius:
                  "12px",
                padding: "13px",
                background: "#fff",
                color: "#294336",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Maybe Later
            </button>

            {submitError && (
              <p
                style={{
                  margin:
                    "14px 0 0",
                  color: "#d64545",
                  fontSize: "12px",
                  lineHeight: 1.45,
                }}
              >
                {submitError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="report-issue-header">
        <button
          className="report-issue-back"
          onClick={() =>
            navigate("/user")
          }
        >
          <ArrowLeft size={21} />
        </button>

        <h1>{t.title}</h1>

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "4px",
              border:
                "1px solid #dce8df",
              borderRadius:
                "8px",
              padding:
                "3px 6px",
              background:
                "#f7fbf8",
            }}
          >
            <Languages
              size={14}
              color="#009f7f"
            />

            <select
              value={language}
              onChange={
                handleLanguageChange
              }
              aria-label="Select language"
              style={{
                border: "none",
                outline: "none",
                background:
                  "transparent",
                color: "#294336",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="English">
                English
              </option>

              <option value="Hindi">
                हिंदी
              </option>

              <option value="Marathi">
                मराठी
              </option>
            </select>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="report-issue-content">
        <form
          onSubmit={handleSubmit}
        >
          {/* =================================================
              ISSUE TYPE / AI
          ================================================= */}

          <section className="report-form-section">
            <label className="report-section-label">
              {t.issueType}
            </label>

            <label
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: "12px",
                padding:
                  "12px 14px",
                marginBottom:
                  "12px",
                borderRadius:
                  "12px",
                border:
                  "1px solid #dce8df",
                background:
                  letAISuggest
                    ? "#f1f8f3"
                    : "#fff",
                cursor: "pointer",
              }}
            >
              <span>
                <strong
                  style={{
                    display:
                      "block",
                    fontSize:
                      "13px",
                    color:
                      "#294336",
                  }}
                >
                  {t.aiTitle}
                </strong>

                <span
                  style={{
                    display:
                      "block",
                    marginTop:
                      "3px",
                    fontSize:
                      "11px",
                    color:
                      "#718078",
                  }}
                >
                  {t.aiDescription}
                </span>
              </span>

              <input
                type="checkbox"
                checked={
                  letAISuggest
                }
                onChange={(
                  event
                ) => {
                  const enabled =
                    event.target
                      .checked;

                  setLetAISuggest(
                    enabled
                  );

                  if (enabled) {
                    setSelectedIssue(
                      ""
                    );
                  }
                }}
              />
            </label>

            {!letAISuggest && (
              <div className="issue-type-list">
                {issueTypes.map(
                  (issue) => {
                    const Icon =
                      issue.icon;

                    return (
                      <button
                        type="button"
                        key={
                          issue.name
                        }
                        className={`issue-type-card ${
                          selectedIssue ===
                          issue.name
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedIssue(
                            issue.name
                          );

                          setLetAISuggest(
                            false
                          );
                        }}
                      >
                        <Icon size={19} />

                        <span>
                          {
                            t
                              .issueNames[
                              issue.name
                            ]
                          }
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* =================================================
              LOCATION
          ================================================= */}

          <section className="report-form-section">
            <label className="report-section-label">
              {t.location}
            </label>

            <div className="location-field">
              <div className="location-left">
                <MapPin size={18} />

                {isLocationEditing ? (
                  <input
                    type="text"
                    value={
                      locationText
                    }
                    onChange={(
                      event
                    ) =>
                      setLocationText(
                        event.target
                          .value
                      )
                    }
                    placeholder={
                      t.location
                    }
                    autoFocus
                  />
                ) : (
                  <span>
                    {locationText ||
                      t.locationNotSelected}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  marginLeft:
                    "8px",
                }}
              >
                <button
                  type="button"
                  className="change-location"
                  onClick={() =>
                    setIsLocationEditing(
                      (value) =>
                        !value
                    )
                  }
                >
                  {isLocationEditing
                    ? t.done
                    : t.enterManually}
                </button>

                <button
                  type="button"
                  className="change-location"
                  onClick={() => {
                    setSubmitError(
                      ""
                    );

                    detectLocation();
                  }}
                  disabled={
                    isDetectingLocation
                  }
                >
                  {isDetectingLocation
                    ? t.detecting
                    : t.useCurrent}
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <section className="report-form-section">
            <label className="report-section-label">
              {t.description}

              {!letAISuggest && (
                <span
                  style={{
                    fontWeight: 400,
                    fontSize:
                      "11px",
                    color:
                      "#8a968f",
                  }}
                >
                  {" "}
                  {t.required}
                </span>
              )}
            </label>

            <div
              className="description-wrapper"
              style={{
                position:
                  "relative",
              }}
            >
              <textarea
                value={description}
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target.value.slice(
                      0,
                      500
                    )
                  )
                }
                maxLength={500}
                placeholder={
                  letAISuggest
                    ? t.aiPlaceholder
                    : t.normalPlaceholder
                }
                style={{
                  paddingRight:
                    "48px",
                  paddingBottom:
                    "28px",
                }}
              />

              {speechSupported && (
                <button
                  type="button"
                  onClick={
                    toggleSpeechToText
                  }
                  aria-label={
                    isListening
                      ? "Stop speech to text"
                      : "Start speech to text"
                  }
                  title={
                    isListening
                      ? "Stop listening"
                      : "Speak"
                  }
                  style={{
                    position:
                      "absolute",
                    top: "10px",
                    right: "10px",
                    width: "34px",
                    height:
                      "34px",
                    borderRadius:
                      "50%",
                    border: "none",
                    background:
                      isListening
                        ? "#dc5a5a"
                        : "#eaf6ef",
                    color:
                      isListening
                        ? "#fff"
                        : "#009f7f",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    cursor:
                      "pointer",
                  }}
                >
                  {isListening ? (
                    <MicOff
                      size={17}
                    />
                  ) : (
                    <Mic size={17} />
                  )}
                </button>
              )}

              <span className="character-count">
                {description.length}/500
              </span>
            </div>

            {isListening && (
              <p
                style={{
                  margin:
                    "7px 0 0",
                  fontSize:
                    "11px",
                  color:
                    "#dc5a5a",
                  fontWeight: 600,
                }}
              >
                ● {t.listening}
              </p>
            )}

            {letAISuggest && (
              <p
                style={{
                  margin:
                    "7px 0 0",
                  fontSize:
                    "11px",
                  color:
                    "#718078",
                }}
              >
                {t.aiHint}
              </p>
            )}
          </section>

          {/* =================================================
              PHOTO
          ================================================= */}

          <section className="report-form-section">
            <label className="report-section-label">
              {t.uploadPhoto}
            </label>

            {!image ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "10px",
                }}
              >
                {/* CAMERA */}

                <button
                  type="button"
                  onClick={() =>
                    cameraInputRef.current?.click()
                  }
                  style={{
                    minHeight:
                      "110px",
                    border:
                      "1px solid #dce8df",
                    borderRadius:
                      "14px",
                    background:
                      "#f7fbf8",
                    color:
                      "#294336",
                    display: "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: "8px",
                    cursor:
                      "pointer",
                  }}
                >
                  <Camera
                    size={28}
                    color="#009f7f"
                  />

                  <strong
                    style={{
                      fontSize:
                        "13px",
                    }}
                  >
                    Take a Picture
                  </strong>

                  <span
                    style={{
                      fontSize:
                        "10px",
                      color:
                        "#718078",
                    }}
                  >
                    Use Camera
                  </span>
                </button>

                {/* GALLERY */}

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  style={{
                    minHeight:
                      "110px",
                    border:
                      "1px solid #dce8df",
                    borderRadius:
                      "14px",
                    background:
                      "#f7fbf8",
                    color:
                      "#294336",
                    display: "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: "8px",
                    cursor:
                      "pointer",
                  }}
                >
                  <ImageIcon
                    size={28}
                    color="#009f7f"
                  />

                  <strong
                    style={{
                      fontSize:
                        "13px",
                    }}
                  >
                    Upload from Gallery
                  </strong>

                  <span
                    style={{
                      fontSize:
                        "10px",
                      color:
                        "#718078",
                    }}
                  >
                    Camera Roll
                  </span>
                </button>
              </div>
            ) : (
              <div
                style={{
                  position:
                    "relative",
                  width: "100%",
                  borderRadius:
                    "16px",
                  overflow:
                    "hidden",
                  background:
                    "#f1f5f2",
                  border:
                    "1px solid #dce8df",
                }}
              >
                <img
                  src={image}
                  alt="Issue preview"
                  style={{
                    width: "100%",
                    maxHeight:
                      "300px",
                    objectFit:
                      "cover",
                    display:
                      "block",
                  }}
                />

                {/* DELETE */}

                <button
                  type="button"
                  onClick={
                    deletePhoto
                  }
                  aria-label="Delete photo"
                  style={{
                    position:
                      "absolute",
                    top: "10px",
                    right: "10px",
                    width: "38px",
                    height:
                      "38px",
                    borderRadius:
                      "50%",
                    border: "none",
                    background:
                      "rgba(0,0,0,0.7)",
                    color: "#fff",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    cursor:
                      "pointer",
                  }}
                >
                  <X size={20} />
                </button>

                {/* CHANGE PHOTO */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "8px",
                    padding:
                      "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      cameraInputRef.current?.click()
                    }
                    style={{
                      border:
                        "1px solid #dce8df",
                      borderRadius:
                        "10px",
                      padding:
                        "10px",
                      background:
                        "#fff",
                      color:
                        "#294336",
                      fontWeight:
                        600,
                      cursor:
                        "pointer",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: "6px",
                    }}
                  >
                    <Camera
                      size={16}
                    />

                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    style={{
                      border:
                        "1px solid #dce8df",
                      borderRadius:
                        "10px",
                      padding:
                        "10px",
                      background:
                        "#fff",
                      color:
                        "#294336",
                      fontWeight:
                        600,
                      cursor:
                        "pointer",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: "6px",
                    }}
                  >
                    <ImageIcon
                      size={16}
                    />

                    Choose Another
                  </button>
                </div>
              </div>
            )}

            {/* CAMERA INPUT */}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={
                handleImageUpload
              }
              hidden
            />

            {/* GALLERY INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={
                handleImageUpload
              }
              hidden
            />
          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {submitError &&
            !showLocationPopup && (
              <p
                style={{
                  color:
                    "#d64545",
                  fontSize:
                    "13px",
                  margin:
                    "8px 0 12px",
                }}
              >
                {submitError}
              </p>
            )}

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="submit-report-button"
            disabled={
              isSubmitting ||
              isProcessingImage
            }
          >
            {isSubmitting
              ? t.submitting
              : t.submit}
          </button>
        </form>
      </main>

      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}

      <nav className="report-bottom-navigation">
        <button
          className="report-bottom-item"
          onClick={() =>
            navigate("/user")
          }
        >
          <Home size={19} />
          <span>Home</span>
        </button>

        <button
          className="report-bottom-item"
          onClick={() =>
            navigate("/user/map")
          }
        >
          <Map size={19} />
          <span>Map</span>
        </button>

        <button
          className="report-add-button"
          onClick={() =>
            navigate("/user/report")
          }
        >
          <Plus size={27} />
        </button>

        <button
          className="report-bottom-item"
          onClick={() =>
            navigate("/user/reports")
          }
        >
          <FileText size={19} />
          <span>Reports</span>
        </button>

        <button
          className="report-bottom-item"
          onClick={() =>
            navigate("/user/profile")
          }
        >
          <User size={19} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default ReportIssue;