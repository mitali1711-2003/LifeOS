/**
 * ExperimentList — shows all experiments as cards with their average scores.
 * Clicking a card opens the detail view.
 */
import { apiDelete } from '../../api/client';

// Map status to color badges
const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function ExperimentList({ experiments, onSelect, onRefresh }) {
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this experiment and all its logs?')) return;
    try {
      await apiDelete(`/experiments/${id}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete experiment:', err);
    }
  };

  if (experiments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">🧪</p>
        <p className="text-sm">No experiments yet. Create one to start!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {experiments.map((exp) => (
        <div
          key={exp.id}
          onClick={() => onSelect(exp.id)}
          className="p-4 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">{exp.title}</h4>
              {exp.description && (
                <p className="text-xs text-gray-500 mt-0.5">{exp.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[exp.status]}`}>
                {exp.status}
              </span>
              <button
                onClick={(e) => handleDelete(e, exp.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Date range */}
          <p className="text-xs text-gray-400 mb-2">
            {exp.start_date} → {exp.end_date}
          </p>

          {/* Average scores */}
          {exp.stats.total_logs > 0 ? (
            <div className="flex gap-4 text-xs">
              <span className="text-amber-600">😊 Mood: {exp.stats.avg_mood}</span>
              <span className="text-blue-600">⚡ Productivity: {exp.stats.avg_productivity}</span>
              <span className="text-purple-600">🎯 Focus: {exp.stats.avg_focus}</span>
              <span className="text-gray-400">({exp.stats.total_logs} logs)</span>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No logs yet — click to add one</p>
          )}
        </div>
      ))}
    </div>
  );
}
