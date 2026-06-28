import React, { useState } from "react";
import { 
  auth, 
  googleProvider, 
  getOrCreateUserProfile, 
  getGuestUserId,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from "../supabase";
import { 
  Sprout, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  Compass
} from "lucide-react";
import { LocalUserState } from "../types";

interface OnboardingScreenProps {
  onLoginSuccess: (user: LocalUserState) => void;
}

export default function OnboardingScreen({ onLoginSuccess }: OnboardingScreenProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError(null);

      if (tab === "signup") {
        if (!name) {
          setError("Please provide your name to register.");
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const userProfile = await getOrCreateUserProfile(userCred.user.uid, email, name);
        onLoginSuccess({
          uid: userCred.user.uid,
          email: email,
          displayName: name,
          isGuest: false,
          streak: userProfile.streak,
          gardenGrowth: userProfile.gardenGrowth,
          gardenLevel: userProfile.gardenLevel
        });
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const userProfile = await getOrCreateUserProfile(userCred.user.uid, email, userCred.user.displayName);
        onLoginSuccess({
          uid: userCred.user.uid,
          email: email,
          displayName: userProfile.displayName,
          isGuest: false,
          streak: userProfile.streak,
          gardenGrowth: userProfile.gardenGrowth,
          gardenLevel: userProfile.gardenLevel
        });
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Authentication failed. Please verify your credentials.";
      const lowerMsg = errMsg.toLowerCase();
      if (lowerMsg.includes("invalid login") || lowerMsg.includes("invalid_credentials") || lowerMsg.includes("invalid credentials")) {
        errMsg = "Invalid email or password. If you do not have an account yet, please click the 'Register' tab at the top to create one first.";
      } else if (lowerMsg.includes("user already") || lowerMsg.includes("already registered") || lowerMsg.includes("email_exists") || lowerMsg.includes("already exists")) {
        errMsg = "This email is already registered. Please click 'Sign In' at the top to access your account.";
      } else if (lowerMsg.includes("password should be") || lowerMsg.includes("weak_password") || lowerMsg.includes("weak password")) {
        errMsg = "Password must be at least 6 characters long.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("Social Sign In with Google is currently disabled inside the preview sandbox environment. Please register/sign in with an Email or click 'Continue as Guest' below to explore MindMate AI with full local and Cloud persistence.");
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const guestUid = getGuestUserId();
      const userProfile = await getOrCreateUserProfile(guestUid, "guest@mindmate.ai", "Guest Companion");
      onLoginSuccess({
        uid: guestUid,
        email: "guest@mindmate.ai",
        displayName: "Guest Companion",
        isGuest: true,
        streak: userProfile.streak,
        gardenGrowth: userProfile.gardenGrowth,
        gardenLevel: userProfile.gardenLevel
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to initialize Guest Mode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-12 md:py-16 bg-slate-950 overflow-hidden">
      {/* Background radial soft glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10 space-y-6 md:space-y-8">
        
        {/* App Branding Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 bg-indigo-600/20 rounded-3xl border border-indigo-500/30 shadow-xl animate-float">
            <Sprout className="h-8 w-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">MindMate <span className="gradient-text font-sans">AI</span></h1>
            <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide uppercase">TECH SPECTRA 2026 Hackathon Winner</p>
          </div>
          
          {/* Problem Statement Citation Box */}
          <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-left text-[11px] leading-relaxed text-slate-400">
            <span className="font-bold text-slate-300 block mb-0.5">💡 Problem Statement: "The Weight We Carry"</span>
            An accessible, stigma-free mental wellness platform that helps people receive daily emotional self-care without replacing professional medical advice.
          </div>
        </div>

        {/* Authentication Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-900">
            <button
              onClick={() => { setTab("signin"); setError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === "signin" 
                  ? "bg-slate-900 text-white border border-slate-800/80 shadow" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("signup"); setError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === "signup" 
                  ? "bg-slate-900 text-white border border-slate-800/80 shadow" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Auth Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {tab === "signup" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-xs bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
            >
              <span>{loading ? "Authenticating..." : tab === "signup" ? "Create Free Account" : "Access MindMate Dashboard"}</span>
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-900"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Or Connect Safely</span>
            <div className="flex-grow border-t border-slate-900"></div>
          </div>

          {/* Social Signin popup + Dynamic Guest Mode Fallback */}
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2.5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-300 rounded-xl text-xs font-semibold transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114a5.79 5.79 0 0 1-5.79-5.79 5.79 5.79 0 0 1 5.79-5.79c1.47 0 2.82.537 3.86 1.433l3.14-3.14A9.954 9.954 0 0 0 12.24 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10c5.3 0 9.88-3.83 9.88-10 0-.612-.06-1.125-.19-1.714H12.24z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>

            {/* IFRAME SAFE BULLETPROOF ONBOARDING ACTION */}
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2.5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Sparkles className="h-4.5 w-4.5 text-emerald-200 animate-pulse" />
              <span>Continue as Guest (Iframe Safe) 🌿</span>
            </button>
          </div>

          {/* Quick instructions indicator */}
          <div className="text-center text-[10px] text-slate-500">
            Choose Continue as Guest for instant secure access to all Firestore & Gemini AI features without popups or cookie limits.
          </div>

        </div>

      </div>
    </div>
  );
}
