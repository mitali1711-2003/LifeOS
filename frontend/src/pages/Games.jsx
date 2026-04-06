/**
 * Games Page — fun brain-training mini-games.
 * 4 games in tabs: Memory Match, Reaction Speed, Typing Test, Breathing.
 */
import { useState } from 'react';
import MemoryGame from '../features/games/MemoryGame';
import ReactionGame from '../features/games/ReactionGame';
import BreathingGame from '../features/games/BreathingGame';
import TypingGame from '../features/games/TypingGame';

const GAMES = [
  {
    id: 'memory',
    label: 'Memory Match',
    icon: '🧠',
    color: 'from-indigo-500 to-purple-500',
    desc: 'Find matching pairs to train your memory',
    Component: MemoryGame,
  },
  {
    id: 'reaction',
    label: 'Reaction Speed',
    icon: '⚡',
    color: 'from-amber-500 to-orange-500',
    desc: 'Test how fast your reflexes are',
    Component: ReactionGame,
  },
  {
    id: 'typing',
    label: 'Typing Speed',
    icon: '⌨️',
    color: 'from-blue-500 to-cyan-500',
    desc: 'Measure your typing speed in WPM',
    Component: TypingGame,
  },
  {
    id: 'breathing',
    label: 'Focus Breathing',
    icon: '🫁',
    color: 'from-teal-500 to-emerald-500',
    desc: 'Calm your mind with guided breathing',
    Component: BreathingGame,
  },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState('memory');
  const active = GAMES.find((g) => g.id === activeGame);

  return (
    <div>
      <h2 className="text-3xl font-black gradient-text mb-1">Brain Games</h2>
      <p className="text-sm text-gray-500 mb-8">Train your brain with fun mini-games</p>

      {/* Game selector — horizontal cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`p-4 rounded-xl border text-left transition-all duration-300 ${
              activeGame === game.id
                ? `bg-gradient-to-br ${game.color} border-transparent shadow-lg`
                : 'glass-card border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-2xl block mb-2">{game.icon}</span>
            <p className={`text-sm font-bold ${activeGame === game.id ? 'text-white' : 'text-gray-300'}`}>
              {game.label}
            </p>
            <p className={`text-[10px] mt-0.5 ${activeGame === game.id ? 'text-white/70' : 'text-gray-500'}`}>
              {game.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Active game */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${active.color} flex items-center justify-center text-lg shadow-lg`}>
            {active.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{active.label}</h3>
            <p className="text-xs text-gray-500">{active.desc}</p>
          </div>
        </div>

        <active.Component key={activeGame} />
      </div>
    </div>
  );
}
