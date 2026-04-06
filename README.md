# LifeOS — AI-Powered Personal Life Management App

<div align="center">

**Your all-in-one personal command center.**

Track habits, manage finances, run life experiments, learn smarter with AI, journal your thoughts, organize bookmarks, and train your brain — all in one beautiful dark-themed dashboard.

[![Tech Stack](https://img.shields.io/badge/Frontend-React%20+%20Tailwind-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Flask%20+%20SQLite-green?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com)
[![AI](https://img.shields.io/badge/AI-NLP%20Engine-purple?style=for-the-badge&logo=openai)](/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## Features (10 Modules)

### Phase 1 — Core
| Module | Description |
|--------|-------------|
| **Habit Tracker** | Add habits, daily check-in, streak tracking, calendar heatmap |
| **Finance Tracker** | Income/expenses, categorization, weekly charts, budget tips |
| **Dashboard** | Unified overview of all modules with animated stats |

### Phase 2 — Tracking
| Module | Description |
|--------|-------------|
| **Life Experiments** | Create experiments (e.g., "No caffeine"), log daily mood/focus/productivity, view trend charts |
| **Learning Tracker** | Track courses/books/skills, progress bars, filter by status |

### Phase 3 — AI Features
| Module | Description |
|--------|-------------|
| **AI Study Buddy** | Paste notes → AI generates flashcards & MCQs. Spaced repetition scheduling. Quiz scoring. |
| **Idea Generator** | AI generates startup ideas, creative ideas, and personal challenges. Save favorites. |

### Phase 4 — Advanced AI
| Module | Description |
|--------|-------------|
| **Voice Journal** | Record voice (Web Speech API) → text. AI analyzes mood (positive/negative/neutral) and generates summaries. Mood trend chart. |
| **Smart Bookmarks** | Save URLs → AI auto-fetches title, categorizes (Tech, Finance, Education, etc.), keyword search. |

### Bonus
| Module | Description |
|--------|-------------|
| **Brain Games** | 4 mini-games: Memory Match, Reaction Speed, Typing Speed Test, Focus Breathing Exercise. Best scores saved locally. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Tailwind CSS, Recharts, React Router |
| **Backend** | Python Flask, Flask-CORS |
| **Database** | SQLite (zero setup) |
| **AI/NLP** | Custom NLP engine — sentiment analysis, text summarization, keyword extraction, auto-categorization |
| **Speech** | Browser Web Speech API (Chrome/Edge) |
| **Build Tool** | Vite |

---

## Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 18+**
- **npm**

### 1. Clone the repo
```bash
git clone https://github.com/mitali1711-2003/LifeOS.git
cd LifeOS
```

### 2. Start the backend
```bash
cd backend
pip install -r requirements.txt
python3 app.py
```
Backend runs at `http://localhost:5002`

### 3. Start the frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

### 4. Open in browser
```
http://localhost:3000
```

> **Or** use the startup script (starts both):
> ```bash
> chmod +x start.sh
> ./start.sh
> ```

---

## Project Structure

```
LifeOS/
├── backend/
│   ├── app.py                  # Flask entry point
│   ├── config.py               # Configuration
│   ├── database.py             # SQLite setup (12 tables)
│   ├── models/                 # Data access layer
│   │   ├── habit.py            # Habits + streak calculation
│   │   ├── finance.py          # Transactions + budget tips
│   │   ├── experiment.py       # Experiments + daily logs
│   │   ├── learning.py         # Learning items + progress
│   │   ├── study.py            # Study notes + flashcards + quizzes
│   │   ├── idea.py             # Idea generation + bookmarks
│   │   ├── journal.py          # Journal entries + mood analysis
│   │   └── bookmark.py         # Bookmarks + auto-categorization
│   ├── routes/                 # REST API endpoints
│   │   ├── habit_routes.py
│   │   ├── finance_routes.py
│   │   ├── dashboard_routes.py
│   │   ├── experiment_routes.py
│   │   ├── learning_routes.py
│   │   ├── study_routes.py
│   │   ├── idea_routes.py
│   │   ├── journal_routes.py
│   │   └── bookmark_routes.py
│   ├── services/               # AI/NLP services
│   │   ├── ai_engine.py        # Flashcard + MCQ + idea generation
│   │   └── nlp_engine.py       # Sentiment analysis + summarization + search
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── api/client.js       # API fetch wrapper
│       ├── components/         # Shared UI components
│       │   ├── Card.jsx        # Glassmorphism card
│       │   ├── Layout.jsx      # App shell with particles
│       │   ├── Sidebar.jsx     # Navigation sidebar
│       │   └── animated/       # 3D animated components
│       │       ├── RotatingCube.jsx
│       │       ├── OrbitRings.jsx
│       │       ├── ParticleField.jsx
│       │       ├── AnimatedCounter.jsx
│       │       ├── ProgressRing.jsx
│       │       ├── DNAHelix.jsx
│       │       └── GlowingCard.jsx
│       ├── features/           # Feature components
│       │   ├── habits/
│       │   ├── finance/
│       │   ├── experiments/
│       │   ├── learning/
│       │   ├── study/
│       │   ├── journal/
│       │   ├── bookmarks/
│       │   ├── dashboard/
│       │   └── games/
│       ├── pages/              # Page components (10 pages)
│       └── index.css           # Global styles + animations
│
└── start.sh                    # One-command startup script
```

---

## API Endpoints

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | List all habits with streaks |
| POST | `/api/habits` | Create a habit |
| DELETE | `/api/habits/:id` | Delete a habit |
| POST | `/api/habits/:id/log` | Toggle daily check-in |
| GET | `/api/habits/:id/logs` | Get log dates for calendar |

### Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance/transactions` | List transactions |
| POST | `/api/finance/transactions` | Add transaction |
| DELETE | `/api/finance/transactions/:id` | Delete transaction |
| GET | `/api/finance/summary` | Weekly summary + budget tip |

### Experiments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiments` | List experiments with stats |
| POST | `/api/experiments` | Create experiment |
| GET | `/api/experiments/:id` | Get detail + logs |
| DELETE | `/api/experiments/:id` | Delete experiment |
| POST | `/api/experiments/:id/logs` | Add daily log |

### Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/learning` | List items (filterable) |
| POST | `/api/learning` | Add learning item |
| PUT | `/api/learning/:id` | Update progress |
| DELETE | `/api/learning/:id` | Delete item |

### AI Study Buddy
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/study/notes` | Save study notes |
| GET | `/api/study/notes` | List notes with stats |
| POST | `/api/study/notes/:id/generate` | AI generate flashcards |
| POST | `/api/study/notes/:id/quiz` | AI generate MCQ quiz |
| GET | `/api/study/flashcards` | Get flashcards |
| POST | `/api/study/flashcards/:id/review` | Record review (spaced repetition) |
| POST | `/api/study/quiz/submit` | Submit quiz score |

### Ideas
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ideas/generate` | Generate 3 fresh ideas |
| POST | `/api/ideas/save` | Bookmark an idea |
| GET | `/api/ideas/saved` | List saved ideas |

### Voice Journal
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/journal` | Save entry (AI mood + summary) |
| GET | `/api/journal` | List entries |
| GET | `/api/journal/moods` | Mood history for chart |
| POST | `/api/journal/analyze` | Preview mood analysis |

### Smart Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookmarks` | Save URL (AI categorizes) |
| GET | `/api/bookmarks` | List (filter by category) |
| GET | `/api/bookmarks/search?q=` | Keyword search |
| GET | `/api/bookmarks/categories` | Category counts |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated stats from all modules |

---

## How the AI Works (No API Key Needed)

The AI features run **100% locally** using custom NLP algorithms:

### Flashcard Generation
1. Splits notes into sentences
2. Detects definition patterns (`"X is Y"`) → creates `"What is X?"` cards
3. Extracts key terms → creates fill-in-the-blank cards

### MCQ Generation
1. Extracts key facts from sentences
2. Creates questions from each fact
3. Generates plausible wrong answers (distractors) from other terms

### Mood Analysis
1. Scores 100+ emotion words (positive: "happy" +2, "amazing" +3; negative: "sad" -2, "terrible" -3)
2. Handles negation ("not happy" flips the score)
3. Normalizes to -1.0 (very sad) to +1.0 (very happy)

### Text Summarization
1. Counts word frequencies across all sentences
2. Scores each sentence by importance (word frequency / length)
3. Picks top N highest-scoring sentences in original order

### Bookmark Categorization
1. Matches URL + title + description against 8 keyword lists
2. Categories: Technology, Education, Finance, News, Health, Entertainment, Productivity, Social

### Upgrading to OpenAI
Set `OPENAI_API_KEY` in your environment and change `USE_OPENAI = True` in `services/ai_engine.py`.

---

## Database Schema

12 SQLite tables, zero setup required:

| Table | Module | Key Columns |
|-------|--------|-------------|
| `habits` | Habit Tracker | name, created_at |
| `habit_logs` | Habit Tracker | habit_id, date |
| `transactions` | Finance | type, category, amount, date |
| `experiments` | Experiments | title, start_date, end_date, status |
| `experiment_logs` | Experiments | mood, productivity, focus, notes |
| `learning_items` | Learning | title, type, progress, status |
| `study_notes` | Study Buddy | title, content |
| `flashcards` | Study Buddy | question, answer, next_review |
| `quiz_results` | Study Buddy | score_percent, taken_at |
| `saved_ideas` | Ideas | type, content |
| `journal_entries` | Journal | transcript, mood, summary |
| `bookmarks` | Bookmarks | url, title, category, tags |

---

## UI Design

- **Dark theme** with deep navy background
- **Glassmorphism** cards with subtle blur
- **3D rotating cube** on loading screen and hero section
- **Orbit rings** animation (atom-like spinning dots)
- **Floating particles** drifting upward across the app
- **DNA helix** decorative animation
- **Animated progress rings** (SVG circular indicators)
- **Animated counters** that count up from zero
- **Gradient text** headings with glow effects

---

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel
```

### Backend (Render)
1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python app.py`
5. Set the port to `5002`

---

## Built With

- Built as a learning project by a BCA student
- AI assistance by [Claude Code](https://claude.ai/claude-code)

---

## License

MIT License — free to use, modify, and distribute.
