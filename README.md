# GabAI — Your AI-Powered Filipino Healthcare Navigator

> Built for InnOlympics 2026 · Category: Health & Wellness

GabAI is a Progressive Web App (PWA) that guides Filipino patients through the **entire healthcare journey** — from figuring out where to go, to understanding what the doctor said, to tracking recovery and follow-ups. It bridges the gap between the healthcare system and patients who face barriers like health literacy, language, geography, and cost.

---

## The Problem

Many Filipinos — especially those in urban poor communities — struggle with:
- Not knowing **which facility to go to** based on their symptoms
- Not understanding **what the doctor told them** (jargon, fast explanations)
- Forgetting **medicines and instructions** after the visit
- Not knowing their **rights as patients**
- Losing track of their **medical history**

GabAI solves all of this in one app.

---

## Features

### 🟠 Before Phase — *Paghahanda*
- **Symptom Classification** — Describe your symptom or needed service in plain language; Gemini AI classifies the urgency and target department. Falls back to a local rule-based classifier (from `conditions.ts` + `services.ts`) when API quota runs out.
- **Facility Finder** — Finds the nearest BHC, RHU, hospital, or clinic from a curated Metro Manila dataset, ranked by a relevance + distance scoring algorithm. Filters: PhilHealth accredited, walk-in, 24/7 emergency, Malasakit Center, senior/PWD lane, and more.
- **Commute Planner** — Generates a multi-leg commute route (Walk → Tricycle → Jeepney → LRT/MRT → Bus) using OSRM for real road distances, with LTFRB 2024 official fare computations. Displays an interactive Leaflet.js map with the route polyline.
- **Document Checklist** — Context-aware list of what to bring (PhilHealth card, valid ID, referral slip, etc.), generated based on facility type and symptom classification.
- **PGH Queue Estimates** — Real wait-time estimates for Philippine General Hospital departments sourced from `pgh_estimates.ts`.

### 🔵 During Phase — *Tagamasid*

The during phase uses a **3-tab interface** inside a single scrollable card:

- **Tab 1 — Karapatan Mo (Patient Rights):** AI-generated patient rights briefing, tailored to the facility level and the patient's symptoms. Pulls PhilHealth membership status from the onboarding profile to surface relevant rights.
- **Tab 2 — Ano ang Narinig Mo (Recall Assistant):** Voice-first interface using MediaRecorder API + Web Speech API for real-time transcription. On stop, audio is base64-encoded and sent to Gemini 2.5 Flash for multimodal analysis. The AI structures the output into categorized instructions (`Gamot`, `Bawal`, `Aktibidad`, `Follow-up`, `Iba pa`) with confidence levels (`clear`, `reconstructed`, `unclear`). Automatically detects referrals (target specialty + reason) and writes everything to the Zustand encounter store.
- **Tab 3 — I-scan ang Lab Report:** Camera or file upload for lab results. Displays a parsed plain-language explanation. Includes a Text-to-Speech "read aloud" button.

### 🟢 After Phase — *Pagkalinga*

A continuous vertical scroll with four sections:

1. **Buod ng Iyong Bisita (Visit Recap)** — Structured summary card: facility name, visit date, encounter status, classification/diagnosis, medicines to remember, lab scan findings, and a referral alert banner if one was detected.
2. **Susunod na Hakbang (Referral Companion)** — Appears only when `referralTriggered = true` in the store. Shows the target specialty and reason extracted by Gemini. Clicking it pre-populates a new encounter with the referral context and routes to the Before phase.
3. **Okay Ka Pa Ba? (Follow-Up Intelligence)** — The patient selects their current condition (improving / same / worse). GabAI calls the `/api/gemini/followup` endpoint to generate personalized guidance based on symptoms, medications, and history.
4. **Community Log** — Collects wait time, doctor helpfulness, and a star rating. Submitted data is saved to the encounter record.

### 📁 Health Memory — *Alaala Ko*
- Full encounter history sorted by date, searchable by symptoms, facility, or medicine
- Inline expandable detail panels per encounter: symptoms, classification, encounter logs (Patient + GabAI turns), document scans, medicines, and risk flags
- User profile card with editable city, language, and PhilHealth status
- Live stats: total visits and active (flagged) encounters

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **AI / LLM** | [Google Gemini 2.5 Flash](https://ai.google.dev/) via REST API (multimodal: text + audio) |
| **Fallback Classifier** | Local rule-based engine (`conditions.ts`, `services.ts`) — zero API quota |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) with `persist` middleware (localStorage) |
| **Styling** | Vanilla CSS (custom design system in `globals.css`) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/react-icons/) |
| **Maps** | [Leaflet.js](https://leafletjs.com/) (CDN) with [OpenStreetMap](https://www.openstreetmap.org/) tiles |
| **Routing Engine** | [OSRM](http://project-osrm.org/) public demo server (road distances, free, no API key) |
| **Fare Matrix** | LTFRB 2024 official fares — hardcoded, no API needed |
| **Voice Input** | Web Speech API (real-time transcription) + MediaRecorder API (audio capture) |
| **Text-to-Speech** | Web Speech Synthesis API |
| **Database** | [Firebase Firestore](https://firebase.google.com/) (optional; primary persistence is localStorage) |

---

## Running Locally

### Prerequisites

- Node.js 18+
- A Google AI Studio API key ([get one here](https://aistudio.google.com/app/apikey))
- (Optional) A Firebase project for cloud persistence

> **Note:** GabAI is designed to run without Firebase. The `GABAI_GEMINI_KEY` is the only required secret. Symptom classification will also work fully offline via the local rule-based fallback if the Gemini API is unavailable.

### 1. Clone the repository

```bash
git clone https://github.com/dandadanielll/InnOlympics.git
cd InnOlympics/GabAi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the `GabAi/` root:

```env
# Required — Gemini API key for voice recall, patient rights, and follow-up AI
GABAI_GEMINI_KEY=your_gemini_api_key_here

# Used by the /api/classify route (can be same key or separate project)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — Firebase Firestore
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> Voice recording requires microphone permissions. Use Chrome or a Chromium-based browser for full Web Speech API support.

### 5. Build for production (optional)

```bash
npm run build
npm run start
```

---

## Project Structure

```
GabAi/
├── app/
│   ├── api/
│   │   ├── classify/         # Symptom/service triage — Gemini + local rule-based fallback
│   │   ├── commute/          # Commute plan — OSRM road routing + LTFRB fare matrix
│   │   ├── health/           # General health query endpoint
│   │   └── gemini/
│   │       ├── recall/       # Voice recall AI — multimodal transcription & instruction extraction
│   │       ├── rights/       # Patient rights AI — facility & symptom-specific briefing
│   │       └── followup/     # Follow-up intelligence — post-visit condition assessment
│   ├── components/
│   │   ├── Sidebar.tsx       # Global navigation sidebar
│   │   ├── LegalNotice.tsx   # RA 10173 / RA 4200 compliance notice component
│   │   └── LogoLoop.tsx      # Animated logo component
│   ├── navigator/
│   │   ├── layout.tsx        # Shared navigator layout
│   │   ├── page.tsx          # Navigator redirect
│   │   ├── before/
│   │   │   ├── page.tsx              # Before phase main page
│   │   │   ├── facilities.ts         # Curated Metro Manila health facility dataset
│   │   │   ├── conditions.ts         # Medical conditions database for local classifier
│   │   │   ├── services.ts           # Healthcare services lookup
│   │   │   ├── pgh_estimates.ts      # PGH department wait-time estimates
│   │   │   └── DocumentChecklist.tsx # Dynamic document checklist component
│   │   ├── during/
│   │   │   └── page.tsx      # During phase (3-tab: Rights, Recall, Lab Scan)
│   │   └── after/
│   │       └── page.tsx      # After phase (Visit Recap, Referral, Follow-Up, Community Log)
│   ├── history/
│   │   └── page.tsx          # Angkla — health memory dashboard
│   ├── dashboard/
│   │   └── page.tsx          # LGU analytics dashboard (static)
│   ├── onboarding/
│   │   └── page.tsx          # 2-step onboarding (city + PhilHealth status)
│   ├── about/                # About the project page
│   ├── globals.css           # Global design system, CSS variables, component classes
│   ├── layout.tsx            # Root app layout with sidebar
│   └── page.tsx              # Landing / onboarding redirect
├── lib/
│   ├── store.ts              # Zustand global state (Encounter, UserProfile, actions)
│   ├── firebase.ts           # Firebase Firestore client config
│   └── audioHelpers.ts       # MediaRecorder, blobToBase64, audio visualizer utilities
└── public/                   # Static assets (icons, manifest)
```

---

## Credits

| Resource | Purpose |
|---|---|
| [Google Gemini API](https://ai.google.dev/) | AI core — voice recall, patient rights briefing, follow-up intelligence, referral detection |
| [Next.js](https://nextjs.org/) | Full-stack React framework (App Router, API routes) |
| [Zustand](https://github.com/pmndrs/zustand) | Global state with localStorage persistence across all phases |
| [Firebase](https://firebase.google.com/) | Optional Firestore for cloud encounter persistence |
| [Framer Motion](https://www.framer.com/motion/) | Animations and transitions |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Leaflet.js](https://leafletjs.com/) | Interactive map for facility locations and commute routes |
| [OpenStreetMap](https://www.openstreetmap.org/) | Free map tiles for Leaflet |
| [OSRM](http://project-osrm.org/) | Open-source road routing engine (real distances, no API key) |
| [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) | Browser-native real-time speech recognition |
| [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) | Audio capture piped as base64 to Gemini multimodal input |
| [SpeechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) | Text-to-speech read-aloud for lab results |
| [Outfit & Inter fonts](https://fonts.google.com/) | Typography (via Google Fonts) |
| [Philippine DOH](https://www.doh.gov.ph/) | Reference for facility classifications and patient rights framework |
| [LTFRB Fare Matrix 2024](https://www.ltfrb.gov.ph/) | Official fare rates used in the commute planner |
| [Republic Act 10173](https://www.privacy.gov.ph/) | Data Privacy Act — basis for the voice consent flow |
| [Republic Act 4200](https://lawphil.net/) | Anti-Wiretapping Law — basis for the in-app recording legal notice |
| [Manus](https://manus.im/) | AI agent used during research, planning, and architectural design phases |

---

## Team

Built by **Daniel, Francis, Julius, and Mark** for the **InnOlympics 2026** hackathon.

---

## License

This project is submitted for academic and competition purposes. All rights reserved.
