/**
 * GlowingCard — a card with a subtle glow effect.
 */
export default function GlowingCard({ children, className = '' }) {
  return (
    <div className={`glow-border glass-card p-6 ${className}`}>
      {children}
    </div>
  );
}
