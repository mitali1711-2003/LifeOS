/**
 * Journal Page — Voice Journal with mood analysis.
 *
 * Features:
 * - Record voice → converts to text using browser's Web Speech API
 * - Or type directly
 * - AI analyzes mood (positive/negative/neutral) and generates summary
 * - View past entries with mood badges
 * - Mood trend chart over time
 */
import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import Card from '../components/Card';
import VoiceRecorder from '../features/journal/VoiceRecorder';
import JournalHistory from '../features/journal/JournalHistory';
import MoodChart from '../features/journal/MoodChart';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [entriesData, moodsData] = await Promise.all([
        apiGet('/journal'),
        apiGet('/journal/moods'),
      ]);
      setEntries(entriesData);
      setMoodHistory(moodsData);
    } catch (err) {
      console.error('Failed to fetch journal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Voice Journal</h2>
      <p className="text-sm text-gray-500 mb-6">
        Speak or type your thoughts — AI analyzes your mood
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Voice recorder / text input */}
        <Card title="New Entry">
          <VoiceRecorder onSaved={fetchData} />
        </Card>

        {/* Mood chart */}
        <MoodChart moodHistory={moodHistory} />
      </div>

      {/* Journal history */}
      <Card title="Past Entries">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <JournalHistory entries={entries} onRefresh={fetchData} />
        )}
      </Card>
    </div>
  );
}
