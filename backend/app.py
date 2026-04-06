"""
LifeOS Backend — Main Application File
This is the entry point. It creates the Flask app, registers all routes,
and starts the server.

To run: python3 app.py
The server will start at http://localhost:5000
"""
from flask import Flask
from flask_cors import CORS
from database import init_db
from routes.habit_routes import habit_bp
from routes.finance_routes import finance_bp
from routes.dashboard_routes import dashboard_bp
from routes.experiment_routes import experiment_bp
from routes.learning_routes import learning_bp
from routes.study_routes import study_bp
from routes.idea_routes import idea_bp
from routes.journal_routes import journal_bp
from routes.bookmark_routes import bookmark_bp

# Create the Flask app
app = Flask(__name__)

# Enable CORS so the React frontend (running on port 3000)
# can make requests to this backend (running on port 5000)
CORS(app)

# Register all route blueprints
# Each blueprint handles a different feature module
app.register_blueprint(habit_bp)        # /api/habits/*
app.register_blueprint(finance_bp)     # /api/finance/*
app.register_blueprint(dashboard_bp)   # /api/dashboard
app.register_blueprint(experiment_bp)  # /api/experiments/*
app.register_blueprint(learning_bp)    # /api/learning/*
app.register_blueprint(study_bp)       # /api/study/*
app.register_blueprint(idea_bp)        # /api/ideas/*
app.register_blueprint(journal_bp)     # /api/journal/*
app.register_blueprint(bookmark_bp)    # /api/bookmarks/*


@app.route("/")
def home():
    """Simple health check endpoint."""
    return {"message": "LifeOS API is running!", "version": "1.0.0"}


# Initialize the database when the app starts
# This creates tables if they don't exist yet
with app.app_context():
    init_db()


if __name__ == "__main__":
    # Start the development server
    # debug=True means it auto-reloads when you change code
    app.run(debug=True, port=5002)
