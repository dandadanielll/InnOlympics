import { useState } from 'react'

export function DocumentChecklist({ isPGH, userLat, userLng }: { isPGH: boolean, userLat: number | null, userLng: number | null }) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({})
  const [showDirections, setShowDirections] = useState<string | null>(null)

  const toggleCheck = (id: string) => setCheckedDocs(prev => ({ ...prev, [id]: !prev[id] }))

  const GENERAL_DOCS = [
    {
      id: 'id', title: 'Valid Government-Issued ID', desc: 'Primary IDs: Passport, Driver\'s License, UMID, Postal ID',
      how: 'Bring any original valid primary government ID. If none, bring a Barangay Clearance with your Company/School ID.', cost: 'Free to present', time: 'Immediate',
      dest: '', destQuery: ''
    },
    {
      id: 'mdr', title: 'PhilHealth ID or MDR', desc: 'Required for PhilHealth Konsulta / deductions',
      how: 'Log in to philhealth.gov.ph → Members Portal → Download MDR. Or go to the nearest PhilHealth branch.',
      cost: 'Free', time: 'Instant online, or 15-30 mins walk-in',
      dest: 'PhilHealth Branch', destQuery: 'PhilHealth+branch+near+me'
    },
    {
      id: 'indigency', title: 'Certificate of Indigency', desc: 'Needed for Medical Assistance / Malasakit',
      how: 'Go to your Barangay Hall. Tell the secretary you need it for a hospital visit.',
      cost: 'Free (some charge ₱50-₱100 for clearance)', time: '15-30 minutes',
      dest: 'Barangay Hall', destQuery: 'Barangay+Hall+near+me'
    },
    {
      id: 'referral', title: 'Referral Letter', desc: 'Required for tertiary hospitals',
      how: 'Go to your nearest Barangay Health Center in the morning. A doctor will examine you and write it.',
      cost: 'Free', time: '30-90 minutes (due to queue)',
      dest: 'Barangay Health Center', destQuery: 'Barangay+Health+Center+near+me'
    },
    {
      id: 'records', title: 'Previous Medical Records', desc: 'Lab results or clinical abstract',
      how: 'Return to the medical records section of your previous clinic/hospital.',
      cost: '₱100-₱300 (Govt), ₱500+ (Private)', time: '3-7 working days',
      dest: '', destQuery: ''
    }
  ]

  const PGH_DOCS = [
    {
      id: 'bluecard', title: 'PGH Blue Card', desc: 'Out-Patient Registration Card — required for all OPD visits',
      how: 'Go to PGH OPD Registration, Ground Floor, Main Bldg (Taft Avenue entrance). Arrive before 6:00 AM. Bring valid ID + 1 piece 1x1 photo.',
      cost: 'Free', time: '1-2 hours queue',
      dest: 'PGH OPD Registration', destQuery: 'Philippine+General+Hospital+Taft+Avenue+Manila'
    },
    {
      id: 'ocra', title: 'OCRA Appointment Slip', desc: 'Online booking — required for specialty OPD',
      how: 'Go to ocra.pgh.gov.ph → Register with Blue Card number → Select department → Book slot → Print/screenshot confirmation.',
      cost: 'Free', time: '5 mins online (2-4 weeks wait for slot)',
      dest: '', destQuery: ''
    },
    {
      id: 'referral_pgh', title: 'Valid Referral Form', desc: 'From a lower-level facility',
      how: 'Get a referral from your BHC or district hospital. ER cases do NOT need a referral.',
      cost: 'Free', time: 'Same day',
      dest: 'Barangay Health Center', destQuery: 'Barangay+Health+Center+near+me'
    },
    {
      id: 'abstract', title: 'Clinical Abstract / Medical Certificate', desc: 'Summary of medical history from previous doctor',
      how: 'Go to the Medical Records Section of your previous hospital. Fill out a request form and pay the fee.',
      cost: '₱100-₱500', time: '3-7 working days',
      dest: '', destQuery: ''
    },
    {
      id: 'philhealth_pgh', title: 'PhilHealth ID or MDR', desc: 'For Malasakit Center co-pay coverage',
      how: 'Download from philhealth.gov.ph → Members Portal, or visit any PhilHealth branch.',
      cost: 'Free', time: 'Instant online, or 15-30 mins walk-in',
      dest: 'PhilHealth Branch', destQuery: 'PhilHealth+branch+near+me'
    },
    {
      id: 'indigency_pgh', title: 'Certificate of Indigency', desc: 'For PGH Social Work / Charity access',
      how: 'Get from your Barangay Hall + DSWD clearance. PGH Social Work Section can also assist.',
      cost: 'Free', time: '15-30 minutes',
      dest: 'Barangay Hall', destQuery: 'Barangay+Hall+near+me'
    }
  ]

  const docs = isPGH ? PGH_DOCS : GENERAL_DOCS
  const checkedCount = docs.filter(d => checkedDocs[d.id]).length

  const buildMapsUrl = (destQuery: string) => {
    if (!userLat || !userLng) return `https://www.google.com/maps/search/${destQuery}`
    return `https://www.google.com/maps/dir/${userLat},${userLng}/${destQuery}/`
  }

  const buildEmbedUrl = (destQuery: string) => {
    const key = typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.props?.pageProps?.mapsKey : ''
    const mapsKey = process.env.NEXT_PUBLIC_MAPS_API_KEY || key || ''
    if (!userLat || !userLng || !mapsKey) return null
    return `https://www.google.com/maps/embed/v1/directions?key=${mapsKey}&origin=${userLat},${userLng}&destination=${encodeURIComponent(destQuery)}&mode=transit`
  }

  return (
    <div className="bfr-docs-grid fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ flex: 1, height: '6px', background: '#f0ece4', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${(checkedCount / docs.length) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize: '12px', color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{checkedCount}/{docs.length} ready</span>
      </div>

      {docs.map(d => {
        const isExpanded = expandedDoc === d.id
        const isChecked = checkedDocs[d.id]
        const showingDirections = showDirections === d.id
        return (
          <div key={d.id} className={`bfr-doc-card ${isPGH ? 'pgh' : ''}`} style={{
            padding: '16px', 
            background: isChecked ? '#f0fdf4' : '#fff', 
            border: isPGH ? '1px solid var(--primary)' : isChecked ? '1px solid #86efac' : '1px solid #eee', 
            borderRadius: '12px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedDoc(isExpanded ? null : d.id)}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="checkbox" checked={isChecked || false} onChange={() => toggleCheck(d.id)} onClick={e => e.stopPropagation()} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: isChecked ? '#16a34a' : '#101010', textDecoration: isChecked ? 'line-through' : 'none' }}>{d.title}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{d.desc}</p>
                </div>
              </div>
              <svg style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }} width="20" height="20" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            {isExpanded && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#444' }}>
                <div style={{ marginBottom: '10px' }}><strong>Paano Kunin:</strong> {d.how}</div>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div><strong>Gastos:</strong> {d.cost}</div>
                  <div><strong>Tagal:</strong> {d.time}</div>
                </div>
                {d.destQuery && (
                  <div style={{ marginTop: '12px', background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        className="bfr-ghost-btn" 
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }} 
                        onClick={() => setShowDirections(showingDirections ? null : d.id)}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {showingDirections ? 'Hide Map' : `Show directions to ${d.dest}`}
                      </button>
                      <a 
                        href={buildMapsUrl(d.destQuery)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bfr-pri-btn"
                        style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Open in Google Maps
                      </a>
                    </div>
                    {showingDirections && (
                      <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', height: '450px', width: '100%' }}>
                        {buildEmbedUrl(d.destQuery) ? (
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            referrerPolicy="no-referrer-when-downgrade"
                            src={buildEmbedUrl(d.destQuery)!}
                            allowFullScreen
                          />
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', color: '#666', fontSize: '13px' }}>
                            Set your location in Step 2 to see directions
                          </div>
                        )}
                      </div>
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
