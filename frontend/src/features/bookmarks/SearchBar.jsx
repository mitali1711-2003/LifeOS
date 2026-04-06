/**
 * SearchBar — search input for finding bookmarks.
 * Uses debouncing to avoid calling the API on every keystroke.
 */
import { useState, useEffect, useRef } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const timerRef = useRef(null);

  // Debounce: wait 300ms after user stops typing before searching
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search bookmarks (e.g., python tutorial, finance...)"
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); onSearch(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
