"""
Database setup for LifeOS.
Handles connecting to SQLite and creating tables on first run.
"""
import sqlite3
from config import DATABASE_PATH


def get_db():
    """
    Create and return a database connection.
    row_factory = sqlite3.Row makes rows behave like dictionaries,
    so you can access columns by name (e.g., row["name"]).
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    # Enable foreign key support (SQLite has it off by default)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """
    Create all tables if they don't already exist.
    This runs once when the app starts.
    """
    conn = get_db()
    cursor = conn.cursor()

    # --- Habits table ---
    # Stores each habit the user wants to track
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (date('now'))
        )
    """)

    # --- Habit Logs table ---
    # One row per habit per day (marks that the habit was done that day)
    # UNIQUE constraint prevents checking in the same habit twice on one day
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
            UNIQUE(habit_id, date)
        )
    """)

    # --- Transactions table ---
    # Stores income and expense records
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            category TEXT NOT NULL,
            amount REAL NOT NULL CHECK(amount > 0),
            description TEXT DEFAULT '',
            date TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # --- Experiments table (Phase 2) ---
    # Stores life experiments like "No caffeine for 2 weeks"
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS experiments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # --- Experiment Logs table (Phase 2) ---
    # Daily entries for an experiment: mood, focus, productivity + notes
    # Each score is 1-5 scale
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS experiment_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            experiment_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            mood INTEGER NOT NULL CHECK(mood BETWEEN 1 AND 5),
            productivity INTEGER NOT NULL CHECK(productivity BETWEEN 1 AND 5),
            focus INTEGER NOT NULL CHECK(focus BETWEEN 1 AND 5),
            notes TEXT DEFAULT '',
            FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
            UNIQUE(experiment_id, date)
        )
    """)

    # --- Learning Items table (Phase 2) ---
    # Tracks courses, books, or skills being learned
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS learning_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('course', 'book', 'skill')),
            progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
            status TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'completed')),
            notes TEXT DEFAULT '',
            created_at TEXT NOT NULL DEFAULT (date('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # --- Study Notes table (Phase 3) ---
    # Stores the raw notes that the user pastes in
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS study_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # --- Flashcards table (Phase 3) ---
    # AI-generated flashcards linked to a study note
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            times_reviewed INTEGER NOT NULL DEFAULT 0,
            times_correct INTEGER NOT NULL DEFAULT 0,
            next_review TEXT DEFAULT NULL,
            FOREIGN KEY (note_id) REFERENCES study_notes(id) ON DELETE CASCADE
        )
    """)

    # --- Quiz Results table (Phase 3) ---
    # Tracks quiz attempts: which note, score, date
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            correct_answers INTEGER NOT NULL,
            score_percent REAL NOT NULL,
            taken_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (note_id) REFERENCES study_notes(id) ON DELETE CASCADE
        )
    """)

    # --- Saved Ideas table (Phase 3) ---
    # Stores bookmarked ideas from the idea generator
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS saved_ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL CHECK(type IN ('startup', 'creative', 'challenge')),
            content TEXT NOT NULL,
            saved_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # --- Journal Entries table (Phase 4) ---
    # Stores voice journal entries with transcript, mood, and summary
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transcript TEXT NOT NULL,
            mood TEXT NOT NULL DEFAULT 'neutral',
            mood_score REAL NOT NULL DEFAULT 0.0,
            mood_emoji TEXT NOT NULL DEFAULT '😐',
            mood_label TEXT NOT NULL DEFAULT 'Neutral',
            summary TEXT DEFAULT '',
            date TEXT NOT NULL DEFAULT (date('now')),
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # --- Bookmarks table (Phase 4) ---
    # Stores smart bookmarks with auto-categorization
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            category TEXT NOT NULL DEFAULT 'Other',
            tags TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialized successfully!")
