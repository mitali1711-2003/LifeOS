/**
 * BookmarkList — displays bookmarks as cards with category badges and tags.
 */
import { apiDelete } from '../../api/client';

// Color mapping for categories
const CATEGORY_COLORS = {
  Technology: 'bg-blue-100 text-blue-700',
  Education: 'bg-purple-100 text-purple-700',
  Finance: 'bg-green-100 text-green-700',
  News: 'bg-red-100 text-red-700',
  Health: 'bg-emerald-100 text-emerald-700',
  Entertainment: 'bg-pink-100 text-pink-700',
  Productivity: 'bg-amber-100 text-amber-700',
  Social: 'bg-cyan-100 text-cyan-700',
  Other: 'bg-gray-100 text-gray-600',
};

export default function BookmarkList({ bookmarks, onRefresh }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bookmark?')) return;
    try {
      await apiDelete(`/bookmarks/${id}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">🔖</p>
        <p className="text-sm">No bookmarks yet. Save a URL above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bm) => (
        <div key={bm.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Title (clickable link) */}
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline block truncate"
              >
                {bm.title}
              </a>
              {/* URL */}
              <p className="text-xs text-gray-400 truncate mt-0.5">{bm.url}</p>
              {/* Description */}
              {bm.description && (
                <p className="text-xs text-gray-500 mt-1">{bm.description}</p>
              )}
              {/* Tags + Category */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[bm.category] || CATEGORY_COLORS.Other}`}>
                  {bm.category}
                </span>
                {bm.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleDelete(bm.id)}
              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
