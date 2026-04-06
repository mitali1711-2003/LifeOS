"""
Experiment API routes — handles HTTP requests for /api/experiments.

Endpoints:
  GET    /api/experiments          — List all experiments with stats
  POST   /api/experiments          — Create a new experiment
  GET    /api/experiments/:id      — Get experiment details + all logs
  DELETE /api/experiments/:id      — Delete an experiment
  POST   /api/experiments/:id/logs — Add a daily log entry
"""
from flask import Blueprint, request, jsonify
from database import get_db
from models.experiment import (
    get_all_experiments, get_experiment, create_experiment,
    delete_experiment, add_log
)

experiment_bp = Blueprint("experiments", __name__, url_prefix="/api/experiments")


@experiment_bp.route("", methods=["GET"])
def list_experiments():
    """GET /api/experiments — Returns all experiments with average scores."""
    db = get_db()
    experiments = get_all_experiments(db)
    db.close()
    return jsonify(experiments)


@experiment_bp.route("", methods=["POST"])
def new_experiment():
    """
    POST /api/experiments
    Create a new experiment.
    Expects JSON: { "title": "...", "description": "...", "start_date": "...", "end_date": "..." }
    """
    data = request.get_json()

    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400
    if not data.get("start_date") or not data.get("end_date"):
        return jsonify({"error": "Start date and end date are required"}), 400

    db = get_db()
    experiment = create_experiment(db, data)
    db.close()
    return jsonify(experiment), 201


@experiment_bp.route("/<int:experiment_id>", methods=["GET"])
def get_experiment_detail(experiment_id):
    """GET /api/experiments/:id — Returns experiment with all its daily logs."""
    db = get_db()
    experiment = get_experiment(db, experiment_id)
    db.close()

    if not experiment:
        return jsonify({"error": "Experiment not found"}), 404
    return jsonify(experiment)


@experiment_bp.route("/<int:experiment_id>", methods=["DELETE"])
def remove_experiment(experiment_id):
    """DELETE /api/experiments/:id — Delete an experiment and all logs."""
    db = get_db()
    deleted = delete_experiment(db, experiment_id)
    db.close()

    if deleted:
        return jsonify({"message": "Experiment deleted"})
    return jsonify({"error": "Experiment not found"}), 404


@experiment_bp.route("/<int:experiment_id>/logs", methods=["POST"])
def log_experiment(experiment_id):
    """
    POST /api/experiments/:id/logs
    Add a daily log. Expects JSON:
    { "date": "2026-04-06", "mood": 4, "productivity": 3, "focus": 5, "notes": "..." }

    If a log for that date already exists, it updates it.
    """
    data = request.get_json()

    if not data or not data.get("date"):
        return jsonify({"error": "Date is required"}), 400

    # Validate scores are 1-5
    for field in ["mood", "productivity", "focus"]:
        val = data.get(field)
        if val is None or not isinstance(val, int) or val < 1 or val > 5:
            return jsonify({"error": f"'{field}' must be an integer from 1 to 5"}), 400

    db = get_db()
    result = add_log(db, experiment_id, data)
    db.close()
    return jsonify(result)
