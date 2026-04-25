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

### 5.2 PHASE 1: BEFORE — "Handa Ka Na Ba?" (4-Step Preparation Companion)

The Before phase is implemented as a **4-step vertical wizard** with step indicators, scroll-to-next behavior, and progressive disclosure (locked steps blur until preceding step completes).

#### Step 1: Patient Intake (Situation Input)
| Requirement | Detail |
|---|---|
| Input method | Text input with autocomplete suggestions. Two paths: "I have a diagnosis" or "I need a specific service" |
| Suggestions (Diagnosis) | Hypertension, Tuberculosis, Diabetes, Dengue, Pneumonia, Asthma, UTI, Anemia, Thyroid Disorder, etc. (25 conditions) |
| Suggestions (Service) | Chest X-Ray, CBC, ECG, MRI, Ultrasound, Urinalysis, Cancer Treatment, Chemotherapy, Dialysis, Neurosurgery, etc. (27 services) |
| Processing | Text → POST `/api/classify` → Gemini AI classification (title, class/department, risk/care level) |
| AI Model | Gemini 2.0 Flash (with fallback to Gemini 1.5 Flash). JSON response mode. |
| Output | Classification card showing: short title, target department, recommended care level |
| Fallback | If all models fail, returns: `{ title: "General Checkup", class: "General Consultation", risk: "Local Health Center" }` |

**Classification Output Structure:**

| Field | Description |
|---|---|
| `title` | Short 2-3 word summary (e.g., "Cancer Screening") |
| `class` | Target department or service type (e.g., "Oncology Department") |
| `risk` | Recommended care level (e.g., "Tertiary Hospital", "Diagnostic Center") |

#### Step 2: Facility Routing (Map + Filtering Engine)
| Requirement | Detail |
|---|---|
| Location input | GPS geolocation, text search (autocomplete from facility names/addresses/districts), or click-to-pin on Leaflet map |
| Map provider | Leaflet (OpenStreetMap) — loaded via CDN, dynamic marker placement with custom icons and tooltips |
| Facility database | 47 verified Manila facilities in `facilities.ts`: 16 hospitals, 3 clinics, 28 BHCs. Sources: pgh.gov.ph, jrrmmc.gov.ph, cghmc.com.ph, usthospital.com.ph, manila.gov.ph, DOH records |
| Display | Split grid: interactive map (left) + scrollable facility cards (right), each showing name, address, distance, travel time, tags |

**Filtering Engine (3 Sort Modes + Secondary Filters):**

| Sort Mode | Behavior |
|---|---|
| **Near Me (≤1hr)** | Progressive distance: starts at 1hr travel (10km at 10km/hr avg Manila commute speed). If no facilities found, expands by 1hr increments up to 5hrs. Shows facilities within nearest viable radius. |
| **Free Services** | Hard-filters to government/free facilities: `isBHC \|\| isPhilHealthKonsulta \|\| hasMalasakitCenter \|\| tags includes 'DOH' or 'City-run'`. Sorted by distance. PGH, JRRMMC, San Lazaro, OMMC, GABMMC, TMC, all BHCs included. |
| **Best for My Need** | Relevance scoring (never removes facilities): exact service match (+5), direct/reverse match (+3), keyword token match (+1), tag/risk-level match (+1). Sorted by score, then distance. |

**Secondary Checkbox Filters (Hard Removal):**
PhilHealth Accredited, Walk-in Accepted, 24/7 Emergency, Outpatient (OPD), Inpatient/Admission, Laboratory/Diagnostics, Malasakit Center, Senior/PWD Lane, Accepts Referral.

**Facility Card Labels:**
`FREE (BHC)` → `GOV'T FREE` (Malasakit) → `GOV'T` (DOH/City-run) → `PHILHEALTH` → `PRIVATE`

#### Step 3: Travel & Gastos (Commute + Expense Planning)
| Requirement | Detail |
|---|---|
| Trigger | User selects a facility → "Compute Travel & Gastos" prompt overlay |
| Processing | POST `/api/commute` → Gemini generates transit plan with LTFRB fare matrices |
| Output | Receipt-style vertical stepper: origin → transport legs (Jeepney, Tricycle, Bus, Walk, LRT, MRT) → destination. Each leg shows mode icon, instruction, fare. |
| Route map | Second Leaflet map showing origin-to-destination with color-coded polyline segments per transport mode and labeled waypoints |
| Totals | Total travel time + total gastos (₱) displayed at bottom |

#### Step 4: Requirements Checklist (Document Preparation)
| Requirement | Detail |
|---|---|
| General docs | Valid ID (primary IDs listed), PhilHealth ID or MDR, Certificate of Indigency |
| PGH-specific | Shown only when selected facility is PGH (id: `h4` or name includes "Philippine General"). Includes: PGH Blue Card, Valid Referral Form, Clinical Abstract/Medical Certificate, Printed Appointment Slip (OCRA system) |
| UX | Interactive checkboxes for each document. Cards with icons. PGH card has special accent styling. |

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

### Route Structure (Next.js App Router) — As Implemented

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout + sidebar navigation
├── globals.css                 # UI UX ProMax design system (60/30/10 palette)
├── onboarding/
│   └── page.tsx                # Onboarding flow
├── navigator/
│   ├── layout.tsx              # Navigator layout shell
│   ├── page.tsx                # Phase router (redirects)
│   ├── before/
│   │   ├── page.tsx            # 4-step Before wizard (900+ lines)
│   │   └── facilities.ts      # 47 verified Manila facilities + haversine distance
│   ├── during/
│   │   └── page.tsx            # During phase
│   └── after/
│       └── page.tsx            # After phase
├── about/
│   └── page.tsx                # About page
├── api/
│   ├── classify/
│   │   └── route.ts            # Gemini AI classification (diagnosis/service → department + care level)
│   └── commute/
│       └── route.ts            # Gemini AI commute planner (origin/dest → transit legs + fares)
└── .env.local                  # GEMINI_API_KEY, NEXT_PUBLIC_MAPS_API_KEY
```

### Key Implementation Files

| File | Purpose | Lines |
|---|---|---|
| `before/page.tsx` | 4-step wizard: Patient Intake → Facility Routing (map + filters) → Travel & Gastos → Document Checklist | ~900 |
| `before/facilities.ts` | 47 Manila facilities (16 hospitals, 3 clinics, 28 BHCs) with 27 filterable fields each. Includes `haversineKm()` distance calculation. | ~115 |
| `api/classify/route.ts` | Gemini classification with model fallback chain (`gemini-2.0-flash` → `gemini-1.5-flash`). Returns JSON: `{title, class, risk}` | ~95 |
| `api/commute/route.ts` | Gemini commute planner using LTFRB fare matrices. Returns `{totalTime, totalFare, legs[]}` | ~60 |

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

### Facility Data Model (As Implemented in `before/facilities.ts`)
```typescript
interface Facility {
  id: string                          // e.g., 'h4' (hospitals), 'c1' (clinics), 'b1' (BHCs)
  name: string                        // e.g., 'Philippine General Hospital'
  address: string
  district: string                    // 'District I' through 'District VI'
  lat: number
  lng: number
  type: 'Hospital' | 'BHC' | 'Clinic'
  services: string[]                  // Verified from official hospital websites
  tags: string[]                      // e.g., ['DOH','Tertiary','Level III']
  // Filter fields (27 total)
  isBHC: boolean
  isPhilHealthKonsulta: boolean
  isPhilHealthAccredited: boolean
  acceptsWalkIn: boolean
  acceptsReferral: boolean
  hasEmergency: boolean
  inpatient: boolean
  outpatient: boolean
  hasLaboratory: boolean
  hasDiagnostics: boolean
  hasMalasakitCenter: boolean         // Key flag for "Free" filter
  hasSeniorLane: boolean
  hours: string
  is24Hours: boolean
  typicalWaitLevel: 'low' | 'medium' | 'high'
}
```

**Facility Database Summary (47 facilities, verified sources):**

| Category | Count | Tags | Free Filter |
|---|---|---|---|
| DOH-retained hospitals | 5 (SLH, Fabella, JRRMMC, PGH, TMC) | `DOH` | ✅ via DOH/Malasakit |
| City-run hospitals | 5 (OMMC, GABMMC, Sta. Ana, JASGM, OS) | `City-run` | ✅ via City-run/Malasakit |
| Private hospitals | 6 (Manila Doctors, Chinese General, UST, MMC, MJH, MCU-FDT) | `Private` | ❌ |
| Diagnostic clinics | 2 (Hi-Precision, QualiMed) | `Private` | ❌ |
| PhilHealth Konsulta | 1 (Quiapo) | `PhilHealth` | ✅ via Konsulta |
| Barangay Health Centers | 28 (Districts I–VI + City Health Offices) | `BHC` | ✅ via BHC |

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

### 8.1 Classification Prompt (Before Phase — Step 1)

**API Route:** `POST /api/classify`

**Model Fallback Chain:** `gemini-2.0-flash` → `gemini-1.5-flash`

```
The user stated their diagnosis/condition is: "{query}".
(OR: The user needs a specific healthcare service/procedure: "{query}".)

Classify the necessary healthcare facility type.

Return a JSON object STRICTLY with the following structure:
{
  "title": "A short 2-3 word summary of the action",
  "class": "The Target Department or Service Type",
  "risk": "The Recommended Care Level (e.g., Primary Care, Diagnostic Center, General Hospital)"
}
Do not include markdown blocks, just the raw JSON.
```

**Features:**
- `responseMimeType: "application/json"` for guaranteed JSON output
- Automatic fallback to next model if API error or blocked response
- Strips markdown code fences if present in response
- Graceful fallback: `{ title: "General Checkup", class: "General Consultation", risk: "Local Health Center" }`

### 8.1b Commute Planning Prompt (Before Phase — Step 3)

**API Route:** `POST /api/commute`

```
Generate a commute plan from ({originLat}, {originLng}) to {facilityName}
at ({destinationLat}, {destinationLng}) in Manila.

Use realistic Manila public transit: Jeepney, Tricycle, Bus, Walk, LRT, MRT.
Use official LTFRB fare matrices.

Return JSON:
{
  "totalTime": "estimated travel time string",
  "totalFare": number,
  "legs": [
    { "mode": "Jeepney|Tricycle|Bus|Walk|LRT|MRT", "instruction": "string", "fare": number }
  ]
}
```

**UI Integration:** Receipt-style vertical stepper with color-coded transport icons, route map with polyline segments per leg, and total gastos display.

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
--primary: #7e2625;            /* Deep red — hero elements, primary CTAs, critical alerts */
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

#### Navigator — Before Phase (4-Step Wizard)
```
┌──────────────────────────────────────────────────┐
│ ← Back    BEFORE - Handa Ka Na Ba?    [1][2][3][4]│
├──────────────────────────────────────────────────┤
│ STEP 1: PATIENT INTAKE                            │
│ ┌──────────────────────────────────────────┐      │
│ │ [I have a diagnosis] [I need a service]  │      │
│ │ ┌─────────────────────────────────┐      │      │
│ │ │ 🔍  Enter condition/service...  │      │      │
│ │ └─────────────────────────────────┘      │      │
│ │ Suggestions: [Hypertension] [Diabetes]  │      │
│ │ [Pneumonia] [UTI] [MRI] [ECG]...        │      │
│ │                                         │      │
│ │ ┌─── AI CLASSIFICATION ───┐             │      │
│ │ │ Title: Cancer Screening  │             │      │
│ │ │ Dept: Oncology            │             │      │
│ │ │ Level: Tertiary Hospital  │             │      │
│ │ └──────────────────────────┘             │      │
│ └──────────────────────────────────────────┘      │
│                                                    │
│ STEP 2: FACILITY ROUTING                           │
│ ┌─────────────────┬──────────────────────┐        │
│ │  [📍 MAP]       │  Location Bar:       │        │
│ │                 │  [📍 GPS] or search  │        │
│ │  • markers      │                      │        │
│ │  • click-to-pin │  [Near Me] [Free]    │        │
│ │  • tooltips     │  [Best Match]        │        │
│ │                 │                      │        │
│ │                 │  ☐ PhilHealth ☐ ER   │        │
│ │                 │  ☐ Walk-in ☐ Lab     │        │
│ ├─────────────────┤                      │        │
│ │ Facility Cards: │  PGH · 3.2km        │        │
│ │ [GOV'T FREE]    │  • GOV'T FREE       │        │
│ │ JRRMMC · 2.1km  │  [Select] →         │        │
│ │ • DOH Tertiary  │                      │        │
│ └─────────────────┴──────────────────────┘        │
│                                                    │
│ STEP 3: TRAVEL & GASTOS                            │
│ ┌──────────────────────────────────────────┐      │
│ │ 📍 Your Location                        │      │
│ │    ↓ 🚐 Jeepney · Ride along Taft · ₱13│      │
│ │    ↓ 🚶 Walk · 5 min                   │      │
│ │ 🏥 Philippine General Hospital          │      │
│ │ ─────────────────────────────            │      │
│ │ ⏱ ~35 min    💰 ₱13 total              │      │
│ └──────────────────────────────────────────┘      │
│                                                    │
│ STEP 4: REQUIREMENTS CHECKLIST                     │
│ ┌──────────────────────────────────────────┐      │
│ │ ☐ Valid ID (government-issued)           │      │
│ │ ☐ PhilHealth ID or MDR                   │      │
│ │ ☐ Certificate of Indigency               │      │
│ │                                          │      │
│ │ ┌── 🏥 PGH SPECIFIC ──────────────┐    │      │
│ │ │ ☐ PGH Blue Card                  │    │      │
│ │ │ ☐ Valid Referral Form             │    │      │
│ │ │ ☐ Clinical Abstract               │    │      │
│ │ │ ☐ Printed Appointment Slip (OCRA) │    │      │
│ │ └──────────────────────────────────┘    │      │
│ └──────────────────────────────────────────┘      │
├──────────────────────────────────────────────────┤
│ 🚨 Emergency? Call 911                            │
└──────────────────────────────────────────────────┘
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
  "theme_color": "#7e2625",
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
