from google import genai
from google.genai import types
from pydantic import BaseModel
import time

from ..config import settings


client = genai.Client(
    api_key=settings.gemini_api_key
)


CATEGORIES = [
    "Other",
    "Garbage",
    "Street Light",
    "Pothole",
    "Drainage",
    "Water Leakage",
    "Road Damage",
]


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


MODELS = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
]


def analyze_complaint_image(
    image_bytes: bytes,
    mime_type: str,
    description: str,
    location: str,
    departments: list[str],
) -> ComplaintAnalysis:

    # ---------------------------------------------------------
    # Validate the current department list
    # ---------------------------------------------------------

    departments = [
        department.strip()
        for department in departments
        if department and department.strip()
    ]

    if not departments:
        raise ValueError(
            "No departments are available for AI assignment."
        )

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

General rules:
- Use ONLY the category names provided above.
- Use ONLY the department names provided above.
- Do not invent categories or departments.
- Base the category primarily on the image.
- Use description and location as supporting information.
- If the image is unclear, lower the confidence.
- Do not claim certainty when evidence is insufficient.
"""

    last_error = None

    for model_name in MODELS:
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
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": ComplaintAnalysis,
                    },
                )

                result = ComplaintAnalysis.model_validate_json(
                    response.text
                )

                # -------------------------------------------------
                # Backend validation
                # -------------------------------------------------

                if result.detected_category not in CATEGORIES:
                    raise ValueError(
                        f"AI returned an invalid category: "
                        f"{result.detected_category}"
                    )

                if result.recommended_department not in departments:
                    raise ValueError(
                        f"AI returned an invalid department: "
                        f"{result.recommended_department}"
                    )

                if result.predicted_priority not in [
                    "Low",
                    "Medium",
                    "High",
                ]:
                    raise ValueError(
                        f"AI returned an invalid priority: "
                        f"{result.predicted_priority}"
                    )

                print(
                    f"Gemini analysis completed with {model_name}"
                )

                print(
                    f"AI category: {result.detected_category}"
                )

                print(
                    f"AI department: {result.recommended_department}"
                )

                print(
                    f"AI priority: {result.predicted_priority}"
                )

                return result

            except Exception as error:
                last_error = error
                error_text = str(error)

                is_temporary_error = (
                    "503" in error_text
                    or "UNAVAILABLE" in error_text
                    or "high demand" in error_text.lower()
                )

                if not is_temporary_error:
                    raise

                if attempt == 0:
                    print(
                        f"{model_name} is temporarily unavailable. "
                        "Retrying once..."
                    )

                    time.sleep(2)

                else:
                    print(
                        f"{model_name} is still unavailable. "
                        "Trying the next Gemini model..."
                    )

    raise last_error