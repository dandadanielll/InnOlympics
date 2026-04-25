// Emergency keyword detection — client-side, runs BEFORE sending to Gemini
// If detected, shows a red interstitial modal directing to 911/ER

const EMERGENCY_KEYWORDS = [
  // Breathing
  'hindi makahinga', "can't breathe", 'difficulty breathing', 'hirap huminga',
  'shortness of breath', 'di makahingang',
  // Chest
  'chest pain', 'masakit dibdib', 'sakit sa dibdib', 'heart attack', 'atake sa puso',
  // Consciousness
  'nawalan ng malay', 'unconscious', 'hindi gumigising', 'hindi nagigising',
  'not responding', 'di humihinga',
  // Bleeding
  'heavy bleeding', 'hindi humihinto ang dugo', 'sobrang dugo', 'malaking sugat',
  // Neurological
  'seizure', 'kombulsyon', 'stroke', 'hindi makagalaw', 'paralyzed',
  // Injury
  'nahulog', 'aksidente', 'nabangga', 'nalugmok',
  // Poisoning
  'lason', 'poisoning', 'overdose', 'nakain ng lason', 'nainom ng lason',
  // Mental health crisis
  'gusto ko na mamatay', 'suicidal', 'papatayin ko sarili ko',
  'wala na akong dahilan', 'want to end my life',
  // Pediatric emergencies
  'bata hindi humihinga', 'sanggol hindi gumagalaw', 'baby not breathing',
];

export function detectEmergency(input: string): boolean {
  const lower = input.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

export const EMERGENCY_HOTLINES = [
  { name: 'National Emergency', number: '911', description: 'Police, Fire, Medical' },
  { name: 'DOH Hotline', number: '1555', description: 'Department of Health' },
  { name: 'NCMH Crisis Line', number: '0917-899-8727', description: 'Mental Health Crisis' },
  { name: 'Hopeline', number: '2919', description: 'Suicide Prevention Hotline' },
  { name: 'Hopeline (Globe)', number: '0804-4673', description: 'Suicide Prevention' },
  { name: 'PhilHealth', number: '8441-7442', description: 'PhilHealth Inquiries' },
  { name: 'DSWD', number: '931-8101', description: 'Social Welfare' },
  { name: 'PNP', number: '117', description: 'Philippine National Police' },
  { name: 'BFP', number: '160', description: 'Bureau of Fire Protection' },
  { name: 'Red Cross', number: '143', description: 'Philippine Red Cross' },
];
