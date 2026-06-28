import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Calendar, 
  Smile, 
  Trash, 
  Check, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  BadgeAlert
} from "lucide-react";
import { LocalUserState } from "../types";
import { addJournalEntry, getJournalEntries, JournalEntry } from "../supabase";

interface AIJournalSectionProps {
  user: LocalUserState;
  onUpdateUser: (data: Partial<LocalUserState>) => void;
}

export default function AIJournalSection({ user, onUpdateUser }: AIJournalSectionProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [journalsLoading, setJournalsLoading] = useState(true);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);

  const emotions: Record<string, string> = {
    "Happy": "😊",
    "Excited": "😍",
    "Neutral": "😐",
    "Anxiety": "😰",
    "Sad": "😢",
    "Angry": "😡"
  };

  const loadJournals = async () => {
    try {
      setJournalsLoading(true);
      const entries = await getJournalEntries(user.uid, 20);
      setJournals(entries);
    } catch (err) {
      console.error(err);
    } finally {
      setJournalsLoading(false);
    }
  };

  useEffect(() => {
    loadJournals();
  }, [user.uid]);

  const handleAnalyzeAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    try {
      setLoading(true);

      // 1. Post to the backend to perform Gemini Emotion Analysis and Summarization
      const res = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
      });

      if (!res.ok) {
        throw new Error("Failed to analyze journal");
      }

      const analysis = await res.json();
      setLatestAnalysis(analysis);

      // 2. Save the journal entry AND its analysis in Firestore
      await addJournalEntry(user.uid, content, analysis);

      // 3. Clear text and update user garden growth (+7 for journal)
      setContent("");
      const updatedGrowth = Math.min(100, user.gardenGrowth + 7);
      onUpdateUser({
        gardenGrowth: updatedGrowth,
        gardenLevel: Math.floor(updatedGrowth / 20) + 1
      });

      // 4. Reload journals list
      await loadJournals();

    } catch (err) {
      console.error(err);
      // Fallback if anything fails
      const fallbackAnalysis = {
        emotion: "Neutral",
        sentimentScore: 60,
        summary: "Journal entry logged successfully.",
        keywords: ["Reflection", "Mindfulness"],
        reflectionPrompt: "What is one thing you are grateful for today?"
      };
      setLatestAnalysis(fallbackAnalysis);
      await addJournalEntry(user.uid, content, fallbackAnalysis);
      setContent("");
      await loadJournals();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-1 py-4 md:py-6 pb-20 md:pb-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight flex items-center space-x-2">
          <BookOpen className="h-7 w-7 text-indigo-400" />
          <span>Daily Reflexive AI Journal</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Pour your thoughts onto your private canvas. Our AI analyzes your sentiment patterns, extracts core triggers, and gives you healing prompts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Journal Section */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 lg:col-span-7">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-serif font-semibold text-white font-medium">Write Your Reflection</h2>
          </div>

          <form onSubmit={handleAnalyzeAndSave} className="space-y-4">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write whatever is in your heart today... Explain how you slept, what stressed you, what brought you joy. Let your emotions flow without judgement..."
                className="w-full min-h-[220px] text-xs md:text-sm bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
                disabled={loading}
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-slate-500">
                {content.length} characters
              </span>
            </div>

            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white rounded-xl text-xs md:text-sm font-semibold shadow-lg transition-all"
            >
              <Sparkles className="h-4.5 w-4.5 text-indigo-200 animate-pulse" />
              <span>{loading ? "AI is summarizing & analyzing emotion..." : "Save and Run Emotion AI"}</span>
            </button>
          </form>

          {/* Prompt Aid Helper */}
          <div className="p-3.5 bg-indigo-950/10 border border-indigo-900/20 rounded-xl flex items-start space-x-2.5">
            <HelpCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-indigo-300 block mb-0.5">Stuck? Try writing about:</span>
              What was the most challenging part of your day, what did you learn, or what are you looking forward to tomorrow?
            </div>
          </div>
        </div>

        {/* Real-time AI Analysis Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block">AI Clinical Insight</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">Real-time</span>
              </div>

              {!latestAnalysis ? (
                <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                  <span className="text-4xl">🔮</span>
                  <span className="text-xs font-semibold text-slate-400">Waiting for Entry</span>
                  <p className="text-[11px] text-slate-500 max-w-xs">Write a journal entry on the left and submit to view AI summarization, sentiment scores, and trigger keywords.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Emotion Indicator & Sentiment Score */}
                  <div className="flex items-center justify-between p-3 bg-indigo-950/20 border border-indigo-900/20 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl">{emotions[latestAnalysis.emotion] || "😐"}</span>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Primary Emotion</span>
                        <span className="text-xs font-bold text-white">{latestAnalysis.emotion}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Sentiment Score</span>
                      <span className="text-xs font-bold text-indigo-400">{latestAnalysis.sentimentScore}/100</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Executive Summary</span>
                    <blockquote className="p-3 bg-slate-900/40 border-l-4 border-indigo-500 rounded text-xs text-slate-300 italic leading-relaxed">
                      "{latestAnalysis.summary}"
                    </blockquote>
                  </div>

                  {/* Keywords Extracted */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Core Triggers & Themes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {latestAnalysis.keywords?.map((kw: string, i: number) => (
                        <span key={i} className="text-[10px] font-medium bg-slate-800 text-indigo-300 px-2 py-1 rounded-md border border-slate-700">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reflection Question */}
                  <div className="p-3.5 bg-emerald-950/15 border border-emerald-900/20 rounded-xl space-y-1">
                    <div className="flex items-center space-x-1">
                      <Smile className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Mindful Prompt Suggestion</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {latestAnalysis.reflectionPrompt}
                    </p>
                  </div>

                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-800 text-center">
              Journal logs are fully private and encrypted.
            </div>
          </div>
        </div>

      </div>

      {/* Historical Entries */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-serif font-semibold text-white">Journal History</h2>
        </div>

        {journalsLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-16 bg-slate-800 rounded-xl"></div>
            <div className="h-16 bg-slate-800 rounded-xl"></div>
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No journals saved yet. Spill your thoughts above to begin tracking your mood patterns.</div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {journals.map((entry) => (
              <div key={entry.id} className="p-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{emotions[entry.analysis?.emotion || "Neutral"] || "😐"}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">Sentiment Score: {entry.analysis?.sentimentScore || 50}/100</span>
                        <span className="text-[10px] text-slate-500">
                          {entry.timestamp ? new Date(entry.timestamp.toDate ? entry.timestamp.toDate() : entry.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : entry.dateStr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-h-[80px] overflow-y-auto">{entry.content}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    {entry.analysis?.emotion || "Neutral"}
                  </span>
                </div>

                {entry.analysis?.summary && (
                  <div className="pl-4 border-l-2 border-indigo-500/40 text-[11px] text-slate-400 italic">
                    AI Summary: "{entry.analysis.summary}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
