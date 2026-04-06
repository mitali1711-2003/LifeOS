/**
 * Ideas Page — Daily Idea Generator.
 *
 * Shows 3 AI-generated ideas (startup, creative, challenge).
 * User can refresh for new ideas and save/bookmark favorites.
 */
import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '../api/client';
import Card from '../components/Card';

// Styling for each idea type
const IDEA_STYLES = {
  startup: { icon: '🚀', label: 'Startup Idea', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  creative: { icon: '🎨', label: 'Creative Idea', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  challenge: { icon: '💪', label: 'Personal Challenge', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
};

export default function Ideas() {
  const [ideas, setIdeas] = useState(null);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // tracks which idea type is being saved

  // Generate fresh ideas
  const generateIdeas = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/ideas/generate');
      setIdeas(data);
    } catch (err) {
      console.error('Failed to generate ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved ideas
  const fetchSaved = async () => {
    try {
      const data = await apiGet('/ideas/saved');
      setSavedIdeas(data);
    } catch (err) {
      console.error('Failed to fetch saved ideas:', err);
    }
  };

  // Save an idea
  const handleSave = async (type, content) => {
    setSaving(type);
    try {
      await apiPost('/ideas/save', { type, content });
      fetchSaved();
    } catch (err) {
      console.error('Failed to save idea:', err);
    } finally {
      setSaving(null);
    }
  };

  // Delete a saved idea
  const handleDelete = async (id) => {
    try {
      await apiDelete(`/ideas/${id}`);
      fetchSaved();
    } catch (err) {
      console.error('Failed to delete idea:', err);
    }
  };

  // Load initial ideas and saved list
  useEffect(() => {
    generateIdeas();
    fetchSaved();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Idea Generator</h2>
      <p className="text-sm text-gray-500 mb-6">
        Fresh AI-generated ideas to spark your creativity
      </p>

      {/* Generate button */}
      <button
        onClick={generateIdeas}
        disabled={loading}
        className="mb-6 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? '🔄 Generating...' : '✨ Generate New Ideas'}
      </button>

      {/* Idea cards */}
      {ideas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(ideas).map(([type, content]) => {
            const style = IDEA_STYLES[type];
            return (
              <div
                key={type}
                className={`p-5 rounded-xl border-2 ${style.bg} ${style.border}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{style.icon}</span>
                  <span className={`text-xs font-semibold uppercase ${style.text}`}>
                    {style.label}
                  </span>
                </div>
                <p className={`text-sm font-medium ${style.text} mb-4`}>
                  {content}
                </p>
                <button
                  onClick={() => handleSave(type, content)}
                  disabled={saving === type}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${style.text} bg-white/70 hover:bg-white`}
                >
                  {saving === type ? 'Saving...' : '🔖 Save Idea'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Saved ideas */}
      <Card title="Saved Ideas">
        {savedIdeas.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-3">🔖</p>
            <p className="text-sm">No saved ideas yet. Generate some and bookmark your favorites!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedIdeas.map((idea) => {
              const style = IDEA_STYLES[idea.type];
              return (
                <div
                  key={idea.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <span className="text-lg">{style.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{idea.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {style.label} — saved {idea.saved_at.split('T')[0]}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
