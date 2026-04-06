/**
 * VoiceRecorder — records voice using the browser's Web Speech API
 * and converts it to text in real-time.
 *
 * HOW IT WORKS:
 * The browser has a built-in speech recognition engine (works in Chrome/Edge).
 * When you click "Start Recording", it listens to your microphone and
 * converts your speech to text automatically. No server needed for this part!
 *
 * The text is then sent to the backend for mood analysis and saving.
 */
import { useState, useRef } from 'react';
import { apiPost } from '../../api/client';

export default function VoiceRecorder({ onSaved }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const recognitionRef = useRef(null);

  // Check if the browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  const startRecording = () => {
    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;       // Keep listening until stopped
    recognition.interimResults = true;    // Show text as you speak
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setAnalysis(null);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // Save the journal entry (backend analyzes mood + generates summary)
  const handleSave = async () => {
    if (!transcript.trim()) return;

    setSaving(true);
    try {
      const result = await apiPost('/journal', {
        transcript: transcript.trim(),
      });
      setAnalysis(result);
      setTranscript('');
      onSaved();
    } catch (err) {
      console.error('Failed to save journal entry:', err);
    } finally {
      setSaving(false);
    }
  };

  // Clear and start over
  const handleClear = () => {
    setTranscript('');
    setAnalysis(null);
  };

  return (
    <div className="space-y-4">
      {/* Browser support check */}
      {!isSupported && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Voice recording is not supported in this browser. Please use Chrome or Edge.
          You can still type your journal entry below.
        </div>
      )}

      {/* Record button */}
      <div className="flex gap-3">
        {isSupported && (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isRecording ? '⏹ Stop Recording' : '🎙️ Start Recording'}
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Listening...
          </div>
        )}
      </div>

      {/* Transcript area (editable) */}
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder={isSupported
          ? "Click 'Start Recording' and speak, or type here..."
          : "Type your journal entry here..."
        }
        rows={6}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !transcript.trim()}
          className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? '🔄 Analyzing & Saving...' : '💾 Save & Analyze Mood'}
        </button>
        {transcript && (
          <button
            onClick={handleClear}
            className="px-4 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Analysis result (shows after saving) */}
      {analysis && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-2">
          <p className="text-sm font-medium text-indigo-800">Entry Saved!</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{analysis.mood.emoji}</span>
            <div>
              <p className="text-sm font-medium text-indigo-700">
                Mood: {analysis.mood.label}
              </p>
              <p className="text-xs text-indigo-500">
                Score: {analysis.mood.score} ({analysis.mood.mood})
              </p>
            </div>
          </div>
          {analysis.summary && (
            <div className="mt-2">
              <p className="text-xs text-indigo-600 font-medium">Summary:</p>
              <p className="text-xs text-indigo-700">{analysis.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
