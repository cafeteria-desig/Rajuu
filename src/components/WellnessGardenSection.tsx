import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sprout, 
  Sparkles, 
  Droplet, 
  Check, 
  Lock, 
  Flame, 
  Award, 
  Leaf, 
  Heart 
} from "lucide-react";
import { LocalUserState } from "../types";
import { updateUserProfile } from "../supabase";

interface WellnessGardenSectionProps {
  user: LocalUserState;
  onUpdateUser: (data: Partial<LocalUserState>) => void;
}

export default function WellnessGardenSection({ user, onUpdateUser }: WellnessGardenSectionProps) {
  const [watering, setWatering] = useState(false);
  const [waterSuccess, setWaterSuccess] = useState(false);

  const plantStages = [
    { level: 1, name: "Vulnerable Sprout", emoji: "🌱", desc: "A tiny seedling taking its first breath. Needs gentle daily reflections.", minPct: 0 },
    { level: 2, name: "Resilient Sapling", emoji: "🌿", desc: "Stretching upward, growing stronger. It begins to withstand stress.", minPct: 20 },
    { level: 3, name: "Mindfulness Clover", emoji: "🍀", desc: "Multiple rich shoots. Your daily mindfulness acts are taking shape.", minPct: 40 },
    { level: 4, name: "Empathetic Lotus", emoji: "🌸", desc: "A beautiful blossom representing deep self-understanding and peace.", minPct: 60 },
    { level: 5, name: "Sanctuary Oak Tree", emoji: "🌳", desc: "A mighty, permanent canopy. Safe, calm, and sheltering. Butterflies fly here.", minPct: 80 }
  ];

  const milestones = [
    { id: "leaves", name: "Unshakable Leaves", desc: "Log 3 days of consistent mood inputs", unlocked: user.gardenGrowth >= 15 },
    { id: "flowers", name: "Therapeutic Blossom", desc: "Analyze 5 journal reflections with Emotion AI", unlocked: user.gardenGrowth >= 35 },
    { id: "trees", name: "Canopy Core", desc: "Complete 3 meditation timers", unlocked: user.gardenGrowth >= 55 },
    { id: "butterflies", name: "Anarchic Butterflies", desc: "Maintain a 7-day wellness streak", unlocked: user.gardenGrowth >= 75 },
    { id: "forest", name: "MindMate Sanctuary", desc: "Nurture plant to Level 5 (80%+ growth)", unlocked: user.gardenGrowth >= 90 }
  ];

  const currentStage = plantStages.find(stage => stage.level === user.gardenLevel) || plantStages[0];

  const handleWaterPlant = async () => {
    if (watering || waterSuccess) return;

    try {
      setWatering(true);
      // simulate watering splash
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newGrowth = Math.min(100, user.gardenGrowth + 2);
      const newLevel = Math.floor(newGrowth / 20) + 1;

      const updateData = {
        gardenGrowth: newGrowth,
        gardenLevel: Math.min(5, newLevel)
      };

      // save to Supabase
      await updateUserProfile(user.uid, updateData);
      onUpdateUser(updateData);
      
      setWaterSuccess(true);
      setTimeout(() => setWaterSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setWatering(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-1 py-4 md:py-6 pb-20 md:pb-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight flex items-center space-x-2">
          <Sprout className="h-7 w-7 text-emerald-400 animate-float" />
          <span>Your Emotional Wellness Garden</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Nurture your mental state, complete daily goals, and witness your psychological healing manifest as a beautiful, growing virtual plant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PLANT VISUAL STAGE CARD */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 lg:col-span-7 flex flex-col justify-between items-center relative overflow-hidden min-h-[460px]">
          {/* Animated glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl animate-pulse-slow"></div>

          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
            <div className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200">Active Cultivation Canvas</h2>
            </div>
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Level {user.gardenLevel} Plant
            </span>
          </div>

          {/* Core Visual Plant Stage */}
          <div className="my-10 relative flex flex-col items-center justify-center relative z-10 select-none">
            
            {/* Stage Level Plant Emoji rendering with animations */}
            <AnimatePresence mode="wait">
              <motion.div
                key={user.gardenLevel}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1.0, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-8xl md:text-9xl mb-4 animate-float relative flex items-center justify-center"
              >
                {currentStage.emoji}
                
                {/* Float surrounding butterflies if tree stage (lvl 5) */}
                {user.gardenLevel === 5 && (
                  <>
                    <span className="absolute -top-3 -left-4 text-2xl animate-pulse delay-75">🦋</span>
                    <span className="absolute -bottom-1 -right-5 text-2xl animate-pulse delay-300">🦋</span>
                  </>
                )}
                
                {/* Sparkles if blooming stage (lvl 4) */}
                {user.gardenLevel === 4 && (
                  <span className="absolute -top-4 right-1 text-2xl text-pink-300 animate-spin">✨</span>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="text-center space-y-1.5 max-w-sm mt-3">
              <h3 className="text-xl font-serif font-bold text-white tracking-wide">{currentStage.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed italic">"{currentStage.desc}"</p>
            </div>
          </div>

          {/* Growth Bar & Quick Water Action */}
          <div className="w-full space-y-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-400">Plant Growth Status</span>
                <span className="text-slate-300">{user.gardenGrowth}% toward next stage</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800/80 p-0.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${user.gardenGrowth}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleWaterPlant}
                disabled={watering || waterSuccess}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold shadow-lg transition-all border ${
                  waterSuccess 
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 cursor-default" 
                    : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-sky-400 hover:text-sky-300"
                }`}
              >
                {watering ? (
                  <>
                    <Droplet className="h-4.5 w-4.5 text-sky-400 animate-bounce" />
                    <span>Nurturing...</span>
                  </>
                ) : waterSuccess ? (
                  <>
                    <Check className="h-4.5 w-4.5 text-emerald-400" />
                    <span>Nurtured +2% Growth!</span>
                  </>
                ) : (
                  <>
                    <Droplet className="h-4.5 w-4.5 text-sky-400 animate-pulse" />
                    <span>Nurture & Water Plant</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MILESTONE LOCKS PANEL */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 lg:col-span-5 space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Award className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-serif font-bold text-white">Nurture Milestones</h2>
          </div>

          <p className="text-xs text-slate-400 leading-normal">
            As your daily wellness habits expand and your plant growth index reaches specific parameters, you will automatically unlock cosmetic garden attachments:
          </p>

          <div className="space-y-2.5">
            {milestones.map((mil) => (
              <div 
                key={mil.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  mil.unlocked 
                    ? "bg-emerald-950/10 border-emerald-500/20 text-slate-300" 
                    : "bg-slate-950/40 border-slate-900 text-slate-500"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2 rounded-lg ${mil.unlocked ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-900 text-slate-600"}`}>
                    {mil.unlocked ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${mil.unlocked ? "text-white" : "text-slate-400"}`}>{mil.name}</span>
                    <span className="text-[10px] text-slate-500">{mil.desc}</span>
                  </div>
                </div>
                {mil.unlocked && <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Unlocked</span>}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
