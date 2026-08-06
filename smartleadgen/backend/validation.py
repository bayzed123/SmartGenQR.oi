"""
Data validation, normalization, deduplication, and lead scoring.
Goal: never let obviously invalid or duplicate rows reach the sheet.
"""

import phonenumbers

JUNK_NAME_MARKERS = ("test listing", "sample business", "n/a", "unknown business")
GENERIC_PLACE_TYPES = {"point_of_interest", "establishment"}


def normalize_phone(raw_phone: str, default_region: str = "BD"):
    """
    Returns (is_valid, formatted_e164_or_None).

    Uses Google's own libphonenumber (via the `phonenumbers` package)
    instead of a paid validation API — it's free, works offline, and is
    the reference implementation most validation APIs wrap anyway.
    `default_region` is only used when a number has no country code —
    set it to match where most of your leads are.
    """
    if not raw_phone:
        return False, None
    try:
        parsed = phonenumbers.parse(raw_phone, default_region)
        if phonenumbers.is_valid_number(parsed):
            return True, phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except phonenumbers.NumberParseException:
        pass
    return False, None


def is_valid_business_name(name: str) -> bool:
    if not name or not name.strip():
        return False
    lowered = name.lower()
    return not any(marker in lowered for marker in JUNK_NAME_MARKERS)


def pick_primary_type(types_list) -> str:
    """Pick the most descriptive Places `type` for the Sector/Category
    column, skipping generic catch-all types when a more specific one exists."""
    types_list = types_list or []
    for t in types_list:
        if t not in GENERIC_PLACE_TYPES:
            return t
    return types_list[0] if types_list else ""


def score_lead(place: dict, enrichment: dict) -> str:
    """
    Flags how promising a lead is *for a digital marketing agency*
    specifically — this is the "smart" part of SmartLeadGen.

    No website at all is the strongest signal: that business needs the
    single most basic digital marketing service there is. A website with
    no discoverable email/socials and weak reviews are next-best signals.
    """
    has_website = bool(place.get("websiteUri"))
    rating = place.get("rating")
    review_count = place.get("userRatingCount") or 0

    if not has_website:
        return "High"
    if not enrichment.get("email") and not enrichment.get("socials"):
        return "High"
    if rating is not None and rating < 4.0:
        return "Medium"
    if review_count < 10:
        return "Medium"
    return "Low"


def make_dedup_key(place: dict) -> str:
    """Google's Place ID is a stable unique identifier per business —
    prefer it over name/phone matching, which can miss real duplicates
    or wrongly merge two different franchise locations."""
    return place.get("id", "") or ""