/**
 * Layout — immersive app shell with particles, orbs, and glassmorphism.
 * All decorative layers use pointer-events:none so inputs work.
 */
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ParticleField from './animated/ParticleField';

export default function Layout() {
  return (
    <div className="app-background flex min-h-screen">
      {/* Decorative layers — all pointer-events:none */}
      <ParticleField count={25} />
      <div className="floating-orb orb-1" style={{ pointerEvents: 'none' }}></div>
      <div className="floating-orb orb-2" style={{ pointerEvents: 'none' }}></div>
      <div className="floating-orb orb-3" style={{ pointerEvents: 'none' }}></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content — high z-index so it's always interactive */}
      <main className="flex-1 p-8 overflow-auto" style={{ position: 'relative', zIndex: 10 }}>
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
