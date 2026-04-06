/**
 * QuizPlayer — MCQ quiz interface.
 *
 * How it works:
 * 1. Fetches MCQs from the AI engine
 * 2. Shows one question at a time with 4 options
 * 3. User selects an answer → highlights correct/wrong
 * 4. At the end, shows the score and saves it
 */
import { useState, useEffect } from 'react';
import { apiPost } from '../../api/client';
import Card from '../../components/Card';

export default function QuizPlayer({ noteId, onDone }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate quiz questions when component mounts
  useEffect(() => {
    apiPost(`/study/notes/${noteId}/quiz`, { count: 5 })
      .then((data) => setQuestions(data.questions))
      .catch((err) => console.error('Failed to generate quiz:', err))
      .finally(() => setLoading(false));
  }, [noteId]);

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-400">
          <p className="text-2xl mb-3">🤖</p>
          <p className="text-sm">AI is generating your quiz...</p>
        </div>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm">
            Couldn't generate enough questions. Try adding more detailed notes
            with clear definitions.
          </p>
          <button
            onClick={onDone}
            className="mt-4 px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg"
          >
            ← Back
          </button>
        </div>
      </Card>
    );
  }

  const question = questions[currentIndex];

  // Handle selecting an answer
  const handleSelect = (optionIndex) => {
    if (answered) return; // Can't change answer after selecting
    setSelectedAnswer(optionIndex);
    setAnswered(true);

    if (optionIndex === question.correct_answer) {
      setScore((s) => s + 1);
    }
  };

  // Move to next question or finish
  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      // Save the quiz result
      try {
        await apiPost('/study/quiz/submit', {
          note_id: noteId,
          total_questions: questions.length,
          correct_answers: score,
        });
      } catch (err) {
        console.error('Failed to save quiz result:', err);
      }
      setFinished(true);
    }
  };

  // Show results at the end
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card title="Quiz Complete!">
        <div className="text-center py-6">
          <p className="text-5xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '📚'}
          </p>
          <p className="text-3xl font-bold text-gray-800 mb-2">{percentage}%</p>
          <p className="text-sm text-gray-500 mb-6">
            You got {score} out of {questions.length} questions right
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                // Reset and retake
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setAnswered(false);
                setScore(0);
                setFinished(false);
              }}
              className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
            >
              🔄 Retake Quiz
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

  // Option colors after answering
  const getOptionStyle = (index) => {
    if (!answered) {
      return selectedAnswer === index
        ? 'border-indigo-300 bg-indigo-50'
        : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50';
    }
    // After answering: green for correct, red for wrong selection
    if (index === question.correct_answer) {
      return 'border-green-300 bg-green-50 text-green-800';
    }
    if (index === selectedAnswer && index !== question.correct_answer) {
      return 'border-red-300 bg-red-50 text-red-800';
    }
    return 'border-gray-200 opacity-50';
  };

  return (
    <div>
      {/* Progress */}
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>{score} correct so far</span>
      </div>

      {/* Question */}
      <Card>
        <p className="text-base font-medium text-gray-800 mb-6">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={answered}
              className={`w-full text-left p-3 rounded-lg border-2 text-sm transition-colors ${getOptionStyle(index)}`}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Next button (shows after answering) */}
        {answered && (
          <button
            onClick={handleNext}
            className="w-full mt-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {currentIndex + 1 < questions.length ? 'Next Question →' : 'See Results'}
          </button>
        )}
      </Card>
    </div>
  );
}
