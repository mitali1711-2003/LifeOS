/**
 * ParticleField — floating glowing particles that drift upward.
 * Creates an immersive space/tech feel.
 */
import { useMemo } from 'react';

export default function ParticleField({ count = 30 }) {
  // Generate random particles once (useMemo prevents re-creating on every render)
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,           // random X position (%)
      size: Math.random() * 4 + 1,          // 1-5px
      duration: Math.random() * 15 + 10,    // 10-25 seconds
      delay: Math.random() * 10,            // staggered start
      opacity: Math.random() * 0.5 + 0.1,   // 0.1-0.6
      color: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#10b981', '#f5576c'][
        Math.floor(Math.random() * 6)
      ],
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
