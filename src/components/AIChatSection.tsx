import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  AlertCircle, 
  PhoneCall, 
  HelpCircle,
  Clock,
  Mic,
  Volume2
} from "lucide-react";
import { LocalUserState } from "../types";
import { addChatMessage, getChatMessages, ChatMessage } from "../supabase";

interface AIChatSectionProps {
  user: LocalUserState;
}

export default function AIChatSection({ user }: AIChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const [showSafetyBanner, setShowSafetyBanner] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickSuggestions = [
    "I'm feeling very overwhelmed right now.",
    "Can you guide me through a quick stress relief practice?",
    "Help me reframe a negative thought I'm having.",
    "I'm struggling to sleep. Any suggestions?"
  ];

  // Self-harm detectors for showing clinical resources
  const crisisKeywords = ["suicide", "kill myself", "end my life", "harm myself", "want to die", "hurt myself", "cutting", "overdose"];

  const checkSafetyKeywords = (text: string) => {
    const lower = text.toLowerCase();
    const hasCrisis = crisisKeywords.some(kw => lower.includes(kw));
    if (hasCrisis) {
      setShowSafetyBanner(true);
    }
  };

  useEffect(() => {
    async function loadChat() {
      try {
        setChatLoading(true);
        const history = await getChatMessages(user.uid);
        if (history.length === 0) {
          // Add a welcoming message from MindMate
          const welcomeMsg: ChatMessage = {
            userId: user.uid,
            text: `Hello ${user.displayName || "there"}! I am **MindMate AI**, your supportive mental wellness companion. 🌿 \n\nI am here to listen with absolute empathy, offer gentle mindfulness suggestions, and support your self-care journey. \n\n*Please remember: I am an AI companion, not a replacement for clinical therapy. If you are experiencing a crisis, please let me know or click the crisis support links.* \n\nHow is your day unfolding? What's on your mind?`,
            sender: "ai",
            timestamp: new Date()
          };
          setMessages([welcomeMsg]);
        } else {
          setMessages(history);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setChatLoading(false);
      }
    }
    loadChat();
  }, [user.uid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    checkSafetyKeywords(textToSend);

    // 1. Add User Message to local state and Firestore
    const userMsgText = textToSend;
    setInputValue("");
    setLoading(true);

    try {
      const userMsg = await addChatMessage(user.uid, userMsgText, "user");
      setMessages(prev => [...prev, userMsg]);

      // 2. Prepare conversation history for Gemini API
      // We only take the last 10 messages for context window size to keep things fast
      const chatHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        text: msg.text
      }));

      // 3. Query our server endpoint (which handles the secret Gemini API Key)
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMsgText,
          history: chatHistory
        })
      });

      if (!res.ok) {
        throw new Error("Failed to receive AI response");
      }

      const data = await res.json();
      const aiResponseText = data.text || "I apologize, I'm having trouble reflecting on that. Can we try again?";

      // 4. Save AI Response to Firestore and update local state
      const aiMsg = await addChatMessage(user.uid, aiResponseText, "ai");
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        userId: user.uid,
        text: "I apologize, I lost connection to my emotional core. Please check your network or try again.",
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Speak suggestion or activate simple mock speech input
  const startSpeechInput = () => {
    if (micActive) {
      setMicActive(false);
      return;
    }
    setMicActive(true);
    // Simulating typing voice input in a hackathon demo
    setTimeout(() => {
      setInputValue("I am feeling a bit stressed from exams and work load.");
      setMicActive(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 py-4 md:py-6 pb-20 md:pb-6 flex flex-col h-[calc(100vh-100px)]">
      
      {/* Disclaimer and Title */}
      <div className="shrink-0 flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-indigo-400" />
            <span>AI Empathetic Companion</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            A stigma-free zone for active emotional support, therapeutic reframing, and calming dialogue.
          </p>
        </div>
        <span className="text-[10px] text-slate-400 flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
          <Clock className="h-3.5 w-3.5 text-indigo-400" />
          <span>Active Session</span>
        </span>
      </div>

      {/* EMERGENCY CRISIS WARNING BANNER */}
      {showSafetyBanner && (
        <div id="safety-crisis-banner" className="shrink-0 flex items-start space-x-4 p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300">
          <PhoneCall className="h-6 w-6 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">We are here with you. You are not alone.</h4>
            <p className="text-xs">
              If you are feeling overwhelmed, having thoughts of self-harm, or in immediate distress, please consider talking to a crisis specialist right away. These services are free, confidential, and available 24/7:
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              <span className="px-2.5 py-1 bg-rose-500/20 text-white font-semibold rounded-lg">National Suicide Prevention: Call or Text 988 (USA)</span>
              <span className="px-2.5 py-1 bg-rose-500/20 text-white font-semibold rounded-lg">Crisis Text Line: Text HOME to 741741</span>
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-semibold rounded-lg">International: findahelpline.com</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 p-4 overflow-y-auto space-y-4 relative flex flex-col min-h-0">
        
        {chatLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 animate-pulse">
            <Bot className="h-8 w-8 text-indigo-400 animate-spin" />
            <span className="text-xs">Synchronizing conversation history...</span>
          </div>
        ) : (
          <div className="flex-1 space-y-4 pr-1">
            {messages.map((msg, index) => {
              const isAI = msg.sender === "ai";
              return (
                <div 
                  key={index} 
                  className={`flex ${isAI ? "justify-start" : "justify-end"} items-start space-x-2.5 max-w-[85%] ${
                    isAI ? "mr-auto" : "ml-auto"
                  }`}
                >
                  {isAI && (
                    <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-indigo-400" />
                    </div>
                  )}

                  <div className={`p-3.5 rounded-2xl text-xs md:text-sm shadow-md leading-relaxed ${
                    isAI 
                      ? "bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none" 
                      : "bg-indigo-600 text-white rounded-tr-none"
                  }`}>
                    <div className="markdown-body font-sans text-left">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>

                  {!isAI && (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Thinking/Typing Indicator */}
            {loading && (
              <div className="flex justify-start items-start space-x-2.5 max-w-[85%] mr-auto">
                <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="p-3.5 bg-slate-800/80 text-slate-400 border border-slate-700/50 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                  <span className="text-xs italic">MindMate is listening</span>
                  <div className="flex space-x-1">
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Prompts Grid */}
      {messages.length <= 2 && !loading && (
        <div className="shrink-0 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recommended topics:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickSuggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="p-2 text-left text-xs bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-colors truncate"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Area */}
      <div className="shrink-0 glass-panel rounded-2xl border border-slate-800 p-2.5 flex items-center space-x-2">
        <button 
          onClick={startSpeechInput}
          className={`p-2.5 rounded-xl transition-all border ${
            micActive 
              ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse" 
              : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white"
          }`}
          title="Mic input (Demo Simulation)"
        >
          <Mic className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage(inputValue);
          }}
          placeholder={micActive ? "Listening to voice input..." : "Share what you carry... Type your message"}
          className="flex-1 bg-transparent text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none px-2"
          disabled={loading}
        />

        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim() || loading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 text-white rounded-xl shadow-lg transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom Legal Disclaimer */}
      <div className="shrink-0 text-center text-[10px] text-slate-500 leading-normal">
        *MindMate AI is not a medical professional. Conversations are securely stored and analyzed for your personal wellness tracking. For emergency cases, please contact local medical crisis lines.*
      </div>

    </div>
  );
}
