/**
 * ExperimentDetail — shows a single experiment's details, logs, and charts.
 * This is the "drill-down" view when you click an experiment.
 */
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiGet } from '../../api/client';
import Card from '../../components/Card';
import LogForm from './LogForm';

export default function ExperimentDetail({ experimentId, onBack }) {
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = () => {
    apiGet(`/experiments/${experimentId}`)
      .then((data) => setExperiment(data))
      .catch((err) => console.error('Failed to load experiment:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [experimentId]);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (!experiment) return <p className="text-red-500 text-sm">Experiment not found.</p>;

  // Prepare chart data (logs sorted by date ascending)
  const chartData = [...experiment.logs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date.slice(5), // Show "04-06" instead of "2026-04-06"
      Mood: log.mood,
      Productivity: log.productivity,
      Focus: log.focus,
    }));

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-1"
      >
        ← Back to experiments
      </button>

      {/* Experiment header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">{experiment.title}</h3>
        {experiment.description && (
          <p className="text-sm text-gray-500 mt-1">{experiment.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {experiment.start_date} → {experiment.end_date}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Add Log Form */}
        <Card title="Add Daily Log">
          <LogForm experimentId={experimentId} onLogged={fetchDetail} />
        </Card>

        {/* Average Scores */}
        <Card title="Summary">
          {experiment.stats.total_logs > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <ScoreStat label="Avg Mood" emoji="😊" value={experiment.stats.avg_mood} color="amber" />
                <ScoreStat label="Avg Productivity" emoji="⚡" value={experiment.stats.avg_productivity} color="blue" />
                <ScoreStat label="Avg Focus" emoji="🎯" value={experiment.stats.avg_focus} color="purple" />
              </div>
              <p className="text-xs text-gray-400 text-center">
                Based on {experiment.stats.total_logs} log{experiment.stats.total_logs !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">
              No logs yet. Add your first entry!
            </p>
          )}
        </Card>
      </div>

      {/* Trend chart */}
      {chartData.length >= 2 && (
        <Card title="Trends Over Time" className="mb-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Mood" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Productivity" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Focus" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Log history */}
      <Card title="Log History">
        {experiment.logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No logs yet.</p>
        ) : (
          <div className="space-y-2">
            {experiment.logs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{log.date}</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-amber-600">😊 {log.mood}</span>
                    <span className="text-blue-600">⚡ {log.productivity}</span>
                    <span className="text-purple-600">🎯 {log.focus}</span>
                  </div>
                </div>
                {log.notes && <p className="text-xs text-gray-500">{log.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/** Small stat card for average scores */
function ScoreStat({ label, emoji, value, color }) {
  const bgColor = {
    amber: 'bg-amber-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
  }[color];
  const textColor = {
    amber: 'text-amber-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
  }[color];

  return (
    <div className={`text-center p-3 rounded-lg ${bgColor}`}>
      <p className="text-lg mb-0.5">{emoji}</p>
      <p className={`text-xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
