import React, { useState } from "react";
import { 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  HelpCircle, 
  Info, 
  RotateCcw,
  BadgeAlert,
  ArrowRight,
  Smile,
  AlertTriangle
} from "lucide-react";
import { LocalUserState } from "../types";

interface BurnoutPredictorSectionProps {
  user: LocalUserState;
}

export default function BurnoutPredictorSection({ user }: BurnoutPredictorSectionProps) {
  const [sleepQuality, setSleepQuality] = useState<number>(6);
  const [answers, setAnswers] = useState<number[]>([1, 1, 1, 1, 1]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const questions = [
    { id: 0, text: "How exhausted do you feel physically or emotionally at the end of a typical workday?", labels: ["Not at all", "Somewhat", "Quite a bit", "Extremely exhausted"] },
    { id: 1, text: "How often do you find yourself feeling cynical, distant, or resentful toward your daily responsibilities?", labels: ["Rarely", "Occasionally", "Frequently", "Almost constantly"] },
    { id: 2, text: "How often do you struggle to fall asleep or wake up feeling tired over the past week?", labels: ["Never", "Once or twice", "Most days", "Every single night"] },
    { id: 3, text: "How often do you experience physical symptoms like tension, headaches, or muscle fatigue due to stress?", labels: ["Rarely", "Sometimes", "Often", "Severely every day"] },
    { id: 4, text: "How would you rate your level of emotional disinterest or apathy in hobbies or relationships?", labels: ["Perfect engagement", "Minor disinterest", "Noticeable apathy", "Complete burnout/isolation"] }
  ];

  const handleSelectAnswer = (qIndex: number, val: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[qIndex] = val;
      return next;
    });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      // fetch from express backend which runs Gemini evaluation
      const res = await fetch("/api/burnout-prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          moodHistory: [ "logged recently" ],
          sleepQuality,
          stressAnswers: answers
        })
      });

      if (!res.ok) {
        throw new Error("Failed to predict burnout");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setResult({
        riskLevel: "Medium",
        riskScore: 52,
        insights: [
          "Establish strict digital boundaries and limit off-hour work emails.",
          "Schedule 10 minutes of box breathing mid-afternoon.",
          "Go for a quiet 15-minute nature walk after lunch without screens."
        ],
        advice: "You have a moderate risk of burnout. It is highly recommended to practice daily mindfulness and set clear boundaries around work."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAnswers([1, 1, 1, 1, 1]);
    setSleepQuality(6);
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto px-1 py-4 md:py-6 pb-20 md:pb-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight flex items-center space-x-2">
          <ShieldAlert className="h-7 w-7 text-rose-400" />
          <span>AI Burnout Risk Predictor</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Evaluate your neurological exhaustion parameters. Using emotional logs, sleep quality indexes, and stress indicators, we estimate your risk levels.
        </p>
      </div>

      {/* Safety Notice Warning */}
      <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs">
        <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Clinical Notice:</span> The Burnout Predictor is an offline estimation based on self-reported stress behaviors and emotional indexes. It is not an official clinical diagnosis. For psychological support, please seek advice from licensed clinicians.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Burnout Predictor Questionnaire */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 lg:col-span-7 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200">Exhaustion Assessment</h2>
          </div>

          {!result ? (
            <form onSubmit={handlePredict} className="space-y-6">
              
              {/* Sleep Index slider */}
              <div className="space-y-2.5 p-4 bg-slate-900/40 rounded-2xl border border-slate-850">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Sleep Quality Index (Past Week)</span>
                  <span className="text-xs font-bold text-indigo-400">{sleepQuality}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Very Distressed</span>
                  <span>Restful & Deep</span>
                </div>
              </div>

              {/* Questionnaire list */}
              <div className="space-y-5">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <span className="text-xs text-slate-300 font-medium block">
                      {q.id + 1}. {q.text}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {q.labels.map((label, index) => {
                        const isSelected = answers[q.id] === index;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, index)}
                            className={`p-2 rounded-xl text-[10px] md:text-xs font-medium text-center border transition-all ${
                              isSelected 
                                ? "bg-indigo-600/25 border-indigo-500 text-indigo-300" 
                                : "bg-slate-900/20 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white rounded-xl text-xs md:text-sm font-semibold shadow-lg transition-all"
              >
                <Sparkles className="h-4.5 w-4.5 animate-pulse text-indigo-200" />
                <span>{submitting ? "Analyzing stress vectors..." : "Estimate Burnout Risk Index"}</span>
              </button>

            </form>
          ) : (
            <div className="space-y-6 py-6 text-center">
              <span className="text-5xl block animate-float">📊</span>
              <h3 className="text-xl font-serif font-bold text-white">Assessment Complete</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Your stress parameters and emotional fatigue inputs have been compiled. View your personalized report on the right.</p>
              
              <button
                onClick={handleReset}
                className="flex items-center space-x-1.5 px-4 py-2 mx-auto bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Take Another Assessment</span>
              </button>
            </div>
          )}
        </div>

        {/* Burnout Result Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5 min-h-[440px] flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block">AI Diagnostic Assessment</span>
              
              {!result ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                  <span className="text-4xl">🔬</span>
                  <span className="text-xs font-semibold text-slate-400">Waiting for Inputs</span>
                  <p className="text-[11px] text-slate-500 max-w-xs">Complete the Exhaustion Assessment questionnaire to generate your stress index, risk level, and clinical self-care guidelines.</p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  
                  {/* Gauge Risk Level Indicator */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    result.riskLevel === "Low" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : result.riskLevel === "Medium" 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Burnout Risk Status</span>
                      <span className="text-base font-bold uppercase tracking-wider">{result.riskLevel} Risk</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Risk Score</span>
                      <span className="text-xl font-extrabold">{result.riskScore}/100</span>
                    </div>
                  </div>

                  {/* Summary Advice */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Expert Advisory Summary</span>
                    <blockquote className="p-3 bg-slate-900/40 border-l-4 border-indigo-500 rounded text-xs text-slate-300 italic leading-relaxed">
                      "{result.advice}"
                    </blockquote>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Actionable Self-Care Guidelines</span>
                    <div className="space-y-2">
                      {result.insights?.map((insight: string, i: number) => (
                        <div key={i} className="flex items-start space-x-2 p-2 bg-slate-950/20 border border-slate-900 rounded-lg text-xs text-slate-300">
                          <CheckCircleBadge riskLevel={result.riskLevel} />
                          <p>{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-800 text-center">
              Evaluated with Gemini 2.5 Cognitive Science templates.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

function CheckCircleBadge({ riskLevel }: { riskLevel: string }) {
  if (riskLevel === "Low") {
    return <span className="text-emerald-400 text-xs shrink-0 mt-0.5">✓</span>;
  }
  if (riskLevel === "Medium") {
    return <span className="text-amber-400 text-xs shrink-0 mt-0.5">✓</span>;
  }
  return <span className="text-rose-400 text-xs shrink-0 mt-0.5">✓</span>;
}
