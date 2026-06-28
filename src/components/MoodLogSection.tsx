import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from "recharts";
import { Smile, Calendar, BookOpen, AlertCircle, TrendingUp, Sparkles, Send } from "lucide-react";
import { LocalUserState } from "../types";
import { addMoodLog, getMoodLogs, MoodLog } from "../supabase";

interface MoodLogSectionProps {
  user: LocalUserState;
  onUpdateUser: (data: Partial<LocalUserState>) => void;
}

export default function MoodLogSection({ user, onUpdateUser }: MoodLogSectionProps) {
  const [mood, setMood] = useState<string>("Happy");
  const [note, setNote] = useState<string>("");
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const emojis: Record<string, { icon: string; bg: string; text: string; value: number }> = {
    "Happy": { icon: "😊", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", text: "Happy", value: 5 },
    "Excited": { icon: "😍", bg: "bg-pink-500/10 border-pink-500/20 text-pink-400", text: "Excited", value: 6 },
    "Neutral": { icon: "😐", bg: "bg-sky-500/10 border-sky-500/20 text-sky-400", text: "Neutral", value: 4 },
    "Anxiety": { icon: "😰", bg: "bg-amber-500/10 border-amber-500/20 text-amber-400", text: "Anxious", value: 2 },
    "Sad": { icon: "😢", bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400", text: "Sad", value: 1 },
    "Angry": { icon: "😡", bg: "bg-rose-500/10 border-rose-500/20 text-rose-400", text: "Angry", value: 0 }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const moodHistory = await getMoodLogs(user.uid, 30);
      setLogs(moodHistory);
    } catch (err) {
      console.error("Failed to load mood logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      await addMoodLog(user.uid, mood, note || "Logged with feelings");
      setNote("");
      
      // Award growth score on frontend
      const updatedGrowth = Math.min(100, user.gardenGrowth + 3);
      onUpdateUser({
        gardenGrowth: updatedGrowth,
        gardenLevel: Math.floor(updatedGrowth / 20) + 1
      });

      await loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare line chart data
  const chartData = logs.map(log => {
    const d = new Date(log.dateStr);
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return {
      date: dateFormatted,
      score: emojis[log.mood]?.value ?? 3,
      mood: log.mood
    };
  });

  // Prepare pie chart data
  const moodCounts: Record<string, number> = {};
  logs.forEach(log => {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  });

  const pieColors: Record<string, string> = {
    "Happy": "#10b981",
    "Excited": "#ec4899",
    "Neutral": "#0ea5e9",
    "Anxiety": "#f59e0b",
    "Sad": "#6366f1",
    "Angry": "#ef4444"
  };

  const pieData = Object.keys(moodCounts).map(key => ({
    name: key,
    value: moodCounts[key],
    color: pieColors[key] || "#a855f7"
  }));

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-1 py-4 md:py-6 pb-20 md:pb-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight flex items-center space-x-2">
          <Smile className="h-7 w-7 text-indigo-400" />
          <span>Daily Mood Tracker & Insights</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Express your inner state, map your emotional patterns over time, and nurture self-care.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mood Logger Form */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 lg:col-span-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-serif font-semibold text-white">Log Your Feelings</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">Select the emoji that matches your mood:</label>
              <div className="grid grid-cols-3 gap-2.5">
                {Object.keys(emojis).map((key) => {
                  const item = emojis[key];
                  const isSelected = mood === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMood(key)}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${
                        isSelected 
                          ? "bg-indigo-600/20 border-indigo-500 shadow-lg scale-105" 
                          : "bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                      }`}
                    >
                      <span className="text-3xl mb-1">{item.icon}</span>
                      <span className="text-[10px] font-medium text-slate-300">{item.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Add a personal reflection (optional):</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What triggered this emotion? What are your thoughts..."
                className="w-full min-h-[100px] text-xs bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? "Logging..." : "Securely Save Log"}</span>
            </button>
          </form>
        </div>

        {/* Mood Analytics Charts */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-serif font-semibold text-white">Your Mood Analytics</h2>
            </div>
            <span className="text-[10px] text-slate-400">Past 30 entries</span>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500 animate-pulse">
              Analyzing mood trends...
            </div>
          ) : logs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2 text-center p-4">
              <span className="text-3xl">📊</span>
              <span className="text-sm font-medium text-slate-300">No Analytics Available Yet</span>
              <p className="text-xs text-slate-500 max-w-sm">Log your mood for a few days to visualize your psychological trends and stress patterns.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Line Chart showing mood progression */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Mood Fluctuations (Chronological)</span>
                <div className="h-48 md:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        domain={[0, 6]} 
                        ticks={[0, 1, 2, 4, 5, 6]} 
                        tickFormatter={(value) => {
                          if (value === 6) return " Excited";
                          if (value === 5) return " Happy";
                          if (value === 4) return " Neutral";
                          if (value === 2) return " Anxious";
                          if (value === 1) return " Sad";
                          if (value === 0) return " Angry";
                          return "";
                        }} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", fontSize: "11px" }}
                        formatter={(value: any, name, props) => [props.payload.mood, "Current State"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        dot={{ fill: "#818cf8", strokeWidth: 2 }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Two-Column Chart breakdown (Mood distribution) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                
                {/* Distribution Pie Chart */}
                <div className="space-y-2 flex flex-col items-center">
                  <span className="text-xs font-semibold text-slate-300 self-start">Mood Distribution</span>
                  <div className="h-40 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Legend and Analysis details */}
                <div className="space-y-3 justify-center flex flex-col">
                  <span className="text-xs font-semibold text-slate-300">Insights Summary</span>
                  <div className="grid grid-cols-2 gap-2">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center space-x-2 text-xs">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-400">{item.name}: <strong className="text-slate-200">{item.value}</strong></span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl">
                    <p className="text-[11px] text-slate-400">
                      Your dominant emotion recently has been <strong className="text-indigo-300">
                        {pieData.length > 0 ? pieData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name : "Neutral"}
                      </strong>. Logging consistently helps the MindMate AI refine its advice.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>

      {/* Historical Entries Logs */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-serif font-semibold text-white">Mood Reflection Logs</h2>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-12 bg-slate-800 rounded-xl"></div>
            <div className="h-12 bg-slate-800 rounded-xl"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">No entries logged yet. Try adding your first mood log above!</div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {logs.slice().reverse().map((log) => {
              const item = emojis[log.mood] || { icon: "😐", text: log.mood, bg: "bg-slate-800 text-slate-300 border-slate-700" };
              return (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-900/30 border border-slate-800/80 rounded-xl space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{log.mood}</span>
                        <span className="text-[10px] text-slate-500">
                          {log.timestamp ? new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : log.dateStr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 italic">"{log.note}"</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-indigo-400/80 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded self-start sm:self-center">
                    Mood Logged
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
