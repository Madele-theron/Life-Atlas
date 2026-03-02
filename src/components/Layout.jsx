import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, HeartPulse, Wallet, Heart, Sparkles, PieChart, Target, BookOpen, ReceiptCent, Dumbbell, ShieldCheck, Sun, GraduationCap, Mountain, FileSpreadsheet, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Determine current active macro area based on URL path
  const isWealth = currentPath.startsWith('/wealth');
  const isHealth = currentPath.startsWith('/health');
  const isLove = currentPath.startsWith('/love');
  const isSelf = currentPath.startsWith('/self');
  const isAscent = currentPath.startsWith('/ascent');

  return (
    <div className="app-container">
      {/* Global Sidebar */}
      <nav className="global-sidebar">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `global-sidebar-link ${isActive && !isWealth && !isHealth && !isLove && !isSelf && !isAscent ? 'active' : ''}`}
          title="Global Overview"
        >
          <LayoutGrid size={24} />
        </NavLink>
        <NavLink
          to="/health"
          className={({ isActive }) => `global-sidebar-link ${isActive ? 'active-health' : ''}`}
          title="Health"
        >
          <HeartPulse size={24} />
        </NavLink>
        <NavLink
          to="/wealth"
          className={({ isActive }) => `global-sidebar-link ${isActive ? 'active-wealth' : ''}`}
          title="Wealth"
        >
          <Wallet size={24} />
        </NavLink>
        <NavLink
          to="/love"
          className={({ isActive }) => `global-sidebar-link ${isActive ? 'active-love' : ''}`}
          title="Love"
        >
          <Heart size={24} />
        </NavLink>
        <NavLink
          to="/self"
          className={({ isActive }) => `global-sidebar-link ${isActive ? 'active-self' : ''}`}
          title="Self"
        >
          <Sparkles size={24} />
        </NavLink>
        <div style={{ width: '32px', height: '1px', background: 'var(--border-glass)', margin: '0.5rem 0' }}></div>
        <NavLink
          to="/ascent"
          className={({ isActive }) => `global-sidebar-link ${isActive ? 'active-ascent' : ''}`}
          title="The Ascent"
        >
          <Mountain size={24} />
        </NavLink>

        <div style={{ flexGrow: 1 }}></div>
        <button
          onClick={handleSignOut}
          className="global-sidebar-link text-zinc-500 hover:text-red-400 mt-auto mb-4"
          title="Sign Out"
        >
          <LogOut size={24} />
        </button>
      </nav>

      {/* Area Specific Sidebar */}
      {isWealth && (
        <aside className="area-sidebar">
          <div className="area-sidebar-title">Financial Center</div>
          <NavLink to="/wealth" end className="area-nav-link">
            <LayoutGrid size={18} /> Dashboard
          </NavLink>
          <NavLink to="/wealth/tracker" className="area-nav-link">
            <FileSpreadsheet size={18} /> Financial Tracker
          </NavLink>
          <NavLink to="/wealth/cash-flow" className="area-nav-link">
            <ReceiptCent size={18} /> Cash Flow & Spending
          </NavLink>
          <NavLink to="/wealth/assets" className="area-nav-link">
            <PieChart size={18} /> Assets & Investments
          </NavLink>
          <NavLink to="/wealth/goals" className="area-nav-link">
            <Target size={18} /> Goals & Values
          </NavLink>
          <NavLink to="/wealth/knowledge" className="area-nav-link">
            <BookOpen size={18} /> Notes & Learnings
          </NavLink>
          <NavLink to="/wealth/course" className="area-nav-link">
            <GraduationCap size={18} /> Courses
          </NavLink>
        </aside>
      )}

      {/* Area Specific Sidebar - Health */}
      {isHealth && (
        <aside className="area-sidebar">
          <div className="area-sidebar-title">Health Center</div>
          <NavLink to="/health" end className="area-nav-link">
            <LayoutGrid size={18} /> Dashboard
          </NavLink>
          <NavLink to="/health/fitness" className="area-nav-link">
            <Dumbbell size={18} /> Fitness Tracking
          </NavLink>
          <NavLink to="/health/longevity" className="area-nav-link">
            <ShieldCheck size={18} /> Longevity & Nutrition
          </NavLink>
          <NavLink to="/health/mind" className="area-nav-link">
            <Sun size={18} /> Mental Wellbeing
          </NavLink>
        </aside>
      )}

      {/* Future sub-sidebars for Love, Self can go here */}

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
