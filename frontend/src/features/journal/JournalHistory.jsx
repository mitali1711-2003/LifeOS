/**
 * JournalHistory — displays past journal entries with mood and summaries.
 */
import { apiDelete } from '../../api/client';
import MoodBadge from './MoodBadge';

export default function JournalHistory({ entries, onRefresh }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await apiDelete(`/journal/${id}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">🎙️</p>
        <p className="text-sm">No journal entries yet. Record your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="p-4 border border-gray-100 rounded-lg">
          {/* Header: date + mood + delete */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">{entry.date}</span>
              <MoodBadge mood={entry.mood} />
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Summary */}
          {entry.summary && (
            <p className="text-sm text-gray-700 mb-2 font-medium">
              {entry.summary}
            </p>
          )}

          {/* Full transcript (collapsible) */}
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">
              Show full transcript
            </summary>
            <p className="mt-2 p-2 bg-gray-50 rounded">{entry.transcript}</p>
          </details>
        </div>
      ))}
    </div>
  );
}
