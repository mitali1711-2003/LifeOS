/**
 * ProgressBar — a colored progress bar that fills based on percentage.
 * Color changes: gray (0%), blue (1-49%), indigo (50-99%), green (100%).
 */
export default function ProgressBar({ progress }) {
  let barColor;
  if (progress === 0) barColor = 'bg-gray-300';
  else if (progress < 50) barColor = 'bg-blue-500';
  else if (progress < 100) barColor = 'bg-indigo-500';
  else barColor = 'bg-green-500';

  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-300 ${barColor}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}
