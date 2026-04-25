export interface ConditionData {
  label: string
  tags: string[]
  department: string
  careLevel: string
  searchAliases: string[]
}

export const CONDITIONS: ConditionData[] = [
  // Infectious / Communicable
  { label: 'Tuberculosis (PTB)', tags: ['Infectious', 'Respiratory'], department: 'Infectious Disease', careLevel: 'Primary/BHC', searchAliases: ['tb', 'ubo na may dugo', 'tisis'] },
  { label: 'Dengue', tags: ['Infectious', 'Endemic'], department: 'Internal Medicine', careLevel: 'District Hospital', searchAliases: ['lagnat', 'dengue fever'] },
  { label: 'Typhoid Fever', tags: ['Infectious', 'Gastrointestinal'], department: 'Internal Medicine', careLevel: 'District Hospital', searchAliases: ['typhoid'] },
  { label: 'Leptospirosis', tags: ['Infectious', 'Endemic'], department: 'Infectious Disease', careLevel: 'District/Tertiary Hospital', searchAliases: ['baha', 'ihi ng daga'] },
  { label: 'Hepatitis A/B/C', tags: ['Infectious', 'Liver'], department: 'Gastroenterology', careLevel: 'Primary/Secondary Hospital', searchAliases: ['hepa', 'paninilaw'] },
  { label: 'HIV/AIDS', tags: ['Infectious', 'Immunology'], department: 'Infectious Disease', careLevel: 'Specialist/Tertiary Hospital', searchAliases: ['hiv', 'aids', 'immune'] },
  { label: 'Measles', tags: ['Infectious', 'Pediatric'], department: 'Pediatrics', careLevel: 'Primary/BHC', searchAliases: ['tigdas', 'rashes'] },
  { label: 'Chickenpox', tags: ['Infectious'], department: 'Family Medicine', careLevel: 'Primary/BHC', searchAliases: ['bulutong'] },
  { label: 'Rabies Exposure', tags: ['Infectious', 'Emergency'], department: 'Animal Bite Center', careLevel: 'BHC/District Hospital', searchAliases: ['kagat ng aso', 'kagat ng pusa'] },
  { label: 'Cholera', tags: ['Infectious', 'Gastrointestinal'], department: 'Infectious Disease', careLevel: 'District Hospital', searchAliases: ['cholera', 'nagtatae na tubig'] },
  { label: 'Schistosomiasis', tags: ['Infectious', 'Parasitic'], department: 'Internal Medicine', careLevel: 'District Hospital', searchAliases: ['snail fever'] },
  { label: 'Malaria', tags: ['Infectious', 'Endemic'], department: 'Internal Medicine', careLevel: 'District Hospital', searchAliases: ['malaria', 'lamok'] },
  { label: 'Meningitis', tags: ['Infectious', 'Neurological', 'Emergency'], department: 'Neurology / ICU', careLevel: 'Tertiary Hospital', searchAliases: ['meningitis'] },
  { label: 'COVID-19', tags: ['Infectious', 'Respiratory'], department: 'Internal Medicine', careLevel: 'District Hospital', searchAliases: ['covid', 'corona'] },
  { label: 'Pneumonia', tags: ['Infectious', 'Respiratory'], department: 'Pulmonology', careLevel: 'Primary/Secondary Hospital', searchAliases: ['pulmonya', 'matinding ubo'] },
  { label: 'Bronchitis', tags: ['Infectious', 'Respiratory'], department: 'Pulmonology', careLevel: 'Primary/BHC', searchAliases: ['bronchitis'] },
  { label: 'URTI (Upper Respiratory)', tags: ['Infectious', 'Respiratory'], department: 'Family Medicine', careLevel: 'Primary/BHC', searchAliases: ['sipon', 'ubo', 'sore throat'] },
  { label: 'AGE/LBM (Gastroenteritis)', tags: ['Infectious', 'Gastrointestinal'], department: 'Internal Medicine', careLevel: 'BHC/District Hospital', searchAliases: ['lbm', 'pagsusuka', 'diarrhea', 'nagtatae'] },
  { label: 'UTI (Urinary Tract Infection)', tags: ['Infectious', 'Renal'], department: 'Internal Medicine', careLevel: 'Primary/BHC', searchAliases: ['uti', 'balisawsaw', 'masakit umihi'] },
  { label: 'SSTI (Skin Infection)', tags: ['Infectious', 'Dermatology'], department: 'Dermatology', careLevel: 'Primary/BHC', searchAliases: ['maga', 'pigsa', 'sugat', 'impeksyon'] },
  { label: 'Conjunctivitis (Sore Eyes)', tags: ['Infectious', 'Ophthalmology'], department: 'Ophthalmology', careLevel: 'Primary/BHC', searchAliases: ['sore eyes', 'namumula mata'] },
  { label: 'Scabies', tags: ['Infectious', 'Dermatology', 'Parasitic'], department: 'Dermatology', careLevel: 'Primary/BHC', searchAliases: ['galis', 'kati-kati'] },
  { label: 'Ringworm', tags: ['Infectious', 'Dermatology', 'Fungal'], department: 'Dermatology', careLevel: 'Primary/BHC', searchAliases: ['buni', 'an-an'] },

  // Non-Communicable (NCD)
  { label: 'Hypertension', tags: ['NCD', 'Cardiovascular'], department: 'Cardiology', careLevel: 'Primary/BHC', searchAliases: ['high blood', 'bp'] },
  { label: 'Diabetes Type 1 & 2', tags: ['NCD', 'Endocrine'], department: 'Endocrinology', careLevel: 'Primary/Secondary', searchAliases: ['diabetes', 'mataas ang sugar', 'dyabetis'] },
  { label: 'Chronic Kidney Disease', tags: ['NCD', 'Renal'], department: 'Nephrology', careLevel: 'Specialist/Tertiary', searchAliases: ['sakit sa bato', 'ckd'] },
  { label: 'End-Stage Renal Disease', tags: ['NCD', 'Renal', 'Critical'], department: 'Nephrology/Dialysis', careLevel: 'Tertiary Hospital', searchAliases: ['esrd', 'dialysis needed'] },
  { label: 'Heart Failure', tags: ['NCD', 'Cardiovascular', 'Critical'], department: 'Cardiology', careLevel: 'Tertiary Hospital', searchAliases: ['heart failure', 'hirap huminga'] },
  { label: 'Coronary Artery Disease', tags: ['NCD', 'Cardiovascular'], department: 'Cardiology', careLevel: 'Tertiary Hospital', searchAliases: ['cad', 'bara sa puso'] },
  { label: 'Arrhythmia', tags: ['NCD', 'Cardiovascular'], department: 'Cardiology', careLevel: 'Specialist/Tertiary', searchAliases: ['palpitations', 'irregular heartbeat'] },
  { label: 'Stroke/CVA', tags: ['NCD', 'Neurological', 'Emergency'], department: 'Neurology', careLevel: 'Tertiary Hospital', searchAliases: ['stroke', 'cva'] },
  { label: 'Asthma', tags: ['NCD', 'Respiratory'], department: 'Pulmonology', careLevel: 'Primary/Secondary', searchAliases: ['hika', 'asthma'] },
  { label: 'COPD', tags: ['NCD', 'Respiratory'], department: 'Pulmonology', careLevel: 'Secondary/Tertiary', searchAliases: ['copd', 'emphysema'] },
  { label: 'Anemia', tags: ['NCD', 'Blood'], department: 'Hematology', careLevel: 'Primary/BHC', searchAliases: ['anemia', 'kulang sa dugo'] },
  { label: 'Thyroid disorders', tags: ['NCD', 'Endocrine'], department: 'Endocrinology', careLevel: 'Specialist/Tertiary', searchAliases: ['goiter', 'hyperthyroidism', 'biyok'] },
  { label: 'Osteoarthritis', tags: ['NCD', 'Musculoskeletal'], department: 'Orthopedics / Rheumatology', careLevel: 'Primary/Secondary', searchAliases: ['osteoarthritis'] },
  { label: 'Rheumatoid Arthritis', tags: ['NCD', 'Autoimmune'], department: 'Rheumatology', careLevel: 'Specialist/Tertiary', searchAliases: ['rheumatoid'] },
  { label: 'Gout / Rayuma', tags: ['NCD', 'Musculoskeletal'], department: 'Rheumatology', careLevel: 'Primary/BHC', searchAliases: ['rayuma', 'high uric acid', 'masakit ang joints'] },
  { label: 'Osteoporosis', tags: ['NCD', 'Musculoskeletal'], department: 'Orthopedics', careLevel: 'Secondary Hospital', searchAliases: ['marupok ang buto'] },
  { label: 'Epilepsy / Seizure', tags: ['NCD', 'Neurological'], department: 'Neurology', careLevel: 'Specialist/Tertiary', searchAliases: ['epilepsy', 'seizure', 'kombulsyon'] },
  { label: 'Parkinson\'s', tags: ['NCD', 'Neurological'], department: 'Neurology', careLevel: 'Specialist/Tertiary', searchAliases: ['parkinsons', 'panginginig'] },
  { label: 'Dementia / Alzheimer\'s', tags: ['NCD', 'Neurological'], department: 'Neurology / Psychiatry', careLevel: 'Specialist/Tertiary', searchAliases: ['dementia', 'alzheimers', 'ulyanin'] },
  { label: 'Peptic Ulcer / GERD', tags: ['NCD', 'Gastrointestinal'], department: 'Gastroenterology', careLevel: 'Primary/Secondary', searchAliases: ['acid reflux', 'hyperacidity', 'ulcer', 'gerd', 'sikmura'] },
  { label: 'Liver Cirrhosis', tags: ['NCD', 'Liver'], department: 'Gastroenterology', careLevel: 'Tertiary Hospital', searchAliases: ['cirrhosis', 'sakit sa atay'] },
  { label: 'Fatty Liver (NAFLD)', tags: ['NCD', 'Liver'], department: 'Gastroenterology', careLevel: 'Secondary Hospital', searchAliases: ['fatty liver'] },
  { label: 'Gallstones', tags: ['NCD', 'Gastrointestinal'], department: 'Surgery', careLevel: 'Secondary/Tertiary Hospital', searchAliases: ['gallstones', 'bato sa apdo'] },
  { label: 'Appendicitis', tags: ['NCD', 'Gastrointestinal', 'Emergency'], department: 'Surgery', careLevel: 'Secondary/Tertiary Hospital', searchAliases: ['appendicitis'] },
  { label: 'Hernia', tags: ['NCD', 'Musculoskeletal'], department: 'Surgery', careLevel: 'Secondary Hospital', searchAliases: ['hernia', 'luslos'] },
  { label: 'Hemorrhoids / Almuranas', tags: ['NCD', 'Gastrointestinal'], department: 'Surgery', careLevel: 'Primary/Secondary Hospital', searchAliases: ['almuranas', 'hemorrhoids'] },
  { label: 'Kidney Stones', tags: ['NCD', 'Renal'], department: 'Urology', careLevel: 'Secondary Hospital', searchAliases: ['bato sa bato', 'kidney stone'] },
  { label: 'Prostate Enlargement', tags: ['NCD', 'Urology'], department: 'Urology', careLevel: 'Secondary Hospital', searchAliases: ['bph', 'prostate', 'hirap umihi'] },
  { label: 'Ovarian Cyst', tags: ['NCD', 'Gynecological'], department: 'OB-GYN', careLevel: 'Secondary Hospital', searchAliases: ['cyst', 'ovary'] },
  { label: 'PCOS', tags: ['NCD', 'Endocrine', 'Gynecological'], department: 'OB-GYN', careLevel: 'Secondary Hospital', searchAliases: ['pcos', 'irregular mens'] },
  { label: 'Fibroids / Myoma', tags: ['NCD', 'Gynecological'], department: 'OB-GYN', careLevel: 'Secondary Hospital', searchAliases: ['myoma', 'fibroids'] },
  { label: 'Endometriosis', tags: ['NCD', 'Gynecological'], department: 'OB-GYN', careLevel: 'Specialist/Tertiary', searchAliases: ['endometriosis', 'matinding dysmenorrhea'] },
  
  // Cancer
  { label: 'Cervical Cancer', tags: ['Cancer', 'Gynecological'], department: 'Oncology', careLevel: 'Tertiary Hospital', searchAliases: ['cervical cancer'] },
  { label: 'Breast Cancer', tags: ['Cancer'], department: 'Oncology', careLevel: 'Tertiary Hospital', searchAliases: ['bukol sa suso', 'breast cancer'] },
  { label: 'Prostate Cancer', tags: ['Cancer'], department: 'Oncology', careLevel: 'Tertiary Hospital', searchAliases: ['prostate cancer'] },
  { label: 'Lung Cancer', tags: ['Cancer', 'Respiratory'], department: 'Oncology', careLevel: 'Tertiary Hospital', searchAliases: ['lung cancer'] },
  { label: 'Colorectal Cancer', tags: ['Cancer', 'Gastrointestinal'], department: 'Oncology', careLevel: 'Tertiary Hospital', searchAliases: ['colon cancer', 'colorectal'] },
  { label: 'Liver Cancer', tags: ['Cancer', 'Liver'], department: 'Oncology', careLevel: 'Tertiary Hospital', searchAliases: ['liver cancer'] },
  { label: 'Leukemia', tags: ['Cancer', 'Blood'], department: 'Oncology / Hematology', careLevel: 'Tertiary Hospital', searchAliases: ['leukemia', 'dugo cancer'] },
  { label: 'Lymphoma', tags: ['Cancer', 'Immunology'], department: 'Oncology', careLevel: 'Tertiary Hospital', searchAliases: ['lymphoma'] },
  { label: 'Skin Cancer', tags: ['Cancer', 'Dermatology'], department: 'Oncology / Dermatology', careLevel: 'Tertiary Hospital', searchAliases: ['skin cancer'] },

  // Mental Health
  { label: 'Depression', tags: ['Mental Health'], department: 'Psychiatry', careLevel: 'Specialist', searchAliases: ['depression', 'malungkot', 'depress'] },
  { label: 'Anxiety', tags: ['Mental Health'], department: 'Psychiatry', careLevel: 'Specialist', searchAliases: ['anxiety', 'kaba', 'panic attack'] },
  { label: 'Schizophrenia', tags: ['Mental Health'], department: 'Psychiatry', careLevel: 'Specialist/Tertiary', searchAliases: ['schizophrenia'] },
  { label: 'Bipolar Disorder', tags: ['Mental Health'], department: 'Psychiatry', careLevel: 'Specialist/Tertiary', searchAliases: ['bipolar'] },
  { label: 'OCD', tags: ['Mental Health'], department: 'Psychiatry', careLevel: 'Specialist', searchAliases: ['ocd'] },
  { label: 'ADHD', tags: ['Mental Health', 'Neurodevelopmental'], department: 'Psychiatry / Pediatrics', careLevel: 'Specialist', searchAliases: ['adhd'] },
  { label: 'Autism Spectrum', tags: ['Mental Health', 'Neurodevelopmental'], department: 'Psychiatry / Pediatrics', careLevel: 'Specialist', searchAliases: ['autism', 'asd'] },
  { label: 'Substance Use Disorder', tags: ['Mental Health', 'Addiction'], department: 'Rehabilitation / Psychiatry', careLevel: 'Specialist/Tertiary', searchAliases: ['addiction', 'drugs', 'droga'] },

  // Women's / Reproductive
  { label: 'Prenatal Care', tags: ['Women\'s Health', 'Maternity'], department: 'Family Medicine / OB-GYN', careLevel: 'Primary/BHC', searchAliases: ['buntis', 'prenatal', 'checkup buntis'] },
  { label: 'Pregnancy Complications', tags: ['Women\'s Health', 'Emergency', 'Maternity'], department: 'OB-GYN', careLevel: 'Secondary/Tertiary Hospital', searchAliases: ['dugo buntis', 'preeclampsia'] },
  { label: 'Postpartum Care', tags: ['Women\'s Health', 'Maternity'], department: 'OB-GYN', careLevel: 'Primary/Secondary', searchAliases: ['postpartum', 'bagong panganak'] },
  { label: 'Miscarriage', tags: ['Women\'s Health', 'Emergency', 'Gynecological'], department: 'OB-GYN', careLevel: 'Secondary/Tertiary Hospital', searchAliases: ['nakunan', 'miscarriage'] },
  { label: 'Family Planning', tags: ['Women\'s Health', 'Reproductive'], department: 'Family Medicine', careLevel: 'Primary/BHC', searchAliases: ['contraceptive', 'pills', 'iud', 'family planning'] },
  { label: 'Dysmenorrhea', tags: ['Women\'s Health', 'Gynecological'], department: 'OB-GYN', careLevel: 'Primary/BHC', searchAliases: ['masakit puson', 'mens', 'dysmenorrhea'] },
  { label: 'Menopause', tags: ['Women\'s Health', 'Gynecological'], department: 'OB-GYN', careLevel: 'Primary/Secondary', searchAliases: ['menopause'] },

  // Pediatric
  { label: 'Malnutrition / Stunting', tags: ['Pediatric', 'Nutrition'], department: 'Pediatrics', careLevel: 'Primary/BHC', searchAliases: ['payat bata', 'malnutrition'] },
  { label: 'Febrile Convulsion', tags: ['Pediatric', 'Emergency'], department: 'Pediatrics', careLevel: 'Secondary/Tertiary Hospital', searchAliases: ['kombulsyon dahil sa lagnat'] },
  { label: 'Diarrhea (Children)', tags: ['Pediatric', 'Gastrointestinal'], department: 'Pediatrics', careLevel: 'Primary/BHC', searchAliases: ['diarrhea bata', 'pagsusuka bata'] },
  { label: 'Hand-Foot-Mouth Disease', tags: ['Pediatric', 'Infectious'], department: 'Pediatrics', careLevel: 'Primary/BHC', searchAliases: ['hfmd', 'hand foot mouth'] },
  { label: 'Cleft Lip/Palate', tags: ['Pediatric', 'Surgical'], department: 'Pediatric Surgery', careLevel: 'Tertiary Hospital', searchAliases: ['cleft lip', 'bingot'] },
  { label: 'Congenital Heart Disease', tags: ['Pediatric', 'Cardiovascular'], department: 'Pediatric Cardiology', careLevel: 'Tertiary Hospital', searchAliases: ['butas sa puso', 'chd'] },
  { label: 'Cerebral Palsy', tags: ['Pediatric', 'Neurological'], department: 'Pediatrics / Rehab', careLevel: 'Specialist/Tertiary', searchAliases: ['cerebral palsy'] },
  { label: 'Down Syndrome', tags: ['Pediatric', 'Genetic'], department: 'Pediatrics', careLevel: 'Specialist/Tertiary', searchAliases: ['down syndrome'] },

  // Eye / ENT
  { label: 'Cataracts', tags: ['Eye', 'Surgical'], department: 'Ophthalmology', careLevel: 'Secondary/Tertiary Hospital', searchAliases: ['katarata', 'cataract'] },
  { label: 'Glaucoma', tags: ['Eye'], department: 'Ophthalmology', careLevel: 'Specialist/Tertiary', searchAliases: ['glaucoma'] },
  { label: 'Diabetic Retinopathy', tags: ['Eye', 'Endocrine'], department: 'Ophthalmology', careLevel: 'Specialist/Tertiary', searchAliases: ['diabetic retinopathy', 'lumalabo mata dahil sa diabetes'] },
  { label: 'Hearing Loss', tags: ['ENT'], department: 'ENT', careLevel: 'Secondary/Tertiary Hospital', searchAliases: ['bingi', 'hearing loss'] },
  { label: 'Vertigo', tags: ['ENT', 'Neurological'], department: 'ENT / Neurology', careLevel: 'Primary/Secondary', searchAliases: ['nahihilo', 'vertigo'] },
  { label: 'Tinnitus', tags: ['ENT'], department: 'ENT', careLevel: 'Specialist/Tertiary', searchAliases: ['tinnitus', 'tunog sa tenga'] },

  // Trauma / Injury
  { label: 'Fractures', tags: ['Trauma', 'Orthopedics', 'Emergency'], department: 'Orthopedics / ER', careLevel: 'Secondary/Tertiary Hospital', searchAliases: ['nabalian', 'bone fracture'] },
  { label: 'Burns', tags: ['Trauma', 'Dermatology', 'Emergency'], department: 'Burn Unit / ER', careLevel: 'Tertiary Hospital', searchAliases: ['paso', 'burn'] },
  { label: 'Head Injury', tags: ['Trauma', 'Neurological', 'Emergency'], department: 'Neurosurgery / ER', careLevel: 'Tertiary Hospital', searchAliases: ['nauntog', 'bagok', 'head injury'] },
  { label: 'Drowning', tags: ['Trauma', 'Emergency', 'Respiratory'], department: 'ER / ICU', careLevel: 'Tertiary Hospital', searchAliases: ['nalunod', 'drowning'] },
  { label: 'Wound Care', tags: ['Trauma', 'Emergency'], department: 'Surgery / ER', careLevel: 'Primary/BHC', searchAliases: ['sugat', 'tahi', 'wound care'] }
]
