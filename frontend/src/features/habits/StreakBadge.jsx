/**
 * StreakBadge — dark-theme compatible streak indicator.
 */
export default function StreakBadge({ streak }) {
  let colorClasses;
  if (streak === 0) {
    colorClasses = 'bg-white/5 text-gray-500 border-white/10';
  } else if (streak < 7) {
    colorClasses = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
  } else {
    colorClasses = 'bg-red-500/15 text-red-400 border-red-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
      🔥 {streak} day{streak !== 1 ? 's' : ''}
    </span>
  );
}
