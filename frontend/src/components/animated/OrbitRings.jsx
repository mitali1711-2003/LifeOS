/**
 * OrbitRings — animated orbital rings with glowing dots,
 * like an atom or solar system. Pure CSS animation.
 */
export default function OrbitRings({ size = 200 }) {
  return (
    <div className="orbit-container" style={{ width: size, height: size }}>
      <div className="orbit-ring"></div>
      <div className="orbit-ring orbit-ring-2"></div>
      <div className="orbit-ring orbit-ring-3"></div>
      <div className="orbit-center-glow"></div>
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 10px rgba(102,126,234,0.5))' }}>
          🧠
        </span>
      </div>
    </div>
  );
}
