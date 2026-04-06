/**
 * LearningForm — form to add a new learning item (course, book, or skill).
 */
import { useState } from 'react';
import { apiPost } from '../../api/client';

export default function LearningForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    type: 'course',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);
    try {
      await apiPost('/learning', {
        ...form,
        title: form.title.trim(),
        notes: form.notes.trim(),
      });
      setForm({ title: '', type: 'course', notes: '' });
      onCreated();
    } catch (err) {
      console.error('Failed to add learning item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        placeholder="What are you learning? (e.g., React, Python book...)"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />

      {/* Type selector */}
      <div className="flex gap-2">
        {[
          { value: 'course', label: '📚 Course', },
          { value: 'book', label: '📖 Book' },
          { value: 'skill', label: '🛠️ Skill' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setForm((p) => ({ ...p, type: opt.value }))}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              form.type === opt.value
                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <textarea
        value={form.notes}
        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        placeholder="Notes (optional) — link, author, platform..."
        rows={2}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />

      <button
        type="submit"
        disabled={loading || !form.title.trim()}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Adding...' : '+ Add Learning Item'}
      </button>
    </form>
  );
}
