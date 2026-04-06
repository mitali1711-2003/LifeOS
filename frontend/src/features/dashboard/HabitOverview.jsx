/**
 * HabitOverview — habit streaks with dark theme.
 */
import Card from '../../components/Card';
import StreakBadge from '../habits/StreakBadge';

export default function HabitOverview({ data }) {
  if (!data) return null;

  return (
    <Card title="Habit Streaks">
      {data.streaks.length === 0 ? (
        <p className="text-gray-500 text-sm">No habits tracked yet.</p>
      ) : (
        <div className="space-y-3">
          {data.streaks.map((habit) => (
            <div key={habit.habit_id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
              <span className="text-sm text-gray-300">{habit.name}</span>
              <StreakBadge streak={habit.current_streak} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
