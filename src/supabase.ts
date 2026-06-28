import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------- LOCAL TYPES & DEFAULT VALUES ----------------
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  createdAt: any;
  streak: number;
  lastActive: string;
  gardenGrowth: number;
  gardenLevel: number;
}

export interface MoodLog {
  id?: string;
  userId: string;
  mood: string;
  note?: string;
  timestamp: any;
  dateStr: string;
}

export interface JournalEntry {
  id?: string;
  userId: string;
  content: string;
  timestamp: any;
  dateStr: string;
  analysis?: {
    emotion: string;
    sentimentScore: number;
    summary: string;
    keywords: string[];
    reflectionPrompt: string;
  };
}

export interface ChatMessage {
  id?: string;
  userId: string;
  text: string;
  sender: "user" | "ai";
  timestamp: any;
}

export interface DailyGoal {
  id?: string;
  userId: string;
  title: string;
  completed: boolean;
  dateStr: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "streak_7", title: "7 Day Streak", description: "Log your mood 7 days in a row", icon: "Zap", unlockedAt: null },
  { id: "streak_30", title: "30 Day Streak", description: "Log your mood 30 days in a row", icon: "Flame", unlockedAt: null },
  { id: "mood_100", title: "100 Mood Entries", description: "Create 100 mood logs", icon: "Smile", unlockedAt: null },
  { id: "journal_50", title: "50 Journals", description: "Write 50 personal journals", icon: "BookOpen", unlockedAt: null },
  { id: "meditation_master", title: "Meditation Master", description: "Complete 10 mindfulness/meditation sessions", icon: "Moon", unlockedAt: null },
  { id: "growth_champion", title: "Growth Champion", description: "Reach Level 5 in your virtual Emotional Wellness Garden", icon: "Sprout", unlockedAt: null }
];

export function getGuestUserId(): string {
  let guestId = localStorage.getItem("mindmate_guest_uid");
  if (!guestId) {
    guestId = "guest_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("mindmate_guest_uid", guestId);
  }
  return guestId;
}

// ---------------- BIDIRECTIONAL MAPPERS ----------------
function mapProfileFromDb(row: any): UserProfile {
  if (!row) return null as any;
  return {
    uid: row.uid,
    email: row.email,
    displayName: row.display_name,
    photoURL: row.photo_url || null,
    createdAt: row.created_at,
    streak: row.streak,
    lastActive: row.last_active,
    gardenGrowth: row.garden_growth,
    gardenLevel: row.garden_level
  };
}

function mapProfileToDb(p: Partial<UserProfile>): any {
  const row: any = {};
  if (p.uid !== undefined) row.uid = p.uid;
  if (p.email !== undefined) row.email = p.email;
  if (p.displayName !== undefined) row.display_name = p.displayName;
  if (p.photoURL !== undefined) row.photo_url = p.photoURL;
  if (p.streak !== undefined) row.streak = p.streak;
  if (p.lastActive !== undefined) row.last_active = p.lastActive;
  if (p.gardenGrowth !== undefined) row.garden_growth = p.gardenGrowth;
  if (p.gardenLevel !== undefined) row.garden_level = p.gardenLevel;
  return row;
}

function mapMoodFromDb(row: any): MoodLog {
  return {
    id: row.id,
    userId: row.user_id,
    mood: row.mood,
    note: row.note || "",
    timestamp: row.timestamp,
    dateStr: row.date_str
  };
}

function mapJournalFromDb(row: any): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    content: row.content,
    timestamp: row.timestamp,
    dateStr: row.date_str,
    analysis: row.analysis || undefined
  };
}

function mapMessageFromDb(row: any): ChatMessage {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    sender: row.sender,
    timestamp: row.timestamp
  };
}

function mapGoalFromDb(row: any): DailyGoal {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    completed: row.completed,
    dateStr: row.date_str
  };
}

// ---------------- DYNAMIC OFFLINE / RESILIENCE MECHANISM ----------------
let forceOfflineMode = false;

export function isOfflineMode(): boolean {
  if (forceOfflineMode) return true;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("placeholder") || url.includes("your-supabase-project") || url.includes("your-placeholder-project")) {
    return true;
  }
  return false;
}

// ---------------- LOCAL STORAGE DB GETTERS / SETTERS ----------------
function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Local Storage write failed", err);
  }
}

function getLocalProfiles(): UserProfile[] {
  return getLocalData<UserProfile[]>("mindmate_local_profiles", []);
}
function saveLocalProfiles(profiles: UserProfile[]) {
  setLocalData("mindmate_local_profiles", profiles);
}

function getLocalMoodLogs(): MoodLog[] {
  return getLocalData<MoodLog[]>("mindmate_local_mood_logs", []);
}
function saveLocalMoodLogs(logs: MoodLog[]) {
  setLocalData("mindmate_local_mood_logs", logs);
}

function getLocalJournalEntries(): JournalEntry[] {
  return getLocalData<JournalEntry[]>("mindmate_local_journal_entries", []);
}
function saveLocalJournalEntries(entries: JournalEntry[]) {
  setLocalData("mindmate_local_journal_entries", entries);
}

function getLocalChatMessages(): ChatMessage[] {
  return getLocalData<ChatMessage[]>("mindmate_local_chat_messages", []);
}
function saveLocalChatMessages(messages: ChatMessage[]) {
  setLocalData("mindmate_local_chat_messages", messages);
}

function getLocalDailyGoals(): DailyGoal[] {
  return getLocalData<DailyGoal[]>("mindmate_local_daily_goals", []);
}
function saveLocalDailyGoals(goals: DailyGoal[]) {
  setLocalData("mindmate_local_daily_goals", goals);
}

function getLocalAchievements(): any[] {
  return getLocalData<any[]>("mindmate_local_achievements", []);
}
function saveLocalAchievements(achievements: any[]) {
  setLocalData("mindmate_local_achievements", achievements);
}

// ---------------- ERROR WARNER HELPER ----------------
function handleSupabaseError(error: any, operationName: string) {
  const errMsg = error?.message || String(error);
  const isValidationError = 
    errMsg.includes("Invalid login credentials") ||
    errMsg.includes("User already registered") ||
    errMsg.includes("Password should be") ||
    errMsg.toLowerCase().includes("invalid") ||
    errMsg.toLowerCase().includes("weak_password") ||
    errMsg.toLowerCase().includes("email_exists") ||
    errMsg.toLowerCase().includes("credentials");

  if (isValidationError) {
    console.warn(`Supabase expected validation warning during ${operationName}:`, errMsg);
    return;
  }

  console.error(`Supabase error during ${operationName}:`, error);
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
    console.warn("Supabase configuration is not active. Using fully functioning Offline Storage fallback.");
  }
}

// ---------------- MOCK AUTH CONTEXT HELPERS ----------------
interface MockUser {
  uid: string;
  email: string;
  password?: string;
  displayName: string;
}

let currentMockUser: any = null;
const authListeners: ((user: any) => void)[] = [];

function triggerAuthListeners() {
  authListeners.forEach(cb => cb(currentMockUser));
}

// ---------------- AUTH COMPATIBILITY WRAPPERS ----------------
export const auth = {
  currentUser: null as any
};

export function onAuthStateChanged(authObj: any, callback: (user: any) => void) {
  authListeners.push(callback);

  const fallbackToMock = () => {
    forceOfflineMode = true;
    const savedUser = getLocalData<any>("mindmate_mock_session", null);
    currentMockUser = savedUser;
    auth.currentUser = savedUser;
    callback(savedUser);
  };

  if (isOfflineMode()) {
    fallbackToMock();
    return () => {
      const idx = authListeners.indexOf(callback);
      if (idx > -1) authListeners.splice(idx, 1);
    };
  }

  // Initial check
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        fallbackToMock();
        return;
      }
      handleSupabaseError(error, "getSession");
      callback(null);
      return;
    }
    if (session?.user) {
      const mappedUser = {
        uid: session.user.id,
        email: session.user.email || "",
        displayName: session.user.user_metadata?.displayName || session.user.user_metadata?.full_name || "Wellness Companion"
      };
      auth.currentUser = mappedUser;
      callback(mappedUser);
    } else {
      auth.currentUser = null;
      callback(null);
    }
  }).catch((err) => {
    console.warn("Session check failed, falling back to offline mode", err);
    fallbackToMock();
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (forceOfflineMode) return;
    if (session?.user) {
      const mappedUser = {
        uid: session.user.id,
        email: session.user.email || "",
        displayName: session.user.user_metadata?.displayName || session.user.user_metadata?.full_name || "Wellness Companion"
      };
      auth.currentUser = mappedUser;
      callback(mappedUser);
    } else {
      auth.currentUser = null;
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
    const idx = authListeners.indexOf(callback);
    if (idx > -1) authListeners.splice(idx, 1);
  };
}

export async function signOut(authObj?: any) {
  if (isOfflineMode()) {
    currentMockUser = null;
    setLocalData("mindmate_mock_session", null);
    auth.currentUser = null;
    triggerAuthListeners();
    return;
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        await signOut();
        return;
      }
      handleSupabaseError(error, "signOut");
    }
  } catch (err) {
    forceOfflineMode = true;
    await signOut();
    return;
  }
  auth.currentUser = null;
}

export async function signInWithEmailAndPassword(authObj: any, email: string, password: string) {
  if (isOfflineMode()) {
    const users = getLocalData<MockUser[]>("mindmate_mock_users", []);
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) {
      throw new Error("Invalid login credentials");
    }
    const loggedUser = {
      uid: found.uid,
      email: found.email,
      displayName: found.displayName
    };
    currentMockUser = loggedUser;
    auth.currentUser = loggedUser;
    setLocalData("mindmate_mock_session", loggedUser);
    triggerAuthListeners();
    return { user: loggedUser };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return signInWithEmailAndPassword(authObj, email, password);
      }
      handleSupabaseError(error, "signInWithEmailAndPassword");
      throw error;
    }
    const mappedUser = {
      uid: data.user!.id,
      email: data.user!.email || "",
      displayName: data.user!.user_metadata?.displayName || data.user!.user_metadata?.full_name || "Wellness Companion"
    };
    return { user: mappedUser };
  } catch (err: any) {
    if (err?.message?.includes("Failed to fetch")) {
      forceOfflineMode = true;
      return signInWithEmailAndPassword(authObj, email, password);
    }
    throw err;
  }
}

export async function createUserWithEmailAndPassword(authObj: any, email: string, password: string) {
  if (isOfflineMode()) {
    const users = getLocalData<MockUser[]>("mindmate_mock_users", []);
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("User already registered");
    }
    if (password.length < 6) {
      throw new Error("Password should be at least 6 characters");
    }
    const newUid = "mock_user_" + Math.random().toString(36).substring(2, 15);
    const newMock: MockUser = {
      uid: newUid,
      email: email,
      password: password,
      displayName: "Wellness Companion"
    };
    users.push(newMock);
    setLocalData("mindmate_mock_users", users);

    const loggedUser = {
      uid: newUid,
      email: email,
      displayName: "Wellness Companion"
    };
    currentMockUser = loggedUser;
    auth.currentUser = loggedUser;
    setLocalData("mindmate_mock_session", loggedUser);
    triggerAuthListeners();
    return { user: loggedUser };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return createUserWithEmailAndPassword(authObj, email, password);
      }
      handleSupabaseError(error, "createUserWithEmailAndPassword");
      throw error;
    }
    const mappedUser = {
      uid: data.user!.id,
      email: data.user!.email || "",
      displayName: "Wellness Companion"
    };
    return { user: mappedUser };
  } catch (err: any) {
    if (err?.message?.includes("Failed to fetch")) {
      forceOfflineMode = true;
      return createUserWithEmailAndPassword(authObj, email, password);
    }
    throw err;
  }
}

export async function signInWithPopup(authObj: any, provider: any): Promise<any> {
  throw new Error("Social login is disabled. Please Sign In using Guest Mode or Email.");
}

export const googleProvider = {};

// ---------------- USER MANAGEMENT ----------------
export async function getOrCreateUserProfile(userId: string, email: string | null, name: string | null): Promise<UserProfile> {
  if (isOfflineMode()) {
    const profiles = getLocalProfiles();
    let profile = profiles.find(p => p.uid === userId);
    if (!profile) {
      const todayStr = new Date().toISOString().split("T")[0];
      profile = {
        uid: userId,
        email: email || "guest@mindmate.ai",
        displayName: name || "Guest Companion",
        photoURL: null,
        createdAt: new Date().toISOString(),
        streak: 1,
        lastActive: todayStr,
        gardenGrowth: 10,
        gardenLevel: 1
      };
      profiles.push(profile);
      saveLocalProfiles(profiles);
    }
    return profile;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("uid", userId)
      .maybeSingle();

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return getOrCreateUserProfile(userId, email, name);
      }
      throw error;
    }

    if (data) {
      return mapProfileFromDb(data);
    } else {
      const todayStr = new Date().toISOString().split("T")[0];
      const newUserProfile = {
        uid: userId,
        email: email || "guest@mindmate.ai",
        display_name: name || "Guest Companion",
        photo_url: null,
        streak: 1,
        last_active: todayStr,
        garden_growth: 10,
        garden_level: 1
      };

      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .insert(newUserProfile)
        .select()
        .single();

      if (insertError) {
        if (insertError.message?.includes("Failed to fetch")) {
          forceOfflineMode = true;
          return getOrCreateUserProfile(userId, email, name);
        }
        throw insertError;
      }
      return mapProfileFromDb(inserted);
    }
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return getOrCreateUserProfile(userId, email, name);
    }
    handleSupabaseError(error, "getOrCreateUserProfile");
    return {
      uid: userId,
      email: email,
      displayName: name || "Guest Companion",
      photoURL: null,
      createdAt: new Date().toISOString(),
      streak: 1,
      lastActive: new Date().toISOString().split("T")[0],
      gardenGrowth: 10,
      gardenLevel: 1
    };
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  if (isOfflineMode()) {
    const profiles = getLocalProfiles();
    const idx = profiles.findIndex(p => p.uid === userId);
    if (idx > -1) {
      profiles[idx] = { ...profiles[idx], ...data };
      saveLocalProfiles(profiles);
    } else {
      const profile = await getOrCreateUserProfile(userId, null, null);
      const updated = { ...profile, ...data };
      profiles.push(updated);
      saveLocalProfiles(profiles);
    }
    return;
  }

  try {
    const dbData = mapProfileToDb(data);
    const { error } = await supabase
      .from("profiles")
      .update(dbData)
      .eq("uid", userId);

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return updateUserProfile(userId, data);
      }
      throw error;
    }
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return updateUserProfile(userId, data);
    }
    handleSupabaseError(error, "updateUserProfile");
  }
}

export async function verifyAndIncrementStreak(userId: string): Promise<UserProfile> {
  try {
    const profile = await getOrCreateUserProfile(userId, null, null);
    const todayStr = new Date().toISOString().split("T")[0];

    if (profile.lastActive === todayStr) {
      return profile;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = profile.streak;
    if (profile.lastActive === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1; // Broken
    }

    const updated = {
      streak: newStreak,
      lastActive: todayStr,
      gardenGrowth: Math.min(100, profile.gardenGrowth + 5)
    };

    await updateUserProfile(userId, updated);
    return { ...profile, ...updated };
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return verifyAndIncrementStreak(userId);
    }
    handleSupabaseError(error, "verifyAndIncrementStreak");
    return {
      uid: userId,
      email: "guest@mindmate.ai",
      displayName: "Guest Companion",
      photoURL: null,
      createdAt: new Date().toISOString(),
      streak: 1,
      lastActive: new Date().toISOString().split("T")[0],
      gardenGrowth: 10,
      gardenLevel: 1
    };
  }
}

// ---------------- MOOD LOGS ----------------
export async function addMoodLog(userId: string, mood: string, note: string): Promise<MoodLog> {
  const todayStr = new Date().toISOString().split("T")[0];

  if (isOfflineMode()) {
    const logs = getLocalMoodLogs();
    const newLog: MoodLog = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      mood,
      note,
      timestamp: new Date().toISOString(),
      dateStr: todayStr
    };
    logs.push(newLog);
    saveLocalMoodLogs(logs);

    // Award garden growth
    const profile = await getOrCreateUserProfile(userId, null, null);
    const newGrowth = Math.min(100, profile.gardenGrowth + 3);
    const newLevel = Math.floor(newGrowth / 20) + 1;
    await updateUserProfile(userId, {
      gardenGrowth: newGrowth,
      gardenLevel: Math.min(5, newLevel)
    });

    return newLog;
  }

  const logRow = {
    user_id: userId,
    mood: mood,
    note: note || "",
    date_str: todayStr
  };

  try {
    const { data, error } = await supabase
      .from("mood_logs")
      .insert(logRow)
      .select()
      .single();

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return addMoodLog(userId, mood, note);
      }
      throw error;
    }

    // Award garden growth
    const profile = await getOrCreateUserProfile(userId, null, null);
    const newGrowth = Math.min(100, profile.gardenGrowth + 3);
    const newLevel = Math.floor(newGrowth / 20) + 1;
    await updateUserProfile(userId, {
      gardenGrowth: newGrowth,
      gardenLevel: Math.min(5, newLevel)
    });

    return mapMoodFromDb(data);
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return addMoodLog(userId, mood, note);
    }
    handleSupabaseError(error, "addMoodLog");
    return {
      id: Math.random().toString(),
      userId,
      mood,
      note,
      timestamp: new Date().toISOString(),
      dateStr: todayStr
    };
  }
}

export async function getMoodLogs(userId: string, count: number = 30): Promise<MoodLog[]> {
  if (isOfflineMode()) {
    const logs = getLocalMoodLogs();
    const userLogs = logs.filter(l => l.userId === userId);
    const sorted = [...userLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sorted.slice(0, count).reverse();
  }

  try {
    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(count);

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return getMoodLogs(userId, count);
      }
      throw error;
    }
    return (data || []).map(mapMoodFromDb).reverse();
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return getMoodLogs(userId, count);
    }
    handleSupabaseError(error, "getMoodLogs");
    return [];
  }
}

// ---------------- JOURNAL ENTRIES ----------------
export async function addJournalEntry(userId: string, content: string, analysis?: any): Promise<JournalEntry> {
  const todayStr = new Date().toISOString().split("T")[0];

  if (isOfflineMode()) {
    const entries = getLocalJournalEntries();
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      content,
      timestamp: new Date().toISOString(),
      dateStr: todayStr,
      analysis
    };
    entries.push(newEntry);
    saveLocalJournalEntries(entries);

    // Growth award
    const profile = await getOrCreateUserProfile(userId, null, null);
    const newGrowth = Math.min(100, profile.gardenGrowth + 7);
    const newLevel = Math.floor(newGrowth / 20) + 1;
    await updateUserProfile(userId, {
      gardenGrowth: newGrowth,
      gardenLevel: Math.min(5, newLevel)
    });

    return newEntry;
  }

  const journalRow = {
    user_id: userId,
    content: content,
    date_str: todayStr,
    analysis: analysis || null
  };

  try {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert(journalRow)
      .select()
      .single();

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return addJournalEntry(userId, content, analysis);
      }
      throw error;
    }

    // Growth award
    const profile = await getOrCreateUserProfile(userId, null, null);
    const newGrowth = Math.min(100, profile.gardenGrowth + 7);
    const newLevel = Math.floor(newGrowth / 20) + 1;
    await updateUserProfile(userId, {
      gardenGrowth: newGrowth,
      gardenLevel: Math.min(5, newLevel)
    });

    return mapJournalFromDb(data);
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return addJournalEntry(userId, content, analysis);
    }
    handleSupabaseError(error, "addJournalEntry");
    return {
      id: Math.random().toString(),
      userId,
      content,
      timestamp: new Date().toISOString(),
      dateStr: todayStr,
      analysis
    };
  }
}

export async function getJournalEntries(userId: string, count: number = 10): Promise<JournalEntry[]> {
  if (isOfflineMode()) {
    const entries = getLocalJournalEntries();
    const userEntries = entries.filter(e => e.userId === userId);
    const sorted = [...userEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sorted.slice(0, count);
  }

  try {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(count);

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return getJournalEntries(userId, count);
      }
      throw error;
    }
    return (data || []).map(mapJournalFromDb);
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return getJournalEntries(userId, count);
    }
    handleSupabaseError(error, "getJournalEntries");
    return [];
  }
}

// ---------------- AI CONVERSATIONS ----------------
export async function addChatMessage(userId: string, text: string, sender: "user" | "ai"): Promise<ChatMessage> {
  if (isOfflineMode()) {
    const messages = getLocalChatMessages();
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      text,
      sender,
      timestamp: new Date().toISOString()
    };
    messages.push(newMsg);
    saveLocalChatMessages(messages);
    return newMsg;
  }

  const messageRow = {
    user_id: userId,
    text: text,
    sender: sender
  };

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert(messageRow)
      .select()
      .single();

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return addChatMessage(userId, text, sender);
      }
      throw error;
    }
    return mapMessageFromDb(data);
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return addChatMessage(userId, text, sender);
    }
    handleSupabaseError(error, "addChatMessage");
    return {
      id: Math.random().toString(),
      userId,
      text,
      sender,
      timestamp: new Date().toISOString()
    };
  }
}

export async function getChatMessages(userId: string, count: number = 40): Promise<ChatMessage[]> {
  if (isOfflineMode()) {
    const messages = getLocalChatMessages();
    const userMessages = messages.filter(m => m.userId === userId);
    const sorted = [...userMessages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return sorted.slice(-count);
  }

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true })
      .limit(count);

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return getChatMessages(userId, count);
      }
      throw error;
    }
    return (data || []).map(mapMessageFromDb);
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return getChatMessages(userId, count);
    }
    handleSupabaseError(error, "getChatMessages");
    return [];
  }
}

// ---------------- DAILY GOALS ----------------
export async function getOrCreateDailyGoals(userId: string): Promise<DailyGoal[]> {
  const todayStr = new Date().toISOString().split("T")[0];

  if (isOfflineMode()) {
    const goals = getLocalDailyGoals();
    const userTodayGoals = goals.filter(g => g.userId === userId && g.dateStr === todayStr);
    if (userTodayGoals.length > 0) {
      return userTodayGoals;
    }

    const defaultTitles = [
      "Log your mood emoji",
      "Do a 3-minute breathing exercise",
      "Write a quick journal entry"
    ];

    const newGoals = defaultTitles.map(title => ({
      id: Math.random().toString(36).substring(2, 11),
      userId,
      title,
      completed: false,
      dateStr: todayStr
    }));

    goals.push(...newGoals);
    saveLocalDailyGoals(goals);
    return newGoals;
  }

  try {
    const { data, error } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", userId)
      .eq("date_str", todayStr);

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return getOrCreateDailyGoals(userId);
      }
      throw error;
    }

    if (data && data.length > 0) {
      return data.map(mapGoalFromDb);
    }

    const defaultTitles = [
      "Log your mood emoji",
      "Do a 3-minute breathing exercise",
      "Write a quick journal entry"
    ];

    const defaultGoalRows = defaultTitles.map(title => ({
      user_id: userId,
      title: title,
      completed: false,
      date_str: todayStr
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("daily_goals")
      .insert(defaultGoalRows)
      .select();

    if (insertError) {
      if (insertError.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return getOrCreateDailyGoals(userId);
      }
      throw insertError;
    }
    return (inserted || []).map(mapGoalFromDb);
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return getOrCreateDailyGoals(userId);
    }
    handleSupabaseError(error, "getOrCreateDailyGoals");
    return [
      { id: "1", userId, title: "Log your mood emoji", completed: false, dateStr: todayStr },
      { id: "2", userId, title: "Do a 3-minute breathing exercise", completed: false, dateStr: todayStr },
      { id: "3", userId, title: "Write a quick journal entry", completed: false, dateStr: todayStr }
    ];
  }
}

export async function toggleGoalCompletion(goalId: string, completed: boolean): Promise<void> {
  if (isOfflineMode()) {
    const goals = getLocalDailyGoals();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx > -1) {
      goals[idx].completed = completed;
      saveLocalDailyGoals(goals);
    }
    return;
  }

  try {
    const { error } = await supabase
      .from("daily_goals")
      .update({ completed })
      .eq("id", goalId);

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return toggleGoalCompletion(goalId, completed);
      }
      throw error;
    }
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return toggleGoalCompletion(goalId, completed);
    }
    handleSupabaseError(error, "toggleGoalCompletion");
  }
}

// ---------------- ACHIEVEMENTS ----------------
export async function getAchievements(userId: string): Promise<Achievement[]> {
  if (isOfflineMode()) {
    const achs = getLocalAchievements();
    const userAchs = achs.filter(a => a.user_id === userId);
    const unlockedMap = new Map<string, string>();
    userAchs.forEach(row => {
      unlockedMap.set(row.achievement_id, row.unlocked_at);
    });
    return DEFAULT_ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlockedAt: unlockedMap.has(ach.id) ? unlockedMap.get(ach.id)! : null
    }));
  }

  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return getAchievements(userId);
      }
      throw error;
    }

    const unlockedMap = new Map<string, string>();
    (data || []).forEach((row: any) => {
      unlockedMap.set(row.achievement_id, row.unlocked_at);
    });

    return DEFAULT_ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlockedAt: unlockedMap.has(ach.id) ? unlockedMap.get(ach.id)! : null
    }));
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return getAchievements(userId);
    }
    handleSupabaseError(error, "getAchievements");
    return DEFAULT_ACHIEVEMENTS;
  }
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
  if (isOfflineMode()) {
    const achs = getLocalAchievements();
    const already = achs.some(a => a.user_id === userId && a.achievement_id === achievementId);
    if (!already) {
      const todayStr = new Date().toISOString().split("T")[0];
      achs.push({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: todayStr
      });
      saveLocalAchievements(achs);
      return true;
    }
    return false;
  }

  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .eq("achievement_id", achievementId)
      .maybeSingle();

    if (error) {
      if (error.message?.includes("Failed to fetch")) {
        forceOfflineMode = true;
        return unlockAchievement(userId, achievementId);
      }
      throw error;
    }

    if (!data) {
      const todayStr = new Date().toISOString().split("T")[0];
      const { error: insertError } = await supabase
        .from("achievements")
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: todayStr
        });

      if (insertError) {
        if (insertError.message?.includes("Failed to fetch")) {
          forceOfflineMode = true;
          return unlockAchievement(userId, achievementId);
        }
        throw insertError;
      }
      return true;
    }

    return false;
  } catch (error) {
    if (String(error).includes("Failed to fetch")) {
      forceOfflineMode = true;
      return unlockAchievement(userId, achievementId);
    }
    handleSupabaseError(error, "unlockAchievement");
    return false;
  }
}

// ---------------- DATABASE STATS (ADMIN GRAPH COUPLING) ----------------
export async function getDatabaseStats() {
  if (isOfflineMode()) {
    const profiles = getLocalProfiles();
    const moods = getLocalMoodLogs();
    const journals = getLocalJournalEntries();

    const userCount = Math.max(1, profiles.length);
    const finalMoodCount = moods.length;
    const finalJournalCount = journals.length;

    let streakSum = 0;
    profiles.forEach(p => {
      streakSum += (p.streak || 1);
    });
    const streakAvg = userCount > 0 ? Math.round((streakSum / userCount) * 10) / 10 : 1;

    return {
      totalUsers: userCount,
      totalMoods: finalMoodCount,
      totalJournals: finalJournalCount,
      activeStreakAvg: streakAvg
    };
  }

  try {
    const { data: users, error: errUsers } = await supabase.from("profiles").select("streak");
    if (errUsers) throw errUsers;

    const { count: moodCount, error: errMoods } = await supabase.from("mood_logs").select("*", { count: "exact", head: true });
    if (errMoods) throw errMoods;

    const { count: journalCount, error: errJournals } = await supabase.from("journal_entries").select("*", { count: "exact", head: true });
    if (errJournals) throw errJournals;

    const userCount = Math.max(1, users ? users.length : 0);
    const finalMoodCount = moodCount || 0;
    const finalJournalCount = journalCount || 0;

    let streakSum = 0;
    if (users) {
      users.forEach(u => {
        streakSum += (u.streak || 1);
      });
    }
    const streakAvg = userCount > 0 ? Math.round((streakSum / userCount) * 10) / 10 : 1;

    return {
      totalUsers: userCount,
      totalMoods: finalMoodCount,
      totalJournals: finalJournalCount,
      activeStreakAvg: streakAvg
    };
  } catch (err) {
    console.warn("Failed to fetch database stats, defaulting to mock storage stats");
    forceOfflineMode = true;
    return getDatabaseStats();
  }
}
