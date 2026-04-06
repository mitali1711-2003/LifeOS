/**
 * LearningList — shows all learning items with progress bars and controls.
 * Users can update progress with a slider and delete items.
 */
import { useState } from 'react';
import { apiDelete } from '../../api/client';
import ProgressBar from './ProgressBar';

// Icons for each type
const TYPE_ICONS = { course: '📚', book: '📖', skill: '🛠️' };

// Status badge styles
const STATUS_STYLES = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function LearningList({ items, onUpdate, onRefresh }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this learning item?')) return;
    try {
      await apiDelete(`/learning/${id}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📚</p>
        <p className="text-sm">No learning items yet. Add one to start!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <LearningCard
          key={item.id}
          item={item}
          onUpdate={onUpdate}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </div>
  );
}

/** Individual learning item card with progress slider */
function LearningCard({ item, onUpdate, onDelete }) {
  const [progress, setProgress] = useState(item.progress);
  const [saving, setSaving] = useState(false);

  // Save progress when slider is released
  const handleProgressChange = async (newProgress) => {
    setProgress(newProgress);
    setSaving(true);
    try {
      await onUpdate(item.id, { progress: newProgress });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{TYPE_ICONS[item.type]}</span>
          <div>
            <h4 className="text-sm font-semibold text-gray-800">{item.title}</h4>
            {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[item.status]}`}>
            {STATUS_LABELS[item.status]}
          </span>
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar and slider */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium text-indigo-600">
            {progress}% {saving && '(saving...)'}
          </span>
        </div>
        <ProgressBar progress={progress} />
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value))}
          onMouseUp={() => handleProgressChange(progress)}
          onTouchEnd={() => handleProgressChange(progress)}
          className="w-full mt-1 h-1 appearance-none cursor-pointer accent-indigo-600"
        />
      </div>
    </div>
  );
}
