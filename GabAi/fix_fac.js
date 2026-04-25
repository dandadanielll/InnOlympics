const fs = require('fs');

const path = '/Users/jouleused/Desktop/InnOlympics/GabAi/app/navigator/before/facilities.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "export interface Facility {\n",
  "import { type ServiceType } from './services'\n\nexport interface Facility {\n"
);

content = content.replace(
  "  services: string[]\n",
  "  services: ServiceType[]\n  unverified?: boolean\n  communityFlagged?: boolean\n  _sources?: Record<string, string>\n"
);

const serviceMap = {
  'Maternity': 'OB-GYN',
  'Neonatal': 'Neonatal ICU (NICU)',
  'Prenatal Checkup': 'OB-GYN',
  'Cancer Treatment (Oncology)': 'Oncology',
  'Major Surgery': 'Surgery',
  'Pediatric Surgery': 'Surgery',
  'Dental Cleaning': 'Dental / Oral Health',
  'Dental': 'Dental / Oral Health',
  'X-Ray': 'Chest X-Ray (CXR)',
  'Ultrasound': 'Abdominal Ultrasound',
  'ECG': 'ECG/EKG',
  'Laboratory': 'Complete Blood Count (CBC)',
  'Dialysis': 'Dialysis (Hemodialysis)',
  'Emergency': 'Emergency Room (ER)',
  'Consultation': 'General Medicine',
  'Blood Extraction': 'Complete Blood Count (CBC)',
  'Vaccination': 'Vaccination / Immunization',
  'TB-DOTS': 'TB-DOTS Treatment',
  'Pharmacy': 'General Medicine',
  'Anesthesiology': 'Surgery',
  'Emergency Medicine': 'Emergency Room (ER)'
};

content = content.replace(/services:\s*\[(.*?)\]/g, (match, p1) => {
  if (!p1.trim()) return "services: []";
  const arr = p1.split(',').map(s => s.trim().replace(/^'|'$/g, ''));
  const newArr = [];
  for (const s of arr) {
    if (serviceMap[s]) {
      newArr.push(`'${serviceMap[s]}'`);
    } else {
      newArr.push(`'${s}'`);
    }
  }
  // Deduplicate
  const unique = [...new Set(newArr)];
  return `services: [${unique.join(', ')}]`;
});

// Since everything except PGH is essentially unverified deeply, we add unverified:true to BHCs
content = content.replace(/(isBHC:true.*?) \}/g, "$1, unverified: true }");

fs.writeFileSync(path, content);
console.log("Updated facilities.ts");
