/**
 * MoodBadge — displays a mood emoji + label with colored background.
 */
const MOOD_STYLES = {
  positive: 'bg-green-50 border-green-200 text-green-700',
  negative: 'bg-red-50 border-red-200 text-red-700',
  neutral: 'bg-gray-50 border-gray-200 text-gray-600',
};

export default function MoodBadge({ mood }) {
  if (!mood) return null;

  const style = MOOD_STYLES[mood.mood] || MOOD_STYLES.neutral;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${style}`}>
      <span className="text-base">{mood.emoji}</span>
      {mood.label}
    </span>
  );
}
