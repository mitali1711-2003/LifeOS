"""
Habit model — handles all database operations for habits.
Think of this as the "brain" for habit data.
"""
from datetime import date, timedelta


def get_all_habits(db):
    """
    Get all habits with today's check-in status and current streak.
    Returns a list of dictionaries.
    """
    today = date.today().isoformat()
    habits = db.execute("SELECT * FROM habits ORDER BY created_at DESC").fetchall()

    result = []
    for habit in habits:
        # Check if this habit was done today
        log = db.execute(
            "SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?",
            (habit["id"], today)
        ).fetchone()

        result.append({
            "id": habit["id"],
            "name": habit["name"],
            "created_at": habit["created_at"],
            "done_today": log is not None,
            "current_streak": calculate_streak(db, habit["id"])
        })

    return result


def create_habit(db, name):
    """
    Create a new habit and return it.
    """
    cursor = db.execute(
        "INSERT INTO habits (name) VALUES (?)",
        (name,)
    )
    db.commit()

    # Fetch and return the newly created habit
    habit = db.execute(
        "SELECT * FROM habits WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    return {
        "id": habit["id"],
        "name": habit["name"],
        "created_at": habit["created_at"]
    }


def delete_habit(db, habit_id):
    """
    Delete a habit by ID. The ON DELETE CASCADE in the schema
    automatically deletes all related logs too.
    Returns True if a habit was found and deleted, False otherwise.
    """
    cursor = db.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    db.commit()
    return cursor.rowcount > 0


def toggle_log(db, habit_id, log_date):
    """
    Toggle a habit's check-in for a given date.
    - If already logged: remove it (undo)
    - If not logged: add it (mark done)
    Returns "logged" or "removed".
    """
    # Check if a log already exists for this habit + date
    existing = db.execute(
        "SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?",
        (habit_id, log_date)
    ).fetchone()

    if existing:
        # Already checked in — undo it
        db.execute("DELETE FROM habit_logs WHERE id = ?", (existing["id"],))
        db.commit()
        return "removed"
    else:
        # Not checked in yet — mark it done
        db.execute(
            "INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)",
            (habit_id, log_date)
        )
        db.commit()
        return "logged"


def get_logs(db, habit_id, month=None):
    """
    Get all log dates for a habit. If month is provided (e.g., "2026-04"),
    only return logs from that month.
    """
    if month:
        # Filter by month: dates that start with "2026-04"
        rows = db.execute(
            "SELECT date FROM habit_logs WHERE habit_id = ? AND date LIKE ? ORDER BY date",
            (habit_id, f"{month}%")
        ).fetchall()
    else:
        rows = db.execute(
            "SELECT date FROM habit_logs WHERE habit_id = ? ORDER BY date",
            (habit_id,)
        ).fetchall()

    return [row["date"] for row in rows]


def calculate_streak(db, habit_id):
    """
    Calculate the current streak for a habit.

    How it works:
    1. Start from today (or yesterday if today isn't logged yet)
    2. Go backwards day by day
    3. Count consecutive days that have a log
    4. Stop when we find a day without a log

    Example: If logs exist for Apr 6, Apr 5, Apr 4 but NOT Apr 3,
    the streak is 3.
    """
    today = date.today()

    # Get all log dates, sorted newest first
    rows = db.execute(
        "SELECT date FROM habit_logs WHERE habit_id = ? ORDER BY date DESC",
        (habit_id,)
    ).fetchall()

    # Convert to a set for fast lookup
    logged_dates = {row["date"] for row in rows}

    # If no logs at all, streak is 0
    if not logged_dates:
        return 0

    # Start counting from today
    check_date = today
    # If today isn't logged, start from yesterday
    # (so the streak doesn't break just because it's morning)
    if check_date.isoformat() not in logged_dates:
        check_date = today - timedelta(days=1)

    streak = 0
    while check_date.isoformat() in logged_dates:
        streak += 1
        check_date -= timedelta(days=1)

    return streak
