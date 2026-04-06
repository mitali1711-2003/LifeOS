/**
 * BreathingGame — guided breathing exercise with animated circle.
 *
 * Uses the 4-7-8 breathing technique:
 * - Breathe IN for 4 seconds
 * - HOLD for 7 seconds
 * - Breathe OUT for 8 seconds
 *
 * The circle expands and contracts to guide you.
 */
import { useState, useEffect, useRef } from 'react';

const PHASES = [
  { label: 'Breathe In', duration: 4, color: 'from-indigo-500 to-blue-500', scale: 1.5 },
  { label: 'Hold', duration: 7, color: 'from-purple-500 to-indigo-500', scale: 1.5 },
  { label: 'Breathe Out', duration: 8, color: 'from-blue-500 to-cyan-500', scale: 1 },
];

export default function BreathingGame() {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef(null);

  const phase = PHASES[phaseIndex];

  const start = () => {
    setRunning(true);
    setPhaseIndex(0);
    setCountdown(PHASES[0].duration);
    setCycles(0);
    setTotalTime(0);
  };

  const stop = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setPhaseIndex((pi) => {
            const next = (pi + 1) % PHASES.length;
            if (next === 0) setCycles((c) => c + 1);
            // Set countdown for next phase
            setTimeout(() => setCountdown(PHASES[next].duration), 0);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
      setTotalTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Stats */}
      {(cycles > 0 || running) && (
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-xl font-bold text-white">{cycles}</p>
            <p className="text-[10px] text-gray-500">Cycles</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{formatTime(totalTime)}</p>
            <p className="text-[10px] text-gray-500">Duration</p>
          </div>
        </div>
      )}

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center my-6" style={{ width: 240, height: 240 }}>
        {/* Outer ring */}
        <div
          className={`absolute rounded-full bg-gradient-to-br ${running ? phase.color : 'from-gray-700 to-gray-800'} opacity-20 transition-all duration-[4000ms] ease-in-out`}
          style={{
            width: running ? phase.scale * 220 : 180,
            height: running ? phase.scale * 220 : 180,
          }}
        />

        {/* Middle ring */}
        <div
          className={`absolute rounded-full bg-gradient-to-br ${running ? phase.color : 'from-gray-600 to-gray-700'} opacity-30 transition-all duration-[4000ms] ease-in-out`}
          style={{
            width: running ? phase.scale * 170 : 140,
            height: running ? phase.scale * 170 : 140,
          }}
        />

        {/* Inner circle */}
        <div
          className={`absolute rounded-full bg-gradient-to-br ${running ? phase.color : 'from-gray-500 to-gray-600'} transition-all duration-[4000ms] ease-in-out flex items-center justify-center`}
          style={{
            width: running ? phase.scale * 120 : 100,
            height: running ? phase.scale * 120 : 100,
            boxShadow: running
              ? `0 0 40px rgba(102, 126, 234, 0.3), 0 0 80px rgba(102, 126, 234, 0.1)`
              : 'none',
          }}
        >
          <div className="text-center">
            {running ? (
              <>
                <p className="text-2xl font-black text-white">{countdown}</p>
                <p className="text-[10px] text-white/70 font-medium">{phase.label}</p>
              </>
            ) : (
              <p className="text-3xl">🫁</p>
            )}
          </div>
        </div>
      </div>

      {/* Label */}
      {running && (
        <p className="text-lg font-bold text-white mb-2 animate-pulse">
          {phase.label}
        </p>
      )}

      {!running && (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">4-7-8 Breathing Technique</p>
          <p className="text-xs text-gray-500 mt-1">Reduces stress and improves focus</p>
        </div>
      )}

      {/* Start/Stop button */}
      <button
        onClick={running ? stop : start}
        className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
          running
            ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/30'
        }`}
      >
        {running ? '⏹ Stop' : '▶ Start Breathing'}
      </button>
    </div>
  );
}
