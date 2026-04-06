/**
 * Card — glassmorphism card with gradient title accent.
 * No transform animations — keeps inputs and buttons fully interactive.
 */
export default function Card({ title, children, className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}
