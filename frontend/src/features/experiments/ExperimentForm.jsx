/**
 * ExperimentForm — form to create a new life experiment.
 * Fields: title, description, start date, end date.
 */
import { useState } from 'react';
import { apiPost } from '../../api/client';

export default function ExperimentForm({ onCreated }) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: today,
    end_date: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.end_date) return;

    setLoading(true);
    try {
      await apiPost('/experiments', {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setForm({ title: '', description: '', start_date: today, end_date: '' });
      onCreated();
    } catch (err) {
      console.error('Failed to create experiment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={form.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="Experiment title (e.g., No caffeine for 2 weeks)"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />

      <textarea
        value={form.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Description — what are you trying and why?"
        rows={2}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            min={form.start_date}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !form.title.trim() || !form.end_date}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Creating...' : '+ Start Experiment'}
      </button>
    </form>
  );
}
