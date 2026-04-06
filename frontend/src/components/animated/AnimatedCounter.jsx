/**
 * AnimatedCounter — a number that counts up from 0 to the target value.
 * Creates a satisfying animation when stats load.
 */
import { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ target, duration = 1500, suffix = '', className = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate once and only if target > 0
    if (hasAnimated.current || target === 0) {
      setCount(target);
      return;
    }

    hasAnimated.current = true;
    const start = 0;
    const end = typeof target === 'number' ? target : parseFloat(target) || 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out curve for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return (
    <span ref={ref} className={`stat-number ${className}`}>
      {count}{suffix}
    </span>
  );
}
