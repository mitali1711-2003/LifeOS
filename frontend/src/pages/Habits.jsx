/**
 * Habits Page — the main page for the Habit Tracker feature.
 * Composes: HabitForm (add new), HabitList (view/check/delete), HabitCalendar (heatmap).
 */
import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import Card from '../components/Card';
import HabitForm from '../features/habits/HabitForm';
import HabitList from '../features/habits/HabitList';
import HabitCalendar from '../features/habits/HabitCalendar';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabitId, setSelectedHabitId] = useState(null);

  // Fetch all habits from the API
  const fetchHabits = async () => {
    try {
      const data = await apiGet('/habits');
      setHabits(data);
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load habits when the page first opens
  useEffect(() => {
    fetchHabits();
  }, []);

  // Find the selected habit's name (for the calendar title)
  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Habit Tracker</h2>

      {/* Add new habit form */}
      <Card className="mb-6">
        <HabitForm onHabitAdded={fetchHabits} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit list (left side) */}
        <Card title="Your Habits">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <HabitList
              habits={habits}
              onRefresh={fetchHabits}
              onSelectHabit={setSelectedHabitId}
              selectedHabitId={selectedHabitId}
            />
          )}
        </Card>

        {/* Calendar heatmap (right side — shows when a habit is selected) */}
        {selectedHabit ? (
          <HabitCalendar
            habitId={selectedHabit.id}
            habitName={selectedHabit.name}
          />
        ) : (
          <Card>
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-sm">Click on a habit to see its calendar</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
