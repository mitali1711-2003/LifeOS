"""
Voice Journal API routes.

The speech-to-text conversion happens in the BROWSER using the Web Speech API.
The backend receives the transcript text and handles:
  - Saving entries
  - AI mood analysis
  - AI summarization
  - Mood history

Endpoints:
  POST   /api/journal          — Save a new journal entry (with AI analysis)
  GET    /api/journal          — Get all journal entries
  DELETE /api/journal/:id      — Delete an entry
  GET    /api/journal/moods    — Get mood history for charting
  POST   /api/journal/analyze  — Analyze text without saving (preview)
"""
from flask import Blueprint, request, jsonify
from database import get_db
from models.journal import (
    create_entry, get_all_entries, delete_entry, get_mood_history
)
from services.nlp_engine import analyze_mood, summarize_text

journal_bp = Blueprint("journal", __name__, url_prefix="/api/journal")


@journal_bp.route("", methods=["POST"])
def add_entry():
    """
    POST /api/journal
    Save a journal entry. The AI automatically analyzes mood and generates a summary.
    Body: { "transcript": "Today was a great day...", "date": "2026-04-06" (optional) }
    """
    data = request.get_json()
    if not data or not data.get("transcript"):
        return jsonify({"error": "Transcript text is required"}), 400

    transcript = data["transcript"].strip()
    if len(transcript) < 10:
        return jsonify({"error": "Transcript is too short (minimum 10 characters)"}), 400

    entry_date = data.get("date")

    db = get_db()
    entry = create_entry(db, transcript, entry_date)
    db.close()
    return jsonify(entry), 201


@journal_bp.route("", methods=["GET"])
def list_entries():
    """GET /api/journal — Get all journal entries, newest first."""
    db = get_db()
    entries = get_all_entries(db)
    db.close()
    return jsonify(entries)


@journal_bp.route("/<int:entry_id>", methods=["DELETE"])
def remove_entry(entry_id):
    """DELETE /api/journal/:id — Delete a journal entry."""
    db = get_db()
    deleted = delete_entry(db, entry_id)
    db.close()
    if deleted:
        return jsonify({"message": "Entry deleted"})
    return jsonify({"error": "Entry not found"}), 404


@journal_bp.route("/moods", methods=["GET"])
def mood_chart():
    """GET /api/journal/moods — Get mood score history for charting."""
    db = get_db()
    moods = get_mood_history(db)
    db.close()
    return jsonify(moods)


@journal_bp.route("/analyze", methods=["POST"])
def preview_analysis():
    """
    POST /api/journal/analyze
    Analyze text without saving — useful for previewing mood before saving.
    Body: { "text": "..." }
    """
    data = request.get_json()
    if not data or not data.get("text"):
        return jsonify({"error": "Text is required"}), 400

    mood = analyze_mood(data["text"])
    summary = summarize_text(data["text"], max_sentences=2)

    return jsonify({"mood": mood, "summary": summary})
