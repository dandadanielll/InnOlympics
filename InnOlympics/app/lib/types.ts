import type { Timestamp } from 'firebase/firestore';

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  location: string;
  hasPhilHealth: 'yes' | 'no' | 'unsure';
  languagePreference: 'filipino' | 'taglish' | 'english';
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}

// ─── Encounter ───────────────────────────────────────────────────────────────

export type EncounterPhase = 'before' | 'during' | 'after' | 'complete';
export type RiskFlag = 'green' | 'yellow' | 'red';
export type FollowUpStatus = 'pending' | 'improving' | 'flagged' | null;

export interface RecommendedFacility {
  name: string;
  address: string;
  facilityId: string;
  why: string;
}

export interface DocumentChecklistItem {
  document: string;
  whereToGet: string;
  isFree: boolean;
}

export interface CarePlan {
  facilityLevel: string;
  recommendedFacilities: RecommendedFacility[];
  documentsChecklist: DocumentChecklistItem[];
  commuteOptions: string;
  queueEstimate: string;
  riskFlag: RiskFlag;
  riskLevel: string;
  riskRationale: string;
  whatToExpect: string;
  summary: string;
}

export interface EncounterLogEntry {
  timestamp: Timestamp;
  rawTranscript: string;
  summary: string;
}

export interface Prescription {
  medication: string;
  dosage: string;
  instructions: string;
}

export interface DocumentScan {
  imageBase64: string;
  documentType: string;
  explanation: string;
  nextSteps: string[];
  questionsToAsk: string[];
}

export interface Encounter {
  phase: EncounterPhase;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Before phase
  rawInput: string;
  carePlan: CarePlan | null;
  script: string;

  // During phase
  encounterLog: EncounterLogEntry[];
  toRemember: string[];
  prescriptions: Prescription[];
  documentScans: DocumentScan[];

  // After phase
  followUpStatus: FollowUpStatus;
  followUpResponse: string;
  referralTriggered: boolean;
  referralFromEncounterId: string | null;
  whatsappSummary: string;

  // Reference
  facilityId: string;
}

// ─── Facility ─────────────────────────────────────────────────────────────────

export type FacilityType =
  | 'bhc'
  | 'rhu'
  | 'district_hospital'
  | 'city_hospital'
  | 'provincial_hospital'
  | 'medical_center'
  | 'private';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  city: string;
  region: 'metro_manila';
  coordinates: { lat: number; lng: number };
  operatingHours: string;
  peakHours: string;
  philHealthAccredited: boolean;
  servicesOffered: string[];
  averageWaitMinutes: number | null;
  contactNumber: string;
}

// ─── Community ───────────────────────────────────────────────────────────────

export interface CommunityExperience {
  facilityId: string;
  waitTimeMinutes: number;
  doctorHelpful: boolean;
  turnedAway: boolean;
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt: Timestamp;
}

// ─── Gemini API Response Types ───────────────────────────────────────────────

export interface CarePlanResponse extends CarePlan {}

export interface ScriptResponse {
  script: string;
  keyPointsToMention: string[];
  questionsToAsk: string[];
}

export interface EncounterSummaryResponse {
  plainSummary: string;
  toRemember: string[];
  prescriptions: Prescription[];
  followUpDate: string | null;
  referralMentioned: boolean;
  referralDetails: string | null;
}

export interface DocumentVisionResponse {
  documentType: string;
  plainExplanation: string;
  medications: Array<{ name: string; purpose: string; howToTake: string }>;
  nextSteps: string[];
  questionsToAsk: string[];
  urgency: 'routine' | 'soon' | 'urgent';
}

export interface FollowUpResponse {
  status: 'improving' | 'stable' | 'flagged';
  message: string;
  recommendedAction: string;
  shouldReturn: boolean;
  urgency: 'none' | 'low' | 'high';
}
