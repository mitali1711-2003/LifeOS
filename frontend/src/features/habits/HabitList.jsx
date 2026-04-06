/**
 * HabitList — displays all habits with checkboxes, streaks, and delete buttons.
 * This is the main component on the Habits page.
 */
import { apiPost, apiDelete } from '../../api/client';
import StreakBadge from './StreakBadge';

export default function HabitList({ habits, onRefresh, onSelectHabit, selectedHabitId }) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);

  // Toggle a habit's check-in for today
  const handleToggle = async (habitId) => {
    try {
      await apiPost(`/habits/${habitId}/log`, { date: today });
      onRefresh(); // Refresh the list to update checkboxes and streaks
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  // Delete a habit
  const handleDelete = async (habitId) => {
    if (!window.confirm('Delete this habit and all its history?')) return;
    try {
      await apiDelete(`/habits/${habitId}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  // Show a friendly message when there are no habits yet
  if (habits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">🎯</p>
        <p className="text-sm">No habits yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {habits.map((habit) => (
        <div
          key={habit.id}
          onClick={() => onSelectHabit(habit.id)}
          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
            selectedHabitId === habit.id
              ? 'border-indigo-200 bg-indigo-50'
              : 'border-gray-100 hover:bg-gray-50'
          }`}
        >
          {/* Checkbox — marks the habit as done for today */}
          <input
            type="checkbox"
            checked={habit.done_today}
            onChange={(e) => {
              e.stopPropagation(); // Don't trigger the row click
              handleToggle(habit.id);
            }}
            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />

          {/* Habit name */}
          <span className={`flex-1 text-sm ${habit.done_today ? 'line-through text-gray-400' : 'text-gray-700'}`}>
            {habit.name}
          </span>

          {/* Streak badge */}
          <StreakBadge streak={habit.current_streak} />

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(habit.id);
            }}
            className="text-gray-300 hover:text-red-500 transition-colors"
            title="Delete habit"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
