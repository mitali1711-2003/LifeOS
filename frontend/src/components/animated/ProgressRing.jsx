/**
 * ProgressRing — animated SVG circular progress indicator.
 * The ring fills up with a smooth animation.
 */
import { useState, useEffect } from 'react';

export default function ProgressRing({
  progress = 0,
  size = 80,
  strokeWidth = 6,
  color = '#667eea',
  bgColor = 'rgba(255,255,255,0.06)',
  children,
}) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Animate the progress on mount
    const timer = setTimeout(() => {
      const progressOffset = circumference - (progress / 100) * circumference;
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
