"""
Experiment model — handles all database operations for life experiments.

A "life experiment" is something you try for a period of time
(e.g., "No caffeine for 2 weeks") and track daily how you feel.
"""
from datetime import date


def get_all_experiments(db):
    """
    Get all experiments with their summary stats (average mood, etc.).
    Returns newest first.
    """
    experiments = db.execute(
        "SELECT * FROM experiments ORDER BY created_at DESC"
    ).fetchall()

    result = []
    for exp in experiments:
        # Calculate average scores from logs
        stats = get_experiment_stats(db, exp["id"])
        result.append({
            "id": exp["id"],
            "title": exp["title"],
            "description": exp["description"],
            "start_date": exp["start_date"],
            "end_date": exp["end_date"],
            "status": exp["status"],
            "created_at": exp["created_at"],
            "stats": stats,
        })

    return result


def get_experiment(db, experiment_id):
    """
    Get a single experiment with all its daily logs.
    Used for the detail page.
    """
    exp = db.execute(
        "SELECT * FROM experiments WHERE id = ?",
        (experiment_id,)
    ).fetchone()

    if not exp:
        return None

    # Get all logs for this experiment, sorted by date
    logs = db.execute(
        "SELECT * FROM experiment_logs WHERE experiment_id = ? ORDER BY date DESC",
        (experiment_id,)
    ).fetchall()

    log_list = [
        {
            "id": log["id"],
            "date": log["date"],
            "mood": log["mood"],
            "productivity": log["productivity"],
            "focus": log["focus"],
            "notes": log["notes"],
        }
        for log in logs
    ]

    stats = get_experiment_stats(db, experiment_id)

    return {
        "id": exp["id"],
        "title": exp["title"],
        "description": exp["description"],
        "start_date": exp["start_date"],
        "end_date": exp["end_date"],
        "status": exp["status"],
        "created_at": exp["created_at"],
        "logs": log_list,
        "stats": stats,
    }


def create_experiment(db, data):
    """
    Create a new experiment.
    data should have: title, description, start_date, end_date
    """
    cursor = db.execute(
        """INSERT INTO experiments (title, description, start_date, end_date)
           VALUES (?, ?, ?, ?)""",
        (data["title"], data.get("description", ""),
         data["start_date"], data["end_date"])
    )
    db.commit()

    exp = db.execute(
        "SELECT * FROM experiments WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    return {
        "id": exp["id"],
        "title": exp["title"],
        "description": exp["description"],
        "start_date": exp["start_date"],
        "end_date": exp["end_date"],
        "status": exp["status"],
    }


def delete_experiment(db, experiment_id):
    """Delete an experiment and all its logs (CASCADE)."""
    cursor = db.execute("DELETE FROM experiments WHERE id = ?", (experiment_id,))
    db.commit()
    return cursor.rowcount > 0


def add_log(db, experiment_id, data):
    """
    Add a daily log entry for an experiment.
    data should have: date, mood (1-5), productivity (1-5), focus (1-5), notes
    If a log already exists for that date, it updates it instead.
    """
    # Check if log already exists for this date
    existing = db.execute(
        "SELECT id FROM experiment_logs WHERE experiment_id = ? AND date = ?",
        (experiment_id, data["date"])
    ).fetchone()

    if existing:
        # Update existing log
        db.execute(
            """UPDATE experiment_logs
               SET mood = ?, productivity = ?, focus = ?, notes = ?
               WHERE id = ?""",
            (data["mood"], data["productivity"], data["focus"],
             data.get("notes", ""), existing["id"])
        )
        db.commit()
        return {"status": "updated", "date": data["date"]}
    else:
        # Insert new log
        db.execute(
            """INSERT INTO experiment_logs (experiment_id, date, mood, productivity, focus, notes)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (experiment_id, data["date"], data["mood"],
             data["productivity"], data["focus"], data.get("notes", ""))
        )
        db.commit()
        return {"status": "logged", "date": data["date"]}


def get_experiment_stats(db, experiment_id):
    """
    Calculate average mood, productivity, and focus for an experiment.
    Also returns the total number of log entries.
    """
    row = db.execute(
        """SELECT
            COUNT(*) as total_logs,
            COALESCE(AVG(mood), 0) as avg_mood,
            COALESCE(AVG(productivity), 0) as avg_productivity,
            COALESCE(AVG(focus), 0) as avg_focus
           FROM experiment_logs
           WHERE experiment_id = ?""",
        (experiment_id,)
    ).fetchone()

    return {
        "total_logs": row["total_logs"],
        "avg_mood": round(row["avg_mood"], 1),
        "avg_productivity": round(row["avg_productivity"], 1),
        "avg_focus": round(row["avg_focus"], 1),
    }
