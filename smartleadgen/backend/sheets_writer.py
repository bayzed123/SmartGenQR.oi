"""
Google Sheets integration via gspread.

Appends validated leads in batches rather than one API call per row —
Sheets API has a per-minute write quota, so batching is both faster
and safer than a row-at-a-time loop.
"""

import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]

HEADER_ROW = [
    "Business Name", "Sector/Category", "Address", "Phone", "Website",
    "Email", "Facebook", "Instagram", "LinkedIn", "Rating", "Reviews",
    "Lead Score", "Google Maps Link", "Date Collected",
]


class SheetsWriterError(Exception):
    """Raised for any Sheets failure that the dashboard should show to the user."""


def get_worksheet(service_account_info: dict, sheet_id_or_url: str, worksheet_name: str = "Leads"):
    """Open (or create) the target worksheet, adding a header row if it's new."""
    creds = Credentials.from_service_account_info(service_account_info, scopes=SCOPES)
    client = gspread.authorize(creds)

    try:
        if sheet_id_or_url.startswith("http"):
            spreadsheet = client.open_by_url(sheet_id_or_url)
        else:
            spreadsheet = client.open_by_key(sheet_id_or_url)
    except gspread.exceptions.APIError as e:
        raise SheetsWriterError(
            "Couldn't open that sheet. Double-check the URL/ID, and make sure you've "
            "shared the sheet with your service account's email address (Editor access) — "
            "this is the single most common setup mistake."
        ) from e
    except Exception as e:
        raise SheetsWriterError(f"Couldn't authenticate to Google Sheets: {e}") from e

    try:
        worksheet = spreadsheet.worksheet(worksheet_name)
        if worksheet.row_count == 0 or not worksheet.row_values(1):
            worksheet.append_row(HEADER_ROW)
    except gspread.exceptions.WorksheetNotFound:
        worksheet = spreadsheet.add_worksheet(title=worksheet_name, rows=1000, cols=len(HEADER_ROW))
        worksheet.append_row(HEADER_ROW)

    return worksheet


def append_leads(worksheet, rows: list) -> None:
    """rows: list of row-lists matching HEADER_ROW's column order."""
    if not rows:
        return
    worksheet.append_rows(rows, value_input_option="USER_ENTERED")