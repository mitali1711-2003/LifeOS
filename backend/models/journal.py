"""
Journal model — handles database operations for the Voice Journal.

Speech-to-text happens in the browser (Web Speech API).
The backend handles: saving entries, mood analysis, and summarization.
"""
from services.nlp_engine import analyze_mood, summarize_text


def create_entry(db, transcript, entry_date=None):
    """
    Save a journal entry with AI-analyzed mood and summary.

    1. Takes the transcript text
    2. Runs sentiment analysis → determines mood
    3. Generates a summary of the entry
    4. Saves everything to the database
    """
    # AI: Analyze the mood of the journal text
    mood_result = analyze_mood(transcript)

    # AI: Generate a summary (pick the 2 most important sentences)
    summary = summarize_text(transcript, max_sentences=2)

    # Build the SQL values
    date_value = entry_date or "date('now')"

    if entry_date:
        cursor = db.execute(
            """INSERT INTO journal_entries
               (transcript, mood, mood_score, mood_emoji, mood_label, summary, date)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (transcript, mood_result["mood"], mood_result["score"],
             mood_result["emoji"], mood_result["label"], summary, entry_date)
        )
    else:
        cursor = db.execute(
            """INSERT INTO journal_entries
               (transcript, mood, mood_score, mood_emoji, mood_label, summary)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (transcript, mood_result["mood"], mood_result["score"],
             mood_result["emoji"], mood_result["label"], summary)
        )
    db.commit()

    return {
        "id": cursor.lastrowid,
        "transcript": transcript,
        "mood": mood_result,
        "summary": summary,
    }


def get_all_entries(db, limit=50):
    """Get all journal entries, newest first."""
    rows = db.execute(
        "SELECT * FROM journal_entries ORDER BY date DESC, created_at DESC LIMIT ?",
        (limit,)
    ).fetchall()

    return [
        {
            "id": row["id"],
            "transcript": row["transcript"],
            "mood": {
                "mood": row["mood"],
                "score": row["mood_score"],
                "emoji": row["mood_emoji"],
                "label": row["mood_label"],
            },
            "summary": row["summary"],
            "date": row["date"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def delete_entry(db, entry_id):
    """Delete a journal entry."""
    cursor = db.execute("DELETE FROM journal_entries WHERE id = ?", (entry_id,))
    db.commit()
    return cursor.rowcount > 0


def get_mood_history(db, days=30):
    """
    Get mood scores over time for charting.
    Groups by date, averages the mood score per day.
    """
    rows = db.execute(
        """SELECT date, AVG(mood_score) as avg_score, COUNT(*) as entries
           FROM journal_entries
           GROUP BY date
           ORDER BY date DESC
           LIMIT ?""",
        (days,)
    ).fetchall()

    return [
        {
            "date": row["date"],
            "avg_score": round(row["avg_score"], 2),
            "entries": row["entries"],
        }
        for row in rows
    ]


def get_journal_stats(db):
    """Get journal statistics for the dashboard."""
    total = db.execute("SELECT COUNT(*) as c FROM journal_entries").fetchone()["c"]

    if total == 0:
        return {"total_entries": 0, "avg_mood": 0, "mood_emoji": "😐"}

    avg = db.execute(
        "SELECT AVG(mood_score) as avg FROM journal_entries"
    ).fetchone()["avg"]

    # Latest mood
    latest = db.execute(
        "SELECT mood_emoji FROM journal_entries ORDER BY created_at DESC LIMIT 1"
    ).fetchone()

    return {
        "total_entries": total,
        "avg_mood": round(avg, 2),
        "mood_emoji": latest["mood_emoji"] if latest else "😐",
    }
