"""
Idea Generator API routes.

Endpoints:
  GET    /api/ideas/generate — Generate 3 fresh ideas (startup, creative, challenge)
  POST   /api/ideas/save     — Save/bookmark an idea
  GET    /api/ideas/saved     — Get all saved ideas
  DELETE /api/ideas/:id       — Delete a saved idea
"""
from flask import Blueprint, request, jsonify
from database import get_db
from models.idea import generate_new_ideas, save_idea, get_saved_ideas, delete_idea

idea_bp = Blueprint("ideas", __name__, url_prefix="/api/ideas")


@idea_bp.route("/generate", methods=["GET"])
def generate():
    """GET /api/ideas/generate — Get 3 fresh AI-generated ideas."""
    ideas = generate_new_ideas()
    return jsonify(ideas)


@idea_bp.route("/save", methods=["POST"])
def bookmark_idea():
    """
    POST /api/ideas/save
    Save an idea to your bookmarks.
    Body: { "type": "startup", "content": "An app that..." }
    """
    data = request.get_json()
    if not data or not data.get("type") or not data.get("content"):
        return jsonify({"error": "type and content are required"}), 400

    if data["type"] not in ("startup", "creative", "challenge"):
        return jsonify({"error": "type must be startup, creative, or challenge"}), 400

    db = get_db()
    idea = save_idea(db, data["type"], data["content"])
    db.close()
    return jsonify(idea), 201


@idea_bp.route("/saved", methods=["GET"])
def list_saved():
    """GET /api/ideas/saved — Get all bookmarked ideas."""
    db = get_db()
    ideas = get_saved_ideas(db)
    db.close()
    return jsonify(ideas)


@idea_bp.route("/<int:idea_id>", methods=["DELETE"])
def remove_idea(idea_id):
    """DELETE /api/ideas/:id — Remove a saved idea."""
    db = get_db()
    deleted = delete_idea(db, idea_id)
    db.close()
    if deleted:
        return jsonify({"message": "Idea removed"})
    return jsonify({"error": "Idea not found"}), 404
