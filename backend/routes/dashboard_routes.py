"""
Dashboard API routes — combines data from ALL modules
into a single response for the dashboard page.
"""
from datetime import date, timedelta
from flask import Blueprint, jsonify
from database import get_db
from models.habit import get_all_habits
from models.finance import get_summary
from models.learning import get_learning_stats
from models.study import get_study_stats
from models.journal import get_journal_stats
from models.bookmark import get_bookmark_stats

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("", methods=["GET"])
def get_dashboard():
    """
    GET /api/dashboard
    Returns combined summary data from all modules.
    """
    db = get_db()

    # --- Habits Summary ---
    habits = get_all_habits(db)
    total_habits = len(habits)
    completed_today = sum(1 for h in habits if h["done_today"])
    streaks = [
        {"habit_id": h["id"], "name": h["name"], "current_streak": h["current_streak"]}
        for h in habits
    ]

    # --- Finance Summary (current week) ---
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    summary = get_summary(db, monday.isoformat(), sunday.isoformat())

    # Today's expenses
    row = db.execute(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date = ?",
        (today.isoformat(),)
    ).fetchone()
    today_expense = row["total"]

    # Top spending category this week
    top_category = ""
    if summary["by_category"]:
        top_category = max(summary["by_category"], key=summary["by_category"].get)

    # --- Experiments Summary (Phase 2) ---
    active_experiments = db.execute(
        "SELECT COUNT(*) as count FROM experiments WHERE status = 'active'"
    ).fetchone()["count"]

    # --- Learning Summary (Phase 2) ---
    learning_stats = get_learning_stats(db)

    # --- Study Summary (Phase 3) ---
    study_stats = get_study_stats(db)

    # --- Ideas Summary (Phase 3) ---
    saved_ideas_count = db.execute(
        "SELECT COUNT(*) as count FROM saved_ideas"
    ).fetchone()["count"]

    # --- Journal Summary (Phase 4) ---
    journal_stats = get_journal_stats(db)

    # --- Bookmarks Summary (Phase 4) ---
    bookmark_stats = get_bookmark_stats(db)

    db.close()

    return jsonify({
        "habits_summary": {
            "total_habits": total_habits,
            "completed_today": completed_today,
            "streaks": streaks,
        },
        "finance_summary": {
            "this_week_income": summary["total_income"],
            "this_week_expense": summary["total_expense"],
            "today_expense": today_expense,
            "top_category": top_category,
            "budget_tip": summary["budget_tip"],
        },
        "experiments_summary": {
            "active_count": active_experiments,
        },
        "learning_summary": learning_stats,
        "study_summary": study_stats,
        "ideas_summary": {
            "saved_count": saved_ideas_count,
        },
        "journal_summary": journal_stats,
        "bookmark_summary": bookmark_stats,
    })
