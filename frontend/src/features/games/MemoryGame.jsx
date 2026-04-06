/**
 * MemoryGame — flip cards to find matching pairs.
 * Tests and improves your short-term memory.
 *
 * How it works:
 * - 16 cards (8 pairs) face down
 * - Flip two at a time — if they match, they stay revealed
 * - Try to finish in the fewest moves possible
 */
import { useState, useEffect, useRef } from 'react';

const EMOJIS = ['🧠', '🚀', '💡', '🎯', '⚡', '🔥', '💎', '🌟'];

function generateCards() {
  const pairs = [...EMOJIS, ...EMOJIS];
  // Shuffle using Fisher-Yates
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryGame() {
  const [cards, setCards] = useState(generateCards);
  const [flippedIds, setFlippedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [bestScore, setBestScore] = useState(
    () => parseInt(localStorage.getItem('lifeos_memory_best')) || 0
  );
  const lockRef = useRef(false);

  const handleFlip = (id) => {
    if (lockRef.current) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    const newFlipped = [...flippedIds, id];
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, flipped: true } : c));
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      lockRef.current = true;

      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        // Match found!
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === a || c.id === b ? { ...c, matched: true } : c
          ));
          setFlippedIds([]);
          lockRef.current = false;
        }, 400);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          lockRef.current = false;
        }, 800);
      }
    }
  };

  // Check for win
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setGameWon(true);
      if (!bestScore || moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem('lifeos_memory_best', moves.toString());
      }
    }
  }, [cards]);

  const restart = () => {
    setCards(generateCards());
    setFlippedIds([]);
    setMoves(0);
    setGameWon(false);
    lockRef.current = false;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Moves: <span className="font-bold text-white">{moves}</span>
          </span>
          {bestScore > 0 && (
            <span className="text-sm text-gray-500">
              Best: <span className="font-bold text-amber-400">{bestScore}</span>
            </span>
          )}
        </div>
        <button
          onClick={restart}
          className="px-4 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          🔄 New Game
        </button>
      </div>

      {/* Win screen */}
      {gameWon && (
        <div className="text-center py-6 mb-5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-lg font-bold text-white">You won in {moves} moves!</p>
          {moves === bestScore && (
            <p className="text-xs text-amber-400 mt-1">🏆 New best score!</p>
          )}
          <button
            onClick={restart}
            className="mt-3 px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Card grid — 4x4 */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-300 border ${
              card.matched
                ? 'bg-emerald-500/15 border-emerald-500/30 scale-95'
                : card.flipped
                ? 'bg-indigo-500/15 border-indigo-500/30 rotate-0'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 cursor-pointer'
            }`}
            style={{
              transform: card.flipped || card.matched ? 'rotateY(0deg)' : 'rotateY(0deg)',
            }}
          >
            {card.flipped || card.matched ? (
              <span style={{ filter: card.matched ? 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' : 'none' }}>
                {card.emoji}
              </span>
            ) : (
              <span className="text-gray-600 text-lg">?</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
