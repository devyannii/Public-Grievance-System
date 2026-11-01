
from google import genai
from google.genai import types
from pydantic import BaseModel
import time

from ..config import settings


# =========================================================
# GEMINI CLIENT
# =========================================================

client = genai.Client(
    api_key=settings.gemini_api_key,
    http_options=types.HttpOptions(
        timeout=120000,
        retry_options=types.HttpRetryOptions(
            attempts=3,
        ),
    ),
)


# =========================================================
# ALLOWED COMPLAINT CATEGORIES
# =========================================================

CATEGORIES = [
    "Other",
    "Garbage",
    "Street Light",
    "Pothole",
    "Drainage",
    "Water Leakage",
    "Road Damage",
]


# =========================================================
# STRUCTURED AI RESPONSE
# =========================================================

class ComplaintAnalysis(BaseModel):
    detected_category: str
    image_confidence: float
    generated_description: str
    predicted_priority: str
    priority_reason: str
    recommended_department: str
    duplicate_risk: str
    duplicate_count: int
    duplicate_score: float
    summary: str


# =========================================================
# GEMINI MODELS
# =========================================================

# Try the intended lower-cost/free-tier candidate first.
# Availability and free quotas depend on your Gemini API project.
MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
]

# =========================================================
# ERROR DETECTION
# =========================================================

def is_quota_error(error: Exception) -> bool:
    """Identify quota and rate-limit errors."""
    error_text = str(error).lower()

    quota_messages = [
        "resource exhausted",
        "quota exceeded",
        "generate_content_free_tier_requests",
        "rate limit",
        "429",
        "too many requests",
    ]

    return any(message in error_text for message in quota_messages)


def is_retryable_error(error: Exception) -> bool:
    """Identify temporary/network errors worth retrying."""
    error_text = str(error).lower()

    retryable_messages = [
        "503",
        "500",
        "502",
        "504",
        "unavailable",
        "high demand",
        "resource exhausted",
        "quota exceeded",
        "rate limit",
        "429",
        "timeout",
        "timed out",
        "readerror",
        "connectionerror",
        "connection reset",
        "connection aborted",
        "server disconnected",
        "winerror 10053",
        "winerror 10054",
        "temporarily unavailable",
        "too many requests",
    ]

    return any(
        message in error_text
        for message in retryable_messages
    )


# =========================================================
# GEMINI COMPLAINT ANALYSIS
# =========================================================

def analyze_complaint_image(
    image_bytes: bytes,
    mime_type: str,
    description: str,
    location: str,
    departments: list[str],
) -> ComplaintAnalysis:

    # -----------------------------------------------------
    # Validate departments
    # -----------------------------------------------------

    departments = [
        department.strip()
        for department in departments
        if department and department.strip()
    ]

    if not departments:
        raise ValueError(
            "No departments are available for AI assignment."
        )

    # -----------------------------------------------------
    # Basic image validation
    # -----------------------------------------------------

    if not image_bytes:
        raise ValueError(
            "No image data was provided for AI analysis."
        )

    if not mime_type:
        mime_type = "image/jpeg"

    # -----------------------------------------------------
    # Prompt
    # -----------------------------------------------------

    prompt = f"""
You are an AI system for a public grievance management platform.

Analyze the complaint image together with the user's description and
reported location.

Allowed complaint categories:
{", ".join(CATEGORIES)}

Current departments available in the grievance system:
{", ".join(departments)}

User-provided complaint description:
{description if description else "No description was provided. Generate one from the image."}

Reported location:
{location if location else "Location not provided."}

Determine:

1. The most appropriate complaint category.
2. Confidence from 0.0 to 1.0.
3. A concise, factual complaint description based primarily on the image.
4. Priority: Low, Medium, or High.
5. Why that priority is appropriate.
6. The department that should handle the complaint.
7. Duplicate risk: Low, Medium, or High.
8. Estimated number of similar complaints.
9. Duplicate score from 0.0 to 1.0.
10. A concise summary.

Department assignment rules:
- Choose recommended_department ONLY from the current departments listed above.
- Do not invent a department.
- Do not rename a department.
- Do not create a new department.
- Return the department name exactly as it appears in the list.
- Select the department whose responsibility best matches the detected issue.
- If the issue does not clearly match a specialized department, choose the most appropriate available general department.

Description rules:
- If the user provided no description, generate one from the image.
- Describe only what can reasonably be observed.
- Do not invent people, addresses, dates, causes, or measurements.
- Keep it suitable for an official public grievance record.
- Keep it to 1–2 sentences.
- Do not mention AI in the generated description.

Duplicate rules:
- The duplicate fields are only an AI estimate.
- Do NOT claim that you searched the complaint database.
- Do NOT state that actual duplicate complaints were found.

General rules:
- Use ONLY the category names provided above.
- Use ONLY the department names provided above.
- Do not invent categories or departments.
- Base the category primarily on the image.
- Use description and location as supporting information.
- If the image is unclear, lower the confidence.
- Do not claim certainty when evidence is insufficient.
- Return valid JSON matching the required schema.
"""

    last_error = None

    # =====================================================
    # TRY AVAILABLE GEMINI MODELS
    # =====================================================

    for model_name in MODELS:

        # Quota errors skip the current model immediately.
        # Temporary network/server errors get one retry.
        for attempt in range(2):

            try:
                print(
                    f"Trying Gemini model: {model_name} "
                    f"(attempt {attempt + 1}/2)"
                )

                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        prompt,
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type=mime_type,
                        ),
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=ComplaintAnalysis,
                        temperature=0.2,
                    ),
                )

                # -------------------------------------------------
                # Validate response
                # -------------------------------------------------

                if not response:
                    raise RuntimeError(
                        "Gemini returned an empty response."
                    )

                if not response.text:
                    raise RuntimeError(
                        "Gemini returned an empty text response."
                    )

                result = ComplaintAnalysis.model_validate_json(
                    response.text
                )

                # -------------------------------------------------
                # Validate category
                # -------------------------------------------------

                if result.detected_category not in CATEGORIES:
                    raise ValueError(
                        "AI returned an invalid category: "
                        f"{result.detected_category}"
                    )

                # -------------------------------------------------
                # Validate department
                # -------------------------------------------------

                if result.recommended_department not in departments:
                    raise ValueError(
                        "AI returned an invalid department: "
                        f"{result.recommended_department}"
                    )

                # -------------------------------------------------
                # Validate priority
                # -------------------------------------------------

                if result.predicted_priority not in [
                    "Low",
                    "Medium",
                    "High",
                ]:
                    raise ValueError(
                        "AI returned an invalid priority: "
                        f"{result.predicted_priority}"
                    )

                # -------------------------------------------------
                # Validate duplicate risk
                # -------------------------------------------------

                if result.duplicate_risk not in [
                    "Low",
                    "Medium",
                    "High",
                ]:
                    raise ValueError(
                        "AI returned an invalid duplicate risk: "
                        f"{result.duplicate_risk}"
                    )

                # -------------------------------------------------
                # Validate confidence
                # -------------------------------------------------

                if not 0.0 <= result.image_confidence <= 1.0:
                    raise ValueError(
                        "AI returned an invalid image confidence: "
                        f"{result.image_confidence}"
                    )

                # -------------------------------------------------
                # Validate duplicate score
                # -------------------------------------------------

                if not 0.0 <= result.duplicate_score <= 1.0:
                    raise ValueError(
                        "AI returned an invalid duplicate score: "
                        f"{result.duplicate_score}"
                    )

                # -------------------------------------------------
                # Validate duplicate count
                # -------------------------------------------------

                if result.duplicate_count < 0:
                    raise ValueError(
                        "AI returned an invalid duplicate count: "
                        f"{result.duplicate_count}"
                    )

                # =================================================
                # SUCCESS
                # =================================================

                print(
                    f"Gemini analysis completed with {model_name}"
                )

                print(f"AI category: {result.detected_category}")
                print(f"AI department: {result.recommended_department}")
                print(f"AI priority: {result.predicted_priority}")
                print(f"AI confidence: {result.image_confidence}")

                return result

            except Exception as error:

                last_error = error

                print(
                    f"Gemini error using {model_name}: "
                    f"{type(error).__name__}: {error}"
                )

                # Do not retry a model whose quota is exhausted.
                if is_quota_error(error):
                    print(
                        f"Quota/rate limit reached for {model_name}. "
                        "Skipping to the next model."
                    )
                    break

                # Do not retry permanent errors.
                if not is_retryable_error(error):
                    print(
                        f"Non-retryable Gemini error from "
                        f"{model_name}."
                    )
                    raise

                # Retry temporary network/server errors once.
                if attempt == 0:
                    print(
                        f"{model_name} encountered a temporary "
                        "network/API error. Waiting 3 seconds "
                        "before retry..."
                    )
                    time.sleep(3)
                else:
                    print(
                        f"{model_name} failed after retry. "
                        "Trying the next Gemini model..."
                    )

    # =====================================================
    # ALL MODELS FAILED
    # =====================================================

    if last_error:
        raise RuntimeError(
            "Gemini AI analysis failed after trying all "
            f"configured models. Last error: {last_error}"
        ) from last_error

    raise RuntimeError(
        "Gemini AI analysis failed for an unknown reason."
    )
