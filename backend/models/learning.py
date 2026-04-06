"""
Learning model — handles all database operations for learning items.

A "learning item" is a course, book, or skill the user is learning.
They track progress (0-100%) and status (not started / in progress / completed).
"""
from datetime import datetime


def get_all_learning_items(db, status_filter=None):
    """
    Get all learning items, optionally filtered by status.
    Returns newest first.
    """
    query = "SELECT * FROM learning_items"
    params = []

    if status_filter:
        query += " WHERE status = ?"
        params.append(status_filter)

    query += " ORDER BY updated_at DESC"
    rows = db.execute(query, params).fetchall()

    return [
        {
            "id": row["id"],
            "title": row["title"],
            "type": row["type"],
            "progress": row["progress"],
            "status": row["status"],
            "notes": row["notes"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
        for row in rows
    ]


def create_learning_item(db, data):
    """
    Add a new learning item.
    data should have: title, type (course/book/skill), notes (optional)
    """
    cursor = db.execute(
        """INSERT INTO learning_items (title, type, notes)
           VALUES (?, ?, ?)""",
        (data["title"], data["type"], data.get("notes", ""))
    )
    db.commit()

    row = db.execute(
        "SELECT * FROM learning_items WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    return {
        "id": row["id"],
        "title": row["title"],
        "type": row["type"],
        "progress": row["progress"],
        "status": row["status"],
        "notes": row["notes"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def update_learning_item(db, item_id, data):
    """
    Update a learning item's progress, status, or notes.
    Automatically sets status based on progress:
      - 0% → not_started
      - 1-99% → in_progress
      - 100% → completed
    """
    # Fetch current item
    item = db.execute(
        "SELECT * FROM learning_items WHERE id = ?",
        (item_id,)
    ).fetchone()

    if not item:
        return None

    # Use provided values or keep existing ones
    progress = data.get("progress", item["progress"])
    notes = data.get("notes", item["notes"])

    # Auto-determine status from progress
    if progress == 0:
        status = "not_started"
    elif progress >= 100:
        progress = 100
        status = "completed"
    else:
        status = "in_progress"

    # Allow manual status override if provided
    if "status" in data:
        status = data["status"]

    now = datetime.now().isoformat(timespec="seconds")

    db.execute(
        """UPDATE learning_items
           SET progress = ?, status = ?, notes = ?, updated_at = ?
           WHERE id = ?""",
        (progress, status, notes, now, item_id)
    )
    db.commit()

    return {
        "id": item_id,
        "title": item["title"],
        "type": item["type"],
        "progress": progress,
        "status": status,
        "notes": notes,
        "updated_at": now,
    }


def delete_learning_item(db, item_id):
    """Delete a learning item by ID."""
    cursor = db.execute("DELETE FROM learning_items WHERE id = ?", (item_id,))
    db.commit()
    return cursor.rowcount > 0


def get_learning_stats(db):
    """
    Get summary statistics for the dashboard.
    Returns counts by status and average progress.
    """
    rows = db.execute(
        """SELECT status, COUNT(*) as count
           FROM learning_items GROUP BY status"""
    ).fetchall()

    stats = {"not_started": 0, "in_progress": 0, "completed": 0}
    for row in rows:
        stats[row["status"]] = row["count"]

    avg_row = db.execute(
        "SELECT COALESCE(AVG(progress), 0) as avg_progress FROM learning_items"
    ).fetchone()

    stats["total"] = sum(stats.values())
    stats["avg_progress"] = round(avg_row["avg_progress"], 1)
    return stats
