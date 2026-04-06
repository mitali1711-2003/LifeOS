/**
 * HabitCalendar — a calendar heatmap showing which days a habit was completed.
 * Green cells = habit done, gray cells = not done.
 * Has month navigation arrows to browse history.
 */
import { useState, useEffect } from 'react';
import { apiGet } from '../../api/client';
import Card from '../../components/Card';

export default function HabitCalendar({ habitId, habitName }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start with current month in "YYYY-MM" format
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loggedDates, setLoggedDates] = useState([]);

  // Fetch logs whenever the habit or month changes
  useEffect(() => {
    if (!habitId) return;

    apiGet(`/habits/${habitId}/logs?month=${currentMonth}`)
      .then((data) => setLoggedDates(data.dates))
      .catch((err) => console.error('Failed to fetch logs:', err));
  }, [habitId, currentMonth]);

  // Navigate to previous/next month
  const changeMonth = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  };

  // Generate all days in the current month
  const getDaysInMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun, 1=Mon...

    // Convert to Monday-start (0=Mon, 6=Sun)
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days = [];
    // Add empty cells for days before the 1st
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    // Add actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonth}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        date: dateStr,
        logged: loggedDates.includes(dateStr),
      });
    }
    return days;
  };

  // Format month name for display (e.g., "April 2026")
  const getMonthName = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const days = getDaysInMonth();
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card title={`Calendar: ${habitName}`}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          ← Prev
        </button>
        <span className="text-sm font-medium text-gray-700">{getMonthName()}</span>
        <button
          onClick={() => changeMonth(1)}
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Next →
        </button>
      </div>

      {/* Day labels (Mon-Sun) */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((label) => (
          <div key={label} className="text-center text-xs text-gray-400 py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayInfo, idx) => (
          <div
            key={idx}
            className={`aspect-square flex items-center justify-center rounded-md text-xs ${
              dayInfo === null
                ? '' // Empty cell
                : dayInfo.logged
                ? 'bg-green-400 text-white font-medium'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {dayInfo?.day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-400"></div>
          Done
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100"></div>
          Not done
        </div>
      </div>
    </Card>
  );
}
