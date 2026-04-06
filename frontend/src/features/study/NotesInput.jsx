/**
 * NotesInput — form where the user pastes their study notes.
 * After saving, they can generate flashcards or take a quiz.
 */
import { useState } from 'react';
import { apiPost } from '../../api/client';

export default function NotesInput({ onSaved }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await apiPost('/study/notes', {
        title: title.trim(),
        content: content.trim(),
      });
      setTitle('');
      setContent('');
      onSaved();
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Topic title (e.g., Photosynthesis, React Hooks...)"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your study notes here...&#10;&#10;Tip: The AI works best with clear sentences that define concepts. For example:&#10;• Photosynthesis is the process by which plants convert sunlight into food.&#10;• DNA stands for deoxyribonucleic acid."
        rows={8}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        required
      />
      <button
        type="submit"
        disabled={loading || !title.trim() || !content.trim()}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : '📝 Save Notes'}
      </button>
    </form>
  );
}
