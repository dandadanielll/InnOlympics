import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DocumentScan {
  imageBase64?: string
  explanation: string
  scannedAt: string
}

export interface Encounter {
  id: string
  createdAt: string
  updatedAt: string
  symptoms: string
  carePlan: {
    facilityLevel: string
    recommendedFacility: string
    facilityAddress: string
    facilityCoordinates: { lat: number; lng: number }
    documentsChecklist: { item: string; howToGet: string }[]
    commuteEstimate: string
    queueEstimate: string
    riskFlag: boolean
    riskLevel: 'none' | 'moderate' | 'high'
    riskMessage: string
  } | null
  script: string
  encounterLog: { speaker: string; text: string }[]
  toRemember: string[]
  documentScans: DocumentScan[]
  patientRights?: { right: string; how: string }[]
  phase: 'before' | 'during' | 'after' | 'complete'
  facilityId: string
  referralTriggered: boolean
  followUpStatus: 'pending' | 'improving' | 'flagged'
  communityRating?: {
    waitTime: number
    doctorHelpful: boolean
    turnedAway: boolean
    rating: number
  }
}

export interface UserProfile {
  id: string
  city: string
  philHealth: 'yes' | 'no' | 'not-sure'
  language: 'filipino' | 'taglish' | 'english'
  onboardingComplete: boolean
}

interface GabAiStore {
  user: UserProfile | null
  encounters: Encounter[]
  currentEncounterId: string | null

  // User actions
  setUser: (user: UserProfile) => void
  clearUser: () => void

  // Encounter actions
  createEncounter: () => string
  updateEncounter: (id: string, data: Partial<Encounter>) => void
  deleteEncounter: (id: string) => void
  setCurrentEncounter: (id: string) => void

  // Selectors
  getCurrentEncounter: () => Encounter | null
  getLatestEncounter: () => Encounter | null
  getAllEncounters: () => Encounter[]
}

export const useGabAiStore = create<GabAiStore>()(
  persist(
    (set, get) => ({
      user: null,
      encounters: [],
      currentEncounterId: null,

      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      createEncounter: () => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        const encounter: Encounter = {
          id,
          createdAt: now,
          updatedAt: now,
          symptoms: '',
          carePlan: null,
          script: '',
          encounterLog: [],
          toRemember: [],
          documentScans: [],
          patientRights: [],
          phase: 'before',
          facilityId: '',
          referralTriggered: false,
          followUpStatus: 'pending',
        }
        set((state) => ({
          encounters: [...state.encounters, encounter],
          currentEncounterId: id,
        }))
        return id
      },

      updateEncounter: (id, data) => {
        const now = new Date().toISOString()
        set((state) => ({
          encounters: state.encounters.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: now } : e
          ),
        }))
      },

      deleteEncounter: (id) =>
        set((state) => ({
          encounters: state.encounters.filter((e) => e.id !== id),
          currentEncounterId:
            state.currentEncounterId === id ? null : state.currentEncounterId,
        })),

      setCurrentEncounter: (id) => set({ currentEncounterId: id }),

      getCurrentEncounter: () => {
        const { encounters, currentEncounterId } = get()
        return encounters.find((e) => e.id === currentEncounterId) ?? null
      },

      getLatestEncounter: () => {
        const { encounters } = get()
        return encounters.length > 0 ? encounters[encounters.length - 1] : null
      },

      getAllEncounters: () => get().encounters,
    }),
    {
      name: 'gabai-storage',
      version: 1,
    }
  )
)

/** Generate or retrieve a stable anonymous user ID from localStorage. */
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'ssr-placeholder'
  const existing = localStorage.getItem('gabai-user-id')
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem('gabai-user-id', id)
  return id
}
