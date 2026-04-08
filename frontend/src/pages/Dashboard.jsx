/**
 * Dashboard — immersive hero with rotating 3D elements, orbit rings,
 * animated counters, progress rings, and module cards.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api/client';
import Card from '../components/Card';
import DailyOverview from '../features/dashboard/DailyOverview';
import HabitOverview from '../features/dashboard/HabitOverview';
import FinanceOverview from '../features/dashboard/FinanceOverview';
import RotatingCube from '../components/animated/RotatingCube';
import OrbitRings from '../components/animated/OrbitRings';
import AnimatedCounter from '../components/animated/AnimatedCounter';
import ProgressRing from '../components/animated/ProgressRing';
import GlowingCard from '../components/animated/GlowingCard';
import DNAHelix from '../components/animated/DNAHelix';

/** Module card with gradient icon and animated hover */
function ModuleCard({ title, icon, gradient, children, onClick, buttonText }) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="glass-card glass-card-glow p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${gradient}`}>
              {icon}
            </div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
          </div>
          <span className="text-xs text-gray-600 group-hover:text-indigo-400 transition-all duration-300 group-hover:translate-x-1">
            {buttonText || 'View →'}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiGet('/dashboard')
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <RotatingCube />
          <p className="text-gray-500 text-sm mt-6 animate-pulse">Initializing LifeOS...</p>
        </div>
      </div>
    );
  }

  // Calculate some aggregate stats for the hero
  const totalModules = 9;
  const activeModules = [
    data?.habits_summary?.total_habits,
    data?.finance_summary?.this_week_expense || data?.finance_summary?.this_week_income,
    data?.experiments_summary?.active_count,
    data?.learning_summary?.total,
    data?.study_summary?.total_notes,
    data?.ideas_summary?.saved_count,
    data?.journal_summary?.total_entries,
    data?.bookmark_summary?.total_bookmarks,
  ].filter(Boolean).length;

  const habitPercent = data?.habits_summary?.total_habits > 0
    ? Math.round((data.habits_summary.completed_today / data.habits_summary.total_habits) * 100)
    : 0;

  return (
    <div>
      {/* ===================================================
          HERO SECTION — 3D scene + animated text + orbit rings
          =================================================== */}
      <div className="relative mb-10 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
          {/* Left: text + stats */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="pulse-dot"></div>
              <span className="text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-semibold">
                System Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black gradient-text-glow mb-2 leading-tight">
              Welcome to<br />LifeOS
            </h1>
            <p className="text-sm text-gray-500 mb-8 max-w-md">
              Your AI-powered personal command center. Track habits, manage finances,
              run experiments, and let AI supercharge your learning.
            </p>

            {/* Quick stats with animated counters + progress rings */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <ProgressRing progress={habitPercent} size={70} strokeWidth={5} color="#667eea">
                <div className="text-center">
                  <p className="text-sm font-bold text-white">
                    <AnimatedCounter target={habitPercent} suffix="%" />
                  </p>
                  <p className="text-[8px] text-gray-500">Habits</p>
                </div>
              </ProgressRing>

              <ProgressRing
                progress={Math.min((activeModules / totalModules) * 100, 100)}
                size={70} strokeWidth={5} color="#f093fb"
              >
                <div className="text-center">
                  <p className="text-sm font-bold text-white">
                    <AnimatedCounter target={activeModules} />/<span className="text-gray-500">{totalModules}</span>
                  </p>
                  <p className="text-[8px] text-gray-500">Modules</p>
                </div>
              </ProgressRing>

              <ProgressRing
                progress={data?.study_summary?.avg_score || 0}
                size={70} strokeWidth={5} color="#10b981"
              >
                <div className="text-center">
                  <p className="text-sm font-bold text-white">
                    <AnimatedCounter target={data?.study_summary?.avg_score || 0} suffix="%" />
                  </p>
                  <p className="text-[8px] text-gray-500">Score</p>
                </div>
              </ProgressRing>
            </div>
          </div>

          {/* Right: 3D rotating elements scene */}
          <div className="hidden lg:flex items-center gap-6 mr-4">
            {/* DNA Helix decoration */}
            <div className="opacity-40">
              <DNAHelix />
            </div>

            {/* Central orbit rings */}
            <OrbitRings size={220} />

            {/* Small rotating cube */}
            <div className="opacity-60">
              <RotatingCube size="small" />
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          QUICK OVERVIEW ROW — daily, habits, finance
          =================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 stagger-in">
        <DailyOverview habits={data?.habits_summary} finance={data?.finance_summary} />
        <HabitOverview data={data?.habits_summary} />
        <FinanceOverview data={data?.finance_summary} />
      </div>

      {/* ===================================================
          FEATURED AI SECTION — glowing card spotlight
          =================================================== */}
      <GlowingCard className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="scene-3d hidden sm:block" style={{ width: 50, height: 50 }}>
              <div className="cube cube-sm">
                <div className="cube-face cube-face-front">🧠</div>
                <div className="cube-face cube-face-back">⚡</div>
                <div className="cube-face cube-face-right">🎯</div>
                <div className="cube-face cube-face-left">🚀</div>
                <div className="cube-face cube-face-top">💡</div>
                <div className="cube-face cube-face-bottom">✨</div>
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">AI Command Center</h3>
              <p className="text-[10px] sm:text-xs text-gray-400">
                <AnimatedCounter target={data?.study_summary?.total_flashcards || 0} /> flashcards
                {' · '}
                <AnimatedCounter target={data?.journal_summary?.total_entries || 0} /> entries
                {' · '}
                <AnimatedCounter target={data?.bookmark_summary?.total_bookmarks || 0} /> bookmarks
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/study')}
            className="btn-gradient px-5 py-2.5 text-xs w-full sm:w-auto"
          >
            Open AI Studio
          </button>
        </div>
      </GlowingCard>

      {/* ===================================================
          MODULE GRID — all 6 feature modules
          =================================================== */}
      <div className="mb-4 flex items-center gap-3">
        <div className="w-8 h-px bg-gradient-to-r from-indigo-500 to-transparent"></div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Your Modules</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-in">
        {/* Experiments */}
        <ModuleCard
          title="Life Experiments"
          icon="🧪"
          gradient="bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
          onClick={() => navigate('/experiments')}
        >
          <div className="flex items-center gap-4">
            <p className="text-3xl font-black text-amber-400 stat-number">
              <AnimatedCounter target={data?.experiments_summary?.active_count || 0} />
            </p>
            <p className="text-xs text-gray-500">Active experiments running</p>
          </div>
        </ModuleCard>

        {/* Learning */}
        <ModuleCard
          title="Learning"
          icon="📚"
          gradient="bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30"
          onClick={() => navigate('/learning')}
        >
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-xl font-bold text-violet-400 stat-number">
                <AnimatedCounter target={data?.learning_summary?.in_progress || 0} />
              </p>
              <p className="text-[10px] text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-400 stat-number">
                <AnimatedCounter target={data?.learning_summary?.completed || 0} />
              </p>
              <p className="text-[10px] text-gray-500">Done</p>
            </div>
            <ProgressRing
              progress={data?.learning_summary?.avg_progress || 0}
              size={44} strokeWidth={3} color="#8b5cf6"
            >
              <span className="text-[9px] font-bold text-violet-400">
                {Math.round(data?.learning_summary?.avg_progress || 0)}%
              </span>
            </ProgressRing>
          </div>
        </ModuleCard>

        {/* Study Buddy */}
        <ModuleCard
          title="AI Study Buddy"
          icon="🤖"
          gradient="bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30"
          onClick={() => navigate('/study')}
          buttonText="Study →"
        >
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-400 stat-number">
                <AnimatedCounter target={data?.study_summary?.total_flashcards || 0} />
              </p>
              <p className="text-[10px] text-gray-500">Cards</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-400 stat-number">
                <AnimatedCounter target={data?.study_summary?.due_for_review || 0} />
              </p>
              <p className="text-[10px] text-gray-500">Due</p>
            </div>
            <ProgressRing
              progress={data?.study_summary?.avg_score || 0}
              size={44} strokeWidth={3} color="#3b82f6"
            >
              <span className="text-[9px] font-bold text-blue-400">
                {Math.round(data?.study_summary?.avg_score || 0)}%
              </span>
            </ProgressRing>
          </div>
        </ModuleCard>

        {/* Ideas */}
        <ModuleCard
          title="Idea Generator"
          icon="💡"
          gradient="bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-500/30"
          onClick={() => navigate('/ideas')}
          buttonText="Spark →"
        >
          <div className="flex items-center gap-4">
            <p className="text-3xl font-black text-pink-400 stat-number">
              <AnimatedCounter target={data?.ideas_summary?.saved_count || 0} />
            </p>
            <p className="text-xs text-gray-500">Ideas bookmarked</p>
          </div>
        </ModuleCard>

        {/* Journal */}
        <ModuleCard
          title="Voice Journal"
          icon="🎙️"
          gradient="bg-gradient-to-br from-teal-500 to-emerald-500 shadow-teal-500/30"
          onClick={() => navigate('/journal')}
          buttonText="Write →"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl" style={{ filter: 'drop-shadow(0 0 8px rgba(20,184,166,0.4))' }}>
              {data?.journal_summary?.mood_emoji || '😐'}
            </span>
            <div>
              <p className="text-xl font-bold text-teal-400 stat-number">
                <AnimatedCounter target={data?.journal_summary?.total_entries || 0} />
              </p>
              <p className="text-[10px] text-gray-500">Journal entries</p>
            </div>
          </div>
        </ModuleCard>

        {/* Bookmarks */}
        <ModuleCard
          title="Smart Bookmarks"
          icon="🔖"
          gradient="bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30"
          onClick={() => navigate('/bookmarks')}
          buttonText="Browse →"
        >
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-xl font-bold text-orange-400 stat-number">
                <AnimatedCounter target={data?.bookmark_summary?.total_bookmarks || 0} />
              </p>
              <p className="text-[10px] text-gray-500">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-400 stat-number">
                <AnimatedCounter target={data?.bookmark_summary?.total_categories || 0} />
              </p>
              <p className="text-[10px] text-gray-500">Categories</p>
            </div>
          </div>
        </ModuleCard>
      </div>
    </div>
  );
}
