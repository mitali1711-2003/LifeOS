/**
 * MoodChart — line chart showing mood trends over time.
 */
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Card from '../../components/Card';

export default function MoodChart({ moodHistory }) {
  if (!moodHistory || moodHistory.length < 2) return null;

  // Reverse to show oldest first (left to right)
  const data = [...moodHistory].reverse().map((d) => ({
    date: d.date.slice(5), // "04-06" format
    score: d.avg_score,
    entries: d.entries,
  }));

  return (
    <Card title="Mood Trends">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [value.toFixed(2), 'Mood Score']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          {/* Reference line at 0 (neutral) */}
          <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4, fill: '#6366f1' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-2">
        <span>😔 Negative</span>
        <span>😐 Neutral</span>
        <span>😊 Positive</span>
      </div>
    </Card>
  );
}
