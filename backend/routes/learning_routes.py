"""
Learning API routes — handles HTTP requests for /api/learning.

Endpoints:
  GET    /api/learning       — List all learning items (filterable by status)
  POST   /api/learning       — Add a new learning item
  PUT    /api/learning/:id   — Update progress/status/notes
  DELETE /api/learning/:id   — Delete a learning item
"""
from flask import Blueprint, request, jsonify
from database import get_db
from models.learning import (
    get_all_learning_items, create_learning_item,
    update_learning_item, delete_learning_item
)

learning_bp = Blueprint("learning", __name__, url_prefix="/api/learning")


@learning_bp.route("", methods=["GET"])
def list_items():
    """
    GET /api/learning?status=in_progress
    Returns all learning items, optionally filtered by status.
    """
    status_filter = request.args.get("status")
    db = get_db()
    items = get_all_learning_items(db, status_filter)
    db.close()
    return jsonify(items)


@learning_bp.route("", methods=["POST"])
def add_item():
    """
    POST /api/learning
    Add a new learning item.
    Expects JSON: { "title": "...", "type": "course|book|skill", "notes": "..." }
    """
    data = request.get_json()

    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    valid_types = ("course", "book", "skill")
    if data.get("type") not in valid_types:
        return jsonify({"error": f"Type must be one of: {', '.join(valid_types)}"}), 400

    db = get_db()
    item = create_learning_item(db, data)
    db.close()
    return jsonify(item), 201


@learning_bp.route("/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    """
    PUT /api/learning/:id
    Update a learning item's progress, status, or notes.
    Expects JSON: { "progress": 50, "notes": "Finished chapter 5" }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    # Validate progress if provided
    if "progress" in data:
        try:
            data["progress"] = int(data["progress"])
            if data["progress"] < 0 or data["progress"] > 100:
                raise ValueError()
        except (ValueError, TypeError):
            return jsonify({"error": "Progress must be 0-100"}), 400

    db = get_db()
    item = update_learning_item(db, item_id, data)
    db.close()

    if not item:
        return jsonify({"error": "Learning item not found"}), 404
    return jsonify(item)


@learning_bp.route("/<int:item_id>", methods=["DELETE"])
def remove_item(item_id):
    """DELETE /api/learning/:id — Delete a learning item."""
    db = get_db()
    deleted = delete_learning_item(db, item_id)
    db.close()

    if deleted:
        return jsonify({"message": "Learning item deleted"})
    return jsonify({"error": "Learning item not found"}), 404
