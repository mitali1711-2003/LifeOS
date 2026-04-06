/**
 * NotesList — shows all saved study notes with options to
 * generate flashcards, take a quiz, or delete.
 */
import { useState } from 'react';
import { apiPost, apiDelete } from '../../api/client';

export default function NotesList({ notes, onRefresh, onViewCards, onStartQuiz }) {
  const [generatingId, setGeneratingId] = useState(null);

  const handleGenerate = async (noteId) => {
    setGeneratingId(noteId);
    try {
      await apiPost(`/study/notes/${noteId}/generate`, { count: 5 });
      onRefresh();
    } catch (err) {
      console.error('Failed to generate flashcards:', err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note and all its flashcards/quizzes?')) return;
    try {
      await apiDelete(`/study/notes/${noteId}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📝</p>
        <p className="text-sm">No study notes yet. Paste some notes above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note.id} className="p-4 border border-gray-100 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">{note.title}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{note.content}</p>
            </div>
            <button
              onClick={() => handleDelete(note.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 text-xs text-gray-500 mb-3">
            <span>📇 {note.flashcard_count} flashcards</span>
            <span>📝 {note.quiz_count} quizzes</span>
            {note.best_score !== null && (
              <span className="text-green-600">🏆 Best: {note.best_score}%</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleGenerate(note.id)}
              disabled={generatingId === note.id}
              className="flex-1 py-1.5 px-3 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
            >
              {generatingId === note.id ? '🔄 Generating...' : '🤖 Generate Flashcards'}
            </button>
            <button
              onClick={() => onViewCards(note.id)}
              disabled={note.flashcard_count === 0}
              className="flex-1 py-1.5 px-3 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 disabled:opacity-50 transition-colors"
            >
              📇 Review Cards
            </button>
            <button
              onClick={() => onStartQuiz(note.id)}
              className="flex-1 py-1.5 px-3 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              📝 Take Quiz
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
