import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Flame, 
  Sprout, 
  BookOpen, 
  Smile, 
  Activity, 
  CheckCircle2, 
  MessageSquare,
  Compass,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { LocalUserState } from "../types";
import { 
  addMoodLog, 
  getMoodLogs, 
  getOrCreateDailyGoals, 
  toggleGoalCompletion,
  MoodLog,
  DailyGoal
} from "../supabase";

interface DashboardHomeProps {
  user: LocalUserState;
  onUpdateUser: (data: Partial<LocalUserState>) => void;
}

export default function DashboardHome({ user, onUpdateUser }: DashboardHomeProps) {
  const [motivation, setMotivation] = useState({
    quote: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    challenge: "Take a 5-minute walk today without looking at your phone."
  });
  const [motivationLoading, setMotivationLoading] = useState(true);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [quickMoodLogged, setQuickMoodLogged] = useState(false);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);

  const emojis = [
    { label: "Happy", icon: "😊", color: "hover:bg-emerald-500/10 text-emerald-400" },
    { label: "Neutral", icon: "😐", color: "hover:bg-sky-500/10 text-sky-400" },
    { label: "Anxiety", icon: "😰", color: "hover:bg-amber-500/10 text-amber-400" },
    { label: "Sad", icon: "😢", color: "hover:bg-indigo-500/10 text-indigo-400" },
    { label: "Angry", icon: "😡", color: "hover:bg-rose-500/10 text-rose-400" },
    { label: "Excited", icon: "😍", color: "hover:bg-pink-500/10 text-pink-400" }
  ];

  // Fetch Motivation Quote & Challenge
  useEffect(() => {
    async function fetchMotivation() {
      try {
        const res = await fetch("/api/get-motivation");
        if (res.ok) {
          const data = await res.json();
          setMotivation(data);
        }
      } catch (err) {
        console.error("Failed to load motivation from backend", err);
      } finally {
        setMotivationLoading(false);
      }
    }

    async function loadGoalsAndMoods() {
      try {
        const activeGoals = await getOrCreateDailyGoals(user.uid);
        setGoals(activeGoals);

        const logs = await getMoodLogs(user.uid, 5);
        setMoodLogs(logs);
        
        // check if logged mood today
        const todayStr = new Date().toISOString().split("T")[0];
        const loggedToday = logs.some(log => log.dateStr === todayStr);
        setQuickMoodLogged(loggedToday);
      } catch (err) {
        console.error("Failed to load goals or mood logs", err);
      } finally {
        setGoalsLoading(false);
      }
    }

    fetchMotivation();
    loadGoalsAndMoods();
  }, [user.uid]);

  const handleQuickMood = async (mood: string) => {
    try {
      await addMoodLog(user.uid, mood, "Quick logged from home dashboard");
      setQuickMoodLogged(true);
      // Grow garden score on client side
      const updatedGrowth = Math.min(100, user.gardenGrowth + 3);
      onUpdateUser({
        gardenGrowth: updatedGrowth,
        gardenLevel: Math.floor(updatedGrowth / 20) + 1
      });

      // Reload goals to see if "Log your mood emoji" was checked off
      const activeGoals = await getOrCreateDailyGoals(user.uid);
      // update "Log your mood emoji" goal as completed
      const moodGoal = activeGoals.find(g => g.title.toLowerCase().includes("mood"));
      if (moodGoal && !moodGoal.completed) {
        await handleToggleGoal(moodGoal.id!, true);
      } else {
        setGoals(activeGoals);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleGoal = async (goalId: string, currentCompleted: boolean) => {
    try {
      const nextState = !currentCompleted;
      await toggleGoalCompletion(goalId, nextState);
      
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: nextState } : g));

      // Award garden growth if completing a goal
      if (nextState) {
        const updatedGrowth = Math.min(100, user.gardenGrowth + 5);
        onUpdateUser({
          gardenGrowth: updatedGrowth,
          gardenLevel: Math.floor(updatedGrowth / 20) + 1
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate an average wellness or happiness score based on recent moods
  const getWellnessScore = () => {
    if (moodLogs.length === 0) return 75; // baseline default
    const moodWeights: Record<string, number> = {
      "Happy": 95, "Excited": 100, "Neutral": 70, "Anxiety": 45, "Sad": 30, "Angry": 25
    };
    const total = moodLogs.reduce((acc, curr) => acc + (moodWeights[curr.mood] || 70), 0);
    return Math.round(total / moodLogs.length);
  };

  const wellnessScore = getWellnessScore();

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-1 py-4 md:py-6 pb-20 md:pb-6">
      
      {/* Safety Notice Warning */}
      <div id="safety-warning" className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs md:text-sm">
        <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Safety Disclaimer:</span> MindMate AI is a daily mental wellness companion designed to support early self-care, reflection, and journaling. It is NOT a medical diagnosis tool or replacement for licensed professional mental health care.
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-6 md:p-8 border border-indigo-500/20 shadow-xl">
        {/* Soft background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-cyan-600/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold tracking-wider uppercase">Welcome Back</span>
              <span className="text-xs text-slate-400">• Day {user.streak} of your wellness journey</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-semibold text-white leading-tight">
              Hello, <span className="gradient-text font-sans font-bold">{user.displayName || "Friend"}</span>. <br />
              <span className="text-slate-300 font-normal text-xl md:text-2xl">How does your heart feel today?</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            {/* Wellness Score Card */}
            <div className="px-5 py-4 bg-slate-900/40 rounded-2xl border border-slate-800 text-center min-w-[120px]">
              <span className="text-xs text-slate-400 block mb-1">Wellness Score</span>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-3xl font-extrabold text-indigo-400">{wellnessScore}</span>
                <span className="text-xs text-slate-500">/100</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-emerald-400 mr-1" /> Based on logs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing Daily Goals list and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Goals Checklist */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-serif font-medium text-white">Your Wellness Goals</h2>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
              +5% Garden growth per task
            </span>
          </div>

          {goalsLoading ? (
            <div className="space-y-2.5 py-4 animate-pulse">
              <div className="h-10 bg-slate-800 rounded-xl"></div>
              <div className="h-10 bg-slate-800 rounded-xl"></div>
              <div className="h-10 bg-slate-800 rounded-xl"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map((goal) => (
                <div 
                  key={goal.id} 
                  onClick={() => handleToggleGoal(goal.id!, goal.completed)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    goal.completed 
                      ? "bg-indigo-950/10 border-indigo-500/30 text-slate-400" 
                      : "bg-slate-900/30 border-slate-800/80 text-white hover:border-slate-700 hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button className="focus:outline-none">
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                        goal.completed ? "bg-indigo-600 border-indigo-500" : "border-slate-600 hover:border-indigo-400"
                      }`}>
                        {goal.completed && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                    </button>
                    <span className={`text-xs md:text-sm ${goal.completed ? "line-through text-slate-500" : "font-medium"}`}>
                      {goal.title}
                    </span>
                  </div>
                  {goal.completed && <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">Completed</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-serif font-medium text-white">Mindfulness Station</h2>
          </div>

          <div className="space-y-2.5">
            <Link 
              to="/chat" 
              className="flex items-center justify-between p-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">AI Support Chat</span>
                  <span className="text-[10px] text-slate-400">Empathetic active listening.</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-400" />
            </Link>

            <Link 
              to="/journal" 
              className="flex items-center justify-between p-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-600/20 rounded-lg text-emerald-400">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Daily Reflexive Journal</span>
                  <span className="text-[10px] text-slate-400">AI emotion & summary analysis.</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </Link>

            <Link 
              to="/wellness" 
              className="flex items-center justify-between p-3 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/20 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-600/20 rounded-lg text-cyan-400">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Meditation & Breathing</span>
                  <span className="text-[10px] text-slate-400">Visual breathing circle guide.</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-cyan-400" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
