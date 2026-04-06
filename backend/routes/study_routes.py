"""
Study Buddy API routes — handles the AI-powered study features.

Endpoints:
  POST   /api/study/notes              — Save study notes
  GET    /api/study/notes              — List all notes
  DELETE /api/study/notes/:id          — Delete a note
  POST   /api/study/notes/:id/generate — Generate flashcards from notes (AI)
  GET    /api/study/flashcards         — Get flashcards (optionally due-only)
  POST   /api/study/flashcards/:id/review — Record flashcard review
  POST   /api/study/notes/:id/quiz     — Generate a quiz (AI)
  POST   /api/study/quiz/submit        — Submit quiz results
  GET    /api/study/quiz/history        — Get quiz history
  GET    /api/study/stats              — Get study statistics
"""
from flask import Blueprint, request, jsonify
from database import get_db
from models.study import (
    save_note, get_all_notes, delete_note,
    generate_and_save_flashcards, get_flashcards, review_flashcard,
    generate_quiz, save_quiz_result, get_quiz_history, get_study_stats
)

study_bp = Blueprint("study", __name__, url_prefix="/api/study")


# ---- Notes ----

@study_bp.route("/notes", methods=["POST"])
def add_note():
    """POST /api/study/notes — Save new study notes."""
    data = request.get_json()
    if not data or not data.get("title") or not data.get("content"):
        return jsonify({"error": "Title and content are required"}), 400

    db = get_db()
    note = save_note(db, data["title"].strip(), data["content"].strip())
    db.close()
    return jsonify(note), 201


@study_bp.route("/notes", methods=["GET"])
def list_notes():
    """GET /api/study/notes — List all study notes with stats."""
    db = get_db()
    notes = get_all_notes(db)
    db.close()
    return jsonify(notes)


@study_bp.route("/notes/<int:note_id>", methods=["DELETE"])
def remove_note(note_id):
    """DELETE /api/study/notes/:id — Delete a note and all its cards/quizzes."""
    db = get_db()
    deleted = delete_note(db, note_id)
    db.close()
    if deleted:
        return jsonify({"message": "Note deleted"})
    return jsonify({"error": "Note not found"}), 404


# ---- Flashcard Generation ----

@study_bp.route("/notes/<int:note_id>/generate", methods=["POST"])
def generate_cards(note_id):
    """
    POST /api/study/notes/:id/generate
    Use AI to generate flashcards from the note's content.
    Optional body: { "count": 5 }
    """
    data = request.get_json() or {}
    count = data.get("count", 5)

    db = get_db()
    cards = generate_and_save_flashcards(db, note_id, count=count)
    db.close()

    if cards is None:
        return jsonify({"error": "Note not found"}), 404
    return jsonify({"flashcards": cards, "count": len(cards)})


# ---- Flashcard Review ----

@study_bp.route("/flashcards", methods=["GET"])
def list_flashcards():
    """
    GET /api/study/flashcards?note_id=1&due_only=true
    Get flashcards with optional filters.
    """
    note_id = request.args.get("note_id", type=int)
    due_only = request.args.get("due_only", "false").lower() == "true"

    db = get_db()
    cards = get_flashcards(db, note_id=note_id, due_only=due_only)
    db.close()
    return jsonify(cards)


@study_bp.route("/flashcards/<int:card_id>/review", methods=["POST"])
def review_card(card_id):
    """
    POST /api/study/flashcards/:id/review
    Record whether the user got the flashcard right or wrong.
    Body: { "correct": true }
    This updates the spaced repetition schedule.
    """
    data = request.get_json()
    if data is None or "correct" not in data:
        return jsonify({"error": "'correct' field is required (true/false)"}), 400

    db = get_db()
    result = review_flashcard(db, card_id, data["correct"])
    db.close()

    if result is None:
        return jsonify({"error": "Flashcard not found"}), 404
    return jsonify(result)


# ---- Quiz ----

@study_bp.route("/notes/<int:note_id>/quiz", methods=["POST"])
def start_quiz(note_id):
    """
    POST /api/study/notes/:id/quiz
    Generate a quiz (MCQs) from the note's content using AI.
    Optional body: { "count": 5 }
    """
    data = request.get_json() or {}
    count = data.get("count", 5)

    db = get_db()
    mcqs = generate_quiz(db, note_id, count=count)
    db.close()

    if mcqs is None:
        return jsonify({"error": "Note not found"}), 404
    return jsonify({"questions": mcqs, "count": len(mcqs)})


@study_bp.route("/quiz/submit", methods=["POST"])
def submit_quiz():
    """
    POST /api/study/quiz/submit
    Save quiz results.
    Body: { "note_id": 1, "total_questions": 5, "correct_answers": 3 }
    """
    data = request.get_json()
    if not data or not all(k in data for k in ["note_id", "total_questions", "correct_answers"]):
        return jsonify({"error": "note_id, total_questions, and correct_answers are required"}), 400

    db = get_db()
    result = save_quiz_result(
        db, data["note_id"], data["total_questions"], data["correct_answers"]
    )
    db.close()
    return jsonify(result), 201


@study_bp.route("/quiz/history", methods=["GET"])
def quiz_history():
    """GET /api/study/quiz/history?note_id=1 — Get quiz history."""
    note_id = request.args.get("note_id", type=int)
    db = get_db()
    history = get_quiz_history(db, note_id)
    db.close()
    return jsonify(history)


# ---- Stats ----

@study_bp.route("/stats", methods=["GET"])
def study_statistics():
    """GET /api/study/stats — Get overall study statistics."""
    db = get_db()
    stats = get_study_stats(db)
    db.close()
    return jsonify(stats)
