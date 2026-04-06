/**
 * Bookmarks Page — Smart Bookmark Organizer.
 *
 * Features:
 * - Save URLs (AI auto-fetches title + categorizes)
 * - Search bookmarks by keyword
 * - Filter by category
 * - View bookmarks as cards with tags
 */
import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import Card from '../components/Card';
import BookmarkForm from '../features/bookmarks/BookmarkForm';
import BookmarkList from '../features/bookmarks/BookmarkList';
import SearchBar from '../features/bookmarks/SearchBar';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null); // null = all
  const [searchMode, setSearchMode] = useState(false);

  const fetchBookmarks = async (category = null) => {
    try {
      const url = category ? `/bookmarks?category=${category}` : '/bookmarks';
      const data = await apiGet(url);
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiGet('/bookmarks/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchMode(false);
      fetchBookmarks(activeCategory);
      return;
    }
    setSearchMode(true);
    try {
      const data = await apiGet(`/bookmarks/search?q=${encodeURIComponent(query)}`);
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to search:', err);
    }
  };

  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    setSearchMode(false);
    fetchBookmarks(category);
  };

  const handleRefresh = () => {
    fetchBookmarks(activeCategory);
    fetchCategories();
  };

  useEffect(() => {
    fetchBookmarks();
    fetchCategories();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Smart Bookmarks</h2>
      <p className="text-sm text-gray-500 mb-6">
        Save URLs — AI auto-categorizes and makes them searchable
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Add bookmark form */}
        <Card title="Add Bookmark">
          <BookmarkForm onSaved={handleRefresh} />
        </Card>

        {/* Categories overview */}
        <Card title="Categories" className="lg:col-span-2">
          {categories.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No bookmarks saved yet. Add your first one!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !activeCategory && !searchMode
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                All ({categories.reduce((s, c) => s + c.count, 0)})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleCategoryFilter(cat.category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat.category && !searchMode
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {cat.category} ({cat.count})
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Bookmark list */}
      <Card title={searchMode ? 'Search Results' : 'Your Bookmarks'}>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <BookmarkList bookmarks={bookmarks} onRefresh={handleRefresh} />
        )}
      </Card>
    </div>
  );
}
