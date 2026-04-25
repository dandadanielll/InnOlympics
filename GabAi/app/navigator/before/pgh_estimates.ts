export interface RealityEstimate {
  id: string
  facilityId: string // 'h4' for PGH, 'h1' for San Lazaro, 'bhc' for generic BHC, 'all' for generic hospital
  service: string
  needTypes: string[] // 'consultation', 'diagnosis', 'service', 'medicine', 'emergency', 'all'
  bestTime: string
  estWait: string
  source: string
  redditQuote: string
  tip: string
}

export const REALITY_ESTIMATES: RealityEstimate[] = [
  // ═══════════════ PHILIPPINE GENERAL HOSPITAL (h4) ═══════════════
  {
    id: 'pgh-bluecard',
    facilityId: 'h4',
    service: 'Blue Card Registration',
    needTypes: ['all'],
    bestTime: '4:30 AM - 5:30 AM',
    estWait: '3-5 Hours',
    source: 'r/Philippines, r/HowToGetTherePH (Consensus)',
    redditQuote: '"Pila pa lang sa blue card napakahaba na. If di ka pupunta nang madaling araw, aabutin ka hanggang tanghali or hapon kakahintay lang ng card."',
    tip: 'This is required for all new patients. Bring a hand fan, umbrella, and water because the line can extend outside the building.'
  },
  {
    id: 'pgh-opd',
    facilityId: 'h4',
    service: 'General OPD Consultation',
    needTypes: ['consultation'],
    bestTime: '6:00 AM',
    estWait: '4-6 Hours',
    source: 'Reddit r/philippines Experiences',
    redditQuote: '"Kahit may appointment slip o referral na, expect na buong araw ang ubusin mo. Consultants often arrive around 9-10 AM pero by batch ang tawag."',
    tip: 'Bring food, water, and a powerbank. Do not confidently leave your designated waiting area as they call numbers unpredictably.'
  },
  {
    id: 'pgh-xray',
    facilityId: 'h4',
    service: 'X-Ray / Imaging Services',
    needTypes: ['diagnosis', 'service'],
    bestTime: '7:00 AM - 8:30 AM',
    estWait: '2-5 Hours',
    source: 'Reddit r/philippines Healthcare Threads',
    redditQuote: '"Ang imaging queue sa PGH ay madalas abutan ng cut-off. Kung malayo pa sa hapon ang number mo, balikan mo na lang sa susunod na araw."',
    tip: 'Ensure your request is signed by the OPD doctor. Wear easy-to-remove clothing (no metal zippers/jewelry) to speed up your turn.'
  },
  {
    id: 'pgh-payment',
    facilityId: 'h4',
    service: 'Cashier / Payment Window',
    needTypes: ['all', 'service', 'diagnosis'],
    bestTime: 'Before 10:00 AM or after 2:00 PM',
    estWait: '30 Mins - 1.5 Hours',
    source: 'Local Patient Guide (2024)',
    redditQuote: '"Mabilis na ang pila sa cashier kesa dati, basta handa na ang documents mo. Malasakit center coverage takes longer to verify than cash payments."',
    tip: 'Prepare exact change if paying in cash. Check if your specific service can be paid via the Malasakit window to avoid double-queuing.'
  },

  // ═══════════════ SAN LAZARO HOSPITAL (h1) ═══════════════
  {
    id: 'slh-triage',
    facilityId: 'h1',
    service: 'Infectious Disease Triage',
    needTypes: ['all', 'consultation'],
    bestTime: '7:00 AM - 8:00 AM',
    estWait: '1-3 Hours',
    source: 'Reddit Patient Commute Groups',
    redditQuote: '"Mabilis ang triage dito pero kailangan mo talagang sumunod sa protocol. Very strict sila sa masks and distancing especially for potential COVID/TB cases."',
    tip: 'Always wear a well-fitted face mask before entering. If you have a cough or fever, inform the triage staff immediately to be moved to the priority line.'
  },
  {
    id: 'slh-vax',
    facilityId: 'h1',
    service: 'Animal Bite / Vaccination',
    needTypes: ['service', 'emergency'],
    bestTime: 'Before 6:00 AM',
    estWait: '3-5 Hours',
    source: 'r/Philippines "Bitten by Dog" Threads',
    redditQuote: '"If for bite center ka, agahan mo talaga. By 8 AM sobrang haba na ng pila at minsan may limit lang yung binibigyan ng slots for the day."',
    tip: 'This is one of the most crowded sections. Bring your PhilHealth ID to speed up the registration and subsidy process.'
  },

  // ═══════════════ JOSE FABELLA (h2) ═══════════════
  {
    id: 'fab-ob',
    facilityId: 'h2',
    service: 'OB-GYN / Maternity Checkup',
    needTypes: ['consultation', 'service'],
    bestTime: '5:00 AM - 6:30 AM',
    estWait: '4-8 Hours',
    source: 'Moms of Manila FB Group / Reddit',
    redditQuote: '"Dito ipinanganak ang kalahati ng Maynila kaya expect mo na laging punuan. Magbaon ng pasensya at pagkain kasi matagal talaga ang hintayan sa OPD."',
    tip: 'Expect a very crowded environment. If you are in active labor, go straight to the Admitting Section or ER instead of the OPD queue.'
  },

  // ═══════════════ OSPITAL NG MAYNILA (h6) ═══════════════
  {
    id: 'osm-pink',
    facilityId: 'h6',
    service: 'Pink Card / City Resident Check',
    needTypes: ['all'],
    bestTime: '8:00 AM - 9:30 AM',
    estWait: '1-2 Hours',
    source: 'Local Community Knowledge',
    redditQuote: '"Dito sa OsMay, advantage pag Manila resident ka at may updated records. Mabilis lang naman basta kumpleto documents mo."',
    tip: 'Bring your original and a copy of your Manila Resident ID or Voter\'s ID to ensure you get the full city-subsidized benefits.'
  },

  // ═══════════════ BARANGAY HEALTH CENTERS (bhc) ═══════════════
  {
    id: 'bhc-gen',
    facilityId: 'bhc',
    service: 'General Consultation / Referral',
    needTypes: ['all', 'consultation'],
    bestTime: '7:30 AM (Opening)',
    estWait: '30 Mins - 2 Hours',
    source: 'Barangay Health Workers Feedback',
    redditQuote: '"Minsan mabilis, minsan matagal depende kung may vaccination program nung araw na yun. Pero definitely mas mabilis kesa sa malalaking ospital."',
    tip: 'Check with your Barangay Health Worker (BHW) the day before if there is a scheduled "Doctor\'s Day" to ensure a physician is present for your referral.'
  }
]
