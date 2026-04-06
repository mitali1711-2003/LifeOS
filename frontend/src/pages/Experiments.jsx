/**
 * Experiments Page — main page for the Life Experiment Tracker.
 *
 * Has two views:
 * 1. List view — shows all experiments + form to create new ones
 * 2. Detail view — shows a single experiment's logs and charts
 */
import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import Card from '../components/Card';
import ExperimentForm from '../features/experiments/ExperimentForm';
import ExperimentList from '../features/experiments/ExperimentList';
import ExperimentDetail from '../features/experiments/ExperimentDetail';

export default function Experiments() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null); // null = list view, number = detail view

  const fetchExperiments = async () => {
    try {
      const data = await apiGet('/experiments');
      setExperiments(data);
    } catch (err) {
      console.error('Failed to fetch experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  // If an experiment is selected, show its detail page
  if (selectedId !== null) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Life Experiments</h2>
        <ExperimentDetail
          experimentId={selectedId}
          onBack={() => {
            setSelectedId(null);
            fetchExperiments(); // Refresh list when coming back
          }}
        />
      </div>
    );
  }

  // Otherwise show the list view
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Life Experiments</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create experiment form */}
        <Card title="New Experiment">
          <ExperimentForm onCreated={fetchExperiments} />
        </Card>

        {/* Experiment list */}
        <Card title="Your Experiments" className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <ExperimentList
              experiments={experiments}
              onSelect={setSelectedId}
              onRefresh={fetchExperiments}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
