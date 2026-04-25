export interface PGHEstimate {
  id: string
  service: string
  needTypes: string[] // 'consultation', 'diagnosis', 'medicine', 'emergency', 'all'
  bestTime: string
  estWait: string
  source: string
  redditQuote: string
  tip: string
}

export const PGH_ESTIMATES: PGHEstimate[] = [
  {
    id: 'bluecard',
    service: 'Blue Card Registration',
    needTypes: ['all'],
    bestTime: '4:30 AM - 5:30 AM',
    estWait: '3-5 Hours',
    source: 'r/Philippines, r/HowToGetTherePH (Consensus)',
    redditQuote: '"Pila pa lang sa blue card napakahaba na. If di ka pupunta nang madaling araw, aabutin ka hanggang tanghali or hapon kakahintay lang ng card."',
    tip: 'This is required for all new patients. Bring a hand fan, umbrella, and water because the line can extend outside the building.'
  },
  {
    id: 'opd',
    service: 'General OPD Consultation (Walk-In)',
    needTypes: ['consultation'],
    bestTime: '6:00 AM',
    estWait: '4-6 Hours',
    source: 'Reddit r/philippines Experiences',
    redditQuote: '"Kahit may appointment slip o referral na, expect na buong araw ang ubusin mo. Consultants often arrive around 9-10 AM pero by batch ang tawag."',
    tip: 'Bring food, water, and a powerbank. Do not confidently leave your designated waiting area as they call numbers unpredictably.'
  },
  {
    id: 'lab',
    service: 'Laboratory / Diagnostics',
    needTypes: ['diagnosis'],
    bestTime: '6:00 AM - 7:00 AM',
    estWait: '2-4 Hours',
    source: 'Reddit & Local Forums',
    redditQuote: '"Ang hirap at tagal sa lab lalo na sa charity lane. If you can afford it and need exact day results, there are diagnostic clinics around Taft."',
    tip: 'Clarify at the window immediately when results will be available. Complex diagnostics can take 3-7 days.'
  },
  {
    id: 'pharma',
    service: 'Pharmacy / Malasakit Processing',
    needTypes: ['medicine'],
    bestTime: 'Early morning or Afternoon',
    estWait: '2-4 Hours',
    source: 'Patient Support Commute Groups',
    redditQuote: '"Sa malasakit center ubos oras dyan mag asikaso ng guarantee letters at forms. Pero worth it kasi zero balance talaga the hospital bills and meds."',
    tip: 'Complete all signatures on your prescription and abstracts before lining up to avoid returning to the back of the queue.'
  },
  {
    id: 'er',
    service: 'Emergency Room Triage',
    needTypes: ['emergency'],
    bestTime: 'N/A (24/7)',
    estWait: 'Triage Basis (Immediate to 8 Hours)',
    source: 'r/philippines ER Threads',
    redditQuote: '"Unless bleeding, having a stroke, or dying, you will wait. They lack beds, so non-critical emergencies are assessed right on the wheelchairs or chairs."',
    tip: 'For severe but non-life-threatening ailments, District Hospitals are much faster. Only go here if you require tertiary/trauma capabilities.'
  }
]
