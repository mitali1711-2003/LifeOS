/**
 * LearningChart — visualizes learning progress as a bar chart.
 * Each bar represents one learning item, colored by status.
 */
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../../components/Card';

// Colors by status
const STATUS_COLORS = {
  not_started: '#d1d5db',
  in_progress: '#6366f1',
  completed: '#10b981',
};

export default function LearningChart({ items }) {
  if (items.length === 0) return null;

  // Prepare chart data
  const chartData = items.map((item) => ({
    name: item.title.length > 15 ? item.title.slice(0, 15) + '...' : item.title,
    progress: item.progress,
    status: item.status,
  }));

  // Summary stats
  const total = items.length;
  const completed = items.filter((i) => i.status === 'completed').length;
  const inProgress = items.filter((i) => i.status === 'in_progress').length;
  const notStarted = items.filter((i) => i.status === 'not_started').length;

  return (
    <Card title="Progress Overview">
      {/* Status counts */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-bold text-gray-500">{notStarted}</p>
          <p className="text-xs text-gray-400">Not Started</p>
        </div>
        <div className="text-center p-2 bg-indigo-50 rounded-lg">
          <p className="text-lg font-bold text-indigo-600">{inProgress}</p>
          <p className="text-xs text-indigo-400">In Progress</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-600">{completed}</p>
          <p className="text-xs text-green-400">Completed</p>
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={STATUS_COLORS[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
