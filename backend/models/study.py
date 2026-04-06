"""
Study model — handles database operations for the AI Study Buddy.

Manages study notes, AI-generated flashcards, and quiz results.
Uses the AI engine (services/ai_engine.py) to generate content.
"""
from datetime import datetime, timedelta
from services.ai_engine import generate_flashcards, generate_mcqs


def save_note(db, title, content):
    """Save study notes and return the new record."""
    cursor = db.execute(
        "INSERT INTO study_notes (title, content) VALUES (?, ?)",
        (title, content)
    )
    db.commit()
    return {
        "id": cursor.lastrowid,
        "title": title,
        "content": content,
    }


def get_all_notes(db):
    """Get all study notes with flashcard/quiz counts."""
    notes = db.execute(
        "SELECT * FROM study_notes ORDER BY created_at DESC"
    ).fetchall()

    result = []
    for note in notes:
        # Count flashcards for this note
        fc_count = db.execute(
            "SELECT COUNT(*) as c FROM flashcards WHERE note_id = ?",
            (note["id"],)
        ).fetchone()["c"]

        # Count quizzes taken
        quiz_count = db.execute(
            "SELECT COUNT(*) as c FROM quiz_results WHERE note_id = ?",
            (note["id"],)
        ).fetchone()["c"]

        # Best quiz score
        best = db.execute(
            "SELECT MAX(score_percent) as best FROM quiz_results WHERE note_id = ?",
            (note["id"],)
        ).fetchone()["best"]

        result.append({
            "id": note["id"],
            "title": note["title"],
            "content": note["content"][:200] + ("..." if len(note["content"]) > 200 else ""),
            "created_at": note["created_at"],
            "flashcard_count": fc_count,
            "quiz_count": quiz_count,
            "best_score": best,
        })

    return result


def delete_note(db, note_id):
    """Delete a note and all associated flashcards/quizzes (CASCADE)."""
    cursor = db.execute("DELETE FROM study_notes WHERE id = ?", (note_id,))
    db.commit()
    return cursor.rowcount > 0


def generate_and_save_flashcards(db, note_id, count=5):
    """
    Use the AI engine to generate flashcards from a note's content,
    then save them to the database.
    """
    # Get the note content
    note = db.execute(
        "SELECT * FROM study_notes WHERE id = ?", (note_id,)
    ).fetchone()

    if not note:
        return None

    # Generate flashcards using AI engine
    cards = generate_flashcards(note["content"], count=count)

    # Save each flashcard to the database
    saved = []
    for card in cards:
        # Calculate first review time (spaced repetition: review in 1 day)
        next_review = (datetime.now() + timedelta(days=1)).isoformat(timespec="seconds")

        cursor = db.execute(
            """INSERT INTO flashcards (note_id, question, answer, next_review)
               VALUES (?, ?, ?, ?)""",
            (note_id, card["question"], card["answer"], next_review)
        )
        db.commit()
        saved.append({
            "id": cursor.lastrowid,
            "question": card["question"],
            "answer": card["answer"],
            "next_review": next_review,
        })

    return saved


def generate_quiz(db, note_id, count=5):
    """
    Generate MCQs from a note's content (not saved — used live).
    Returns the questions for the frontend to display as a quiz.
    """
    note = db.execute(
        "SELECT * FROM study_notes WHERE id = ?", (note_id,)
    ).fetchone()

    if not note:
        return None

    return generate_mcqs(note["content"], count=count)


def get_flashcards(db, note_id=None, due_only=False):
    """
    Get flashcards, optionally filtered by note or due date.
    due_only=True returns only cards that are due for review (spaced repetition).
    """
    query = "SELECT * FROM flashcards"
    params = []
    conditions = []

    if note_id:
        conditions.append("note_id = ?")
        params.append(note_id)

    if due_only:
        now = datetime.now().isoformat(timespec="seconds")
        conditions.append("(next_review IS NULL OR next_review <= ?)")
        params.append(now)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY next_review ASC"
    rows = db.execute(query, params).fetchall()

    return [
        {
            "id": row["id"],
            "note_id": row["note_id"],
            "question": row["question"],
            "answer": row["answer"],
            "times_reviewed": row["times_reviewed"],
            "times_correct": row["times_correct"],
            "next_review": row["next_review"],
        }
        for row in rows
    ]


def review_flashcard(db, card_id, correct):
    """
    Record a flashcard review result and schedule the next review.

    Spaced repetition logic (simplified):
    - If correct: next review in (current_interval * 2) days
    - If wrong: next review in 1 day (reset)

    This means cards you know well show up less often,
    while cards you struggle with keep coming back.
    """
    card = db.execute(
        "SELECT * FROM flashcards WHERE id = ?", (card_id,)
    ).fetchone()

    if not card:
        return None

    times_reviewed = card["times_reviewed"] + 1
    times_correct = card["times_correct"] + (1 if correct else 0)

    # Calculate next review interval
    if correct:
        # Double the interval each time you get it right
        # Start with 1 day, then 2, 4, 8, 16...
        consecutive_correct = times_correct
        interval_days = min(2 ** consecutive_correct, 30)  # Cap at 30 days
    else:
        # Reset to 1 day if wrong
        interval_days = 1

    next_review = (datetime.now() + timedelta(days=interval_days)).isoformat(timespec="seconds")

    db.execute(
        """UPDATE flashcards
           SET times_reviewed = ?, times_correct = ?, next_review = ?
           WHERE id = ?""",
        (times_reviewed, times_correct, next_review, card_id)
    )
    db.commit()

    return {
        "id": card_id,
        "times_reviewed": times_reviewed,
        "times_correct": times_correct,
        "next_review": next_review,
    }


def save_quiz_result(db, note_id, total_questions, correct_answers):
    """Save a quiz attempt result."""
    score = round((correct_answers / total_questions) * 100, 1) if total_questions > 0 else 0

    cursor = db.execute(
        """INSERT INTO quiz_results (note_id, total_questions, correct_answers, score_percent)
           VALUES (?, ?, ?, ?)""",
        (note_id, total_questions, correct_answers, score)
    )
    db.commit()

    return {
        "id": cursor.lastrowid,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "score_percent": score,
    }


def get_quiz_history(db, note_id=None):
    """Get quiz results, optionally for a specific note."""
    if note_id:
        rows = db.execute(
            "SELECT * FROM quiz_results WHERE note_id = ? ORDER BY taken_at DESC",
            (note_id,)
        ).fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM quiz_results ORDER BY taken_at DESC LIMIT 20"
        ).fetchall()

    return [
        {
            "id": row["id"],
            "note_id": row["note_id"],
            "total_questions": row["total_questions"],
            "correct_answers": row["correct_answers"],
            "score_percent": row["score_percent"],
            "taken_at": row["taken_at"],
        }
        for row in rows
    ]


def get_study_stats(db):
    """Get overall study stats for the dashboard."""
    total_notes = db.execute("SELECT COUNT(*) as c FROM study_notes").fetchone()["c"]
    total_cards = db.execute("SELECT COUNT(*) as c FROM flashcards").fetchone()["c"]
    due_cards = db.execute(
        "SELECT COUNT(*) as c FROM flashcards WHERE next_review <= ?",
        (datetime.now().isoformat(timespec="seconds"),)
    ).fetchone()["c"]
    total_quizzes = db.execute("SELECT COUNT(*) as c FROM quiz_results").fetchone()["c"]
    avg_score = db.execute(
        "SELECT COALESCE(AVG(score_percent), 0) as avg FROM quiz_results"
    ).fetchone()["avg"]

    return {
        "total_notes": total_notes,
        "total_flashcards": total_cards,
        "due_for_review": due_cards,
        "total_quizzes": total_quizzes,
        "avg_score": round(avg_score, 1),
    }
