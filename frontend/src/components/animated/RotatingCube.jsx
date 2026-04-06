/**
 * RotatingCube — a 3D CSS cube that rotates continuously.
 * Each face shows an icon representing a LifeOS module.
 */
export default function RotatingCube({ size = 'normal' }) {
  const isSmall = size === 'small';
  const cubeClass = isSmall ? 'cube cube-sm' : 'cube';

  return (
    <div className="scene-3d" style={{ width: isSmall ? 50 : 120, height: isSmall ? 50 : 120 }}>
      <div className={cubeClass}>
        <div className="cube-face cube-face-front">🧠</div>
        <div className="cube-face cube-face-back">📊</div>
        <div className="cube-face cube-face-right">🚀</div>
        <div className="cube-face cube-face-left">💡</div>
        <div className="cube-face cube-face-top">⚡</div>
        <div className="cube-face cube-face-bottom">🎯</div>
      </div>
    </div>
  );
}
