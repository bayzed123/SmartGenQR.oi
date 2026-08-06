"""
Google Places API (New) wrapper for SmartLeadGen.

Why Places API instead of scraping Google Maps directly:
  - Google's Maps *website* is a JS-heavy, bot-defended surface that was
    never meant to be scraped. Selectors change, headless browsers get
    silently served empty/blocked pages, and it's against Google's ToS.
  - The Places API is Google's own official, structured, documented way
    to get exactly this data (name, address, phone, website, rating).
    No browser needed at all, which also means no Chromium binary to
    fight with on free-tier hosting.

Cost control: Places API (New) bills by the *highest-tier* field in your
field mask. We deliberately request only what SmartLeadGen actually uses.
Phone/website/rating fall in the "Enterprise" tier — see README for
current pricing notes and how to set a quota cap so you can never be
billed past what you expect.

Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
"""

import time

import requests

PLACES_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

FIELD_MASK = ",".join(
    [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.websiteUri",
        "places.rating",
        "places.userRatingCount",
        "places.types",
        "places.googleMapsUri",
        "places.businessStatus",
    ]
)

MAX_RESULTS_PER_PAGE = 20
MAX_PAGES = 3  # Google's own cap for Text Search (New): ~60 results/query


class PlacesAPIError(Exception):
    """Raised for any Places API failure that the dashboard should show to the user."""


def build_query(keyword: str, location: str) -> str:
    """Combine a keyword and a location into one Text Search query string."""
    keyword = (keyword or "").strip()
    location = (location or "").strip()
    if location:
        return f"{keyword} in {location}"
    return keyword


def search_places(api_key: str, query: str, max_result_count: int = 20, page_token: str = None):
    """
    Run a single Text Search (New) request.
    Returns (places: list[dict], next_page_token: str | None).
    """
    if not api_key:
        raise PlacesAPIError("No Google Places API key configured.")

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": FIELD_MASK,
    }
    body = {"textQuery": query, "maxResultCount": min(max_result_count, MAX_RESULTS_PER_PAGE)}
    if page_token:
        body["pageToken"] = page_token

    try:
        resp = requests.post(PLACES_TEXT_SEARCH_URL, headers=headers, json=body, timeout=15)
    except requests.RequestException as e:
        raise PlacesAPIError(f"Couldn't reach Google's Places API: {e}") from e

    if resp.status_code == 403:
        raise PlacesAPIError(
            "Google rejected this request (403 Forbidden). This almost always means "
            "one of: the Places API (New) isn't enabled on your Google Cloud project, "
            "billing isn't enabled on the project, or the API key is restricted to the "
            "wrong set of APIs. Check Google Cloud Console → APIs & Services."
        )
    if resp.status_code == 400:
        raise PlacesAPIError(f"Google rejected this request as malformed (400): {resp.text[:300]}")
    if resp.status_code == 429:
        raise PlacesAPIError("Rate-limited by Google (429) — you're calling faster than your quota allows.")
    if resp.status_code >= 500:
        raise PlacesAPIError(f"Google's Places API returned a server error ({resp.status_code}). Try again shortly.")

    try:
        resp.raise_for_status()
    except requests.HTTPError as e:
        raise PlacesAPIError(f"Places API error: {e}") from e

    data = resp.json()
    return data.get("places", []), data.get("nextPageToken")


def search_all_pages(api_key: str, query: str, max_total: int = 60):
    """
    Generator that yields places one at a time, following nextPageToken
    up to `max_total` results or Google's own page cap, whichever is first.
    """
    collected = 0
    page_token = None
    page_number = 0

    while collected < max_total and page_number < MAX_PAGES:
        if page_number > 0:
            # Google requires a short delay before a page token becomes valid.
            time.sleep(2)

        places, page_token = search_places(api_key, query, page_token=page_token)
        page_number += 1

        for place in places:
            yield place
            collected += 1
            if collected >= max_total:
                return

        if not page_token:
            return