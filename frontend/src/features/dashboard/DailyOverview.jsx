/**
 * DailyOverview — today's progress with modern dark theme.
 */
import Card from '../../components/Card';

export default function DailyOverview({ habits, finance }) {
  if (!habits || !finance) return null;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const habitPercent = habits.total_habits > 0
    ? Math.round((habits.completed_today / habits.total_habits) * 100)
    : 0;

  return (
    <Card title="Today's Overview">
      <p className="text-xs text-gray-500 mb-5">{today}</p>

      <div className="space-y-5">
        {/* Habits progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Habits Done</span>
            <span className="text-sm font-bold text-indigo-400 stat-number">
              {habits.completed_today} / {habits.total_habits}
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${habitPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Today's spending */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Today's Spending</span>
          <span className="text-sm font-bold text-red-400 stat-number">
            ₹{finance.today_expense.toFixed(0)}
          </span>
        </div>

        {/* Top category */}
        {finance.top_category && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Top Category</span>
            <span className="text-sm font-medium text-gray-300 capitalize">
              {finance.top_category}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
