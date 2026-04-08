/**
 * Study Buddy Page — AI-powered study assistant.
 *
 * Has 3 views:
 * 1. List view — paste notes, see all notes, generate flashcards
 * 2. Flashcard view — review flashcards with flip animation
 * 3. Quiz view — take an MCQ quiz
 */
import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import Card from '../components/Card';
import NotesInput from '../features/study/NotesInput';
import NotesList from '../features/study/NotesList';
import FlashcardViewer from '../features/study/FlashcardViewer';
import QuizPlayer from '../features/study/QuizPlayer';

export default function StudyBuddy() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'flashcards' | 'quiz'
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchNotes = async () => {
    try {
      const [notesData, statsData] = await Promise.all([
        apiGet('/study/notes'),
        apiGet('/study/stats'),
      ]);
      setNotes(notesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch study data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // View flashcards for a specific note
  const handleViewCards = async (noteId) => {
    try {
      const cards = await apiGet(`/study/flashcards?note_id=${noteId}`);
      setFlashcards(cards);
      setActiveNoteId(noteId);
      setView('flashcards');
    } catch (err) {
      console.error('Failed to fetch flashcards:', err);
    }
  };

  // Start quiz for a specific note
  const handleStartQuiz = (noteId) => {
    setActiveNoteId(noteId);
    setView('quiz');
  };

  // Go back to list
  const handleBack = () => {
    setView('list');
    setActiveNoteId(null);
    fetchNotes(); // Refresh stats
  };

  // Flashcard review view
  if (view === 'flashcards') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📇 Flashcard Review</h2>
        <button
          onClick={handleBack}
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-1"
        >
          ← Back to Study Buddy
        </button>
        <FlashcardViewer flashcards={flashcards} onDone={handleBack} />
      </div>
    );
  }

  // Quiz view
  if (view === 'quiz') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Quiz Time</h2>
        <button
          onClick={handleBack}
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-1"
        >
          ← Back to Study Buddy
        </button>
        <QuizPlayer noteId={activeNoteId} onDone={handleBack} />
      </div>
    );
  }

  // Default: List view
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Study Buddy</h2>
      <p className="text-sm text-gray-500 mb-6">
        Paste your notes → AI generates flashcards and quizzes
      </p>

      {/* Stats bar */}
      {stats && stats.total_notes > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <p className="text-lg font-bold text-indigo-600">{stats.total_notes}</p>
            <p className="text-xs text-gray-500">Notes</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-lg font-bold text-amber-600">{stats.total_flashcards}</p>
            <p className="text-xs text-gray-500">Flashcards</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">{stats.total_quizzes}</p>
            <p className="text-xs text-gray-500">Quizzes</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-lg font-bold text-purple-600">{stats.avg_score}%</p>
            <p className="text-xs text-gray-500">Avg Score</p>
          </div>
        </div>
      )}

      {/* Due for review reminder */}
      {stats && stats.due_for_review > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-sm text-amber-700">
            ⏰ {stats.due_for_review} flashcard{stats.due_for_review !== 1 ? 's' : ''} due for review!
          </span>
          <button
            onClick={async () => {
              const cards = await apiGet('/study/flashcards?due_only=true');
              setFlashcards(cards);
              setView('flashcards');
            }}
            className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
          >
            Review Now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes input */}
        <Card title="Add Study Notes">
          <NotesInput onSaved={fetchNotes} />
        </Card>

        {/* Notes list */}
        <Card title="Your Notes" className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <NotesList
              notes={notes}
              onRefresh={fetchNotes}
              onViewCards={handleViewCards}
              onStartQuiz={handleStartQuiz}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
