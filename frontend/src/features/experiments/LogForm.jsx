/**
 * LogForm — form to add a daily log entry for an experiment.
 * Has sliders for mood, productivity, focus (1-5) and a notes field.
 */
import { useState } from 'react';
import { apiPost } from '../../api/client';

// Labels for the 1-5 scale
const SCALE_LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Very High' };

function ScoreSlider({ label, emoji, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs text-gray-600 font-medium">
          {emoji} {label}
        </label>
        <span className="text-xs text-indigo-600 font-medium">
          {value} — {SCALE_LABELS[value]}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );
}

export default function LogForm({ experimentId, onLogged }) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: today,
    mood: 3,
    productivity: 3,
    focus: 3,
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost(`/experiments/${experimentId}/logs`, form);
      setForm({ date: today, mood: 3, productivity: 3, focus: 3, notes: '' });
      onLogged();
    } catch (err) {
      console.error('Failed to add log:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <ScoreSlider
        label="Mood" emoji="😊"
        value={form.mood}
        onChange={(v) => setForm((p) => ({ ...p, mood: v }))}
      />
      <ScoreSlider
        label="Productivity" emoji="⚡"
        value={form.productivity}
        onChange={(v) => setForm((p) => ({ ...p, productivity: v }))}
      />
      <ScoreSlider
        label="Focus" emoji="🎯"
        value={form.focus}
        onChange={(v) => setForm((p) => ({ ...p, focus: v }))}
      />

      <textarea
        value={form.notes}
        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        placeholder="How was your day? Any observations?"
        rows={2}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : 'Save Log Entry'}
      </button>
    </form>
  );
}
