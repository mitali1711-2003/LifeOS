/**
 * ReactionGame — test your reaction speed.
 *
 * How it works:
 * 1. Screen starts red — "Wait..."
 * 2. After a random delay, it turns green — "CLICK NOW!"
 * 3. Your reaction time is measured in milliseconds
 * 4. Tracks your best time
 */
import { useState, useRef, useCallback } from 'react';

const STATES = {
  IDLE: 'idle',
  WAITING: 'waiting',
  READY: 'ready',
  CLICKED: 'clicked',
  TOO_EARLY: 'too_early',
};

export default function ReactionGame() {
  const [state, setState] = useState(STATES.IDLE);
  const [reactionTime, setReactionTime] = useState(null);
  const [times, setTimes] = useState([]);
  const [bestTime, setBestTime] = useState(
    () => parseInt(localStorage.getItem('lifeos_reaction_best')) || 0
  );
  const timerRef = useRef(null);
  const startRef = useRef(null);

  const startGame = useCallback(() => {
    setState(STATES.WAITING);
    setReactionTime(null);

    // Random delay between 1.5 and 5 seconds
    const delay = Math.random() * 3500 + 1500;
    timerRef.current = setTimeout(() => {
      setState(STATES.READY);
      startRef.current = Date.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (state === STATES.IDLE) {
      startGame();
      return;
    }

    if (state === STATES.WAITING) {
      // Clicked too early!
      clearTimeout(timerRef.current);
      setState(STATES.TOO_EARLY);
      return;
    }

    if (state === STATES.READY) {
      const time = Date.now() - startRef.current;
      setReactionTime(time);
      setState(STATES.CLICKED);

      const newTimes = [...times, time];
      setTimes(newTimes);

      if (!bestTime || time < bestTime) {
        setBestTime(time);
        localStorage.setItem('lifeos_reaction_best', time.toString());
      }
      return;
    }

    // Any other state — restart
    startGame();
  }, [state, times, bestTime, startGame]);

  const getAverage = () => {
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  };

  // Colors and text based on state
  const config = {
    [STATES.IDLE]: {
      bg: 'from-indigo-500/20 to-purple-500/20',
      border: 'border-indigo-500/30',
      text: 'Click to Start',
      subtext: 'Test your reaction speed',
      emoji: '🎯',
    },
    [STATES.WAITING]: {
      bg: 'from-red-500/20 to-orange-500/20',
      border: 'border-red-500/30',
      text: 'Wait for green...',
      subtext: "Don't click yet!",
      emoji: '🔴',
    },
    [STATES.READY]: {
      bg: 'from-emerald-500/20 to-green-500/20',
      border: 'border-emerald-500/30',
      text: 'CLICK NOW!',
      subtext: 'As fast as you can!',
      emoji: '🟢',
    },
    [STATES.CLICKED]: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      text: `${reactionTime}ms`,
      subtext: reactionTime < 200 ? 'Lightning fast! ⚡' : reactionTime < 350 ? 'Great reflexes! 🔥' : 'Keep practicing! 💪',
      emoji: '⏱️',
    },
    [STATES.TOO_EARLY]: {
      bg: 'from-red-500/20 to-pink-500/20',
      border: 'border-red-500/30',
      text: 'Too early!',
      subtext: 'Click to try again',
      emoji: '❌',
    },
  };

  const c = config[state];

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          {times.length > 0 && (
            <span className="text-sm text-gray-400">
              Avg: <span className="font-bold text-white">{getAverage()}ms</span>
            </span>
          )}
          {bestTime > 0 && (
            <span className="text-sm text-gray-500">
              Best: <span className="font-bold text-amber-400">{bestTime}ms</span>
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {times.length} attempt{times.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main click area */}
      <button
        onClick={handleClick}
        className={`w-full rounded-2xl border-2 ${c.border} bg-gradient-to-br ${c.bg} transition-all duration-300 p-12 text-center cursor-pointer hover:scale-[1.01] active:scale-[0.99]`}
        style={{ minHeight: 220 }}
      >
        <p className="text-5xl mb-4">{c.emoji}</p>
        <p className={`text-2xl font-black mb-2 ${
          state === STATES.READY ? 'text-emerald-400 animate-pulse' : 'text-white'
        }`}>
          {c.text}
        </p>
        <p className="text-sm text-gray-400">{c.subtext}</p>
      </button>

      {/* Recent times */}
      {times.length > 0 && (
        <div className="mt-5 flex gap-2 flex-wrap">
          {times.slice(-8).map((t, i) => (
            <span
              key={i}
              className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                t === bestTime
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : t < 250
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              {t}ms
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
