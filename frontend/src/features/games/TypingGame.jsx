/**
 * TypingGame — test your typing speed (WPM).
 *
 * How it works:
 * 1. A sentence appears on screen
 * 2. Type it as fast and accurately as you can
 * 3. Timer starts on first keystroke
 * 4. Shows WPM (words per minute) and accuracy
 */
import { useState, useRef, useEffect } from 'react';

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog near the river bank",
  "Learning to code is a journey that takes patience and practice every day",
  "Artificial intelligence is changing the way we live and work today",
  "Every great developer was once a beginner who never gave up trying",
  "The best way to predict the future is to create it with your own hands",
  "Technology is best when it brings people together and solves real problems",
  "A smooth sea never made a skilled sailor so embrace the challenges ahead",
  "The only way to do great work is to love what you do every single day",
  "Success is not final and failure is not fatal it is courage that counts",
  "Innovation distinguishes between a leader and a follower in any field",
];

export default function TypingGame() {
  const [sentence, setSentence] = useState('');
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [bestWpm, setBestWpm] = useState(
    () => parseInt(localStorage.getItem('lifeos_typing_best')) || 0
  );
  const inputRef = useRef(null);

  const newGame = () => {
    const s = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    setSentence(s);
    setTyped('');
    setStarted(false);
    setFinished(false);
    setWpm(0);
    setAccuracy(100);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    newGame();
  }, []);

  const handleType = (e) => {
    const value = e.target.value;

    // Start timer on first keystroke
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }

    setTyped(value);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === sentence[i]) correct++;
    }
    const acc = value.length > 0 ? Math.round((correct / value.length) * 100) : 100;
    setAccuracy(acc);

    // Check if finished
    if (value.length >= sentence.length) {
      const elapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const words = sentence.split(' ').length;
      const calculatedWpm = Math.round(words / elapsed);

      setWpm(calculatedWpm);
      setFinished(true);

      if (calculatedWpm > bestWpm && acc >= 90) {
        setBestWpm(calculatedWpm);
        localStorage.setItem('lifeos_typing_best', calculatedWpm.toString());
      }
    }
  };

  // Render each character with color coding
  const renderSentence = () => {
    return sentence.split('').map((char, i) => {
      let color = 'text-gray-500'; // not typed yet
      if (i < typed.length) {
        color = typed[i] === char ? 'text-emerald-400' : 'text-red-400 underline';
      } else if (i === typed.length) {
        color = 'text-white bg-white/10 rounded px-0.5'; // cursor position
      }
      return (
        <span key={i} className={`${color} transition-colors`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          {started && !finished && (
            <span className="text-sm text-gray-400">
              Accuracy: <span className={`font-bold ${accuracy >= 90 ? 'text-emerald-400' : accuracy >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                {accuracy}%
              </span>
            </span>
          )}
          {bestWpm > 0 && (
            <span className="text-sm text-gray-500">
              Best: <span className="font-bold text-amber-400">{bestWpm} WPM</span>
            </span>
          )}
        </div>
        <button
          onClick={newGame}
          className="px-4 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          🔄 New Text
        </button>
      </div>

      {/* Result screen */}
      {finished && (
        <div className="text-center py-6 mb-5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <p className="text-4xl mb-2">
            {wpm >= 60 ? '🚀' : wpm >= 40 ? '⚡' : wpm >= 25 ? '👍' : '💪'}
          </p>
          <p className="text-3xl font-black text-white mb-1">{wpm} WPM</p>
          <p className="text-sm text-gray-400">Accuracy: {accuracy}%</p>
          {wpm >= bestWpm && wpm > 0 && (
            <p className="text-xs text-amber-400 mt-1">🏆 New best!</p>
          )}
          <button
            onClick={newGame}
            className="mt-4 px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Sentence to type */}
      <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 mb-4 font-mono text-base leading-relaxed tracking-wide">
        {renderSentence()}
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleType}
        disabled={finished}
        placeholder="Start typing here..."
        autoComplete="off"
        spellCheck="false"
        className="w-full px-5 py-3.5 rounded-xl text-base font-mono bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
      />

      {/* Progress bar */}
      {started && !finished && (
        <div className="mt-3 w-full bg-white/5 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100"
            style={{ width: `${Math.min((typed.length / sentence.length) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
