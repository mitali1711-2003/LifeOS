"""
Habit API routes — handles all HTTP requests for /api/habits.
Each function here is an "endpoint" that the frontend calls.
"""
from flask import Blueprint, request, jsonify
from database import get_db
from models.habit import (
    get_all_habits, create_habit, delete_habit, toggle_log, get_logs
)

# Create a Blueprint (a group of related routes)
habit_bp = Blueprint("habits", __name__, url_prefix="/api/habits")


@habit_bp.route("", methods=["GET"])
def list_habits():
    """GET /api/habits — Returns all habits with streaks and today's status."""
    db = get_db()
    habits = get_all_habits(db)
    db.close()
    return jsonify(habits)


@habit_bp.route("", methods=["POST"])
def add_habit():
    """POST /api/habits — Create a new habit. Expects JSON: { "name": "..." }"""
    data = request.get_json()

    # Validate: name is required
    if not data or not data.get("name"):
        return jsonify({"error": "Habit name is required"}), 400

    db = get_db()
    habit = create_habit(db, data["name"].strip())
    db.close()
    return jsonify(habit), 201


@habit_bp.route("/<int:habit_id>", methods=["DELETE"])
def remove_habit(habit_id):
    """DELETE /api/habits/:id — Delete a habit and all its logs."""
    db = get_db()
    deleted = delete_habit(db, habit_id)
    db.close()

    if deleted:
        return jsonify({"message": "Habit deleted"})
    else:
        return jsonify({"error": "Habit not found"}), 404


@habit_bp.route("/<int:habit_id>/log", methods=["POST"])
def log_habit(habit_id):
    """
    POST /api/habits/:id/log — Toggle today's check-in.
    Expects JSON: { "date": "2026-04-06" }
    If already logged, it removes the log (undo). Otherwise, it adds it.
    """
    data = request.get_json()

    if not data or not data.get("date"):
        return jsonify({"error": "Date is required"}), 400

    db = get_db()
    status = toggle_log(db, habit_id, data["date"])
    db.close()

    return jsonify({"status": status, "date": data["date"]})


@habit_bp.route("/<int:habit_id>/logs", methods=["GET"])
def get_habit_logs(habit_id):
    """
    GET /api/habits/:id/logs?month=2026-04
    Returns all dates when this habit was completed.
    Used by the calendar heatmap on the frontend.
    """
    month = request.args.get("month")  # Optional filter

    db = get_db()
    dates = get_logs(db, habit_id, month)
    db.close()

    return jsonify({"habit_id": habit_id, "dates": dates})
