# [APP NAME] — MVP Business Requirements Document (Part 1/2)
## InnOlympics 2026 | Track B: Pangarap sa Kalusugan
### Filipino Healthcare Encounter Companion PWA

---

## 1. EXECUTIVE SUMMARY

**Product:** [APP NAME] — a voice-first PWA that guides low-to-middle income Filipino patients through every healthcare encounter: before (preparation), during (documentation), and after (follow-up). Powered by Gemini 2.0 Flash, Firebase, and Google Maps.

**Problem:** The Philippine public healthcare system is not absent — it is a maze. Patients arrive at wrong facilities, without correct documents, unable to articulate symptoms effectively, and leave without understanding what the doctor said. Every encounter starts from zero. The cost: lost wages, worsened conditions, and Filipinos who give up entirely.

**Solution:** [APP NAME] is the companion that goes with them — before, during, and after every healthcare encounter — and remembers everything via persistent health memory ("Alaala Ko") so they never start from zero again.

**Scope:** Metro Manila, 23-hour hackathon MVP, anonymous auth, English UI with Filipino/Taglish AI responses.

**Google Technologies:** Gemini 2.0 Flash (load-bearing AI core), Firebase (Auth + Firestore + Hosting), Google Maps Embed API.

---

## 2. PROBLEM STATEMENT

### The System Problem
Philippine public healthcare has 5+ entry points (barangay health center, RHU, city/district hospital, provincial hospital, private clinic, ER) with no routing logic accessible to patients. There is no map, no guide, and no memory between visits.

### The Human Cost
A nanay in Tondo wakes at 4 AM to bring her son to the nearest public hospital. He's had a cough for weeks. After a 2-hour commute and 5-hour wait, she's told: "You need a referral from your barangay health center first." She goes home. Lost wages. Son still coughing. Next day at the BHC — wrong PhilHealth form. Another day lost. By the time he's seen, the cough is pneumonia.

This is not a failure of healthcare availability. It is a failure of healthcare navigability.

### The Cultural Dimension
- **"OA" mindset:** Filipinos culturally downplay symptoms, only seeking care when critically ill. The system punishes early intervention by making it harder to access than emergency care.
- **Authority deference:** Patients are non-confrontational with doctors, leading to vague symptom descriptions ("masakit ang ulo ko") and failure to ask follow-up questions.
- **Family communication:** Healthcare decisions are communal in Filipino families, but visit information is lost in retelling.
- **Digital divide:** Target users type slowly, have low digital literacy, and use budget Android phones on prepaid data.

---

## 3. SOLUTION OVERVIEW

[APP NAME] follows a **before → during → after** workflow anchored by persistent health memory ("Alaala Ko").

```
┌─────────────────────────────────────────────────────────┐
│                    ALAALA KO (Memory)                    │
│         Persistent health history across visits          │
├──────────────┬──────────────────┬────────────────────────┤
│   BEFORE     │     DURING       │       AFTER            │
│ "Handa Ka    │  "Nandito Ka     │    "Uwi Ka Na"         │
│   Na Ba?"    │     Na"          │                        │
├──────────────┼──────────────────┼────────────────────────┤
│• Care plan   │• Script pull-up  │• Follow-up check-in    │
│• Doc checklist│• Rights reminder│• WhatsApp summary      │
│• Script gen  │• Voice logger    │• Referral companion    │
│• Map/facility│• Document camera │• Community logger      │
│• Risk flag   │                  │                        │
└──────────────┴──────────────────┴────────────────────────┘
         ↑                                    │
         └────── Referral loops back ─────────┘
```

**Voice is the primary interaction modality** — not a feature, but the accessibility layer. Push-to-talk pattern (not always-on). Web Speech API for input, Web Speech Synthesis for output.

**Tone:** Warm, calm, Filipino — like a trusted ate or kuya who has navigated the system before. Never clinical, never corporate, never alarming unless necessary.

---

## 4. TARGET USERS & PERSONAS

### Persona 1: Nanay Mercy (Primary)
- **Age:** 38, mother of 3
- **Location:** Caloocan City
- **Income:** ₱18,000/month (husband is a jeepney driver)
- **Phone:** 2nd-hand Samsung Galaxy A03, prepaid Globe data
- **Health literacy:** Low — understands basic symptoms but not medical terminology
- **Digital literacy:** Uses Facebook, Messenger, TikTok. Types slowly. Prefers voice messages.
- **Pain points:** Doesn't know which facility to go to. Doesn't understand PhilHealth benefits. Can't remember what the doctor said last time. Too intimidated to ask doctors questions. Loses a full day's wages per hospital visit.
- **Scenario:** Her youngest (4yo) has had a fever for 3 days. She doesn't know if she should go to the barangay health center or the hospital. She doesn't know what documents to bring. She's afraid of being sent home again.

### Persona 2: Kuya Jericho (Secondary)
- **Age:** 23, first-time public healthcare user
- **Location:** Quezon City (renting a bedspace)
- **Income:** ₱15,000/month (BPO night shift)
- **Phone:** Realme C55, WiFi at work, prepaid data otherwise
- **Health literacy:** Moderate — can Google symptoms but overwhelmed by contradictory information
- **Digital literacy:** High — comfortable with apps, but has never navigated the public health system (previously used company HMO, now expired)
- **Pain points:** Doesn't know the public healthcare system at all. Doesn't know he's eligible for PhilHealth Konsulta. Too embarrassed to ask basic questions. Night shift schedule conflicts with clinic hours.
- **Scenario:** Persistent back pain for 2 months. His HMO expired. He's never been to a public clinic. He doesn't know where to start.

---

## 5. FEATURE REQUIREMENTS

### 5.1 ONBOARDING (2-3 screens, <60 seconds)

| Requirement | Detail |
|---|---|
| Screen 1 | Location: Metro Manila city selector dropdown (17 cities/municipalities) |
| Screen 2 | PhilHealth status: Yes / No / Not Sure (radio buttons) |
| Screen 3 | Language preference: Filipino / Taglish / English (affects AI output language) |
| Storage | Firestore `users/{userId}` document via anonymous auth |
| UX | Large buttons, minimal text, voice-readable labels, completable with one hand |

### 5.2 PHASE 1: BEFORE — "Handa Ka Na Ba?" (Preparation Companion)

#### Feature 1A: Situation Input (Voice or Text)
| Requirement | Detail |
|---|---|
| Input method | Push-to-talk voice (primary) or text input (fallback) |
| Voice tech | Web Speech API (`webkitSpeechRecognition`), lang: `fil-PH` with `en-US` fallback |
| Push-to-talk UX | Large mic button (80px), hold to record, release to send. Animated pulse while recording. |
| Processing | Voice transcript → sent to Gemini Care Navigation Prompt |
| Output | Structured care plan (see Gemini Prompt Architecture, Section 8) |

**Care Plan Output Structure:**

| Field | Description |
|---|---|
| Facility Level | Barangay Health Center / RHU / District Hospital / ER |
| Recommended Facilities | 2-3 specific facilities near user's selected city, with addresses |
| Documents Checklist | What to bring + where/how to get each document for free |
| Commute Options | Estimated commute method and cost from user's city |
| Queue Estimate | Typical operating hours, peak times, estimated wait |
| Risk Flag | Pre-visit triage: green (safe to wait) / yellow (go soon) / red (ER now) |
| Risk Rationale | Plain-language explanation combating "OA" mindset |

#### Feature 1B: "Dapat Sabihin Mo" Script Generator
| Requirement | Detail |
|---|---|
| Input | Structured symptoms from 1A + Alaala Ko history (if exists) |
| Output | Clear, respectful Taglish script the patient can read aloud to the doctor |
| Display | Readable card with large text + "Read it to me" voice playback button |
| History-aware | If prior encounters exist, script includes: "Last time, your doctor noted X — mention this" |
| Tone | Respectful but clinically specific — transforms vague complaints into useful medical narratives |

#### Feature 1C: Facility Map
| Requirement | Detail |
|---|---|
| Display | Google Maps Embed API showing recommended facility |
| Data shown | Facility name, address, operating hours |
| Interaction | Tap to open in Google Maps app for directions |

### 5.3 PHASE 2: DURING — "Nandito Ka Na" (Encounter Support)

#### Feature 2A: Script Pull-up
| Requirement | Detail |
|---|---|
| Trigger | Automatic on entering During phase |
| Content | Display the "Dapat Sabihin Mo" script from Before phase |
| UX | Expandable card at top of screen, collapsible after consultation starts |

#### Feature 2B: Patient Rights Reminder
| Requirement | Detail |
|---|---|
| Display | Context-aware based on PhilHealth status |
| Content (PhilHealth=Yes) | Right to itemized bill, right to second opinion, free services under Konsulta package, no-balance billing policy |
| Content (PhilHealth=No) | Free services available at BHC regardless, how to apply for PhilHealth (PhilHealth Konsulta registration) |
| Tone | Non-confrontational — gives language to use, not legal threats |
| UX | Collapsible info card, "Read to me" voice option |

#### Feature 2C: Voice Encounter Logger
| Requirement | Detail |
|---|---|
| Input | Push-to-talk recording during/after consultation |
| Tech | Web Speech API continuous recognition |
| Processing | Raw transcript → Gemini Encounter Log Summarizer |
| Output | Plain-Taglish summary + "To Remember" highlights (key instructions, meds, follow-ups) |
| Storage | Firestore `encounters/{id}/encounterLog` |
| UX | Big mic button (center of screen), live transcript scrolling, "To Remember" cards below |

#### Feature 2D: Document Camera
| Requirement | Detail |
|---|---|
| Input | Camera capture of prescription, lab request, referral letter, or discharge summary |
| Tech | `<input type="file" accept="image/*" capture="environment">` → base64 → Gemini Vision |
| Processing | Image → Gemini Document Vision Prompt |
| Output | Document type, plain-Taglish explanation, next steps, questions to ask doctor |
| Display | Readable card + voice playback |
| Storage | Image URL (or base64) + explanation in Firestore encounter document |

### 5.4 PHASE 3: AFTER — "Uwi Ka Na" (Follow-up & Sharing)

#### Feature 3A: "Ipaliwanag sa Pamilya" WhatsApp Summary
| Requirement | Detail |
|---|---|
| Trigger | One-tap button on After screen |
| Content | Full visit recap: what happened, diagnosis/notes, prescriptions, what to do next, when to return |
| Source | Compiled from encounter log, To Remember highlights, document camera results |
| Tech | `window.open('https://wa.me/?text=' + encodeURIComponent(summary))` |
| Format | Plain Taglish text, structured with emoji headers for readability |

#### Feature 3B: "Okay Ka Pa Ba?" Follow-up Check-in
| Requirement | Detail |
|---|---|
| Trigger | Push notification 24-48 hours post-visit (or manual check-in button) |
| Input | Voice or tap: "Kumusta ka na?" response options or free voice |
| Processing | Gemini Follow-up Evaluator: user response + original encounter summary |
| Output | Improving → affirm + care tips. Not improving → flag + recommend return. |
| Storage | Update encounter `followUpStatus` field |

#### Feature 3C: Referral Companion
| Requirement | Detail |
|---|---|
| Trigger | If encounter log mentions a referral |
| Behavior | Automatically create a new Before phase flow for the referred facility/service |
| UX | "You were referred to [X]. Let's prepare for that visit." → loops to Phase 1 |
| Data | New encounter document linked to original via `referralFromEncounterId` |

#### Feature 3D: Community Experience Logger
| Requirement | Detail |
|---|---|
| Trigger | Prompted after completing the After phase |
| Fields | Facility (auto-filled), wait time estimate (dropdown), doctor helpful (Y/N), turned away (Y/N), overall (1-5 stars) |
| Storage | Firestore `community/experiences/{id}` — anonymous, no user linkage |
| Future use | Aggregated data feeds back into Before phase queue estimates |

### 5.5 ALAALA KO — Persistent Health Memory (Cross-Phase)

| Requirement | Detail |
|---|---|
| Auto-save | Every encounter saved to Firestore with timestamp, facility, symptoms, diagnosis, prescriptions, follow-up instructions |
| Pre-visit surfacing | Before each new visit, app queries past encounters and surfaces relevant history |
| Script enrichment | Alaala Ko data injected into "Dapat Sabihin Mo" prompt |
| Voice-queryable | "Kailan ako huling pumunta sa doktor?" → voice response from Firestore history |
| Privacy | All data under anonymous user ID. No PII collected beyond what user volunteers in voice. |

### 5.6 NON-FUNCTIONAL REQUIREMENTS

| Category | Requirement |
|---|---|
| Performance | First contentful paint < 3s on 3G. Gemini response < 8s. |
| Offline | Landing page, emergency hotlines, saved care plans cached via service worker |
| Accessibility | WCAG AA contrast, 48px min touch targets, voice I/O for all core features |
| Security | No PII stored beyond anonymous UID. Firestore security rules: user can only read/write own data. Community collection: write-only (no read of others' data in client). |
| Reliability | Graceful degradation: if Gemini fails, show cached/static care pathway guidance. If voice fails, text fallback always available. |
| Device support | Android 8+ Chrome, iOS 14+ Safari. Min 320px viewport. Target: budget Android phones (Samsung A-series, Realme C-series). |

---

## 6. TECHNICAL ARCHITECTURE

### Tech Stack (Fixed)

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Core | Gemini 2.0 Flash via `@google/generative-ai` |
| Vision | Gemini 2.0 Flash multimodal (same SDK) |
| Voice Input | Web Speech API (`webkitSpeechRecognition`) |
| Voice Output | Web Speech Synthesis API (`speechSynthesis`) |
| Database | Firebase Firestore |
| Auth | Firebase Anonymous Auth |
| Hosting | Firebase Hosting or Vercel |
| Maps | Google Maps Embed API |
| PWA | `next-pwa` |
| Icons | Lucide React |
| Fonts | Google Fonts — Inter (body), Plus Jakarta Sans (headings) |
| Animation | Framer Motion |

### Data Flow

```
User (Voice/Text/Camera)
        │
        ▼
┌──────────────────┐     ┌──────────────────────┐
│   Next.js Client │────▶│  Web Speech API       │
│   (PWA)          │     │  (voice ↔ text)       │
│                  │     └──────────────────────┘
│                  │
│                  │────▶ Gemini 2.0 Flash API
│                  │     ├─ Care Navigation Prompt
│                  │     ├─ Script Generator Prompt
│                  │     ├─ Encounter Summarizer
│                  │     ├─ Document Vision Prompt
│                  │     ├─ Follow-up Evaluator
│                  │     └─ WhatsApp Summary Generator
│                  │
│                  │────▶ Firebase Firestore
│                  │     ├─ users/{uid}
│                  │     ├─ users/{uid}/encounters/{eid}
│                  │     ├─ facilities/{fid}
│                  │     └─ community/experiences/{xid}
│                  │
│                  │────▶ Google Maps Embed API
│                  │     └─ Facility location display
└──────────────────┘
```

### Route Structure (Next.js App Router)

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout + PWA head
├── onboarding/
│   └── page.tsx                # Onboarding flow
├── navigator/
│   ├── page.tsx                # Main navigator (phase router)
│   ├── before/
│   │   └── page.tsx            # Before phase
│   ├── during/
│   │   └── page.tsx            # During phase
│   └── after/
│       └── page.tsx            # After phase
├── history/
│   └── page.tsx                # Alaala Ko — encounter history
├── emergency/
│   └── page.tsx                # Emergency hotlines
├── about/
│   └── page.tsx                # About page
├── api/
│   ├── gemini/
│   │   ├── navigate/route.ts   # Care navigation
│   │   ├── script/route.ts     # Script generator
│   │   ├── summarize/route.ts  # Encounter summarizer
│   │   ├── vision/route.ts     # Document camera
│   │   ├── followup/route.ts   # Follow-up evaluator
│   │   └── whatsapp/route.ts   # WhatsApp summary
│   └── facilities/route.ts     # Facility lookup
├── components/
│   ├── VoiceInput.tsx           # Push-to-talk component
│   ├── VoicePlayback.tsx        # TTS playback component
│   ├── CarePlanCard.tsx         # Structured care plan display
│   ├── ScriptCard.tsx           # Dapat Sabihin Mo display
│   ├── DocumentCamera.tsx       # Camera capture + results
│   ├── EncounterLogger.tsx      # Voice logger + transcript
│   ├── FacilityMap.tsx          # Google Maps embed
│   ├── EmergencyBanner.tsx      # Persistent emergency CTA
│   ├── PhaseNavigation.tsx      # Before/During/After tabs
│   └── ChecklistItem.tsx        # Interactive checklist
├── lib/
│   ├── firebase.ts              # Firebase init
│   ├── gemini.ts                # Gemini client + prompts
│   ├── speech.ts                # Web Speech API wrapper
│   ├── emergency.ts             # Emergency keyword detection
│   └── types.ts                 # TypeScript types
└── data/
    └── facilities.json          # Seed facility data (Metro Manila)
```

---

## 7. FIRESTORE DATA SCHEMA

### Collection: `users/{userId}`
```typescript
interface UserProfile {
  location: string;            // Metro Manila city
  hasPhilHealth: 'yes' | 'no' | 'unsure';
  languagePreference: 'filipino' | 'taglish' | 'english';
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}
```

### Subcollection: `users/{userId}/encounters/{encounterId}`
```typescript
interface Encounter {
  phase: 'before' | 'during' | 'after' | 'complete';
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Before phase
  rawInput: string;                    // Original voice/text transcript
  carePlan: {
    facilityLevel: string;
    recommendedFacilities: Array<{
      name: string;
      address: string;
      facilityId: string;
    }>;
    documentsChecklist: Array<{
      document: string;
      whereToGet: string;
      isFree: boolean;
    }>;
    commuteOptions: string;
    queueEstimate: string;
    riskFlag: 'green' | 'yellow' | 'red';
    riskRationale: string;
  };
  script: string;                     // Dapat Sabihin Mo text

  // During phase
  encounterLog: Array<{
    timestamp: Timestamp;
    rawTranscript: string;
    summary: string;
  }>;
  toRemember: string[];               // Gemini-extracted key points
  prescriptions: string[];
  documentScans: Array<{
    imageBase64: string;
    documentType: string;
    explanation: string;
    nextSteps: string[];
  }>;

  // After phase
  followUpStatus: 'pending' | 'improving' | 'flagged' | null;
  followUpResponse: string;
  referralTriggered: boolean;
  referralFromEncounterId: string | null;
  whatsappSummary: string;

  // Facility reference
  facilityId: string;
}
```

### Collection: `facilities/{facilityId}`
```typescript
interface Facility {
  name: string;
  type: 'bhc' | 'rhu' | 'district_hospital' | 'city_hospital' |
        'provincial_hospital' | 'medical_center' | 'private';
  address: string;
  city: string;
  region: 'metro_manila';
  coordinates: { lat: number; lng: number };
  operatingHours: string;
  peakHours: string;
  philHealthAccredited: boolean;
  servicesOffered: string[];
  averageWaitMinutes: number | null;   // Updated from community data
  contactNumber: string;
}
```

### Collection: `community/experiences/{experienceId}`
```typescript
interface CommunityExperience {
  facilityId: string;
  waitTimeMinutes: number;
  doctorHelpful: boolean;
  turnedAway: boolean;
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt: Timestamp;
  // No userId — fully anonymous
}
```

---

## 8. GEMINI PROMPT ARCHITECTURE

### 8.1 Care Navigation Prompt (Before Phase)

```
SYSTEM:
You are [APP NAME], a Filipino healthcare navigation companion.
You help patients find the right facility, prepare documents, and
understand what to expect — so no Filipino wastes another day lost
in the healthcare system.

RULES:
1. You are NOT a doctor. Never diagnose. You are a navigation companion.
2. For life-threatening symptoms (chest pain, difficulty breathing,
   uncontrolled bleeding, loss of consciousness, seizures), IMMEDIATELY
   return riskFlag: "red" and direct to ER / call 911.
3. Use Philippine healthcare levels:
   Level 1: Barangay Health Center (BHC) — free, minor/preventive
   Level 2: Rural Health Unit (RHU) / City Health Office — free, referrals
   Level 3: District/City Hospital — PhilHealth accepted
   Level 4: Medical Center / Tertiary — complex cases
4. ALWAYS combat the "OA" (over-acting) mindset. If symptoms warrant
   urgency, explicitly tell the user: "Hindi ka OA. Tama lang na
   magpatingin ka."
5. Be specific about documents — not just what to bring, but WHERE
   and HOW to get each one for free.
6. Respond with warmth. Use plain Filipino/Taglish (based on user
   language preference). Never use medical jargon without explanation.

FACILITY DATABASE:
{facilitiesFromFirestore}

USER CONTEXT:
- Location: {userLocation}
- PhilHealth: {philHealthStatus}
- Language: {languagePreference}
- Prior encounters (Alaala Ko): {alaalaSummary}

USER INPUT: {rawInput}

OUTPUT FORMAT (JSON):
{
  "facilityLevel": "string",
  "recommendedFacilities": [
    {"name": "string", "address": "string", "facilityId": "string", "why": "string"}
  ],
  "documentsChecklist": [
    {"document": "string", "whereToGet": "string", "isFree": true}
  ],
  "commuteOptions": "string",
  "queueEstimate": "string",
  "riskFlag": "green|yellow|red",
  "riskLevel": "string",
  "riskRationale": "string",
  "whatToExpect": "string",
  "summary": "string"
}
```

### 8.2 Script Generator Prompt (Before Phase)

```
SYSTEM:
Generate a clear, respectful script that the patient can read aloud
to their doctor. Transform vague Filipino symptom descriptions into
clinically useful narratives. Use {languagePreference}.

Address Filipino non-confrontational behavior — the script should
feel empowering, not demanding.

If Alaala Ko history exists, incorporate relevant past encounters:
"Last visit, the doctor noted X. You should mention this."

INPUT:
- Structured symptoms: {carePlanOutput}
- Alaala Ko history: {priorEncounters}
- Language: {languagePreference}

OUTPUT FORMAT (JSON):
{
  "script": "string (the full script to read aloud)",
  "keyPointsToMention": ["string"],
  "questionsToAsk": ["string"]
}
```

### 8.3 Encounter Log Summarizer (During Phase)

```
SYSTEM:
Summarize a patient's voice recording of their doctor consultation.
Extract the most important information in plain {languagePreference}.
This summary will be the patient's memory of the visit.

INPUT: {rawVoiceTranscript}

OUTPUT FORMAT (JSON):
{
  "plainSummary": "string",
  "toRemember": ["string — key instructions"],
  "prescriptions": [
    {"medication": "string", "dosage": "string", "instructions": "string"}
  ],
  "followUpDate": "string or null",
  "referralMentioned": true/false,
  "referralDetails": "string or null"
}
```

### 8.4 Document Vision Prompt (During Phase)

```
SYSTEM:
You are analyzing a medical document (prescription, lab request,
referral letter, or discharge summary) photographed by a Filipino
patient. Explain it in plain {languagePreference} as if explaining
to a family member with no medical background.

INPUT: {base64Image}

OUTPUT FORMAT (JSON):
{
  "documentType": "prescription|lab_request|referral|discharge|other",
  "plainExplanation": "string",
  "medications": [{"name": "string", "purpose": "string", "howToTake": "string"}],
  "nextSteps": ["string"],
  "questionsToAsk": ["string"],
  "urgency": "routine|soon|urgent"
}
```

### 8.5 Follow-up Evaluator (After Phase)

```
SYSTEM:
A Filipino patient is checking in after a healthcare visit. Based on
their response and original encounter data, determine if they are
improving or need to return. Be warm, not alarming. Use {languagePreference}.

If they are NOT improving, gently but clearly recommend returning.
Combat the tendency to say "okay na" when it's not.

INPUT:
- Check-in response: {userResponse}
- Original encounter: {encounterSummary}

OUTPUT FORMAT (JSON):
{
  "status": "improving|stable|flagged",
  "message": "string (warm, personalized response)",
  "recommendedAction": "string",
  "shouldReturn": true/false,
  "urgency": "none|low|high"
}
```

### 8.6 WhatsApp Summary Generator (After Phase)

```
SYSTEM:
Generate a plain-language visit summary formatted for WhatsApp sharing.
A Filipino patient wants to tell their family what happened at the
doctor. Use {languagePreference}. Use emoji headers for readability.
Keep it under 1000 characters.

INPUT: {fullEncounterObject}

OUTPUT: Plain text string (not JSON) formatted for WhatsApp.
```

### All Prompts: Shared Config

```typescript
const geminiConfig = {
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.3,          // Low for consistency
    maxOutputTokens: 2048,
    responseMimeType: "application/json"  // JSON mode for structured
  }
};
// WhatsApp summary uses responseMimeType: "text/plain"
```

---

*End of Part 1 — Sections 1-8. See BRD_PART2.md for Sections 9-17.*
# [APP NAME] — MVP Business Requirements Document (Part 2/2)
## InnOlympics 2026 | Track B: Pangarap sa Kalusugan
### Sections 9–17

---

## 9. UI/UX REQUIREMENTS

### 9.1 Design System

#### Color Palette (60/30/10 Rule)
```css
/* 60% — Backgrounds */
--bg-base: #f2ecdc;           /* Warm cream — page backgrounds */
--bg-card: #FFFFFF;            /* Card surfaces */
--bg-dark: #2a2f18;            /* Dark forest — footer, nav dark mode */

/* 30% — Primary Accent */
--primary: #510400;            /* Deep red — hero elements, primary CTAs, critical alerts */
--primary-hover: #6a1f1e;      /* Darker red on hover */

/* 10% — Secondary Accents */
--text-primary: #3d1b11;       /* Dark brown — primary typography */
--text-secondary: #6b5c53;     /* Muted brown — secondary text */
--success: #868859;            /* Olive — stable status, confirmed, healthy */
--warning: #d4a843;            /* Gold — caution, yellow risk flag */
--danger: #c0392b;             /* Bright red — emergency, red risk flag */
--info: #2a6496;               /* Steel blue — informational elements */
--border: #d4c9b5;             /* Warm border */
```

#### Typography
- **Headings:** Plus Jakarta Sans (Google Fonts), 700 weight
- **Body:** Inter (Google Fonts), 400/500 weight
- **Line height:** 1.6 for body (medical accessibility)
- **Base size:** 16px minimum (never smaller on mobile)

#### Spacing Scale (4px baseline)
`4 | 8 | 12 | 16 | 24 | 32 | 48 | 64`

#### Component Standards
- Border radius: 12px (cards), 8px (buttons), 24px (pills/chips)
- Shadows: `0 2px 8px rgba(61,27,17,0.08)` (subtle), `0 4px 16px rgba(61,27,17,0.12)` (elevated)
- All interactive elements: hover, active, disabled, loading, empty, error states
- Semantic naming: `btn-primary`, `surface-muted`, `text-accent` (not color-based)

### 9.2 Voice Interaction Patterns

#### Push-to-Talk Button
- Size: 80px diameter (large, unmissable)
- States: idle (outline), recording (pulsing red glow + scale animation), processing (spinner)
- Visual feedback: waveform animation during recording
- Haptic: vibrate on press/release (if supported)
- Position: center-bottom of screen (thumb-reachable)

#### Voice Playback
- "Read to me" button on all AI output cards
- Web Speech Synthesis, lang: `fil-PH` (with `en-US` fallback)
- Playback controls: play/pause, speed (0.75x/1x/1.25x)
- Visual: highlighted text scrolling during playback

#### Whisper Mode Consideration
- For hospital waiting rooms: note in UI — "You can also type your question instead"
- Text input always visible as fallback below mic button

### 9.3 Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Touch targets | Minimum 48x48px for all interactive elements |
| Contrast | WCAG AA minimum (4.5:1 for body text, 3:1 for large text) |
| Font size | 16px minimum body, 14px minimum small text |
| Voice I/O | All core features accessible via voice input and voice output |
| Text fallback | Every voice feature has a text equivalent |
| Loading states | Skeleton screens, not spinners (less anxiety-inducing) |
| Error states | Warm, non-technical language ("Something went wrong. Try again?" not "Error 500") |
| Offline | Emergency hotlines page cached and available offline |

### 9.4 Key Screen Layouts

#### Landing Page
```
┌──────────────────────────────┐
│ [Logo] [APP NAME]    [Menu]  │
├──────────────────────────────┤
│                              │
│   Hindi Ka Nag-iisa.         │
│   May Kasama Ka Na.          │
│                              │
│   [🎤 Sabihin Mo Sa Akin]    │
│   or type your concern below │
│   [___________________][Send]│
│                              │
│   🔒 Anonymous  🆓 Free     │
│   📱 Works Offline           │
├──────────────────────────────┤
│  HOW IT WORKS                │
│  1. Tell us → 2. We guide    │
│  → 3. You're prepared        │
├──────────────────────────────┤
│  🚨 Emergency? Call 911      │
└──────────────────────────────┘
```

#### Navigator — Before Phase
```
┌──────────────────────────────┐
│ ← Back    BEFORE    [•][•][○]│
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ YOUR CARE PLAN           │ │
│ │ ────────────────────     │ │
│ │ 🏥 Go to: QC BHC        │ │
│ │ 📍 [Map Embed]           │ │
│ │ 📋 Bring: PhilHealth ID, │ │
│ │    birth cert...         │ │
│ │ 💰 Cost: ₱0 (PhilHealth) │ │
│ │ ⏱️ Wait: ~1-2 hrs        │ │
│ │ 🟢 Safe to wait          │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 📝 DAPAT SABIHIN MO     │ │
│ │ "Doc, 3 days na po..."   │ │
│ │         [🔊 Read to Me]  │ │
│ └──────────────────────────┘ │
│                              │
│ [Proceed to DURING →]       │
├──────────────────────────────┤
│ 🚨 Emergency? Call 911      │
└──────────────────────────────┘
```

#### Navigator — During Phase
```
┌──────────────────────────────┐
│ ← Back    DURING    [•][•][○]│
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ 📝 Your Script (tap)     │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ℹ️ Your Rights (tap)     │ │
│ └──────────────────────────┘ │
│                              │
│   Live Transcript:           │
│   "Doctor said take          │
│    amoxicillin 3x a day..."  │
│                              │
│        ┌────────┐            │
│        │  🎤    │            │
│        │  HOLD  │            │
│        └────────┘            │
│  [📷 Scan Document]         │
│                              │
│ [Proceed to AFTER →]        │
└──────────────────────────────┘
```

---

## 10. PWA REQUIREMENTS

### manifest.json
```json
{
  "name": "[APP NAME]",
  "short_name": "[APP NAME]",
  "description": "Your companion through the Filipino healthcare system",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#f2ecdc",
  "theme_color": "#510400",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker Strategy (next-pwa)
- **Cache-first:** Landing page, about, emergency hotlines, static assets
- **Network-first:** Navigator pages (require Gemini API)
- **Offline fallback:** Static page with emergency hotlines and saved care plans from IndexedDB
- **Firestore offline persistence:** Enabled (`enableIndexedDbPersistence`) — saved encounters available offline

---

## 11. GOOGLE TECHNOLOGY INTEGRATION

| Technology | How It's Used | Why It's Meaningful (Not Decorative) |
|---|---|---|
| **Gemini 2.0 Flash** | Powers ALL 6 AI features: care navigation, script generation, encounter summarization, document vision, follow-up evaluation, WhatsApp summary generation | Remove Gemini and the product doesn't exist. It IS the intelligence layer. Multimodal (text + vision) demonstrates advanced integration. |
| **Firebase Auth** | Anonymous authentication — zero-friction entry, no signup wall | Directly serves the target user: people who won't create accounts but need help now. Anonymous → real account upgrade path exists. |
| **Firebase Firestore** | Persistent health memory (Alaala Ko), encounter storage, facility knowledge base, community experience data | Enables the core differentiator: visits that remember. Offline persistence means data survives bad connectivity. Scalable without infra changes. |
| **Firebase Hosting** | PWA deployment with CDN, SSL, and custom domain | One-command deployment. Production-grade hosting in the hackathon window. |
| **Google Maps Embed** | Facility location display with directions link | Solves the "where is it?" question that comes after "where should I go?" Tap-to-navigate to Google Maps for actual directions. |

**Pitch line:** "We use five Google technologies — and every single one is load-bearing. Remove any one and the product breaks."

---

## 12. SCALABILITY PLAN

### Technical Scalability
```
TODAY (Hackathon MVP)          TOMORROW (Post-Hackathon)
──────────────────────         ────────────────────────
Metro Manila (17 cities)  →    Cebu, Davao, Iloilo, Zamboanga
10-15 curated facilities  →    DOH facility registry integration
Anonymous auth            →    Optional account upgrade (no data loss)
Manual facility data      →    LGU-contributed facility data via admin
Static queue estimates    →    Community-powered real-time estimates
Filipino/Taglish/English  →    Bisaya, Ilocano, Kapampangan
5 care pathway templates  →    Full DOH clinical pathway library
```

**Key architectural decision:** The facility knowledge base is a separate Firestore collection. Adding Cebu = adding documents to a collection. No code changes. No redeployment. This is the scalability story.

### Business Scalability (B2B Angle)

**B2C (Current — Free):**
- Free PWA for patients
- Funded by: DOH grants, health NGOs (WHO PH, UNICEF), LGU health budgets
- PhilHealth integration grant eligibility

**B2B (Future — Revenue):**
- **LGU Health Dashboard:** Anonymized, aggregated community health data
  - Most common conditions by barangay
  - Facility load and wait times
  - Patient drop-off points in the care pathway
  - Referral completion rates
- **Pricing:** GovTech SaaS — ₱5,000–₱15,000/month per LGU
- **Stub for pitch:** One static dashboard screen showing sample LGU data (charts, maps). Do NOT build real-time.

---

## 13. OUT OF SCOPE

| Feature | Why Excluded | Future Consideration |
|---|---|---|
| Full user accounts / email login | Anonymous auth reduces friction for target user | Post-hackathon: optional upgrade path |
| National facility database | Metro Manila is sufficient for MVP demo | Expand via LGU data partnerships |
| Multi-language UI toggle | AI handles language via preference; UI stays English | v2: full i18n |
| Appointment booking | Requires facility system integration | Partner with DOH eHealth |
| Doctor matching/ratings | Ethically complex, legally risky | Community logger is the safe alternative |
| Wearables/health devices | Not relevant to target user's device reality | Future: BP monitor integration |
| Admin dashboard (functional) | Time constraint | Stub one static screen for pitch |
| Offline-first full sync | Service worker caching is sufficient for demo | Post-hackathon: full offline mode |
| Real-time crowdsourced wait times | Community logger stores data; aggregation is future | Post-hackathon: real-time layer |

---

## 14. MVP BUILD TIMELINE (23 Hours)

| Hour | Task | Dependencies |
|---|---|---|
| **H0–H1** | Project scaffold: Next.js 14 + Tailwind + TypeScript + next-pwa. Firebase project creation. API keys (Gemini, Maps, Firebase). Environment variables. | None |
| **H1–H2** | Firebase setup: Anonymous auth, Firestore collections, security rules. Facility seed data (10-15 Metro Manila facilities in JSON → Firestore). | H0–H1 |
| **H2–H3** | Design system implementation: Tailwind config (colors, fonts, spacing). Base components (Button, Card, Input, Badge). Layout shell (nav, footer, emergency banner). | H0–H1 |
| **H3–H5** | Landing page: Hero, problem section, how-it-works, CTA. Onboarding flow (3 screens → Firestore). | H2–H3 |
| **H5–H8** | **BEFORE phase (critical path):** Voice input component (Web Speech API push-to-talk). Gemini care navigation integration (system prompt, JSON mode). Care plan output card. Facility map embed. | H1–H2, H2–H3 |
| **H8–H10** | **BEFORE phase continued:** "Dapat Sabihin Mo" script generator. Alaala Ko history query + injection. Voice playback (TTS). | H5–H8 |
| **H10–H13** | **DURING phase:** Script pull-up card. Patient rights reminder. Voice encounter logger (push-to-talk → transcript → Gemini summarizer → "To Remember" cards). | H5–H8 |
| **H13–H15** | **DURING phase continued:** Document camera (capture → base64 → Gemini Vision → plain explanation card). | H10–H13 |
| **H15–H17** | **AFTER phase:** WhatsApp summary generator (one-tap share). Follow-up check-in (voice/tap → Gemini evaluator). Referral companion (auto-trigger new Before flow). Community experience logger form. | H10–H13 |
| **H17–H18** | **Alaala Ko:** Encounter history page. Voice-queryable history ("Kailan ako huling pumunta sa doktor?"). | H15–H17 |
| **H18–H19** | Emergency hotlines page. About page. LGU dashboard stub (one static screen with sample charts). | Any |
| **H19–H21** | **Polish:** Loading states (skeletons). Error handling. Mobile responsiveness testing. Animation (Framer Motion: page transitions, card entries, mic pulse). PWA testing (install prompt, offline fallback). | All features |
| **H21–H22** | **Deploy:** Firebase Hosting or Vercel. Production build test. Final bug fixes. | H19–H21 |
| **H22–H23** | **Pitch prep:** Demo script rehearsal (3+ full runs). Q&A preparation. Backup demo recording (screen capture in case of live demo failure). | H21–H22 |

### Critical Path
`Scaffold → Firebase → Before Phase → During Phase → After Phase → Polish → Deploy → Pitch`

The Before phase is the single most important feature. If time runs short, the During and After phases can be simplified (reduce to encounter logger + WhatsApp summary only).

---

## 15. DEMO SCRIPT (3 Minutes)

| Time | Content | Screen Shown |
|---|---|---|
| **0:00–0:25** | **Story:** "Last year, a nanay in Tondo woke at 4 AM to bring her son to the hospital. He'd been coughing for weeks. After a 2-hour commute and 5-hour wait, she was told: 'You need a referral from your barangay health center first.' Another day lost. By the time her son was seen, the cough was pneumonia. This is the cost of dreaming of healthcare in the Philippines." | Black screen or photo |
| **0:25–0:50** | **Problem:** "Philippine healthcare isn't absent — it's a maze. 5 entry points, no map. And every visit starts from zero — no one remembers your history." | Problem infographic |
| **0:50–1:15** | **Solution:** "[APP NAME] is your companion through every healthcare encounter. Before you go, while you're there, and after you leave. And it remembers — so you never start from zero again." | Landing page |
| **1:15–1:45** | **Demo BEFORE:** Press mic → speak "Lagnat ang anak ko ng 3 araw, nasa QC kami, may PhilHealth kami" → show care plan with facility + map + documents checklist. Show "Dapat Sabihin Mo" script. Tap "Read to me." | Before phase |
| **1:45–2:05** | **Demo DURING:** Show voice logger — tap mic, speak a sample doctor instruction → show "To Remember" cards. Show document camera — scan a sample prescription → show plain-language explanation. | During phase |
| **2:05–2:25** | **Demo AFTER:** Tap "Share with family" → show WhatsApp summary. Show follow-up check-in. Show Alaala Ko — "Next time, the app remembers." | After phase |
| **2:25–2:45** | **Google tech:** "Powered by Gemini 2.0 Flash for intelligent navigation, document understanding, and follow-up care. Firebase for persistent memory. Maps for facility finding. Five Google technologies — all load-bearing." | Tech architecture slide |
| **2:45–3:00** | **Close:** "No Filipino should lose a day's wages because the system didn't give them a map. [APP NAME] is that map — and it goes with you every step of the way." | Logo + tagline |

---

## 16. RISKS & MITIGATIONS

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | **Gemini hallucination** on PH healthcare specifics | 🔴 High | Constrain with structured prompts + facility data from Firestore. JSON mode forces structured output. Low temperature (0.3). Never let Gemini free-generate facility names — pull from verified seed data. |
| 2 | **Medical liability perception** — "what if it sends someone wrong?" | 🟡 Medium | Persistent disclaimer: "Navigation guide, not medical advice." Emergency detection keywords → auto-redirect to ER/911. Preemptively address in pitch: "We route, we don't diagnose." |
| 3 | **Web Speech API inconsistency** on Filipino/Taglish | 🟡 Medium | Fallback: `fil-PH` → `en-US`. Always show text input as alternative. Test on target devices (Samsung A-series, Realme) during build. |
| 4 | **Voice in noisy environments** (hospital waiting rooms) | 🟡 Medium | Text input always available. UI note: "In a quiet space? Try voice. Otherwise, type below." |
| 5 | **23-hour time pressure** — can't finish all features | 🟡 Medium | Priority order: Before > During (logger) > After (WhatsApp) > rest. If time runs short, During/After can be simplified to just the encounter logger + WhatsApp share. Demo script is designed to highlight Before phase most heavily. |
| 6 | **Firebase/Gemini API key exposure** in client-side code | 🟡 Medium | Gemini calls via Next.js API routes (server-side). Firebase security rules lock down user data. Rate limiting on API routes. |
| 7 | **Emergency keyword false positives** | 🟢 Low | Show interstitial modal with options: "Call 911" or "Continue to navigator." Don't block — inform and let user decide. |
| 8 | **Live demo failure** | 🟡 Medium | Record backup demo video. Have pre-generated care plan screenshot. Test on venue WiFi before pitch. |

### Emergency Keyword Detection (Client-side, pre-Gemini)
```typescript
const EMERGENCY_KEYWORDS = [
  'hindi makahinga', "can't breathe", 'difficulty breathing',
  'chest pain', 'masakit dibdib', 'nawalan ng malay', 'unconscious',
  'heavy bleeding', 'dumudugo', 'seizure', 'kombulsyon',
  'heart attack', 'stroke', 'suicidal', 'gusto ko na mamatay',
  'lason', 'poisoning', 'overdose', 'nahulog', 'aksidente'
];
```

---

## 17. SUCCESS METRICS

### Hackathon Success (What Winning Looks Like)

| Rubric Criterion | Target Score | How We Hit It |
|---|---|---|
| Mission & Impact (25%) | 9-10/10 | Clearest system problem in the track. Specific beneficiary (nanay with sick child). Quantifiable cost (lost wages, worsened illness). Credible impact path (LGU partnerships). |
| Feasibility & PH Fit (20%) | 9/10 | Voice-first for low-literacy users. PWA on budget phones. Anonymous auth (no friction). Metro Manila scoped (honest). Works on 3G. |
| Technical Execution (20%) | 8-9/10 | 6 Gemini integration points. Coherent before-during-after architecture. TypeScript + proper schema. JSON mode for reliability. |
| UX & Inclusivity (15%) | 9/10 | Voice I/O as core accessibility layer. Filipino/Taglish AI responses. 48px touch targets. Emergency always visible. Designed for nanays, not developers. |
| Google Tech (10%) | 10/10 | 5 Google technologies, all load-bearing. "Remove any one and it breaks." |
| Pitch & Demo (10%) | 9/10 | Devastating opening story. Live demo with voice input. Tangible output (care plan + map + script). Clean close. |

### Post-Hackathon Traction Metrics

| Metric | 30-Day Target | 90-Day Target |
|---|---|---|
| PWA installs | 500 | 5,000 |
| Care plans generated | 1,000 | 10,000 |
| Encounters logged (During phase) | 200 | 2,000 |
| Community experience ratings | 100 | 1,000 |
| LGU partnership conversations | 2 | 5 |
| DOH/NGO grant applications | 1 | 3 |
| Facility data coverage | Metro Manila (15) | Metro Manila (100+) + Cebu (20) |

### North Star Metric
**"Days saved"** — number of wasted healthcare visits prevented by correct routing. Estimated at 1 day saved per care plan used. If 10,000 care plans generated in 90 days = 10,000 workdays returned to Filipino families.

---

*End of BRD — [APP NAME] v1.0 MVP | InnOlympics 2026*
*Combine BRD_PART1.md + BRD_PART2.md for the complete document.*
