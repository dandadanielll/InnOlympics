import type { Facility } from '@/lib/types';

const facilities: Facility[] = [
  {
    id: 'qc-bhc-batasan',
    name: 'Batasan Hills Health Center',
    type: 'bhc',
    address: 'Batasan Hills, Quezon City',
    city: 'Quezon City',
    region: 'metro_manila',
    coordinates: { lat: 14.6952, lng: 121.1099 },
    operatingHours: 'Mon-Fri 8AM-5PM',
    peakHours: '8AM-10AM',
    philHealthAccredited: true,
    servicesOffered: ['General consultation', 'Maternal care', 'Immunization', 'Family planning', 'TB DOTS'],
    averageWaitMinutes: 60,
    contactNumber: '',
  },
  {
    id: 'qc-general-hospital',
    name: 'Quezon City General Hospital (QCGH)',
    type: 'city_hospital',
    address: 'Seminary Rd, Quezon City',
    city: 'Quezon City',
    region: 'metro_manila',
    coordinates: { lat: 14.6488, lng: 121.0544 },
    operatingHours: '24/7',
    peakHours: '8AM-12PM',
    philHealthAccredited: true,
    servicesOffered: ['Emergency', 'OPD', 'Surgery', 'OB-GYN', 'Pediatrics', 'Internal Medicine'],
    averageWaitMinutes: 120,
    contactNumber: '8426-1601',
  },
  {
    id: 'manila-health-dept',
    name: 'Manila Health Department (Ermita)',
    type: 'rhu',
    address: 'Padre Faura, Ermita, Manila',
    city: 'Manila',
    region: 'metro_manila',
    coordinates: { lat: 14.5832, lng: 120.9823 },
    operatingHours: 'Mon-Fri 7AM-5PM',
    peakHours: '7AM-9AM',
    philHealthAccredited: true,
    servicesOffered: ['General consultation', 'Prenatal', 'Family planning', 'Dental'],
    averageWaitMinutes: 90,
    contactNumber: '5250-6000',
  },
  {
    id: 'ospital-ng-makati',
    name: 'Ospital ng Makati',
    type: 'city_hospital',
    address: 'Makati Avenue, Makati City',
    city: 'Makati',
    region: 'metro_manila',
    coordinates: { lat: 14.5547, lng: 121.0244 },
    operatingHours: '24/7',
    peakHours: '8AM-11AM',
    philHealthAccredited: true,
    servicesOffered: ['Emergency', 'OPD', 'Pediatrics', 'OB-GYN', 'Cardiology'],
    averageWaitMinutes: 90,
    contactNumber: '8870-1000',
  },
  {
    id: 'pasig-general-hospital',
    name: 'Pasig City General Hospital',
    type: 'city_hospital',
    address: 'Dr. Sixto Antonio Ave, Pasig',
    city: 'Pasig',
    region: 'metro_manila',
    coordinates: { lat: 14.5756, lng: 121.0847 },
    operatingHours: '24/7',
    peakHours: '8AM-12PM',
    philHealthAccredited: true,
    servicesOffered: ['Emergency', 'OPD', 'Surgery', 'Pediatrics'],
    averageWaitMinutes: 100,
    contactNumber: '8641-7000',
  },
  {
    id: 'taguig-bhc-western-bicutan',
    name: 'Western Bicutan Health Center',
    type: 'bhc',
    address: 'Western Bicutan, Taguig',
    city: 'Taguig',
    region: 'metro_manila',
    coordinates: { lat: 14.5066, lng: 121.0465 },
    operatingHours: 'Mon-Fri 8AM-5PM',
    peakHours: '8AM-10AM',
    philHealthAccredited: true,
    servicesOffered: ['General consultation', 'Immunization', 'Family planning'],
    averageWaitMinutes: 45,
    contactNumber: '',
  },
  {
    id: 'caloocan-city-medical-center',
    name: 'Caloocan City Medical Center',
    type: 'city_hospital',
    address: 'Biglang-Awa St, Caloocan',
    city: 'Caloocan',
    region: 'metro_manila',
    coordinates: { lat: 14.6502, lng: 120.9670 },
    operatingHours: '24/7',
    peakHours: '7AM-11AM',
    philHealthAccredited: true,
    servicesOffered: ['Emergency', 'OPD', 'Surgery', 'Pediatrics', 'OB-GYN'],
    averageWaitMinutes: 110,
    contactNumber: '8366-4531',
  },
  {
    id: 'mandaluyong-city-medical-center',
    name: 'Mandaluyong City Medical Center',
    type: 'city_hospital',
    address: 'Maysilo Circle, Mandaluyong',
    city: 'Mandaluyong',
    region: 'metro_manila',
    coordinates: { lat: 14.5794, lng: 121.0359 },
    operatingHours: '24/7',
    peakHours: '8AM-12PM',
    philHealthAccredited: true,
    servicesOffered: ['Emergency', 'OPD', 'Internal Medicine', 'Pediatrics'],
    averageWaitMinutes: 90,
    contactNumber: '8532-2244',
  },
  {
    id: 'marikina-valley-medical-center',
    name: 'Marikina Valley Medical Center',
    type: 'city_hospital',
    address: 'JP Rizal Ave, Marikina',
    city: 'Marikina',
    region: 'metro_manila',
    coordinates: { lat: 14.6423, lng: 121.1064 },
    operatingHours: '24/7',
    peakHours: '8AM-11AM',
    philHealthAccredited: true,
    servicesOffered: ['Emergency', 'OPD', 'Surgery', 'OB-GYN'],
    averageWaitMinutes: 80,
    contactNumber: '8682-0000',
  },
  {
    id: 'paranaque-doctors-hospital',
    name: 'Ospital ng Parañaque',
    type: 'city_hospital',
    address: 'Dr. A. Santos Ave, Parañaque',
    city: 'Parañaque',
    region: 'metro_manila',
    coordinates: { lat: 14.4793, lng: 121.0198 },
    operatingHours: '24/7',
    peakHours: '8AM-12PM',
    philHealthAccredited: true,
    servicesOffered: ['Emergency', 'OPD', 'Pediatrics', 'OB-GYN'],
    averageWaitMinutes: 90,
    contactNumber: '8826-0001',
  },
  {
    id: 'ncmh',
    name: 'National Center for Mental Health (NCMH)',
    type: 'medical_center',
    address: 'Nueve de Pebrero St, Mandaluyong',
    city: 'Mandaluyong',
    region: 'metro_manila',
    coordinates: { lat: 14.5799, lng: 121.0272 },
    operatingHours: '24/7 (ER); OPD Mon-Fri 8AM-5PM',
    peakHours: '9AM-11AM',
    philHealthAccredited: true,
    servicesOffered: ['Psychiatry', 'Psychology', 'Crisis intervention', 'Outpatient mental health'],
    averageWaitMinutes: 120,
    contactNumber: '0917-899-8727',
  },
];

export default facilities;

export function getFacilitiesByCity(city: string): Facility[] {
  return facilities.filter(
    (f) => f.city.toLowerCase() === city.toLowerCase()
  );
}

export function getFacilityById(id: string): Facility | undefined {
  return facilities.find((f) => f.id === id);
}

export function facilitiesToContext(city: string): string {
  const cityFacilities = getFacilitiesByCity(city);
  const fallback = facilities.filter((f) => f.type !== 'bhc').slice(0, 5);
  const list = cityFacilities.length > 0 ? cityFacilities : fallback;

  return list
    .map(
      (f) =>
        `- ${f.name} (${f.type.replace(/_/g, ' ')}) | ${f.address} | Hours: ${f.operatingHours} | Peak: ${f.peakHours} | PhilHealth: ${f.philHealthAccredited ? 'Yes' : 'No'} | Services: ${f.servicesOffered.join(', ')}`
    )
    .join('\n');
}
