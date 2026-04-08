/**
 * Learning Page — main page for the Learning Progress Tracker.
 * Shows a form to add items, a list with progress sliders,
 * filter by status, and a progress chart.
 */
import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../api/client';
import Card from '../components/Card';
import LearningForm from '../features/learning/LearningForm';
import LearningList from '../features/learning/LearningList';
import LearningChart from '../features/learning/LearningChart';

// Helper to call PUT (apiPost doesn't support PUT, so we add a small helper)
async function apiPut(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed`);
  return res.json();
}

export default function Learning() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchItems = async () => {
    try {
      const url = statusFilter === 'all'
        ? '/learning'
        : `/learning?status=${statusFilter}`;
      const data = await apiGet(url);
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch learning items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filter changes
  useEffect(() => {
    fetchItems();
  }, [statusFilter]);

  // Update a learning item's progress
  const handleUpdate = async (id, data) => {
    try {
      await apiPut(`/learning/${id}`, data);
      fetchItems(); // Refresh to get updated status
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  // Filter buttons
  const filters = [
    { value: 'all', label: 'All' },
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Learning Tracker</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Add learning item form */}
        <Card title="Add New Item">
          <LearningForm onCreated={fetchItems} />
        </Card>

        {/* Progress chart */}
        <div className="lg:col-span-2">
          <LearningChart items={items} />
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Learning items list */}
      <Card title="Your Learning Items">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <LearningList
            items={items}
            onUpdate={handleUpdate}
            onRefresh={fetchItems}
          />
        )}
      </Card>
    </div>
  );
}
