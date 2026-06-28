import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Smile, 
  MessageSquare, 
  BookOpen, 
  Compass, 
  Sprout, 
  ShieldAlert, 
  Lock,
  LogOut,
  Flame,
  Moon,
  Sun
} from "lucide-react";
import { LocalUserState } from "../types";

const menuItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/mood", label: "Mood Tracker", icon: Smile },
  { path: "/chat", label: "AI Companion", icon: MessageSquare },
  { path: "/journal", label: "AI Journal", icon: BookOpen },
  { path: "/wellness", label: "Wellness Hub", icon: Compass },
  { path: "/garden", label: "Wellness Garden", icon: Sprout },
  { path: "/burnout", label: "Burnout Predictor", icon: ShieldAlert },
  { path: "/admin", label: "Admin Insights", icon: Lock },
];

interface NavigationProps {
  user: LocalUserState | null;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Navigation({ user, onLogout, theme, onToggleTheme }: NavigationProps) {
  const location = useLocation();

  return (
    <>
      {/* Top Navbar */}
      <nav id="top-navbar" className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/30">
            <Sprout className="h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <span className="font-serif text-lg md:text-xl font-bold text-white tracking-wide">MindMate <span className="text-indigo-400 font-sans text-xs uppercase px-1.5 py-0.5 bg-indigo-900/40 rounded border border-indigo-500/20">AI</span></span>
            <p className="text-[10px] text-slate-400 hidden sm:block">Your Daily Mental Wellness Companion</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            {/* Streak Counter */}
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold">
              <Flame className="h-4 w-4 fill-amber-500" />
              <span>{user.streak} Day Streak</span>
            </div>

            {/* Garden Level */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
              <Sprout className="h-4 w-4" />
              <span>Garden Lvl {user.gardenLevel} ({user.gardenGrowth}%)</span>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={onToggleTheme} 
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
            </button>

            {/* User Profile Info */}
            <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
              <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-slate-200">{user.displayName || "User"}</p>
                <p className="text-[10px] text-slate-500">{user.isGuest ? "Guest Mode" : user.email}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors ml-1"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom navigation bar */}
      {user && (
        <nav id="mobile-nav" className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/80 flex justify-around py-2.5 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-0.5 text-slate-400 hover:text-white ${
                  isActive ? "text-indigo-400 font-semibold" : ""
                }`}
                title={item.label}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span className="text-[9px] truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}

export function Sidebar({ user }: { user: LocalUserState | null }) {
  const location = useLocation();

  if (!user) return null;

  return (
    <aside id="sidebar" className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800/60 h-[calc(100vh-61px)] p-4 space-y-2 sticky top-[61px] overflow-y-auto">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Navigation</div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? "bg-indigo-650/30 text-indigo-300 border-l-4 border-indigo-500 pl-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-indigo-950/15 border border-indigo-500/10 text-xs shadow-inner">
          <span className="font-semibold text-indigo-300 block mb-1">🌱 Daily Care Quote</span>
          <p className="text-[11px] text-slate-400 italic leading-relaxed">"Be gentle with yourself. You are doing the best you can."</p>
        </div>
      </div>
    </aside>
  );
}

