'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGabAiStore } from '@/lib/store'
import { FACILITIES, haversineKm, type Facility } from './facilities'
import { DocumentChecklist } from './DocumentChecklist'

import { CONDITIONS } from './conditions'
import { SERVICES } from './services'

const SECONDARY_FILTERS = [
  { key: 'philhealth', label: 'PhilHealth Accredited', field: 'isPhilHealthAccredited' },
  { key: 'walkin', label: 'Walk-in Accepted', field: 'acceptsWalkIn' },
  { key: 'emergency', label: '24/7 Emergency', field: 'hasEmergency' },
  { key: 'outpatient', label: 'Outpatient (OPD)', field: 'outpatient' },
  { key: 'inpatient', label: 'Inpatient / Admission', field: 'inpatient' },
  { key: 'lab', label: 'Laboratory / Diagnostics', field: 'hasLaboratory' },
  { key: 'malasakit', label: 'Malasakit Center', field: 'hasMalasakitCenter' },
  { key: 'senior', label: 'Senior / PWD Lane', field: 'hasSeniorLane' },
  { key: 'referral', label: 'Accepts Referral', field: 'acceptsReferral' },
] as const

// Average Manila commute speed ~10 km/hr (jeepney+walk+traffic)
const TRAVEL_SPEED_KM_PER_HR = 10

// Transport mode icons (SVG paths)
const MODE_ICONS: Record<string, string> = {
  'Jeepney': 'M3 13h18v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm2-6h14l2 6H3l2-6zm3 9a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z',
  'Tricycle': 'M12 2a3 3 0 00-3 3v2H5l-2 4v4h2a3 3 0 006 0h2a3 3 0 006 0h2v-4l-2-4h-4V5a3 3 0 00-3-3z',
  'Bus': 'M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 13a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2zM6 5h12v8H6V5z',
  'Walk': 'M13 5a1 1 0 10-2 0 1 1 0 002 0zm-1 2l-3 7h2l1-3 2 2v5h2v-6l-2-2 .5-2A5 5 0 0018 9h-2a3 3 0 01-2.3-1L12 7z',
  'LRT': 'M4 11V6a4 4 0 014-4h8a4 4 0 014 4v5a4 4 0 01-4 4H8a4 4 0 01-4-4zm2 0V6a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2zm1 7l-1 2h2l1-2h6l1 2h2l-1-2',
  'MRT': 'M4 11V6a4 4 0 014-4h8a4 4 0 014 4v5a4 4 0 01-4 4H8a4 4 0 01-4-4zm2 0V6a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2zm1 7l-1 2h2l1-2h6l1 2h2l-1-2',
}

// Color palette per transport mode
const MODE_COLORS: Record<string, string> = {
  'Jeepney': '#e67e22',
  'Tricycle': '#9b59b6',
  'Bus': '#3498db',
  'Walk': '#27ae60',
  'LRT': '#e74c3c',
  'MRT': '#c0392b',
}

declare global { interface Window { L: any } }

export default function BeforePage() {
  const router = useRouter()
  const { user } = useGabAiStore()
  const [completedStep1, setCompletedStep1] = useState(false)
  const [completedStep2, setCompletedStep2] = useState(false)
  const [completedStep3, setCompletedStep3] = useState(false)
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)
  const step4Ref = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const pulseMarkerRef = useRef<any>(null)

  // Route map (Step 3)
  const routeMapContainerRef = useRef<HTMLDivElement>(null)

  // Step 1
  const [needType, setNeedType] = useState<'diagnosis' | 'service' | null>(null)
  const [query, setQuery] = useState('')
  const [classification, setClassification] = useState<{ title: string; class: string; risk: string } | null>(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Step 2 — Location
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [locationSet, setLocationSet] = useState(false)
  const [locationText, setLocationText] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)

  // Step 2 — Filters
  const [primarySort, setPrimarySort] = useState<'nearest' | 'free' | 'best'>('best')
  const [secondaryFilters, setSecondaryFilters] = useState<Record<string, boolean>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [showGastosPrompt, setShowGastosPrompt] = useState(false)

  // Step 3
  const [commutePlan, setCommutePlan] = useState<{ totalTime: string; totalFare: number; legs: { mode: string; instruction: string; fare: number }[] } | null>(null)
  const [isPlanning, setIsPlanning] = useState(false)

  const filteredSuggestions = query.trim().length > 0
    ? (needType === 'diagnosis'
      ? CONDITIONS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.searchAliases.some(a => a.toLowerCase().includes(query.toLowerCase()))).map(c => c.label)
      : SERVICES.filter(s => s.label.toLowerCase().includes(query.toLowerCase())).map(s => s.label)
    )
    : []

  // ── Location autocomplete ──
  const locationSuggestions = locationText.trim().length > 1 && !locationSet
    ? FACILITIES.filter(f =>
      f.name.toLowerCase().includes(locationText.toLowerCase()) ||
      f.address.toLowerCase().includes(locationText.toLowerCase()) ||
      f.district.toLowerCase().includes(locationText.toLowerCase())
    ).slice(0, 6)
    : []

  useEffect(() => {
    if (user?.city && !locationText && !locationSet) {
      setLocationText(user.city)
    }
  }, [user, locationText, locationSet])

  // ── Filtering + Sorting Engine ──
  const getFilteredFacilities = useCallback(() => {
    if (!locationSet || userLat === null || userLng === null) return []
    let list = [...FACILITIES]

    // 1. Hard filters
    Object.entries(secondaryFilters).forEach(([key, active]) => {
      if (!active) return
      const def = SECONDARY_FILTERS.find(f => f.key === key)
      if (def) list = list.filter(f => (f as any)[def.field] === true)
    })

    // 2. Compute relevance score
    const scored = list.map(f => {
      let score = 0
      if (classification || query) {
        let need = ((classification?.class || '') + ' ' + (classification?.title || '') + ' ' + query).toLowerCase().trim()
        if (need.includes('consultation') || need.includes('checkup') || need.includes('general')) {
          need += ' general medicine consultation'
        }
        const queryLower = query.toLowerCase().trim()
        const needTokens = need.split(/[\s,/()·\-]+/).filter(t => t.length >= 3)
        f.services.forEach(svc => {
          const svcLower = svc.toLowerCase()
          if (queryLower && svcLower === queryLower) { score += 5; return }
          if (need.includes(svcLower)) { score += 3; return }
          if (queryLower.length >= 3 && svcLower.includes(queryLower)) { score += 3; return }
          const svcTokens = svcLower.split(/[\s,/()·\-]+/).filter(t => t.length >= 3)
          for (const nt of needTokens) {
            if (svcLower.includes(nt) || svcTokens.some(st => nt.includes(st) || st.includes(nt))) {
              score += 1
              break
            }
          }
        })
        if (classification?.risk) {
          const riskLower = classification.risk.toLowerCase()
          f.tags.forEach(tag => {
            const tagLower = tag.toLowerCase()
            if (riskLower.includes(tagLower) || tagLower.includes(riskLower)) { score += 1 }
          })
        }
      }
      const dist = haversineKm(userLat, userLng, f.lat, f.lng)
      return { ...f, _score: score, _dist: dist }
    })

    // 3. Sort
    if (primarySort === 'nearest') {
      const sorted = scored.sort((a, b) => a._dist - b._dist)
      for (let hours = 1; hours <= 5; hours++) {
        const threshold = TRAVEL_SPEED_KM_PER_HR * hours
        const nearby = sorted.filter(f => f._dist <= threshold)
        if (nearby.length > 0) return nearby
      }
      return sorted
    } else if (primarySort === 'free') {
      return scored
        .filter(f => f.isBHC || f.isPhilHealthKonsulta || f.hasMalasakitCenter || f.tags.some(t => t === 'DOH' || t === 'City-run'))
        .sort((a, b) => a._dist - b._dist)
    } else {
      let bestList = scored;
      if (query || classification) { bestList = bestList.filter(f => f._score > 0); }
      return bestList.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score
        return a._dist - b._dist
      })
    }
  }, [primarySort, secondaryFilters, classification, query, userLat, userLng, locationSet])

  const visibleFacilities = getFilteredFacilities()

  // ── Leaflet & Global Init ──
  useEffect(() => {
    fetch('/api/health').catch(() => { })
    if (typeof window === 'undefined') return
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link)
      const script = document.createElement('script'); script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = () => initMap(); document.head.appendChild(script)
    } else if (window.L) { initMap() }
  }, [])

  const initMap = useCallback(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const L = window.L; if (!L) return
    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([14.5995, 120.9842], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    map.on('click', (e: any) => {
      if (locationSet) return
      const { lat, lng } = e.latlng
      placeUserMarker(lat, lng)
      setLocationText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    })
    mapRef.current = map
  }, [locationSet])

  const placeUserMarker = useCallback((lat: number, lng: number) => {
    const L = window.L; const map = mapRef.current
    if (!L || !map) return
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current)
    if (pulseMarkerRef.current) map.removeLayer(pulseMarkerRef.current)

    const pulseIcon = L.divIcon({ className: 'bfr-pulse-wrap', html: `<div class="bfr-pulse-ring"></div>`, iconSize: [40, 40], iconAnchor: [20, 20] })
    pulseMarkerRef.current = L.marker([lat, lng], { icon: pulseIcon, interactive: false }).addTo(map)

    userMarkerRef.current = L.circleMarker([lat, lng], { radius: 10, color: '#fff', fillColor: '#4285f4', fillOpacity: 1, weight: 4 }).addTo(map).bindTooltip('Your Location', { permanent: true, direction: 'top', offset: [0, -14], className: 'bfr-user-tip' })

    const nearbyBounds = L.latLngBounds([[lat, lng]])
    let countNearby = 0
    FACILITIES.forEach(f => {
      if (haversineKm(lat, lng, f.lat, f.lng) < 5 && countNearby < 15) { nearbyBounds.extend([f.lat, f.lng]); countNearby++ }
    })
    if (countNearby > 0) { map.fitBounds(nearbyBounds, { padding: [50, 50], maxZoom: 13 }) } else { map.setView([lat, lng], 12) }
    setUserLat(lat); setUserLng(lng)
  }, [])

  const handleUseCurrentLocation = () => {
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(pos => {
      placeUserMarker(pos.coords.latitude, pos.coords.longitude)
      setLocationText('Current Location (GPS)')
      setLocationSet(true); setIsLocating(false)
    }, () => { alert('Unable to get your location.'); setIsLocating(false) })
  }

  const handleConfirmPinnedLocation = () => { if (userLat !== null && userLng !== null) setLocationSet(true) }

  const handleSelectLocationSuggestion = (f: Facility) => {
    placeUserMarker(f.lat, f.lng)
    setLocationText(f.address)
    setLocationSet(true)
    setShowLocSuggestions(false)
  }

  const syncMarkers = useCallback(() => {
    const L = window.L; const map = mapRef.current; if (!L || !map) return
    markersRef.current.forEach(m => map.removeLayer(m)); markersRef.current = []
    if (!locationSet) return
    const icon = L.divIcon({ className: 'bfr-marker', html: `<div style="width:22px;height:22px;border-radius:50%;background:var(--primary);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg></div>`, iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -24] })
    visibleFacilities.forEach(f => {
      const dist = (f as any)._dist?.toFixed(1) || haversineKm(userLat!, userLng!, f.lat, f.lng).toFixed(1)
      const estMin = Math.round(parseFloat(dist) / TRAVEL_SPEED_KM_PER_HR * 60)
      let reason = `${dist} km · ~${estMin} min`
      if (primarySort === 'best') reason += ` · Offers: ${f.services.slice(0, 2).join(', ')}`
      if (primarySort === 'free') reason = f.isBHC ? 'Free BHC · UHC Act' : 'Konsulta · Zero co-pay'
      const marker = L.marker([f.lat, f.lng], { icon }).addTo(map).bindTooltip(`<div style="font-family:Inter,sans-serif"><div style="font-size:11px;font-weight:700;margin-bottom:1px">${f.name}</div><div style="font-size:10px;color:#666">${reason}</div></div>`, { direction: 'top', offset: [0, -4] })
      marker.on('click', () => { setSelectedFacility(f); setShowGastosPrompt(true) })
      markersRef.current.push(marker)
    })
  }, [visibleFacilities, primarySort, locationSet, userLat, userLng])

  useEffect(() => { syncMarkers() }, [syncMarkers])
  useEffect(() => { if (completedStep1 && mapRef.current) setTimeout(() => mapRef.current.invalidateSize(), 400) }, [completedStep1])

  const handleStep1Submit = async () => {
    setIsClassifying(true)
    try {
      const res = await fetch('/api/classify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ needType, query }) })
      const data = await res.json(); setClassification(data); setCompletedStep1(true)
      setTimeout(() => step2Ref.current?.scrollIntoView({ behavior: 'smooth' }), 600)
    } catch (e) { console.error(e) } finally { setIsClassifying(false) }
  }

  const handleGoToStep3 = async () => {
    if (!selectedFacility || userLat === null || userLng === null) return
    setShowGastosPrompt(false); setCompletedStep2(true); setIsPlanning(true)
    setTimeout(() => step3Ref.current?.scrollIntoView({ behavior: 'smooth' }), 200)
    try {
      const res = await fetch('/api/commute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ originLat: userLat, originLng: userLng, destinationLat: selectedFacility.lat, destinationLng: selectedFacility.lng, facilityName: selectedFacility.name }) })
      const data = await res.json(); setCommutePlan(data)
    } catch (e) { console.error(e) } finally { setIsPlanning(false) }
  }

  const toggleSecondary = (key: string) => setSecondaryFilters(prev => ({ ...prev, [key]: !prev[key] }))
  const clearFilters = () => setSecondaryFilters({})
  const activeSecondaryCount = Object.values(secondaryFilters).filter(Boolean).length

  return (
    <div className="bfr">
      {/* STEP 1 */}
      <section className="bfr-sec">
        <div className="bfr-num-col"><div className={`bfr-circ ${completedStep1 ? 'done' : 'active'}`}>{completedStep1 ? '✓' : '1'}</div><div className={`bfr-line ${completedStep1 ? 'filled' : ''}`} /></div>
        <div className="bfr-main bfr-s1-center">
          <div className="bfr-s1-card">
            <span className="bfr-tag">Patient Intake</span>
            <h1 className="bfr-h1">What do you need?</h1>
            <p className="bfr-p">Select the option that best describes your situation.</p>
            <div className="bfr-choices">
              <button className={`bfr-choice ${needType === 'diagnosis' ? 'on' : ''}`} onClick={() => setNeedType('diagnosis')}>
                <div className="bfr-choice-i"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></div>
                <div className="bfr-choice-t"><strong>I have a diagnosis</strong><span>Follow-up on an existing condition or referral.</span></div>
              </button>
              <button className={`bfr-choice ${needType === 'service' ? 'on' : ''}`} onClick={() => setNeedType('service')}>
                <div className="bfr-choice-i"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8M8 12h8" /></svg></div>
                <div className="bfr-choice-t"><strong>I need a specific service</strong><span>Looking for an X-ray, lab, vaccination, etc.</span></div>
              </button>
            </div>
            {needType && (
              <div className="bfr-inp-wrap fade-in">
                <label className="bfr-lbl">{needType === 'diagnosis' ? 'What is your condition or diagnosis?' : 'What healthcare service do you need?'}</label>
                <div className="bfr-sb-wrap">
                  <div className="bfr-sb">
                    <svg className="bfr-sb-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input className="bfr-sb-input" type="text" placeholder="Type here..." value={query} onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
                    <button className="bfr-sb-btn" disabled={!query.trim() || isClassifying} onClick={handleStep1Submit}>
                      {isClassifying ? 'Routing...' : 'Confirm & Route'}
                    </button>
                  </div>
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="bfr-ac">{filteredSuggestions.slice(0, 6).map(s => <button key={s} className="bfr-ac-item" onMouseDown={() => { setQuery(s); setShowSuggestions(false) }}>{s}</button>)}</div>
                  )}
                </div>
                {classification && <div className="bfr-cls fade-in"><strong>{classification.title}</strong><span>{classification.class} · {classification.risk}</span></div>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STEP 2 */}
      <section className={`bfr-sec ${completedStep1 ? '' : 'locked'}`} ref={step2Ref}>
        <div className="bfr-num-col"><div className={`bfr-circ ${completedStep2 ? 'done' : completedStep1 ? 'active' : ''}`}>{completedStep2 ? '✓' : '2'}</div><div className={`bfr-line ${completedStep2 ? 'filled' : ''}`} /></div>
        <div className="bfr-main">
          {classification && (
            <div className="bfr-dept-banner">
              <div className="bfr-dept-icon"><svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></div>
              <div className="bfr-dept-text"><span className="bfr-dept-label">Recommended Department</span><strong className="bfr-dept-name">{classification.class}</strong></div>
              <span className="bfr-dept-badge">{classification.risk}</span>
            </div>
          )}
          <span className="bfr-tag">Facility Routing</span>
          <h1 className="bfr-h1">Locate a Facility</h1>
          <div className="bfr-locbar">
            <div className="bfr-locbar-inner">
              <input className="bfr-locbar-input" type="text" placeholder="Type location..." value={locationText} onChange={e => { setLocationText(e.target.value); setShowLocSuggestions(true) }} onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)} readOnly={locationSet} />
              {!locationSet ? (
                <button className="bfr-locbar-gps" onClick={handleUseCurrentLocation} disabled={isLocating}>{isLocating ? 'Locating...' : 'Use GPS'}</button>
              ) : (
                <button className="bfr-locbar-change" onClick={() => { setLocationSet(false); setLocationText('') }}>Change</button>
              )}
            </div>
            {showLocSuggestions && locationSuggestions.length > 0 && (
              <div className="bfr-loc-ac">{locationSuggestions.map(f => <button key={f.id} className="bfr-loc-ac-item" onMouseDown={() => handleSelectLocationSuggestion(f)}><strong>{f.name}</strong><span>{f.address}</span></button>)}</div>
            )}
          </div>

          <div className="bfr-filter-bar">
            <div className="bfr-pills">
              <button className={`bfr-pill ${primarySort === 'best' ? 'on' : ''}`} onClick={() => setPrimarySort('best')}>Best Match</button>
              <button className={`bfr-pill ${primarySort === 'nearest' ? 'on' : ''}`} onClick={() => setPrimarySort('nearest')}>Nearest</button>
              <button className={`bfr-pill ${primarySort === 'free' ? 'on' : ''}`} onClick={() => setPrimarySort('free')}>Free Services</button>
            </div>
            <button className="bfr-mf-btn" onClick={() => setShowFilters(!showFilters)}>Filters {activeSecondaryCount > 0 && `(${activeSecondaryCount})`}</button>
          </div>

          <div className="bfr-s2-grid">
            <div className="bfr-map-area">
              <div ref={mapContainerRef} className="bfr-map" />
              {showGastosPrompt && selectedFacility && (
                <div className="bfr-prompt fade-in">
                  <div className="bfr-prompt-card">
                    <h4>{selectedFacility.name}</h4>
                    <button className="bfr-pri-btn" onClick={handleGoToStep3}>Compute Travel & Gastos</button>
                    <button className="bfr-ghost-btn" onClick={() => setShowGastosPrompt(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
            <div className="bfr-flist">
              {visibleFacilities.map(f => (
                <button key={f.id} className={`bfr-fc ${selectedFacility?.id === f.id ? 'on' : ''}`} onClick={() => { setSelectedFacility(f); setShowGastosPrompt(true); mapRef.current?.setView([f.lat, f.lng], 15) }}>
                  <div className="bfr-fc-mid"><h4>{f.name}</h4><p>{f.address}</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STEP 3 */}
      <section className={`bfr-sec ${completedStep2 ? '' : 'locked'}`} ref={step3Ref}>
        <div className="bfr-num-col"><div className={`bfr-circ ${commutePlan ? 'done' : completedStep2 ? 'active' : ''}`}>3</div><div className={`bfr-line ${completedStep3 ? 'filled' : ''}`} /></div>
        <div className="bfr-main">
          <span className="bfr-tag">Commute & Expenses</span>
          <h1 className="bfr-h1">Travel & Gastos</h1>
          {isPlanning ? <div className="bfr-loading">Planning route...</div> : commutePlan && (
            <div className="bfr-s3-grid fade-in">
              <div className="bfr-receipt">
                <div className="bfr-rh"><h2>{selectedFacility?.name}</h2></div>
                <div className="bfr-stepper">
                  {commutePlan.legs.map((l, i) => (
                    <div key={i} className="bfr-step-node">
                      <div className="bfr-step-body"><strong>{l.mode}</strong>: {l.instruction} (₱{l.fare})</div>
                    </div>
                  ))}
                </div>
                <div className="bfr-rtotals"><strong>Total: ₱{commutePlan.totalFare}</strong><button className="bfr-pri-btn" onClick={() => setCompletedStep3(true)}>Checklist</button></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STEP 4 */}
      <section className={`bfr-sec ${completedStep3 ? '' : 'locked'}`} ref={step4Ref}>
        <div className="bfr-num-col"><div className="bfr-circ active">4</div></div>
        <div className="bfr-main">
          <span className="bfr-tag">Preparation</span>
          <h1 className="bfr-h1">Requirements Checklist</h1>
          <DocumentChecklist isPGH={!!selectedFacility?.name.includes('Philipphe General')} userLat={userLat} userLng={userLng} />
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .bfr { margin: -48px; font-family: 'Inter', sans-serif; }
        .bfr-sec { height: 100vh; display: flex; padding: 40px 48px; gap: 24px; box-sizing: border-box; transition: opacity .4s; overflow: hidden; }
        .bfr-sec.locked { opacity: 0.15; pointer-events: none; filter: blur(3px); }
        .bfr-num-col { display: flex; flex-direction: column; align-items: center; width: 44px; flex-shrink: 0; }
        .bfr-circ { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 2px solid var(--border); background: #fff; }
        .bfr-circ.active { background: var(--text-primary); color: #fff; border-color: var(--text-primary); }
        .bfr-circ.done { background: var(--primary); color: #fff; border-color: var(--primary); }
        .bfr-line { flex: 1; width: 2px; background: var(--border-light); margin-top: 10px; }
        .bfr-line.filled { background: var(--primary); }
        .bfr-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .bfr-tag { font-size: 0.7rem; text-transform: uppercase; color: var(--primary); background: var(--primary-light); padding: 4px 12px; border-radius: 20px; width: fit-content; margin-bottom: 12px; font-weight: 700; }
        .bfr-h1 { font-size: 2.5rem; font-weight: 800; margin: 0 0 10px; color: var(--text-primary); }
        .bfr-p { color: var(--text-secondary); margin-bottom: 24px; }
        .bfr-s1-center { justify-content: center; align-items: center; }
        .bfr-s1-card { width: 100%; max-width: 720px; }
        .bfr-choices { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .bfr-choice { display: flex; align-items: center; gap: 20px; padding: 24px; background: #fff; border: 1.5px solid var(--border-light); border-radius: 16px; cursor: pointer; text-align: left; width: 100%; }
        .bfr-choice.on { border-color: var(--primary); background: rgba(126,38,37, 0.02); }
        .bfr-choice-i { width: 50px; height: 50px; background: var(--bg-muted); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .bfr-inp-wrap { background: var(--bg-muted); padding: 24px; border-radius: 16px; }
        .bfr-sb { display: flex; background: #fff; border-radius: 40px; padding: 6px 6px 6px 20px; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .bfr-sb-input { flex: 1; border: none; outline: none; padding: 8px 0; font-size: 1rem; }
        .bfr-sb-btn { background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 40px; font-weight: 700; cursor: pointer; }
        .bfr-ac { background: #fff; border: 1px solid var(--border-light); border-radius: 12px; margin-top: 4px; overflow: hidden; }
        .bfr-ac-item { width: 100%; padding: 12px 20px; text-align: left; border: none; background: transparent; cursor: pointer; border-bottom: 1px solid var(--bg-muted); }
        .bfr-dept-banner { display: flex; align-items: center; gap: 12px; background: var(--primary); color: #fff; padding: 12px 20px; border-radius: 12px; margin-bottom: 16px; max-width: 400px; }
        .bfr-locbar { position: relative; margin-bottom: 16px; }
        .bfr-locbar-inner { display: flex; background: #fff; border: 1.5px solid var(--border-light); border-radius: 12px; padding: 8px 12px; align-items: center; gap: 10px; max-width: 500px; }
        .bfr-locbar-input { flex: 1; border: none; outline: none; }
        .bfr-filter-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }
        .bfr-pills { display: flex; gap: 8px; }
        .bfr-pill { padding: 8px 16px; border-radius: 30px; border: 1.5px solid var(--border-light); background: #fff; cursor: pointer; font-weight: 600; font-size: 0.8rem; }
        .bfr-pill.on { background: var(--primary); color: #fff; border-color: var(--primary); }
        .bfr-s2-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; flex: 1; min-height: 0; }
        .bfr-map-area { position: relative; border-radius: 16px; overflow: hidden; background: #eee; }
        .bfr-map { width: 100%; height: 100%; }
        .bfr-flist { overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
        .bfr-fc { padding: 16px; background: #fff; border: 1.5px solid var(--border-light); border-radius: 12px; text-align: left; cursor: pointer; }
        .bfr-fc.on { border-color: var(--primary); box-shadow: 0 4px 12px rgba(126,38,37, 0.1); }
        .bfr-prompt { position: absolute; bottom: 16px; left: 16px; right: 16px; background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 1000; }
        .bfr-pri-btn { background: var(--primary); color: #fff; border: none; padding: 10px 20px; border-radius: 30px; font-weight: 700; cursor: pointer; }
        .bfr-ghost-btn { background: transparent; border: 1.5px solid var(--border); padding: 10px 20px; border-radius: 30px; cursor: pointer; margin-left: 8px; }
        .bfr-pulse-ring { width: 40px; height: 40px; border-radius: 50%; background: rgba(66,133,244, 0.3); animation: bpulse 2s infinite; }
        @keyframes bpulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
        .fade-in { animation: bfade 0.3s ease-out; }
        @keyframes bfade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  )
}
