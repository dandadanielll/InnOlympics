export type ServiceType =
  // Diagnostics & Imaging
  | 'Complete Blood Count (CBC)' | 'Urinalysis' | 'Fecalysis' | 'Blood Chemistry Panel' | 'HbA1c'
  | 'Thyroid Function Test' | 'Hepatitis B Surface Antigen (HBsAg)' | 'HIV Rapid Test' | 'Dengue NS1/IgG/IgM'
  | 'Chest X-Ray (CXR)' | 'Abdominal Ultrasound' | 'Pelvic Ultrasound' | 'OB Ultrasound' | 'ECG/EKG'
  | '2D Echo' | 'Treadmill Stress Test' | 'CT Scan' | 'MRI' | 'Mammogram' | 'Pap Smear' | 'Sputum AFB (TB Test)'
  | 'Blood Culture' | 'Urine Culture' | 'Biopsy'

  // Outpatient Consultation
  | 'General Medicine' | 'Internal Medicine' | 'Pediatrics' | 'OB-GYN' | 'Surgery' | 'Orthopedics'
  | 'Neurology' | 'Neurosurgery' | 'Cardiology' | 'Pulmonology' | 'Nephrology' | 'Endocrinology' | 'Oncology'
  | 'Dermatology' | 'Ophthalmology' | 'ENT' | 'Psychiatry' | 'Infectious Disease'
  | 'Rehabilitation Medicine' | 'Dental / Oral Health' | 'Nutrition & Dietetics' | 'Family Medicine'

  // Procedures & Treatments
  | 'Dialysis (Hemodialysis)' | 'Chemotherapy' | 'Radiation Therapy' | 'Blood Transfusion'
  | 'IV Hydration / Infusion' | 'Wound Debridement / Dressing' | 'Circumcision' | 'Minor Surgery'
  | 'Endoscopy / Colonoscopy' | 'Cataract Surgery' | 'TURP (Prostate)' | 'Cesarean Section' | 'Normal Spontaneous Delivery'
  | 'Vaccination / Immunization' | 'TB-DOTS Treatment' | 'Family Planning Procedures' | 'PhilHealth Konsulta Package'
  | 'Newborn Screening' | 'Dental Extraction' | 'Dental Filling'

  // Rehabilitation & Support
  | 'Physical Therapy' | 'Occupational Therapy' | 'Speech Therapy' | 'Pulmonary Rehabilitation'
  | 'Cardiac Rehabilitation' | 'Substance Abuse Treatment' | 'Mental Health Counseling' | 'Nutritional Rehabilitation'

  // Emergency Services
  | 'Emergency Room (ER)' | 'Trauma Care' | 'Poison Control' | 'Ambulance / Transport' | 'Intensive Care Unit (ICU)' | 'Neonatal ICU (NICU)'
  | 'Nuclear Medicine'

export interface ServiceData {
  label: ServiceType
  department: string
  careLevel: string
  requiresReferral: boolean
  availableAt: string[]
}

export const SERVICES: ServiceData[] = [
  // Diagnostics & Imaging
  { label: 'Complete Blood Count (CBC)', department: 'Laboratory', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Urinalysis', department: 'Laboratory', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Fecalysis', department: 'Laboratory', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Blood Chemistry Panel', department: 'Laboratory', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'HbA1c', department: 'Laboratory', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Thyroid Function Test', department: 'Laboratory', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Hepatitis B Surface Antigen (HBsAg)', department: 'Laboratory', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'HIV Rapid Test', department: 'Laboratory', careLevel: 'Secondary', requiresReferral: false, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Dengue NS1/IgG/IgM', department: 'Laboratory', careLevel: 'Secondary', requiresReferral: false, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Chest X-Ray (CXR)', department: 'Radiology', careLevel: 'Primary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Abdominal Ultrasound', department: 'Radiology', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Pelvic Ultrasound', department: 'Radiology', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'OB Ultrasound', department: 'Radiology', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'ECG/EKG', department: 'Cardiology', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic'] },
  { label: '2D Echo', department: 'Cardiology', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Treadmill Stress Test', department: 'Cardiology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'CT Scan', department: 'Radiology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'MRI', department: 'Radiology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Mammogram', department: 'Radiology', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Pap Smear', department: 'OB-GYN', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Sputum AFB (TB Test)', department: 'Laboratory', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Blood Culture', department: 'Laboratory', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Urine Culture', department: 'Laboratory', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Biopsy', department: 'Pathology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },

  // Outpatient Consultation
  { label: 'General Medicine', department: 'Internal Medicine', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Internal Medicine', department: 'Internal Medicine', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Pediatrics', department: 'Pediatrics', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'OB-GYN', department: 'OB-GYN', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Surgery', department: 'Surgery', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Orthopedics', department: 'Orthopedics', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Neurology', department: 'Neurology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Neurosurgery', department: 'Neurosurgery', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Cardiology', department: 'Cardiology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Pulmonology', department: 'Pulmonology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Nephrology', department: 'Nephrology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Endocrinology', department: 'Endocrinology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Oncology', department: 'Oncology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Dermatology', department: 'Dermatology', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Ophthalmology', department: 'Ophthalmology', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'ENT', department: 'ENT', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Psychiatry', department: 'Psychiatry', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Infectious Disease', department: 'Infectious Disease', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Rehabilitation Medicine', department: 'Rehabilitation', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Dental / Oral Health', department: 'Dental', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Nutrition & Dietetics', department: 'Nutrition', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Family Medicine', department: 'Family Medicine', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },

  // Procedures & Treatments
  { label: 'Dialysis (Hemodialysis)', department: 'Nephrology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Chemotherapy', department: 'Oncology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Radiation Therapy', department: 'Oncology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Blood Transfusion', department: 'Hematology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'IV Hydration / Infusion', department: 'Emergency/Internal Med', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Wound Debridement / Dressing', department: 'Surgery', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Circumcision', department: 'Surgery', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Minor Surgery', department: 'Surgery', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Endoscopy / Colonoscopy', department: 'Gastroenterology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Cataract Surgery', department: 'Ophthalmology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'TURP (Prostate)', department: 'Urology', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Cesarean Section', department: 'OB-GYN', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Normal Spontaneous Delivery', department: 'OB-GYN', careLevel: 'Secondary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Vaccination / Immunization', department: 'Pediatrics / Family Medicine', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'TB-DOTS Treatment', department: 'Infectious Disease', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Family Planning Procedures', department: 'OB-GYN / Family Medicine', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'PhilHealth Konsulta Package', department: 'Primary Care', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Newborn Screening', department: 'Pediatrics', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Dental Extraction', department: 'Dental', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Dental Filling', department: 'Dental', careLevel: 'Primary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },

  // Rehabilitation & Support
  { label: 'Physical Therapy', department: 'Rehabilitation', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Occupational Therapy', department: 'Rehabilitation', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Speech Therapy', department: 'Rehabilitation', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Pulmonary Rehabilitation', department: 'Rehabilitation', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Cardiac Rehabilitation', department: 'Rehabilitation', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Substance Abuse Treatment', department: 'Psychiatry', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Mental Health Counseling', department: 'Psychiatry', careLevel: 'Secondary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },
  { label: 'Nutritional Rehabilitation', department: 'Nutrition', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital', 'Clinic'] },

  // Emergency Services
  { label: 'Emergency Room (ER)', department: 'Emergency Medicine', careLevel: 'Secondary', requiresReferral: false, availableAt: ['Hospital'] },
  { label: 'Trauma Care', department: 'Emergency Medicine', careLevel: 'Tertiary', requiresReferral: false, availableAt: ['Hospital'] },
  { label: 'Poison Control', department: 'Toxicology', careLevel: 'Tertiary', requiresReferral: false, availableAt: ['Hospital'] },
  { label: 'Ambulance / Transport', department: 'Emergency Medicine', careLevel: 'Secondary', requiresReferral: false, availableAt: ['Hospital', 'Clinic', 'BHC'] },
  { label: 'Intensive Care Unit (ICU)', department: 'ICU', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Neonatal ICU (NICU)', department: 'NICU', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] },
  { label: 'Nuclear Medicine', department: 'Nuclear Medicine', careLevel: 'Tertiary', requiresReferral: true, availableAt: ['Hospital'] }
]
