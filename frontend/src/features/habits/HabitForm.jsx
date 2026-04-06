/**
 * HabitForm — a simple form to add a new habit.
 * When submitted, it calls the API and then tells the parent to refresh the list.
 */
import { useState } from 'react';
import { apiPost } from '../../api/client';

export default function HabitForm({ onHabitAdded }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Don't submit if the input is empty
    if (!name.trim()) return;

    setLoading(true);
    try {
      await apiPost('/habits', { name: name.trim() });
      setName('');          // Clear the input
      onHabitAdded();       // Tell parent to refresh the habit list
    } catch (err) {
      console.error('Failed to add habit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Drink 2L water, Read 30 mins..."
        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Adding...' : '+ Add Habit'}
      </button>
    </form>
  );
}
