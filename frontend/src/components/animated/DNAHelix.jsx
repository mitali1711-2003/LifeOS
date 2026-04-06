/**
 * DNAHelix — a rotating double-strand DNA animation.
 * Made with pure CSS transforms. Decorative element for the AI sections.
 */
export default function DNAHelix() {
  // Create 12 pairs of dots
  const pairs = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="dna-container">
      {pairs.map((i) => (
        <div key={i}>
          {/* Left strand */}
          <div
            className="dna-dot"
            style={{
              top: `${i * 16}px`,
              animationDelay: `${i * 0.15}s`,
              background: `linear-gradient(135deg, #667eea, #764ba2)`,
              boxShadow: `0 0 8px rgba(102, 126, 234, 0.5)`,
            }}
          />
          {/* Right strand (opposite phase) */}
          <div
            className="dna-dot"
            style={{
              top: `${i * 16}px`,
              animationDelay: `${i * 0.15 + 2}s`,
              background: `linear-gradient(135deg, #f093fb, #f5576c)`,
              boxShadow: `0 0 8px rgba(240, 147, 251, 0.5)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
