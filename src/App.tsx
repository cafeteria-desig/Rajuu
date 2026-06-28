import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut, auth, getOrCreateUserProfile, verifyAndIncrementStreak } from "./supabase";
import { LocalUserState } from "./types";

// Import Components
import OnboardingScreen from "./components/OnboardingScreen";
import Navigation, { Sidebar } from "./components/Navigation";
import DashboardHome from "./components/DashboardHome";
import MoodLogSection from "./components/MoodLogSection";
import AIChatSection from "./components/AIChatSection";
import AIJournalSection from "./components/AIJournalSection";
import WellnessHubSection from "./components/WellnessHubSection";
import WellnessGardenSection from "./components/WellnessGardenSection";
import BurnoutPredictorSection from "./components/BurnoutPredictorSection";
import AdminPanelSection from "./components/AdminPanelSection";

export default function App() {
  const [user, setUser] = useState<LocalUserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Validate session on startup
  useEffect(() => {
    // Check if there is an active Supabase Auth user
    const unsubscribe = onAuthStateChanged(auth, async (supabaseUser) => {
      if (supabaseUser) {
        try {
          // Increment or verify daily login streak
          const profile = await verifyAndIncrementStreak(supabaseUser.uid);
          setUser({
            uid: supabaseUser.uid,
            email: supabaseUser.email,
            displayName: profile.displayName || supabaseUser.displayName,
            isGuest: false,
            streak: profile.streak,
            gardenGrowth: profile.gardenGrowth,
            gardenLevel: profile.gardenLevel
          });
        } catch (err) {
          console.error("Supabase session sync error", err);
        }
      } else {
        // Fallback: check if guest user token is loaded in local session
        const localGuestUid = localStorage.getItem("mindmate_guest_uid");
        const activeGuestSession = localStorage.getItem("mindmate_guest_active");
        
        if (localGuestUid && activeGuestSession === "true") {
          try {
             const profile = await verifyAndIncrementStreak(localGuestUid);
            setUser({
              uid: localGuestUid,
              email: "guest@mindmate.ai",
              displayName: profile.displayName || "Guest Companion",
              isGuest: true,
              streak: profile.streak,
              gardenGrowth: profile.gardenGrowth,
              gardenLevel: profile.gardenLevel
            });
          } catch (err) {
            console.error("Guest session sync error", err);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = async (loggedInUser: LocalUserState) => {
    if (loggedInUser.isGuest) {
      localStorage.setItem("mindmate_guest_active", "true");
    }
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("mindmate_guest_active");
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const handleUpdateUser = (data: Partial<LocalUserState>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 space-y-4">
        <div className="p-4 bg-indigo-600/10 rounded-full border border-indigo-500/20 animate-spin">
          <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 animate-pulse">Initializing MindMate Companion...</span>
      </div>
    );
  }

  return (
    <div className={`${theme === "light" ? "light bg-slate-50 text-slate-900" : "dark bg-slate-950 text-slate-100"} min-h-screen font-sans transition-colors duration-300`}>
      <HashRouter>
        {!user ? (
          <Routes>
            <Route path="*" element={<OnboardingScreen onLoginSuccess={handleLoginSuccess} />} />
          </Routes>
        ) : (
          <div className="min-h-screen flex flex-col">
            {/* Navbars */}
            <Navigation 
              user={user} 
              onLogout={handleLogout} 
              theme={theme} 
              onToggleTheme={handleToggleTheme} 
            />

            {/* Layout structure: Sidebar + Central viewport */}
            <div className="flex flex-1">
              <Sidebar user={user} />
              
              <div className="flex-1 md:p-6 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<DashboardHome user={user} onUpdateUser={handleUpdateUser} />} />
                  <Route path="/mood" element={<MoodLogSection user={user} onUpdateUser={handleUpdateUser} />} />
                  <Route path="/chat" element={<AIChatSection user={user} />} />
                  <Route path="/journal" element={<AIJournalSection user={user} onUpdateUser={handleUpdateUser} />} />
                  <Route path="/wellness" element={<WellnessHubSection user={user} onUpdateUser={handleUpdateUser} />} />
                  <Route path="/garden" element={<WellnessGardenSection user={user} onUpdateUser={handleUpdateUser} />} />
                  <Route path="/burnout" element={<BurnoutPredictorSection user={user} />} />
                  <Route path="/admin" element={<AdminPanelSection />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </div>
        )}
      </HashRouter>
    </div>
  );
}
