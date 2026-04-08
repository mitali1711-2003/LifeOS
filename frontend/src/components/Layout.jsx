/**
 * Layout — immersive app shell with particles, orbs, and glassmorphism.
 * All decorative layers use pointer-events:none so inputs work.
 * Mobile: sidebar is a slide-out drawer with hamburger toggle.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ParticleField from './animated/ParticleField';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on navigation (mobile)
  const handleNavigation = () => setSidebarOpen(false);

  return (
    <div className="app-background flex min-h-screen overflow-x-hidden">
      {/* Decorative layers — all pointer-events:none */}
      <ParticleField count={25} />
      <div className="floating-orb orb-1" style={{ pointerEvents: 'none' }}></div>
      <div className="floating-orb orb-2" style={{ pointerEvents: 'none' }}></div>
      <div className="floating-orb orb-3" style={{ pointerEvents: 'none' }}></div>

      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on lg+, drawer on mobile */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleNavigation} />

      {/* Mobile header with hamburger */}
      <div className="fixed top-0 left-0 right-0 lg:hidden mobile-header" style={{ zIndex: 25 }}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/10 text-white"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="5" x2="17" y2="5" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="15" x2="17" y2="15" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-xs font-black">L</span>
            </div>
            <span className="text-sm font-bold gradient-text-glow">LifeOS</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main content — high z-index so it's always interactive */}
      <main className="flex-1 min-w-0 p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-8 overflow-auto" style={{ position: 'relative', zIndex: 10 }}>
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
