'use client'
import { useState, useEffect, useRef } from 'react'

interface CommuteLeg { mode: string; instruction: string; fare: number }
interface CommutePlan { totalTime: string; totalFare: number; legs: CommuteLeg[] }

const MODE_COLORS: Record<string, string> = {
  'Jeepney': '#e67e22', 'Bus': '#3498db', 'Walk': '#27ae60',
  'LRT': '#e74c3c', 'MRT': '#c0392b', 'Tricycle': '#9b59b6',
}

// ── Hardcoded Taglish commute guides per document destination ─────────────────
const COMMUTE_GUIDES: Record<string, string[]> = {
  bhc: [
    'Pumunta sa pinakamalapit na Barangay Health Center (BHC) sa inyong lugar.',
    'Ang BHC ay karaniwang nasa loob ng inyong barangay — tanungin sa barangay hall kung saan ito.',
    'Pumunta nang maaga (6:00–7:00 AM) para maiwasan ang mahabang pila.',
    'Sabihin sa nars o staff na kailangan ninyo ng referral papunta sa ospital.',
  ],
  philhealth: [
    'Pumunta sa pinakamalapit na PhilHealth branch sa inyong lugar.',
    'Sa Manila area: PhilHealth Regional Office, 2/F Bldg, UN Avenue, Ermita (malapit sa PGH).',
    'Pwede ring mag-download ng MDR online: philhealth.gov.ph → Members Portal → Download MDR.',
    'Magdala ng valid ID at inyong PhilHealth number.',
  ],
  barangay: [
    'Pumunta sa inyong Barangay Hall (opisina ng inyong barangay).',
    'Sabihin sa barangay secretary na kailangan ninyo ng Certificate of Indigency para sa ospital.',
    'Magdala ng valid ID. Karaniwang libre ito at ibinibigay agad.',
    'Kung may bayad (₱50–₱100), handa ang barya.',
  ],
  pgh: [
    'Ang PGH OPD Registration ay nasa Ground Floor, Main Building ng Philippine General Hospital.',
    'Pumasok sa Taft Avenue entrance. Hanapin ang karatulang "OPD Registration" (asul na kulay).',
    'Pumunta nang bago mag-6:00 AM para makakuha ng numero.',
    'Magdala ng valid ID at 1 piraso ng 1×1 na litrato.',
  ],
  dswd: [
    'Pumunta sa Malasakit Center sa loob ng ospital (kung meron) o sa pinakamalapit na desk ng DSWD/PCSO.',
    'Magdala ng Medical Abstract, reseta (kung para sa gamot), at inyong Hospital Bill.',
    'Ipadala rin ang inyong Barangay Certificate of Indigency bilang patunay.',
    'Maging maaga dahil kadalasan ay may cut-off sa mga pila.',
  ],
}

// ── Document definitions ──────────────────────────────────────────────────────
const PGH_DOCS = [
  {
    id: 'bluecard', title: 'PGH Blue Card',
    desc: 'Out-Patient Registration Card — required for all OPD and specialty visits',
    how: 'Go to PGH OPD Registration, Ground Floor, Main Bldg (Taft Avenue entrance). Arrive before 6:00 AM. Bring valid ID + 1 piece 1×1 photo.',
    cost: 'Free', time: '1–2 hours queue',
    dest: 'PGH OPD Registration', destQuery: 'Philippine General Hospital', guideType: 'pgh', showPlan: true,
  },
  {
    id: 'ocra', title: 'OCRA Online Appointment Slip',
    desc: 'Required for all specialty OPD consultations at PGH',
    how: 'Go to ocra.pgh.gov.ph → Register using your Blue Card number → Select department → Book a slot → Print or screenshot the confirmation.',
    cost: 'Free', time: '5 minutes online (2–4 weeks wait for slot)',
    dest: '', destQuery: '', guideType: '', showPlan: false,
  },
  {
    id: 'referral_pgh', title: 'Valid Referral Form / Letter',
    desc: 'From a lower-level facility (BHC or district hospital). Not required for ER cases.',
    how: 'Get a referral from your Barangay Health Center or district hospital. Bring your current complaints. The doctor will assess and write the referral.',
    cost: 'Free', time: 'Same day (30–90 mins due to queue)',
    dest: 'Barangay Health Center', destQuery: 'Barangay Health Center near me', guideType: 'bhc', showPlan: false,
  },
  {
    id: 'abstract', title: 'Clinical Abstract / Medical Certificate',
    desc: 'Summary of your medical history from a previous doctor — required for specialty cases',
    how: 'Return to the Medical Records Section of the hospital or clinic where you were previously treated. Fill a request form. Processing takes 3–7 working days.',
    cost: '₱100–₱500 (govt); ₱500+ (private)', time: '3–7 working days',
    dest: '', destQuery: '', guideType: '', showPlan: false,
  },
  {
    id: 'philhealth_pgh', title: 'PhilHealth ID or MDR Printout',
    desc: 'For Malasakit Center / PhilHealth co-pay coverage at PGH',
    how: 'Download your Member Data Record (MDR) from philhealth.gov.ph → Members Portal, or visit any PhilHealth branch with your valid ID.',
    cost: 'Free', time: 'Instant online, or 15–30 mins walk-in',
    dest: 'PhilHealth Branch', destQuery: 'PhilHealth branch', guideType: 'philhealth', showPlan: false,
  },
  {
    id: 'indigency_pgh', title: 'Certificate of Indigency',
    desc: 'For PGH Social Work / Charity service classification (required for full subsidy)',
    how: 'Get from your Barangay Hall. PGH Social Work Section (Ground Floor, Main Bldg) can also assist with indigent patient classification.',
    cost: 'Free (some barangays charge ₱50–₱100)', time: '15–30 minutes',
    dest: 'Barangay Hall', destQuery: 'Barangay Hall', guideType: 'barangay', showPlan: false,
  },
]

const GENERAL_DOCS = [
  {
    id: 'id', title: 'Valid Government-Issued ID',
    desc: 'Primary ID: Passport, Driver\'s License, UMID, Postal ID, PhilSys',
    how: 'Bring any original valid primary government ID. If unavailable, bring a Barangay Clearance with a Company or School ID.',
    cost: 'Free to present', time: 'Immediate',
    dest: '', destQuery: '', guideType: '', showPlan: false,
  },
  {
    id: 'mdr', title: 'PhilHealth ID or MDR',
    desc: 'Required for PhilHealth Konsulta / co-pay deductions',
    how: 'Log in to philhealth.gov.ph → Members Portal → Download MDR. Or go to the nearest PhilHealth branch with your valid ID.',
    cost: 'Free', time: 'Instant online, or 15–30 mins walk-in',
    dest: 'PhilHealth Branch', destQuery: 'PhilHealth branch', guideType: 'philhealth', showPlan: false,
  },
  {
    id: 'indigency', title: 'Certificate of Indigency',
    desc: 'For Medical Assistance / Malasakit Center',
    how: 'Go to your Barangay Hall. Tell the secretary you need it for a hospital visit. Bring valid ID.',
    cost: 'Free (some charge ₱50–₱100)', time: '15–30 minutes',
    dest: 'Barangay Hall', destQuery: 'Barangay Hall', guideType: 'barangay', showPlan: false,
  },
  {
    id: 'referral', title: 'Referral Letter',
    desc: 'Required for secondary and tertiary hospitals; not needed for ER',
    how: 'Go to your nearest Barangay Health Center. A doctor will examine you and write the referral for free.',
    cost: 'Free', time: '30–90 minutes (queue)',
    dest: 'Barangay Health Center', destQuery: 'Barangay Health Center near me', guideType: 'bhc', showPlan: false,
  },
  {
    id: 'guarantee', title: 'Guarantee Letter (DSWD / PCSO / Malasakit)',
    desc: 'Brings financial assistance for hospital bills, labs, or medicines',
    how: 'Get your Medical Abstract and Hospital Bill. Submit these to the Malasakit Center inside the hospital, or to a DSWD/PCSO branch.',
    cost: 'Free', time: '1–2 days processing',
    dest: 'DSWD Branch', destQuery: 'DSWD Branch', guideType: 'dswd', showPlan: false,
  },
  {
    id: 'records', title: 'Previous Medical Records / Lab Results',
    desc: 'For specialty consultations requiring your history',
    how: 'Return to the Medical Records Section of your previous clinic or hospital. Fill a request form and pay any applicable fee.',
    cost: '₱100–₱300 (govt); ₱500+ (private)', time: '3–7 working days',
    dest: '', destQuery: '', guideType: '', showPlan: false,
  },
]

// ── Mini OSM Leaflet Map Component ────────────────────────────────────────────
function MiniOSMMap({ userLat, userLng, destQuery, destName }: { userLat: number; userLng: number; destQuery: string; destName: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined' || !window.L) return
    const L = window.L

    let isMounted = true

    async function loadMap() {
      try {
        setLoading(true)
        setErrorText('')

        // 1. Geocode with Nominatim (clean up query for better hits)
        const cleanQuery = destQuery.replace(/near me/gi, '').replace(/branch/gi, '').trim()
        let nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&limit=1`

        const limitDist = 0.05 // about 5km bbox
        const viewbox = `${userLng - limitDist},${userLat + limitDist},${userLng + limitDist},${userLat - limitDist}`
        nomUrl += `&viewbox=${viewbox}&bounded=1`

        let res = await fetch(nomUrl)
        let data = await res.json()

        // Fallback without bounding
        if (!data || !data.length) {
          nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&limit=1`
          res = await fetch(nomUrl)
          data = await res.json()
        }

        let destLat: number | null = null
        let destLng: number | null = null
        let foundName = ''

        if (data && data.length) {
          destLat = parseFloat(data[0].lat)
          destLng = parseFloat(data[0].lon)
          foundName = data[0].display_name
        } else {
          setErrorText('Tiyak na lokasyon ay hindi makita sa OSM. Ipinapakita ang inyong paligid lang.')
        }

        // 2. Fetch OSRM Route
        let routeCoords: any = null
        if (destLat !== null && destLng !== null) {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`
          try {
            const osrmRes = await fetch(osrmUrl)
            const osrmData = await osrmRes.json()
            if (osrmData.code === 'Ok' && osrmData.routes?.length) {
              routeCoords = osrmData.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
            }
          } catch (_err) {
            // ignore routing error and just plot markers
          }
        }

        if (!isMounted) return

        // 3. Render Leaflet Map
        if (mapRef.current) { mapRef.current.remove() }
        const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(map)

        L.circleMarker([userLat, userLng], { radius: 8, color: '#fff', fillColor: 'var(--primary)', fillOpacity: 1, weight: 2 }).addTo(map).bindPopup('<strong>Inyong Lokasyon</strong>')

        if (destLat !== null && destLng !== null) {
          const destIcon = L.divIcon({ html: `<div style="background:var(--primary);color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap">${destName.split(' ')[0]}</div>`, className: '', iconAnchor: [0, 0] })
          L.marker([destLat, destLng], { icon: destIcon }).addTo(map).bindPopup(`<strong>${destName}</strong><br/>${foundName}`)

          if (routeCoords) {
            const polyline = L.polyline(routeCoords, { color: 'var(--primary)', weight: 4 }).addTo(map)
            map.fitBounds(polyline.getBounds(), { padding: [20, 20] })
          } else {
            map.fitBounds([[userLat, userLng], [destLat, destLng]], { padding: [20, 20] })
          }
        } else {
          map.setView([userLat, userLng], 14)
        }

        mapRef.current = map
        setLoading(false)
      } catch (err: any) {
        if (!isMounted) return
        console.error(err)
        setErrorText(err.message || 'Could not load map.')
        setLoading(false)
      }
    }
    loadMap()

    return () => { isMounted = false }
  }, [userLat, userLng, destQuery])

  return (
    <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '10px', overflow: 'hidden', marginTop: '12px', border: '1px solid #ece8e0', background: '#f5f5f5' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(255,255,255,0.7)', fontSize: '13px', color: '#555', fontWeight: 600 }}>
          Loading map & route via OpenStreetMap...
        </div>
      )}
      {errorText && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, fontSize: '13px', color: '#c0392b' }}>
          {errorText}
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export function DocumentChecklist({
  isPGH, userLat, userLng, commutePlan, initialCheckedDocs, onChecklistChange
}: {
  isPGH: boolean
  userLat: number | null
  userLng: number | null
  commutePlan?: CommutePlan | null
  initialCheckedDocs?: Record<string, boolean>
  onChecklistChange?: (checked: Record<string, boolean>) => void
}) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>(initialCheckedDocs || {})
  const [showMap, setShowMap] = useState<string | null>(null)

  useEffect(() => {
    if (initialCheckedDocs) {
      setCheckedDocs(initialCheckedDocs)
    }
  }, [initialCheckedDocs])

  const handleToggle = (id: string) => {
    const next = { ...checkedDocs, [id]: !checkedDocs[id] }
    setCheckedDocs(next)
    onChecklistChange?.(next)
  }

  const docs = isPGH ? PGH_DOCS : GENERAL_DOCS
  const checkedCount = docs.filter(d => checkedDocs[d.id]).length

  const buildOSMUrl = (destQuery: string) => {
    if (!userLat || !userLng) return `https://www.openstreetmap.org/search?query=${encodeURIComponent(destQuery)}`
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat},${userLng};${encodeURIComponent(destQuery)}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', paddingBottom: '40px' }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <div style={{ flex: 1, height: '8px', background: '#d0c8b8', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${(checkedCount / docs.length) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, whiteSpace: 'nowrap' }}>{checkedCount}/{docs.length} ready</span>
      </div>

      {docs.map(d => {
        const isExpanded = expandedDoc === d.id
        const isChecked = checkedDocs[d.id]
        const showingMap = showMap === d.id
        const guide = d.guideType ? COMMUTE_GUIDES[d.guideType] : null

        return (
          <div key={d.id} style={{
            background: isChecked ? '#f0fdf4' : '#fff',
            border: `1.5px solid ${isChecked ? '#86efac' : isPGH ? 'var(--primary)' : '#eee'}`,
            borderRadius: '12px', transition: 'all 0.3s ease', overflow: 'visible',
          }}>
            {/* Header row */}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '16px' }}
              onClick={() => setExpandedDoc(isExpanded ? null : d.id)}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={isChecked || false}
                  onChange={() => handleToggle(d.id)}
                  onClick={e => e.stopPropagation()}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: isChecked ? '#16a34a' : '#101010', textDecoration: isChecked ? 'line-through' : 'none', fontWeight: 700 }}>{d.title}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{d.desc}</p>
                </div>
              </div>
              <svg style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0, marginLeft: '8px' }} width="20" height="20" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {/* Expanded panel */}
            {isExpanded && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#444' }}>
                <div style={{ marginTop: '14px', marginBottom: '10px', lineHeight: 1.6 }}>
                  <strong>Paano Kunin:</strong> {d.how}
                </div>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <div><strong>Gastos:</strong> {d.cost}</div>
                  <div><strong>Tagal:</strong> {d.time}</div>
                </div>

                {/* Directions section (only if has a destination) */}
                {d.destQuery && (
                  <div style={{ background: '#f9f7f4', padding: '14px', borderRadius: '10px', marginTop: '8px' }}>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      <button
                        onClick={() => setShowMap(showingMap ? null : d.id)}
                        style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '20px', border: '1.5px solid var(--primary)', background: showingMap ? 'var(--primary)' : '#fff', color: showingMap ? '#fff' : 'var(--primary)', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', transition: '0.2s' }}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {showingMap ? 'Itago ang Mapa' : 'Tingnan ang Mapa (OSM)'}
                      </button>

                      <a
                        href={buildOSMUrl(d.destQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '20px', background: '#e0d8ce', color: '#555', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        Buksan sa Bagong Tab
                      </a>
                    </div>

                    {/* For PGH Blue Card: show Step 3 commute plan (same destination) */}
                    {d.showPlan && commutePlan?.legs?.length ? (
                      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #ece8e0', padding: '14px', marginBottom: showingMap ? '12px' : '0' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', fontWeight: 700, marginBottom: '12px' }}>COMMUTE GUIDE PAPUNTANG PGH</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {commutePlan.legs.map((leg, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: MODE_COLORS[leg.mode] || '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ color: '#fff', fontSize: '9px', fontWeight: 800 }}>{leg.mode[0]}</span>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: MODE_COLORS[leg.mode] || '#888', background: `${MODE_COLORS[leg.mode]}20`, padding: '2px 8px', borderRadius: '20px' }}>{leg.mode}</span>
                                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#333' }}>₱ {leg.fare.toFixed(2)}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{leg.instruction}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #ece8e0' }}>
                          <span style={{ fontSize: '12px', color: '#888' }}>⏱ {commutePlan.totalTime}</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>Total: ₱ {commutePlan.totalFare.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : guide ? (
                      /* For other docs: show hardcoded Taglish guide */
                      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #ece8e0', padding: '14px', marginBottom: showingMap ? '12px' : '0' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', fontWeight: 700, marginBottom: '10px' }}>PAANO PUMUNTA</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {guide.map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 800, color: '#fff' }}>{i + 1}</div>
                              <p style={{ margin: 0, fontSize: '12px', color: '#555', lineHeight: 1.6 }}>{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Inline Leaflet Map using OpenStreetMap */}
                    {showingMap && userLat && userLng && (
                      <MiniOSMMap userLat={userLat} userLng={userLng} destQuery={d.destQuery} destName={d.dest} />
                    )}

                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
