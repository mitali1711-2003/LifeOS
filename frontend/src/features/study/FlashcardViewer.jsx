/**
 * FlashcardViewer — flip-card UI for reviewing flashcards.
 *
 * How it works:
 * 1. Shows one card at a time (question side)
 * 2. Click to flip and see the answer
 * 3. Mark as "Got it" or "Didn't know"
 * 4. Moves to the next card
 * 5. Shows score at the end
 */
import { useState } from 'react';
import { apiPost } from '../../api/client';
import Card from '../../components/Card';

export default function FlashcardViewer({ flashcards, onDone }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);

  if (flashcards.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-3">📇</p>
          <p className="text-sm">No flashcards to review. Generate some first!</p>
          <button
            onClick={onDone}
            className="mt-4 px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          >
            ← Back
          </button>
        </div>
      </Card>
    );
  }

  const card = flashcards[currentIndex];
  const total = flashcards.length;
  const progress = ((currentIndex) / total) * 100;

  // Handle answer (correct/wrong)
  const handleAnswer = async (correct) => {
    // Update spaced repetition on the backend
    try {
      await apiPost(`/study/flashcards/${card.id}/review`, { correct });
    } catch (err) {
      console.error('Failed to record review:', err);
    }

    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
    }));

    // Move to next card or finish
    if (currentIndex + 1 < total) {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    } else {
      setFinished(true);
    }
  };

  // Finished — show results
  if (finished) {
    const totalReviewed = score.correct + score.wrong;
    const percentage = totalReviewed > 0 ? Math.round((score.correct / totalReviewed) * 100) : 0;

    return (
      <Card title="Review Complete!">
        <div className="text-center py-6">
          <p className="text-5xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
          </p>
          <p className="text-2xl font-bold text-gray-800 mb-2">{percentage}%</p>
          <p className="text-sm text-gray-500 mb-4">
            {score.correct} correct out of {totalReviewed} cards
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setFlipped(false);
                setScore({ correct: 0, wrong: 0 });
                setFinished(false);
              }}
              className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
            >
              🔄 Review Again
            </button>
            <button
              onClick={onDone}
              className="px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              ← Back to Notes
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Card {currentIndex + 1} of {total}</span>
          <span>{score.correct} correct</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer select-none"
      >
        <div className={`min-h-[250px] flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all ${
          flipped
            ? 'bg-indigo-50 border-indigo-200'
            : 'bg-white border-gray-200 hover:border-indigo-300'
        }`}>
          {!flipped ? (
            <>
              <p className="text-xs text-gray-400 mb-3">QUESTION</p>
              <p className="text-lg text-center text-gray-800 font-medium">
                {card.question}
              </p>
              <p className="text-xs text-gray-400 mt-6">Click to reveal answer</p>
            </>
          ) : (
            <>
              <p className="text-xs text-indigo-400 mb-3">ANSWER</p>
              <p className="text-lg text-center text-indigo-800 font-medium">
                {card.answer}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Answer buttons (only show when flipped) */}
      {flipped && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleAnswer(false)}
            className="flex-1 py-3 text-sm font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            ❌ Didn't Know
          </button>
          <button
            onClick={() => handleAnswer(true)}
            className="flex-1 py-3 text-sm font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            ✅ Got It!
          </button>
        </div>
      )}
    </div>
  );
}
