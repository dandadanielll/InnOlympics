import { GoogleGenerativeAI } from '@google/generative-ai';

// Server-side only — API key never exposed to client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const BASE_CONFIG = {
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 2048,
  },
};

// ─── Care Navigation (Before Phase) ─────────────────────────────────────────

export async function generateCarePlan(params: {
  rawInput: string;
  location: string;
  hasPhilHealth: string;
  languagePreference: string;
  facilitiesContext: string;
  alaalaSummary?: string;
}) {
  const model = genAI.getGenerativeModel({
    ...BASE_CONFIG,
    generationConfig: {
      ...BASE_CONFIG.generationConfig,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
You are Gabay, a Filipino healthcare navigation companion. You help patients find the right facility, prepare documents, and understand what to expect — so no Filipino wastes another day lost in the healthcare system.

STRICT RULES:
1. You are NOT a doctor. Never diagnose. You are a navigation companion.
2. For life-threatening symptoms (chest pain, difficulty breathing, uncontrolled bleeding, loss of consciousness, seizures), IMMEDIATELY return riskFlag: "red" and direct to ER / call 911.
3. Philippine healthcare levels:
   Level 1: Barangay Health Center (BHC) — free, minor/preventive
   Level 2: Rural Health Unit (RHU) / City Health Office — free, referrals
   Level 3: District/City Hospital — PhilHealth accepted
   Level 4: Medical Center / Tertiary — complex cases
4. ALWAYS combat the "OA" (over-acting) mindset. If symptoms warrant urgency, explicitly say: "Hindi ka OA. Tama lang na magpatingin ka."
5. Be specific about documents — what to bring AND where/how to get each one for free.
6. Respond with warmth. Use plain ${params.languagePreference} language. Never use medical jargon without explanation.

AVAILABLE FACILITIES:
${params.facilitiesContext}

USER CONTEXT:
- Location: ${params.location}
- PhilHealth: ${params.hasPhilHealth}
- Language: ${params.languagePreference}
${params.alaalaSummary ? `- Health history (Alaala Ko): ${params.alaalaSummary}` : ''}

USER CONCERN: ${params.rawInput}

Respond ONLY with valid JSON matching this exact structure:
{
  "facilityLevel": "string",
  "recommendedFacilities": [{"name": "string", "address": "string", "facilityId": "string", "why": "string"}],
  "documentsChecklist": [{"document": "string", "whereToGet": "string", "isFree": true}],
  "commuteOptions": "string",
  "queueEstimate": "string",
  "riskFlag": "green|yellow|red",
  "riskLevel": "string",
  "riskRationale": "string",
  "whatToExpect": "string",
  "summary": "string"
}
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// ─── Script Generator (Before Phase) ────────────────────────────────────────

export async function generateScript(params: {
  carePlanSummary: string;
  languagePreference: string;
  priorEncounters?: string;
}) {
  const model = genAI.getGenerativeModel({
    ...BASE_CONFIG,
    generationConfig: {
      ...BASE_CONFIG.generationConfig,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
Generate a clear, respectful script that a Filipino patient can read aloud to their doctor.
Transform vague symptom descriptions into clinically useful narratives.
Use ${params.languagePreference}. Address Filipino non-confrontational behavior — the script should feel empowering.

${params.priorEncounters ? `Health history to incorporate: ${params.priorEncounters}` : ''}

Care plan context: ${params.carePlanSummary}

Respond ONLY with valid JSON:
{
  "script": "string (the full script to read aloud)",
  "keyPointsToMention": ["string"],
  "questionsToAsk": ["string"]
}
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// ─── Encounter Log Summarizer (During Phase) ─────────────────────────────────

export async function summarizeEncounter(params: {
  rawTranscript: string;
  languagePreference: string;
}) {
  const model = genAI.getGenerativeModel({
    ...BASE_CONFIG,
    generationConfig: {
      ...BASE_CONFIG.generationConfig,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
Summarize a patient's voice recording of their doctor consultation. Extract the most important information in plain ${params.languagePreference}. This summary will be the patient's memory of the visit.

Raw transcript: ${params.rawTranscript}

Respond ONLY with valid JSON:
{
  "plainSummary": "string",
  "toRemember": ["string"],
  "prescriptions": [{"medication": "string", "dosage": "string", "instructions": "string"}],
  "followUpDate": "string or null",
  "referralMentioned": true,
  "referralDetails": "string or null"
}
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// ─── Document Vision (During Phase) ─────────────────────────────────────────

export async function analyzeDocument(params: {
  imageBase64: string;
  mimeType: string;
  languagePreference: string;
}) {
  const model = genAI.getGenerativeModel({
    ...BASE_CONFIG,
    generationConfig: {
      ...BASE_CONFIG.generationConfig,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
You are analyzing a medical document (prescription, lab request, referral letter, or discharge summary) photographed by a Filipino patient.
Explain it in plain ${params.languagePreference} as if explaining to a family member with no medical background.

Respond ONLY with valid JSON:
{
  "documentType": "prescription|lab_request|referral|discharge|other",
  "plainExplanation": "string",
  "medications": [{"name": "string", "purpose": "string", "howToTake": "string"}],
  "nextSteps": ["string"],
  "questionsToAsk": ["string"],
  "urgency": "routine|soon|urgent"
}
`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: params.mimeType,
        data: params.imageBase64,
      },
    },
  ]);

  return JSON.parse(result.response.text());
}

// ─── Follow-up Evaluator (After Phase) ──────────────────────────────────────

export async function evaluateFollowUp(params: {
  userResponse: string;
  encounterSummary: string;
  languagePreference: string;
}) {
  const model = genAI.getGenerativeModel({
    ...BASE_CONFIG,
    generationConfig: {
      ...BASE_CONFIG.generationConfig,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
A Filipino patient is checking in after a healthcare visit. Based on their response and original encounter data, determine if they are improving or need to return. Be warm, not alarming. Use ${params.languagePreference}.

If they are NOT improving, gently but clearly recommend returning. Combat the tendency to say "okay na" when it's not.

Check-in response: ${params.userResponse}
Original encounter: ${params.encounterSummary}

Respond ONLY with valid JSON:
{
  "status": "improving|stable|flagged",
  "message": "string",
  "recommendedAction": "string",
  "shouldReturn": true,
  "urgency": "none|low|high"
}
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// ─── WhatsApp Summary Generator (After Phase) ────────────────────────────────

export async function generateWhatsAppSummary(params: {
  encounterData: string;
  languagePreference: string;
}) {
  const model = genAI.getGenerativeModel({
    ...BASE_CONFIG,
    generationConfig: {
      ...BASE_CONFIG.generationConfig,
      maxOutputTokens: 1000,
      responseMimeType: 'text/plain',
    },
  });

  const prompt = `
Generate a plain-language visit summary formatted for WhatsApp sharing.
A Filipino patient wants to tell their family what happened at the doctor.
Use ${params.languagePreference}. Use emoji headers for readability. Keep it under 1000 characters.

Visit data: ${params.encounterData}

Output ONLY the WhatsApp message text. No JSON, no markdown, just plain text with emoji.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
