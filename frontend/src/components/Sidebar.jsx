/**
 * Sidebar — premium dark nav with animated 3D logo, glow effects,
 * and smooth hover animations.
 */
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/habits', label: 'Habits', icon: '✅' },
  { path: '/finance', label: 'Finance', icon: '💰' },
  { path: '/experiments', label: 'Experiments', icon: '🧪' },
  { path: '/learning', label: 'Learning', icon: '📚' },
  { path: '/study', label: 'Study Buddy', icon: '🤖' },
  { path: '/ideas', label: 'Ideas', icon: '💡' },
  { path: '/journal', label: 'Journal', icon: '🎙️' },
  { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
  { path: '/games', label: 'Brain Games', icon: '🎮' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar-gradient w-72 min-h-screen p-5 flex flex-col relative z-20">
      {/* ====== 3D Animated Logo ====== */}
      <div className="mb-8 px-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="logo-3d">
            <div className="logo-3d-inner w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 relative">
              <span className="text-white text-lg font-black">L</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-40 blur-md -z-10"></div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black gradient-text-glow">LifeOS</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="pulse-dot" style={{ width: 5, height: 5 }}></div>
              <p className="text-[9px] text-emerald-400 tracking-widest uppercase font-medium">
                Online
              </p>
            </div>
          </div>
        </div>

        {/* Animated separator */}
        <div className="mt-5 h-px relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
        </div>
      </div>

      {/* ====== Navigation ====== */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative group ${
                isActive
                  ? 'nav-item-active text-white'
                  : 'nav-item-hover text-gray-500 hover:text-gray-200'
              }`
            }
          >
            <span className="icon-glow bg-white/[0.03] group-hover:bg-white/[0.06] text-base transition-all duration-300 group-hover:scale-110">
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            <span className="text-xs opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </NavLink>
        ))}
      </nav>

      {/* ====== Bottom Badge ====== */}
      <div className="px-3 pb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent mb-4"></div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-gray-500">Powered by</p>
          <p className="text-xs font-bold gradient-text">AI + NLP Engine</p>
        </div>
      </div>
    </aside>
  );
}
