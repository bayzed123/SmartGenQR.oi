"""
Website enrichment: given a business's own website URL, try to find a
public contact email and social media links.

Deliberately does NOT use a headless browser. Most business sites are
static enough that `requests` + BeautifulSoup covers them — that's also
*why* this runs comfortably inside 1GB RAM on free-tier hosting, unlike
launching Chromium per site (a likely cause of previous crashes/timeouts).

Respects robots.txt, uses a short timeout per request, identifies itself
honestly via User-Agent, and never raises — a slow or broken site should
skip gracefully rather than stop the whole batch.
"""

import re
import time
from urllib import robotparser
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

USER_AGENT = "SmartLeadGenBot/1.0 (business research; see website owner for contact)"
TIMEOUT_SECONDS = 8
CONTACT_PAGE_HINTS = ("contact", "contact-us", "about", "about-us", "get-in-touch")

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
SOCIAL_PATTERNS = {
    "facebook": re.compile(r"https?://(www\.)?facebook\.com/[^\s\"'<>]+", re.IGNORECASE),
    "instagram": re.compile(r"https?://(www\.)?instagram\.com/[^\s\"'<>]+", re.IGNORECASE),
    "linkedin": re.compile(r"https?://(www\.)?linkedin\.com/[^\s\"'<>]+", re.IGNORECASE),
}
JUNK_EMAIL_SNIPPETS = (
    "example.com", "yourdomain", "domain.com", "sentry.io",
    "wixpress.com", "godaddy.com", ".png", ".jpg", ".jpeg", ".gif", ".svg",
)


def _allowed_by_robots(url: str) -> bool:
    try:
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        parser = robotparser.RobotFileParser()
        parser.set_url(robots_url)
        parser.read()
        return parser.can_fetch(USER_AGENT, url)
    except Exception:
        return True  # if robots.txt is unreadable, don't block on it


def _fetch(url: str):
    try:
        if not _allowed_by_robots(url):
            return None
        resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT_SECONDS)
        if resp.status_code == 200 and "text/html" in resp.headers.get("Content-Type", ""):
            return resp.text
    except requests.RequestException:
        return None
    return None


def _clean_email(addr: str):
    addr = addr.strip().rstrip(".,;")
    if not addr or any(junk in addr.lower() for junk in JUNK_EMAIL_SNIPPETS):
        return None
    return addr


def _extract_emails(html: str, soup: BeautifulSoup):
    found = set()
    for match in EMAIL_PATTERN.findall(html):
        cleaned = _clean_email(match)
        if cleaned:
            found.add(cleaned)
    for anchor in soup.find_all("a", href=True):
        if anchor["href"].lower().startswith("mailto:"):
            cleaned = _clean_email(anchor["href"][7:].split("?")[0])
            if cleaned:
                found.add(cleaned)
    return found


def _extract_social(html: str):
    links = {}
    for platform, pattern in SOCIAL_PATTERNS.items():
        match = pattern.search(html)
        if match:
            links[platform] = match.group(0).rstrip("\"'<>),.")
    return links


def _find_contact_page(base_url: str, soup: BeautifulSoup):
    for anchor in soup.find_all("a", href=True):
        href = anchor["href"].lower()
        text = (anchor.get_text() or "").lower()
        if any(hint in href or hint in text for hint in CONTACT_PAGE_HINTS):
            return urljoin(base_url, anchor["href"])
    return None


def enrich_website(url: str) -> dict:
    """
    Visit a business's website (and, if findable, its contact/about page)
    for a public email and social links. Never raises.

    Returns: {"email": str|None, "all_emails": list[str], "socials": dict}
    """
    result = {"email": None, "all_emails": [], "socials": {}}
    if not url:
        return result

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    homepage_html = _fetch(url)
    if homepage_html is None:
        return result

    soup = BeautifulSoup(homepage_html, "html.parser")
    emails = _extract_emails(homepage_html, soup)
    socials = _extract_social(homepage_html)

    contact_url = _find_contact_page(url, soup)
    if contact_url and contact_url != url:
        time.sleep(1)  # be polite between requests to the same domain
        contact_html = _fetch(contact_url)
        if contact_html:
            contact_soup = BeautifulSoup(contact_html, "html.parser")
            emails |= _extract_emails(contact_html, contact_soup)
            for platform, link in _extract_social(contact_html).items():
                socials.setdefault(platform, link)

    sorted_emails = sorted(emails)
    result["email"] = sorted_emails[0] if sorted_emails else None
    result["all_emails"] = sorted_emails
    result["socials"] = socials
    return result