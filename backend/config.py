"""
Configuration for LifeOS backend.
All settings are defined here so they're easy to find and change.
"""
import os

# Path to the SQLite database file (stored in the backend folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "lifeos.db")

# Flask debug mode — set to False in production
DEBUG = True
