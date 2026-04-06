"""
Bookmark model — handles database operations for the Smart Bookmark Organizer.

Features:
- Save URLs with auto-categorization
- Tag management
- Semantic-like search using keyword matching
"""
import json
import re
from urllib.request import urlopen, Request
from urllib.error import URLError
from services.nlp_engine import categorize_text, search_bookmarks as nlp_search


def extract_page_title(url):
    """
    Try to fetch the webpage and extract its <title> tag.
    Falls back to the URL domain if fetching fails.
    """
    try:
        req = Request(url, headers={'User-Agent': 'LifeOS/1.0'})
        with urlopen(req, timeout=5) as response:
            html = response.read(10000).decode('utf-8', errors='ignore')
            # Find <title>...</title>
            match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
    except Exception:
        pass

    # Fallback: extract domain name from URL
    match = re.search(r'https?://(?:www\.)?([^/]+)', url)
    return match.group(1) if match else url


def create_bookmark(db, url, title=None, description='', tags=None):
    """
    Save a new bookmark with AI auto-categorization.

    1. If no title provided, fetches it from the webpage
    2. AI categorizes the bookmark based on title + URL + description
    3. Saves to database
    """
    # Auto-fetch title if not provided
    if not title:
        title = extract_page_title(url)

    # AI: Auto-categorize
    category = categorize_text(title, url, description)

    # Handle tags (store as JSON string in SQLite)
    if tags is None:
        tags = []
    tags_json = json.dumps(tags)

    cursor = db.execute(
        """INSERT INTO bookmarks (url, title, description, category, tags)
           VALUES (?, ?, ?, ?, ?)""",
        (url, title, description, category, tags_json)
    )
    db.commit()

    return {
        "id": cursor.lastrowid,
        "url": url,
        "title": title,
        "description": description,
        "category": category,
        "tags": tags,
    }


def get_all_bookmarks(db, category=None):
    """Get all bookmarks, optionally filtered by category."""
    if category:
        rows = db.execute(
            "SELECT * FROM bookmarks WHERE category = ? ORDER BY created_at DESC",
            (category,)
        ).fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM bookmarks ORDER BY created_at DESC"
        ).fetchall()

    return [_row_to_dict(row) for row in rows]


def search(db, query):
    """
    Search bookmarks using AI-powered keyword matching.
    Returns bookmarks sorted by relevance.
    """
    all_bookmarks = get_all_bookmarks(db)
    return nlp_search(query, all_bookmarks)


def delete_bookmark(db, bookmark_id):
    """Delete a bookmark."""
    cursor = db.execute("DELETE FROM bookmarks WHERE id = ?", (bookmark_id,))
    db.commit()
    return cursor.rowcount > 0


def update_bookmark(db, bookmark_id, data):
    """Update a bookmark's title, description, tags, or category."""
    bm = db.execute("SELECT * FROM bookmarks WHERE id = ?", (bookmark_id,)).fetchone()
    if not bm:
        return None

    title = data.get("title", bm["title"])
    description = data.get("description", bm["description"])
    category = data.get("category", bm["category"])
    tags = data.get("tags", json.loads(bm["tags"]))
    tags_json = json.dumps(tags)

    db.execute(
        """UPDATE bookmarks SET title=?, description=?, category=?, tags=? WHERE id=?""",
        (title, description, category, tags_json, bookmark_id)
    )
    db.commit()

    return {
        "id": bookmark_id, "url": bm["url"], "title": title,
        "description": description, "category": category, "tags": tags,
    }


def get_categories(db):
    """Get all unique categories with counts."""
    rows = db.execute(
        "SELECT category, COUNT(*) as count FROM bookmarks GROUP BY category ORDER BY count DESC"
    ).fetchall()
    return [{"category": row["category"], "count": row["count"]} for row in rows]


def get_bookmark_stats(db):
    """Stats for the dashboard."""
    total = db.execute("SELECT COUNT(*) as c FROM bookmarks").fetchone()["c"]
    cats = db.execute(
        "SELECT COUNT(DISTINCT category) as c FROM bookmarks"
    ).fetchone()["c"]
    return {"total_bookmarks": total, "total_categories": cats}


def _row_to_dict(row):
    """Convert a database row to a dictionary with parsed tags."""
    return {
        "id": row["id"],
        "url": row["url"],
        "title": row["title"],
        "description": row["description"],
        "category": row["category"],
        "tags": json.loads(row["tags"]),
        "created_at": row["created_at"],
    }
