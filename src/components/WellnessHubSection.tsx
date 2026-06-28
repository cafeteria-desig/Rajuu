import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  Wind, 
  Play, 
  Pause, 
  RotateCcw, 
  Music, 
  Moon, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sprout, 
  Heart,
  ChevronRight
} from "lucide-react";
import { LocalUserState } from "../types";

interface WellnessHubSectionProps {
  user: LocalUserState;
  onUpdateUser: (data: Partial<LocalUserState>) => void;
}

export default function WellnessHubSection({ user, onUpdateUser }: WellnessHubSectionProps) {
  // Breathing States
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathSeconds, setBreathSeconds] = useState(4);
  const breathingTimer = useRef<any>(null);

  // Meditation Timer States
  const [meditating, setMeditating] = useState(false);
  const [medMinutes, setMedMinutes] = useState(5);
  const [medSeconds, setMedSeconds] = useState(0);
  const meditationTimer = useRef<any>(null);

  // Focus Audio Simulation States
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);

  // Audio elements (using public royalty free noise URLs or simulated loops)
  const soundTracks = [
    { id: "rain", name: "Rainfall on Glass", icon: "🌧️", url: "https://assets.mixkit.co/active_storage/sfx/2443/2443-84.wav" },
    { id: "forest", name: "Forest Birdsong & Wind", icon: "🌳", url: "https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav" },
    { id: "ocean", name: "Deep Ocean Waves", icon: "🌊", url: "https://assets.mixkit.co/active_storage/sfx/1113/1113-84.wav" },
    { id: "white", name: "Zen White Noise", icon: "🌌", url: "https://assets.mixkit.co/active_storage/sfx/1205/1205-84.wav" }
  ];

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (breathingTimer.current) clearInterval(breathingTimer.current);
      if (meditationTimer.current) clearInterval(meditationTimer.current);
      // Pause all audio
      Object.values(audioRefs.current).forEach(audio => audio.pause());
    };
  }, []);

  // Breathing Cycle Logic (Box Breathing or Diaphragmatic)
  useEffect(() => {
    if (breathing) {
      breathingTimer.current = setInterval(() => {
        setBreathSeconds(prev => {
          if (prev <= 1) {
            // Transition phase
            setBreathPhase(current => {
              if (current === "Inhale") {
                setBreathSeconds(4);
                return "Hold";
              } else if (current === "Hold") {
                setBreathSeconds(4);
                return "Exhale";
              } else {
                setBreathSeconds(4);
                return "Inhale";
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingTimer.current) {
        clearInterval(breathingTimer.current);
      }
      setBreathSeconds(4);
      setBreathPhase("Inhale");
    }

    return () => {
      if (breathingTimer.current) clearInterval(breathingTimer.current);
    };
  }, [breathing]);

  // Meditation Countdown Logic
  useEffect(() => {
    if (meditating) {
      meditationTimer.current = setInterval(() => {
        if (medSeconds === 0) {
          if (medMinutes === 0) {
            // Completed!
            setMeditating(false);
            clearInterval(meditationTimer.current);
            alert("Congratulations! You have completed your mindfulness meditation session.");
            
            // Award garden growth (+10 for meditation session)
            const updatedGrowth = Math.min(100, user.gardenGrowth + 10);
            onUpdateUser({
              gardenGrowth: updatedGrowth,
              gardenLevel: Math.floor(updatedGrowth / 20) + 1
            });
            
            setMedMinutes(5);
            setMedSeconds(0);
          } else {
            setMedMinutes(prev => prev - 1);
            setMedSeconds(59);
          }
        } else {
          setMedSeconds(prev => prev - 1);
        }
      }, 1000);
    } else {
      if (meditationTimer.current) clearInterval(meditationTimer.current);
    }

    return () => {
      if (meditationTimer.current) clearInterval(meditationTimer.current);
    };
  }, [meditating, medMinutes, medSeconds]);

  // Sound Track control
  const toggleTrack = (trackId: string, url: string) => {
    if (playingTrack === trackId) {
      audioRefs.current[trackId]?.pause();
      setPlayingTrack(null);
    } else {
      // Pause existing
      if (playingTrack) {
        audioRefs.current[playingTrack]?.pause();
      }

      // Initialize if not exists
      if (!audioRefs.current[trackId]) {
        audioRefs.current[trackId] = new Audio(url);
        audioRefs.current[trackId].loop = true;
      }

      audioRefs.current[trackId].volume = muted ? 0 : volume / 100;
      audioRefs.current[trackId].play().catch(err => console.log("Audio play deferred till interaction"));
      setPlayingTrack(trackId);
    }
  };

  // Handle Volume Changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVol = Number(e.target.value);
    setVolume(nextVol);
    if (playingTrack && audioRefs.current[playingTrack]) {
      audioRefs.current[playingTrack].volume = muted ? 0 : nextVol / 100;
    }
  };

  const toggleMute = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    if (playingTrack && audioRefs.current[playingTrack]) {
      audioRefs.current[playingTrack].volume = nextMute ? 0 : volume / 100;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-1 py-4 md:py-6 pb-20 md:pb-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight flex items-center space-x-2">
          <Compass className="h-7 w-7 text-indigo-400" />
          <span>Mindfulness Wellness Hub</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Take a sensory break. Re-align your nervous system with interactive breathing cues, customizable meditation timers, and sleep induction tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* INTERACTIVE BREATHING CIRCLE */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 min-h-[400px]">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Wind className="h-5 w-5 text-sky-400" />
              <h2 className="text-lg font-serif font-semibold text-white">Box Breathing Coach</h2>
            </div>
            <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">Vagal Stimulator</span>
          </div>

          {/* Calming Sphere */}
          <div className="relative flex items-center justify-center h-52 w-52">
            <AnimatePresence mode="wait">
              {/* Pulsing light rings around the circle */}
              {breathing && (
                <>
                  <motion.div 
                    animate={{ scale: breathPhase === "Inhale" ? 2.0 : breathPhase === "Hold" ? 2.0 : 1.0 }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-sky-500/10 blur-xl"
                  ></motion.div>
                  <motion.div 
                    animate={{ scale: breathPhase === "Inhale" ? 1.5 : breathPhase === "Hold" ? 1.5 : 1.0 }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="absolute inset-4 rounded-full bg-indigo-500/10 blur-lg"
                  ></motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Core Sphere */}
            <motion.div 
              animate={{ 
                scale: breathing 
                  ? (breathPhase === "Inhale" ? 1.4 : breathPhase === "Hold" ? 1.4 : 0.85) 
                  : 1.0 
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className={`h-32 w-32 rounded-full flex flex-col items-center justify-center shadow-2xl border transition-colors duration-1000 ${
                breathing 
                  ? (breathPhase === "Inhale" ? "bg-cyan-500/20 border-cyan-400" : breathPhase === "Hold" ? "bg-indigo-500/20 border-indigo-400" : "bg-sky-600/15 border-sky-500/40")
                  : "bg-indigo-600/10 border-indigo-500/20"
              }`}
            >
              <span className="text-sm font-bold text-slate-200">
                {breathing ? breathPhase : "Ready"}
              </span>
              <span className="text-3xl font-extrabold text-white mt-1">
                {breathing ? breathSeconds : "🌿"}
              </span>
            </motion.div>
          </div>

          {/* Cues */}
          <div className="space-y-1">
            <p className="text-xs text-slate-300 font-medium">
              {breathing 
                ? (breathPhase === "Inhale" ? "Slowly fill your lungs with fresh air..." : breathPhase === "Hold" ? "Suspend your breath. Rest in quietude..." : "Release all tension. Exhale fully...")
                : "A 4-4-4 cycle to reset stress, lower blood pressure, and calm anxiety."
              }
            </p>
            <span className="text-[10px] text-slate-500 block">Expand your chest and breathe through your nose</span>
          </div>

          {/* Trigger controls */}
          <button
            onClick={() => setBreathing(!breathing)}
            className={`w-full max-w-[200px] px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all ${
              breathing 
                ? "bg-rose-600 hover:bg-rose-500 text-white" 
                : "bg-sky-600 hover:bg-sky-500 text-white"
            }`}
          >
            {breathing ? "Stop Breathing Guide" : "Start 4-4-4 Breath"}
          </button>
        </div>

        {/* CUSTOM MEDITATION TIMER */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between items-center text-center space-y-6 min-h-[400px]">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Moon className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-serif font-semibold text-white">Silent Meditation Companion</h2>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">Garden Reward: +10%</span>
          </div>

          {/* Timer Display */}
          <div className="space-y-1">
            <div className="text-5xl md:text-6xl font-mono font-bold text-indigo-300 tracking-wider">
              {String(medMinutes).padStart(2, "0")}:{String(medSeconds).padStart(2, "0")}
            </div>
            <span className="text-xs text-slate-400">Complete the session to unlock virtual garden growth</span>
          </div>

          {/* Preset Duration Buttons */}
          <div className="space-y-2 w-full">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Set Duration:</span>
            <div className="flex justify-center space-x-2">
              {[1, 3, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  disabled={meditating}
                  onClick={() => {
                    setMedMinutes(mins);
                    setMedSeconds(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    medMinutes === mins && medSeconds === 0
                      ? "bg-indigo-600/25 border-indigo-400 text-indigo-300 scale-105"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white disabled:opacity-50"
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setMedMinutes(5);
                setMedSeconds(0);
                setMeditating(false);
              }}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700/50"
              title="Reset Timer"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={() => setMeditating(!meditating)}
              className={`px-8 py-3 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 transition-all ${
                meditating 
                  ? "bg-rose-600 hover:bg-rose-500 text-white" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {meditating ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
              <span>{meditating ? "Pause Session" : "Begin Meditation"}</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-500 italic max-w-xs">
            "Quiet the mind, and the soul will speak." Close your eyes, sit with a straight back, and rest in awareness.
          </p>
        </div>

      </div>

      {/* AUDIO FOCUS GENERATORS AND SLEEP TIPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Focus & Noise Player */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 lg:col-span-7">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Music className="h-5 w-5 text-indigo-400 animate-float" />
            <h2 className="text-lg font-serif font-semibold text-white">Focus Sound Generators</h2>
          </div>

          <p className="text-xs text-slate-400">Layer your background with deep, loopable environmental acoustics to block out peripheral distractions and lower baseline cortisol.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {soundTracks.map((track) => {
              const isPlaying = playingTrack === track.id;
              return (
                <div 
                  key={track.id}
                  onClick={() => toggleTrack(track.id, track.url)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isPlaying 
                      ? "bg-indigo-600/10 border-indigo-500/50" 
                      : "bg-slate-900/30 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{track.icon}</span>
                    <span className="text-xs font-bold text-slate-200">{track.name}</span>
                  </div>
                  <button className="focus:outline-none">
                    {isPlaying ? (
                      <span className="flex space-x-0.5">
                        <span className="h-3 w-0.5 bg-indigo-400 animate-bounce"></span>
                        <span className="h-3 w-0.5 bg-indigo-400 animate-bounce delay-100"></span>
                        <span className="h-3 w-0.5 bg-indigo-400 animate-bounce delay-200"></span>
                      </span>
                    ) : (
                      <Play className="h-4 w-4 text-slate-400 hover:text-white" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Volume and Mute control */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 bg-slate-900/20 p-3.5 rounded-xl">
            <button 
              onClick={toggleMute}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {muted ? <VolumeX className="h-4.5 w-4.5 text-rose-400" /> : <Volume2 className="h-4.5 w-4.5 text-indigo-400" />}
            </button>
            <div className="flex-1 mx-4">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{volume}%</span>
          </div>
        </div>

        {/* Dynamic Self-Care Recommendations */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block">Stress & Sleep Advisory</span>
            <h3 className="text-lg font-serif font-bold text-white leading-snug">Empirical Self-Care Tips</h3>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start space-x-2">
                <ChevronRight className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-slate-300"><strong className="text-white">Avoid Blue Light:</strong> Discontinue smartphone or television screens at least 45 minutes before sleep to stimulate standard melatonin release.</p>
              </div>

              <div className="flex items-start space-x-2">
                <ChevronRight className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-slate-300"><strong className="text-white">Physiological Sigh:</strong> Two quick inhales through the nose followed by one long exhale through the mouth instantly drops heart rates.</p>
              </div>

              <div className="flex items-start space-x-2">
                <ChevronRight className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-slate-300"><strong className="text-white">Nurture Streaks:</strong> Consistent 3-minute check-ins trigger a sense of mastery, boosting dopamine levels which counters depressive apathy.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center leading-normal">
            *All tips are verified by behavioral psychology models and general neurology.*
          </div>
        </div>

      </div>

    </div>
  );
}
