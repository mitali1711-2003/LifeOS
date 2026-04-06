"""
Smart Bookmark Organizer API routes.

Endpoints:
  POST   /api/bookmarks            — Save a bookmark (AI auto-categorizes)
  GET    /api/bookmarks             — List bookmarks (filterable by category)
  GET    /api/bookmarks/search?q=   — Search bookmarks (AI keyword matching)
  GET    /api/bookmarks/categories  — Get categories with counts
  PUT    /api/bookmarks/:id         — Update bookmark
  DELETE /api/bookmarks/:id         — Delete bookmark
"""
from flask import Blueprint, request, jsonify
from database import get_db
from models.bookmark import (
    create_bookmark, get_all_bookmarks, search, delete_bookmark,
    update_bookmark, get_categories
)

bookmark_bp = Blueprint("bookmarks", __name__, url_prefix="/api/bookmarks")


@bookmark_bp.route("", methods=["POST"])
def add_bookmark():
    """
    POST /api/bookmarks
    Save a new bookmark. AI auto-fetches the title and categorizes it.
    Body: { "url": "https://...", "title": "optional", "description": "optional", "tags": ["tag1"] }
    """
    data = request.get_json()
    if not data or not data.get("url"):
        return jsonify({"error": "URL is required"}), 400

    url = data["url"].strip()
    # Basic URL validation
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    db = get_db()
    bookmark = create_bookmark(
        db, url,
        title=data.get("title"),
        description=data.get("description", ""),
        tags=data.get("tags", []),
    )
    db.close()
    return jsonify(bookmark), 201


@bookmark_bp.route("", methods=["GET"])
def list_bookmarks():
    """GET /api/bookmarks?category=Technology — List bookmarks."""
    category = request.args.get("category")
    db = get_db()
    bookmarks = get_all_bookmarks(db, category)
    db.close()
    return jsonify(bookmarks)


@bookmark_bp.route("/search", methods=["GET"])
def search_bookmarks():
    """GET /api/bookmarks/search?q=python tutorial — Search bookmarks by relevance."""
    query = request.args.get("q", "")
    if not query.strip():
        return jsonify([])

    db = get_db()
    results = search(db, query)
    db.close()
    return jsonify(results)


@bookmark_bp.route("/categories", methods=["GET"])
def list_categories():
    """GET /api/bookmarks/categories — Get all categories with counts."""
    db = get_db()
    cats = get_categories(db)
    db.close()
    return jsonify(cats)


@bookmark_bp.route("/<int:bm_id>", methods=["PUT"])
def edit_bookmark(bm_id):
    """PUT /api/bookmarks/:id — Update a bookmark's details."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    db = get_db()
    result = update_bookmark(db, bm_id, data)
    db.close()
    if not result:
        return jsonify({"error": "Bookmark not found"}), 404
    return jsonify(result)


@bookmark_bp.route("/<int:bm_id>", methods=["DELETE"])
def remove_bookmark(bm_id):
    """DELETE /api/bookmarks/:id — Delete a bookmark."""
    db = get_db()
    deleted = delete_bookmark(db, bm_id)
    db.close()
    if deleted:
        return jsonify({"message": "Bookmark deleted"})
    return jsonify({"error": "Bookmark not found"}), 404
