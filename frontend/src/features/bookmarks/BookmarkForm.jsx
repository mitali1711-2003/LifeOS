/**
 * BookmarkForm — form to add a new bookmark.
 * Just paste a URL — AI auto-fetches the title and categorizes it.
 */
import { useState } from 'react';
import { apiPost } from '../../api/client';

export default function BookmarkForm({ onSaved }) {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      // Parse tags: "react, javascript" → ["react", "javascript"]
      const tagList = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      await apiPost('/bookmarks', {
        url: url.trim(),
        description: description.trim(),
        tags: tagList,
      });
      setUrl('');
      setDescription('');
      setTags('');
      onSaved();
    } catch (err) {
      console.error('Failed to save bookmark:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste URL here (e.g., https://react.dev)"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated, e.g., react, tutorial)"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? '🔄 Saving & Categorizing...' : '🔖 Save Bookmark'}
      </button>
    </form>
  );
}
