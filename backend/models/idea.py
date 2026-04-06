"""
Idea model — handles database operations for the Daily Idea Generator.
Uses the AI engine to generate fresh ideas.
"""
from services.ai_engine import generate_ideas as ai_generate_ideas


def generate_new_ideas():
    """Generate 3 fresh ideas using the AI engine."""
    return ai_generate_ideas()


def save_idea(db, idea_type, content):
    """Save a bookmarked idea."""
    cursor = db.execute(
        "INSERT INTO saved_ideas (type, content) VALUES (?, ?)",
        (idea_type, content)
    )
    db.commit()
    return {
        "id": cursor.lastrowid,
        "type": idea_type,
        "content": content,
    }


def get_saved_ideas(db):
    """Get all saved/bookmarked ideas."""
    rows = db.execute(
        "SELECT * FROM saved_ideas ORDER BY saved_at DESC"
    ).fetchall()
    return [
        {
            "id": row["id"],
            "type": row["type"],
            "content": row["content"],
            "saved_at": row["saved_at"],
        }
        for row in rows
    ]


def delete_idea(db, idea_id):
    """Delete a saved idea."""
    cursor = db.execute("DELETE FROM saved_ideas WHERE id = ?", (idea_id,))
    db.commit()
    return cursor.rowcount > 0
