# MindMate AI 🌿 — Your Daily Mental Wellness Companion

MindMate AI is an innovative, emotionally engaging, and highly secure full-stack mental wellness platform designed to solve the **TECH SPECTRA 2026 Hackathon** problem statement: *"The Weight We Carry - Build an accessible, stigma-free mental wellness platform that helps people receive daily mental health support without replacing professional medical care."*

Built with **React, Vite, Express, Firebase (Auth + Firestore), and Google Gemini AI**, MindMate AI bridges the gap between active listening and daily self-care rituals.

---

## 🚀 Presentation-Ready Hackathon Features

- **Daily Motivation Station**: Dynamically pulls personalized uplifting wellness quotes and daily action challenges from Gemini AI.
- **Visual Box Breathing (4-4-4)**: Interactive, glowing diaphragmatic lung expander guided by custom-timed CSS/Framer Motion loops.
- **Silent Meditation Companion**: Preset countdown timers that award +10% virtual growth index to your Emotional Wellness Garden upon completion.
- **Reflexive Emotion AI Journal**: Analyzes your thoughts to extract dominant emotions, calculate numeric sentiment percentages, write concise summary logs, find core stress triggers, and generate deep cognitive reframing questions.
- **AI Empathetic Support Chat**: Safe, compassionate, interactive chat that senses self-harm indicators and immediately raises helpful local hotlines (like 988 and Crisis Text Line).
- **Virtual Wellness Garden 🌱**: Cultivate a virtual plant that physically matures from Level 1 Sprout to Level 5 Canopy Tree based on daily tracking habits.
- **Burnout Risk Predictor**: Estimates your exhaustion risk (Low, Medium, High) using sleep indexes and standard physical stress questionnaires.
- **Secure Admin Panel**: Anonymous telemetry and aggregated demographic distributions suited for hackathon verification.

---

## 🛠️ Technological Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, Framer Motion, React Router.
- **Backend**: Express server running on Node, handling server-side proxy routes to shield secret API credentials.
- **AI Integration**: Google `@google/genai` model utilizing **gemini-2.5-flash** for speed and emotional sensitivity.
- **Database**: Cloud Firestore utilizing isolated database regions.
- **Onboarding**: Email/Password registry + dynamic Google Login + **Iframe-Safe Guest Mode Fallback** (crucial for review sandboxes!).

---

## 📦 Setting Up Locally

To set up and run MindMate AI locally, follow these simple steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Keys**:
   Create a `.env` file in your root folder:
   ```env
   GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_KEY"
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Compile production build**:
   ```bash
   npm run build
   ```

5. **Start Production Container**:
   ```bash
   npm run start
   ```

---

*MindMate AI is a wellness companion and not a medical diagnosis tool.*
