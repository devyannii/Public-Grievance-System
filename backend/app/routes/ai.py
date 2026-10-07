from fastapi import APIRouter, HTTPException

from ..ai.analyzer import analyze_complaint_image
from ..supabase import supabase

from datetime import datetime, timezone
from difflib import SequenceMatcher
from math import radians, sin, cos, sqrt, atan2


router = APIRouter()


@router.get("/test")
def test_ai():
    return {
        "success": True,
        "message": "Gemini connection is working",
    }


# ---------------------------------------------------------
# Real duplicate detection helpers
# ---------------------------------------------------------

def calculate_distance_meters(
    lat1,
    lon1,
    lat2,
    lon2,
):
    """
    Calculate distance between two GPS coordinates
    using the Haversine formula.
    """

    earth_radius_m = 6371000

    lat1 = radians(float(lat1))
    lon1 = radians(float(lon1))
    lat2 = radians(float(lat2))
    lon2 = radians(float(lon2))

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a),
    )

    return earth_radius_m * c


def text_similarity(text1, text2):
    """
    Return a similarity score from 0.0 to 1.0.
    """

    text1 = (text1 or "").strip().lower()
    text2 = (text2 or "").strip().lower()

    if not text1 or not text2:
        return 0.0

    return SequenceMatcher(
        None,
        text1,
        text2,
    ).ratio()


def location_score(distance_meters):
    """
    Convert physical distance into a 0.0-1.0 score.
    """

    if distance_meters is None:
        return 0.0

    if distance_meters <= 25:
        return 1.0

    if distance_meters <= 50:
        return 0.9

    if distance_meters <= 100:
        return 0.75

    if distance_meters <= 250:
        return 0.5

    if distance_meters <= 500:
        return 0.25

    return 0.0


def calculate_duplicate_score(
    category_matches,
    description_similarity,
    location_similarity,
    has_location,
):
    """
    Calculate a real duplicate score using existing
    database complaints.

    With GPS:
        Category       35%
        Location       40%
        Description    25%

    Without GPS:
        Category       55%
        Description    45%
    """

    if has_location:

        score = (
            (0.35 if category_matches else 0.0)
            + (0.40 * location_similarity)
            + (0.25 * description_similarity)
        )

    else:

        score = (
            (0.55 if category_matches else 0.0)
            + (0.45 * description_similarity)
        )

    return round(
        min(score, 1.0),
        4,
    )


def duplicate_risk_from_score(score):

    if score >= 0.70:
        return "High"

    if score >= 0.45:
        return "Medium"

    return "Low"


def find_real_duplicates(
    complaint_uuid,
    category_id,
    description,
    latitude,
    longitude,
):
    """
    Compare the new complaint against actual complaints
    stored in Supabase.

    Returns:
        best matching complaint
        number of strong matches
        best duplicate score
    """

    response = (
        supabase
        .table("complaints")
        .select(
            "id, complaint_code, title, description, "
            "category_id, latitude, longitude, status, created_at"
        )
        .neq(
            "id",
            complaint_uuid,
        )
        .execute()
    )

    existing_complaints = response.data or []

    has_location = (
        latitude is not None
        and longitude is not None
    )

    candidates = []

    for existing in existing_complaints:

        category_matches = (
            category_id is not None
            and existing.get("category_id") == category_id
        )

        description_similarity = text_similarity(
            description,
            existing.get("description"),
        )

        distance_meters = None
        location_similarity = 0.0

        if (
            has_location
            and existing.get("latitude") is not None
            and existing.get("longitude") is not None
        ):

            distance_meters = calculate_distance_meters(
                latitude,
                longitude,
                existing["latitude"],
                existing["longitude"],
            )

            location_similarity = location_score(
                distance_meters
            )

        score = calculate_duplicate_score(
            category_matches=category_matches,
            description_similarity=description_similarity,
            location_similarity=location_similarity,
            has_location=has_location,
        )

        if score >= 0.45:

            candidates.append({
                "complaint": existing,
                "score": score,
                "distance_meters": distance_meters,
                "description_similarity": round(
                    description_similarity,
                    4,
                ),
                "category_matches": category_matches,
            })

    candidates.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    strong_matches = [
        candidate
        for candidate in candidates
        if candidate["score"] >= 0.70
    ]

    best_match = (
        candidates[0]
        if candidates
        else None
    )

    return (
        best_match,
        len(strong_matches),
    )


# =========================================================
# AI DEPARTMENT ASSIGNMENT SETTING
# =========================================================

def get_ai_auto_assignment_setting():
    """
    Read the AI automatic department assignment setting
    from Supabase.

    True:
        AI can automatically assign the department.

    False:
        AI can recommend the department but must not
        automatically assign a new complaint.
    """

    response = (
        supabase
        .table("system_settings")
        .select(
            "setting_value"
        )
        .eq(
            "setting_key",
            "ai_auto_assignment",
        )
        .limit(1)
        .execute()
    )

    settings = response.data or []

    if not settings:
        # Safe default:
        # If the setting does not exist, automatic
        # assignment remains enabled to preserve the
        # previous system behavior.
        return True

    value = settings[0].get(
        "setting_value"
    )

    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        return value.lower() == "true"

    return bool(value)


# =========================================================
# MAIN AI ANALYSIS ROUTE
# =========================================================

@router.post("/analyze/{complaint_id}")
def analyze_complaint(complaint_id: str):

    # ---------------------------------------------------------
    # 1. Find complaint using complaint code
    # ---------------------------------------------------------

    complaint_response = (
        supabase
        .table("complaints")
        .select(
            "id, complaint_code, title, description, "
            "location_text, latitude, longitude, "
            "department_id, automatically_assigned, "
            "assignment_source, assigned_at"
        )
        .eq(
            "complaint_code",
            complaint_id,
        )
        .single()
        .execute()
    )

    complaint = complaint_response.data

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    complaint_uuid = complaint["id"]


    # ---------------------------------------------------------
    # 2. Read AI automatic assignment setting
    # ---------------------------------------------------------

    ai_auto_assignment = (
        get_ai_auto_assignment_setting()
    )

    print(
        "AI automatic department assignment:",
        "ON" if ai_auto_assignment else "OFF",
    )


    # ---------------------------------------------------------
    # 3. Find complaint image
    # ---------------------------------------------------------

    image_response = (
        supabase
        .table("complaint_images")
        .select(
            "id, storage_path, file_name, file_type"
        )
        .eq(
            "complaint_id",
            complaint_uuid,
        )
        .order(
            "created_at",
            desc=False,
        )
        .limit(1)
        .execute()
    )

    images = image_response.data or []

    if not images:
        raise HTTPException(
            status_code=404,
            detail="No complaint image found",
        )

    image = images[0]


    # ---------------------------------------------------------
    # 4. Download image from Supabase Storage
    # ---------------------------------------------------------

    image_bytes = (
        supabase
        .storage
        .from_("complaint-images")
        .download(
            image["storage_path"]
        )
    )

    if not image_bytes:
        raise HTTPException(
            status_code=500,
            detail="Unable to download complaint image",
        )


    # ---------------------------------------------------------
    # 5. Get CURRENT departments from Supabase
    # ---------------------------------------------------------

    department_list_response = (
        supabase
        .table("departments")
        .select("id, name")
        .execute()
    )

    department_records = (
        department_list_response.data or []
    )

    if not department_records:
        raise HTTPException(
            status_code=500,
            detail=(
                "No departments are configured "
                "in the system"
            ),
        )

    department_names = [
        department["name"]
        for department in department_records
        if department.get("name")
    ]

    if not department_names:
        raise HTTPException(
            status_code=500,
            detail=(
                "No valid department names are "
                "available for AI assignment"
            ),
        )

    print(
        "Current departments available to AI:",
        department_names,
    )


    # ---------------------------------------------------------
    # 6. Analyze image with Gemini
    # ---------------------------------------------------------

    analysis = analyze_complaint_image(
        image_bytes=image_bytes,
        mime_type=image.get("file_type") or "image/jpeg",
        description=complaint.get("description") or "",
        location=complaint.get("location_text") or "",
        departments=department_names,
    )

    analysis_data = analysis.model_dump()


    # ---------------------------------------------------------
    # 7. Find category UUID
    # ---------------------------------------------------------

    category_response = (
        supabase
        .table("categories")
        .select("id, name")
        .eq(
            "name",
            analysis_data["detected_category"],
        )
        .limit(1)
        .execute()
    )

    categories = (
        category_response.data or []
    )

    category_id = (
        categories[0]["id"]
        if categories
        else None
    )


    # ---------------------------------------------------------
    # 8. Find AI recommended department UUID
    # ---------------------------------------------------------

    recommended_department = (
        analysis_data[
            "recommended_department"
        ]
    )

    department_id = None
    department_name = None

    for department in department_records:

        if (
            department.get("name")
            == recommended_department
        ):

            department_id = department.get("id")
            department_name = department.get("name")

            break


    if not department_id:

        raise HTTPException(
            status_code=500,
            detail=(
                "AI recommended a department that "
                "does not exist in the current "
                "department list"
            ),
        )

    print(
        f"AI recommended department: "
        f"{department_name} ({department_id})"
    )


    # ---------------------------------------------------------
    # 9. Generate description if user left it blank
    # ---------------------------------------------------------

    generated_description = (
        analysis_data.get(
            "generated_description"
        )
        or ""
    )

    final_description = (
        complaint.get("description")
        or ""
    ).strip()

    if (
        not final_description
        and generated_description
    ):

        final_description = (
            generated_description.strip()
        )


    # ---------------------------------------------------------
    # 10. REAL duplicate detection
    # ---------------------------------------------------------

    (
        best_duplicate,
        duplicate_count,
    ) = find_real_duplicates(
        complaint_uuid=complaint_uuid,
        category_id=category_id,
        description=final_description,
        latitude=complaint.get("latitude"),
        longitude=complaint.get("longitude"),
    )

    real_duplicate_score = (
        best_duplicate["score"]
        if best_duplicate
        else 0.0
    )

    real_duplicate_detected = (
        real_duplicate_score >= 0.70
    )

    real_duplicate_risk = (
        duplicate_risk_from_score(
            real_duplicate_score
        )
    )

    duplicate_of = (
        best_duplicate["complaint"]["id"]
        if real_duplicate_detected
        else None
    )


    # ---------------------------------------------------------
    # 11. Prepare common complaint update
    # ---------------------------------------------------------

    complaint_update = {

        "priority": (
            analysis_data[
                "predicted_priority"
            ]
        ),

        "ai_detected_category": (
            analysis_data[
                "detected_category"
            ]
        ),

        "ai_confidence": (
            analysis_data[
                "image_confidence"
            ]
        ),

        "ai_priority": (
            analysis_data[
                "predicted_priority"
            ]
        ),

        "ai_priority_reason": (
            analysis_data[
                "priority_reason"
            ]
        ),

        # REAL duplicate detection
        "duplicate_detected": (
            real_duplicate_detected
        ),

        "duplicate_of": duplicate_of,

        "duplicate_score": (
            real_duplicate_score
        ),

        # IMPORTANT:
        # This is ALWAYS the department recommended
        # by AI, regardless of whether auto assignment
        # is enabled.
        "ai_recommended_department": (
            department_id
        ),

        "ai_summary": (
            analysis_data["summary"]
        ),
    }


    # ---------------------------------------------------------
    # 12. Save AI-generated description
    # ---------------------------------------------------------

    if final_description:

        complaint_update[
            "description"
        ] = final_description


    # ---------------------------------------------------------
    # 13. Save detected category
    # ---------------------------------------------------------

    if category_id:

        complaint_update[
            "category_id"
        ] = category_id

        if complaint.get("title") in [
            None,
            "",
            "Civic Issue",
        ]:

            complaint_update[
                "title"
            ] = analysis_data[
                "detected_category"
            ]


    # =========================================================
    # 14. DEPARTMENT ASSIGNMENT LOGIC
    # =========================================================

    existing_department_id = (
        complaint.get("department_id")
    )

    existing_assignment_source = (
        complaint.get("assignment_source")
    )

    existing_automatically_assigned = (
        complaint.get(
            "automatically_assigned"
        )
    )


    # ---------------------------------------------------------
    # MANUAL ADMIN ASSIGNMENT PROTECTION
    # ---------------------------------------------------------

    manual_assignment_exists = (
        existing_assignment_source == "admin"
    )

    if manual_assignment_exists:

        print(
            "Manual admin assignment detected. "
            "AI will NOT overwrite the department."
        )

        # Do NOT modify:
        # department_id
        # assignment_source
        # assigned_at
        # automatically_assigned


    # ---------------------------------------------------------
    # AI AUTO ASSIGNMENT = ON
    # ---------------------------------------------------------

    elif ai_auto_assignment:

        print(
            "AI automatic assignment is ON."
        )

        complaint_update[
            "department_id"
        ] = department_id

        complaint_update[
            "automatically_assigned"
        ] = True

        complaint_update[
            "assignment_source"
        ] = "ai"

        complaint_update[
            "assigned_at"
        ] = (
            datetime.now(
                timezone.utc
            ).isoformat()
        )


    # ---------------------------------------------------------
    # AI AUTO ASSIGNMENT = OFF
    # ---------------------------------------------------------

    else:

        print(
            "AI automatic assignment is OFF. "
            "Saving recommendation only."
        )

        # IMPORTANT:
        # We intentionally DO NOT set department_id.
        #
        # For a new/unassigned complaint this means:
        #
        # department_id = NULL
        #
        # The AI recommendation remains available through:
        #
        # ai_recommended_department
        #
        # The admin can then manually assign it.


        # If the complaint is already assigned by AI
        # from an earlier run, we preserve that existing
        # assignment rather than unexpectedly removing it.
        #
        # This prevents turning the setting OFF from
        # destroying an existing assignment.


    # ---------------------------------------------------------
    # 15. Update complaint
    # ---------------------------------------------------------

    update_response = (
        supabase
        .table("complaints")
        .update(
            complaint_update
        )
        .eq(
            "id",
            complaint_uuid,
        )
        .execute()
    )

    if not update_response.data:

        raise HTTPException(
            status_code=500,
            detail=(
                "AI analysis completed but "
                "complaint update failed"
            ),
        )


    # ---------------------------------------------------------
    # 16. Determine final assignment state
    # ---------------------------------------------------------

    if manual_assignment_exists:

        final_department_id = (
            existing_department_id
        )

        final_automatically_assigned = (
            existing_automatically_assigned
        )

        final_assignment_source = (
            existing_assignment_source
        )

    elif ai_auto_assignment:

        final_department_id = (
            department_id
        )

        final_automatically_assigned = True

        final_assignment_source = "ai"

    else:

        # AI is only recommending.
        final_department_id = (
            existing_department_id
        )

        final_automatically_assigned = (
            existing_automatically_assigned
        )

        final_assignment_source = (
            existing_assignment_source
        )


    # ---------------------------------------------------------
    # 17. Save complete AI analysis
    # ---------------------------------------------------------

    ai_analysis_data = {

        "complaint_id": complaint_uuid,

        "detected_category": (
            analysis_data[
                "detected_category"
            ]
        ),

        "image_confidence": (
            analysis_data[
                "image_confidence"
            ]
        ),

        "predicted_priority": (
            analysis_data[
                "predicted_priority"
            ]
        ),

        "priority_reason": (
            analysis_data[
                "priority_reason"
            ]
        ),

        # Real database comparison
        "duplicate_risk": (
            real_duplicate_risk
        ),

        "duplicate_count": (
            duplicate_count
        ),

        "duplicate_score": (
            real_duplicate_score
        ),

        # ALWAYS store AI recommendation
        "recommended_department": (
            department_id
        ),

        "summary": (
            analysis_data[
                "summary"
            ]
        ),

        "model_name": (
            "gemini-3.8-flash"
        ),

        "processing_status": (
            "completed"
        ),
    }


    ai_response = (
        supabase
        .table("ai_analysis")
        .insert(
            ai_analysis_data
        )
        .execute()
    )

    if not ai_response.data:

        raise HTTPException(
            status_code=500,
            detail=(
                "Complaint updated but AI analysis "
                "could not be saved"
            ),
        )


    # ---------------------------------------------------------
    # 18. Update complaint image
    # ---------------------------------------------------------

    (
        supabase
        .table("complaint_images")
        .update({
            "ai_detected_label": (
                analysis_data[
                    "detected_category"
                ]
            ),

            "ai_confidence": (
                analysis_data[
                    "image_confidence"
                ]
            ),
        })
        .eq(
            "id",
            image["id"],
        )
        .execute()
    )


    # ---------------------------------------------------------
    # 19. Return result
    # ---------------------------------------------------------

    return {

        "success": True,

        "complaint_id": (
            complaint_id
        ),

        "analysis": {

            **analysis_data,

            # Replace Gemini estimated duplicate
            # values with actual database comparison.
            "duplicate_risk": (
                real_duplicate_risk
            ),

            "duplicate_count": (
                duplicate_count
            ),

            "duplicate_score": (
                real_duplicate_score
            ),

            "duplicate_detected": (
                real_duplicate_detected
            ),

            "duplicate_of": (
                best_duplicate[
                    "complaint"
                ][
                    "complaint_code"
                ]
                if real_duplicate_detected
                else None
            ),

            # Validated AI recommendation.
            "recommended_department": (
                department_name
            ),
        },


        "saved": {

            "category_id": (
                category_id
            ),

            # This is the ACTUAL assigned department.
            "department_id": (
                final_department_id
            ),

            # AI recommendation.
            "ai_recommended_department": (
                department_id
            ),

            "department_name": (
                department_name
                if final_department_id == department_id
                else None
            ),

            "generated_description": bool(
                not complaint.get(
                    "description"
                )
                and generated_description
            ),

            "automatically_assigned": (
                final_automatically_assigned
            ),

            "assignment_source": (
                final_assignment_source
            ),

            "ai_auto_assignment_enabled": (
                ai_auto_assignment
            ),

            "duplicate_detected": (
                real_duplicate_detected
            ),

            "duplicate_of": (
                duplicate_of
            ),

            "duplicate_count": (
                duplicate_count
            ),

            "duplicate_score": (
                real_duplicate_score
            ),

            "complaint_updated": True,

            "ai_analysis_saved": True,
        },
    }