'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  const routeMapRef = useRef<any>(null)

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

  // ── Filtering + Sorting Engine ──
  // Design: Secondary checkbox filters are HARD filters (remove facilities).
  //         Medical need matching is SOFT (scores for sorting, never removes).
  //         All facilities always show unless explicitly filtered by user checkboxes.
  const getFilteredFacilities = useCallback(() => {
    if (!locationSet || userLat === null || userLng === null) return []
    let list = [...FACILITIES]

    // 1. Hard filters — only user-selected checkbox filters remove facilities
    Object.entries(secondaryFilters).forEach(([key, active]) => {
      if (!active) return
      const def = SECONDARY_FILTERS.find(f => f.key === key)
      if (def) list = list.filter(f => (f as any)[def.field] === true)
    })

    // 2. Compute relevance score for EVERY facility (never remove based on score)
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

          // Exact full-string match (highest confidence)
          if (queryLower && svcLower === queryLower) { score += 5; return }

          // Direct match: need string contains the full service name
          if (need.includes(svcLower)) { score += 3; return }

          // Reverse match: service name contains the full query
          if (queryLower.length >= 3 && svcLower.includes(queryLower)) { score += 3; return }

          // Token-level match: keywords from the need match parts of the service
          const svcTokens = svcLower.split(/[\s,/()·\-]+/).filter(t => t.length >= 3)
          for (const nt of needTokens) {
            if (svcLower.includes(nt) || svcTokens.some(st => nt.includes(st) || st.includes(nt))) {
              score += 1
              break
            }
          }
        })

        // Tag matching for classification risk level (e.g., "Tertiary", "Level III")
        if (classification?.risk) {
          const riskLower = classification.risk.toLowerCase()
          f.tags.forEach(tag => {
            const tagLower = tag.toLowerCase()
            if (riskLower.includes(tagLower) || tagLower.includes(riskLower)) {
              score += 1
            }
          })
        }
      }

      const dist = haversineKm(userLat, userLng, f.lat, f.lng)
      return { ...f, _score: score, _dist: dist }
    })

    // 3. Sort based on selected mode
    if (primarySort === 'nearest') {
      // Progressive distance: start at 1hr travel (10km), expand by 1hr until facilities found
      const sorted = scored.sort((a, b) => a._dist - b._dist)
      for (let hours = 1; hours <= 5; hours++) {
        const threshold = TRAVEL_SPEED_KM_PER_HR * hours
        const nearby = sorted.filter(f => f._dist <= threshold)
        if (nearby.length > 0) return nearby
      }
      // Fallback: if nothing within 5hrs, show all
      return sorted
    } else if (primarySort === 'free') {
      // Free/government facilities: BHCs, Konsulta, Malasakit Center, DOH-retained, City-run
      return scored
        .filter(f =>
          f.isBHC ||
          f.isPhilHealthKonsulta ||
          f.hasMalasakitCenter ||
          f.tags.some(t => t === 'DOH' || t === 'City-run')
        )
        .sort((a, b) => a._dist - b._dist)
    } else {
      // "Best for My Need" — sort by relevance score first, then distance as tiebreaker
      let bestList = scored;
      // Filter based on if they actually provide that service or not
      if (query || classification) {
        bestList = bestList.filter(f => f._score > 0);
      }
      return bestList.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score
        return a._dist - b._dist
      })
    }
  }, [primarySort, secondaryFilters, classification, query, userLat, userLng, locationSet])

  const visibleFacilities = getFilteredFacilities()

  // ── Leaflet & Global Init ──
  useEffect(() => {
    // Warm-up API ping to Gemini to prevent cold-starts during demo
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

    // Click-to-pin location
    map.on('click', (e: any) => {
      if (locationSet) return
      const { lat, lng } = e.latlng
      placeUserMarker(lat, lng)
      setLocationText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    })

    mapRef.current = map
  }, [])

  const placeUserMarker = useCallback((lat: number, lng: number) => {
    const L = window.L; const map = mapRef.current
    if (!L || !map) return
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current)
    if (pulseMarkerRef.current) map.removeLayer(pulseMarkerRef.current)

    const pulseIcon = L.divIcon({
      className: 'bfr-pulse-wrap',
      html: `<div class="bfr-pulse-ring"></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })
    pulseMarkerRef.current = L.marker([lat, lng], { icon: pulseIcon, interactive: false }).addTo(map)

    userMarkerRef.current = L.circleMarker([lat, lng], {
      radius: 10,
      color: '#fff',
      fillColor: '#4285f4',
      fillOpacity: 1,
      weight: 4,
    })
      .addTo(map)
      .bindTooltip('Your Location', { permanent: true, direction: 'top', offset: [0, -14], className: 'bfr-user-tip' })

    const nearbyBounds = L.latLngBounds([[lat, lng]])
    let countNearby = 0
    FACILITIES.forEach(f => {
      if (haversineKm(lat, lng, f.lat, f.lng) < 5 && countNearby < 15) {
        nearbyBounds.extend([f.lat, f.lng])
        countNearby++
      }
    })
    if (countNearby > 0) {
      map.fitBounds(nearbyBounds, { padding: [50, 50], maxZoom: 13 })
    } else {
      map.setView([lat, lng], 12)
    }

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

  const handleConfirmPinnedLocation = () => {
    if (userLat !== null && userLng !== null) setLocationSet(true)
  }

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

      const marker = L.marker([f.lat, f.lng], { icon })
        .addTo(map)
        .bindTooltip(`<div style="font-family:Inter,sans-serif"><div style="font-size:11px;font-weight:700;margin-bottom:1px">${f.name}</div><div style="font-size:10px;color:#666">${reason}</div></div>`, { direction: 'top', offset: [0, -4], className: 'bfr-tooltip' })
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

      {/* ═══════ STEP 1 ═══════ */}
      <section className="bfr-sec">
        <div className="bfr-num-col"><div className={`bfr-circ ${completedStep1 ? 'done' : 'active'}`}>{completedStep1 ? <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> : '1'}</div><div className={`bfr-line ${completedStep1 ? 'filled' : ''}`} /></div>
        <div className="bfr-main bfr-s1-center">
          <div className="bfr-s1-card">
            <span className="bfr-tag">Patient Intake</span>
            <h1 className="bfr-h1">What do you need?</h1>
            <p className="bfr-p">Select the option that best describes your situation.</p>
            <div className="bfr-choices">
              <button className={`bfr-choice ${needType === 'diagnosis' ? 'on' : ''}`} onClick={() => setNeedType('diagnosis')}><div className="bfr-choice-i"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></div><div className="bfr-choice-t"><strong>I have a diagnosis</strong><span>Follow-up on an existing condition or referral.</span></div>{needType === 'diagnosis' && <svg className="bfr-chk" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}</button>
              <button className={`bfr-choice ${needType === 'service' ? 'on' : ''}`} onClick={() => setNeedType('service')}><div className="bfr-choice-i"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8M8 12h8" /></svg></div><div className="bfr-choice-t"><strong>I need a specific service</strong><span>Looking for an X-ray, lab, vaccination, etc.</span></div>{needType === 'service' && <svg className="bfr-chk" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}</button>
            </div>
            {needType && (
              <div className="bfr-inp-wrap fade-in">
                <label className="bfr-lbl">{needType === 'diagnosis' ? 'What is your condition or diagnosis?' : 'What healthcare service do you need?'}</label>
                <div className="bfr-sb-wrap">
                  <div className="bfr-sb">
                    <svg className="bfr-sb-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input className="bfr-sb-input" type="text" placeholder={needType === 'diagnosis' ? 'e.g., Hypertension, Suspected TB...' : 'e.g., Chest X-Ray, Blood extraction...'} value={query} onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }} onFocus={() => { if (query.trim()) setShowSuggestions(true) }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
                    <button className="bfr-sb-btn" disabled={!query.trim() || isClassifying || !!classification} onClick={handleStep1Submit}>
                      {isClassifying ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ animation: 'bspin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> : <>Confirm & Route<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>}
                    </button>
                  </div>
                  {showSuggestions && filteredSuggestions.length > 0 && (<div className="bfr-ac">{filteredSuggestions.slice(0, 6).map(s => (<button key={s} className="bfr-ac-item" onMouseDown={() => { setQuery(s); setShowSuggestions(false) }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>{s}</button>))}</div>)}
                </div>
                {classification && (<div className="bfr-cls fade-in"><svg width="18" height="18" fill="none" stroke="var(--success)" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg><div><strong>{classification.title}</strong><span>{classification.class} · {classification.risk}</span></div></div>)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ STEP 2 ═══════ */}
      <section className={`bfr-sec ${completedStep1 ? '' : 'locked'}`} ref={step2Ref}>
        <div className="bfr-num-col"><div className={`bfr-circ ${completedStep2 ? 'done' : completedStep1 ? 'active' : ''}`}>{completedStep2 ? <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> : '2'}</div><div className={`bfr-line ${completedStep2 ? 'filled' : ''}`} /></div>
        <div className="bfr-main">
          {/* ── DEPARTMENT BANNER (half-width) ── */}
          {classification && (
            <div className="bfr-dept-banner">
              <div className="bfr-dept-icon"><svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></div>
              <div className="bfr-dept-text">
                <span className="bfr-dept-label">Recommended Department</span>
                <strong className="bfr-dept-name">{classification.class}</strong>
              </div>
              <span className="bfr-dept-badge">{classification.risk}</span>
            </div>
          )}

          <span className="bfr-tag">Facility Routing</span>
          <h1 className="bfr-h1">Locate a Facility</h1>

          {/* ── LOCATION BAR ── */}
          <div className="bfr-locbar">
            <div className="bfr-locbar-inner">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <input className="bfr-locbar-input" type="text" placeholder="Type your location or click the map to pin..." value={locationText} onChange={e => { setLocationText(e.target.value); setShowLocSuggestions(true) }} onFocus={() => { if (locationText.trim().length > 1) setShowLocSuggestions(true) }} onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)} readOnly={locationSet} />
              {!locationSet ? (
                <>
                  <button className="bfr-locbar-gps" onClick={handleUseCurrentLocation} disabled={isLocating}>
                    {isLocating ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'bspin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> : <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg>Use GPS</>}
                  </button>
                  {userLat !== null && (
                    <button className="bfr-locbar-confirm" onClick={handleConfirmPinnedLocation}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      Confirm Pin
                    </button>
                  )}
                </>
              ) : (
                <button className="bfr-locbar-change" onClick={() => { setLocationSet(false); setLocationText('') }}>Change</button>
              )}
            </div>
            {showLocSuggestions && locationSuggestions.length > 0 && (
              <div className="bfr-loc-ac fade-in">
                {locationSuggestions.map(f => (
                  <button key={f.id} className="bfr-loc-ac-item" onMouseDown={() => handleSelectLocationSuggestion(f)}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <div className="bfr-loc-ac-text">
                      <strong>{f.name}</strong>
                      <span>{f.address} · {f.district}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!locationSet && !showLocSuggestions && <p className="bfr-locbar-hint">Set your location first — use GPS, type it, or click the map to drop a pin.</p>}
          </div>

          {/* ── FILTER PILLS ── */}
          {locationSet && (
            <div className="bfr-filter-bar fade-in">
              <div className="bfr-pills">
                <button className={`bfr-pill ${primarySort === 'best' ? 'on' : ''}`} onClick={() => setPrimarySort('best')}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  Best for My Need
                </button>
                <button className={`bfr-pill ${primarySort === 'nearest' ? 'on' : ''}`} onClick={() => setPrimarySort('nearest')}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  Near Me (≤1hr)
                </button>
                <button className={`bfr-pill ${primarySort === 'free' ? 'on' : ''}`} onClick={() => setPrimarySort('free')}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" /></svg>
                  Free Services
                </button>
              </div>
              <div className="bfr-mf-wrap">
                <button className="bfr-mf-btn" onClick={() => setShowFilters(!showFilters)}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
                  Filters {activeSecondaryCount > 0 && <span className="bfr-badge">{activeSecondaryCount}</span>}
                </button>
                {showFilters && (
                  <div className="bfr-mf-dd fade-in">
                    {SECONDARY_FILTERS.map(sf => (
                      <label key={sf.key} className="bfr-mf-item"><input type="checkbox" checked={!!secondaryFilters[sf.key]} onChange={() => toggleSecondary(sf.key)} /><span>{sf.label}</span></label>
                    ))}
                    {activeSecondaryCount > 0 && <button className="bfr-mf-clear" onClick={clearFilters}>Clear all</button>}
                  </div>
                )}
              </div>
              <span className="bfr-count">{visibleFacilities.length} of {FACILITIES.length} facilities</span>
            </div>
          )}

          {/* ── MAP + LIST GRID ── */}
          <div className="bfr-s2-grid">
            <div className="bfr-map-area">
              <div ref={mapContainerRef} className="bfr-map" />
              {showGastosPrompt && selectedFacility && (
                <div className="bfr-prompt fade-in">
                  <div className="bfr-prompt-card">
                    <h4>{selectedFacility.name}</h4>
                    <p>{selectedFacility.address}</p>
                    <span className="bfr-prompt-r">{((selectedFacility as any)._dist || (userLat && userLng ? haversineKm(userLat, userLng, selectedFacility.lat, selectedFacility.lng) : 0)).toFixed?.(1) || '?'} km · {selectedFacility.type} · {selectedFacility.services.slice(0, 3).join(', ')}</span>
                    <div className="bfr-prompt-btns">
                      <button className="bfr-pri-btn" onClick={handleGoToStep3}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" /></svg>Compute Travel & Gastos</button>
                      <button className="bfr-ghost-btn" onClick={() => setShowGastosPrompt(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {locationSet && visibleFacilities.length > 0 ? (
              <div className="bfr-flist fade-in">
                {visibleFacilities.map(f => {
                  const dist = ((f as any)._dist ?? 0).toFixed(1)
                  const estMin = Math.round(parseFloat(dist) / TRAVEL_SPEED_KM_PER_HR * 60)
                  return (
                    <button key={f.id} className={`bfr-fc ${selectedFacility?.id === f.id ? 'on' : ''}`} onClick={() => { setSelectedFacility(f); setShowGastosPrompt(true); mapRef.current?.setView([f.lat, f.lng], 15) }}>
                      <div className="bfr-fc-top"><span>{f.district}</span><span className={f.isBHC || f.isPhilHealthKonsulta || f.hasMalasakitCenter || f.tags.some(t => t === 'DOH' || t === 'City-run') ? 'free' : ''}>{f.isBHC ? '• FREE (BHC)' : f.hasMalasakitCenter ? '• GOV\'T FREE' : f.tags.some(t => t === 'DOH' || t === 'City-run') ? '• GOV\'T' : f.isPhilHealthAccredited ? '• PHILHEALTH' : '• PRIVATE'}</span></div>
                      <div className="bfr-fc-mid"><h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>{f.name} {!f.unverified && <span style={{ fontSize: '11px', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#ecfdf5', padding: '2px 6px', borderRadius: '12px', fontWeight: 600 }}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg> Verified</span>}</h4><p>{f.address}</p><div className="bfr-fc-meta"><span className="bfr-fc-dist">{dist} km</span><span className="bfr-fc-time">~{estMin} min</span></div><div className="bfr-fc-tags">{f.tags.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div></div>
                    </button>
                  )
                })}
              </div>
            ) : locationSet ? (
              <div className="bfr-flist"><div className="bfr-empty"><p>Walang nahanap na pasilidad.</p><button className="bfr-ghost-btn" onClick={clearFilters}>Clear filters</button></div></div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ═══════ STEP 3 ═══════ */}
      <section className={`bfr-sec ${completedStep2 ? '' : 'locked'}`} ref={step3Ref}>
        <div className="bfr-num-col"><div className={`bfr-circ ${commutePlan ? 'done' : completedStep2 ? 'active' : ''}`}>3</div></div>
        <div className="bfr-main">
          <span className="bfr-tag">Commute & Expenses</span>
          <h1 className="bfr-h1">Travel & Gastos</h1>
          <p className="bfr-p">AI-generated transit plan grounded in official LTFRB fare matrices.</p>
          {isPlanning && (<div className="bfr-loading"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ animation: 'bspin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg><strong>Analyzing Manila Transit</strong><span>Computing fare matrices…</span></div>)}
          {!isPlanning && commutePlan && selectedFacility && (
            <div className="bfr-s3-grid fade-in">
              {/* Left: Receipt with vertical stepper legs */}
              <div className="bfr-receipt">
                <div className="bfr-rh"><span className="bfr-rl">DESTINATION</span><h2>{selectedFacility.name}</h2><p>{selectedFacility.address}</p></div>

                {/* Vertical stepper legs */}
                <div className="bfr-stepper">
                  {/* Origin node */}
                  <div className="bfr-step-node">
                    <div className="bfr-step-dot origin"><svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg></div>
                    <div className="bfr-step-body"><strong className="bfr-step-title">Your Location</strong><span className="bfr-step-sub">{locationText || 'Pinned on map'}</span></div>
                  </div>

                  {commutePlan.legs.map((l, i) => {
                    const modeColor = MODE_COLORS[l.mode] || '#e67e22'
                    return (
                      <div key={i} className="bfr-step-node">
                        <div className="bfr-step-connector" style={{ background: modeColor }} />
                        <div className="bfr-step-dot leg" style={{ background: modeColor }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d={MODE_ICONS[l.mode] || MODE_ICONS['Jeepney']} fill="#fff" /></svg>
                        </div>
                        <div className="bfr-step-body">
                          <div className="bfr-step-head">
                            <span className="bfr-step-mode" style={{ background: `${modeColor}15`, color: modeColor }}>{l.mode}</span>
                            <span className="bfr-step-fare">₱ {l.fare.toFixed(2)}</span>
                          </div>
                          <span className="bfr-step-desc">{l.instruction}</span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Destination node */}
                  <div className="bfr-step-node">
                    <div className="bfr-step-connector dest" />
                    <div className="bfr-step-dot dest"><svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div>
                    <div className="bfr-step-body"><strong className="bfr-step-title">{selectedFacility.name}</strong><span className="bfr-step-sub">{selectedFacility.address}</span></div>
                  </div>
                </div>

                <div className="bfr-rtotals"><div><span className="bfr-rl">TRAVEL TIME</span><strong>{commutePlan.totalTime}</strong></div><div style={{ textAlign: 'right' }}><span className="bfr-rl">TOTAL GASTOS</span><strong className="bfr-rbig">₱ {commutePlan.totalFare.toFixed(2)}</strong></div></div>
                <div style={{ padding: '16px 22px' }}><button className="bfr-pri-btn" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }} onClick={() => { setCompletedStep3(true); setTimeout(() => step4Ref.current?.scrollIntoView({ behavior: 'smooth' }), 200) }}>Proceed to Document Checklist <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg></button></div>
              </div>

              {/* Right: Route Map */}
              <div className="bfr-route-map-area">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '12px' }}
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY || ''}&origin=${userLat},${userLng}&destination=${selectedFacility.lat},${selectedFacility.lng}&mode=transit`}
                  allowFullScreen>
                </iframe>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ STEP 4 ═══════ */}
      <section className={`bfr-sec ${completedStep3 ? '' : 'locked'}`} ref={step4Ref}>
        <div className="bfr-num-col"><div className="bfr-circ active">4</div></div>
        <div className="bfr-main">
          <span className="bfr-tag">Preparation</span>
          <h1 className="bfr-h1">Requirements Checklist</h1>
          <p className="bfr-p">Prepare these documents and requirements to ensure a smooth, free, or discounted service transaction.</p>

          <DocumentChecklist
            isPGH={Boolean(selectedFacility?.id === 'h4' || selectedFacility?.name.includes('Philippine General'))}
            userLat={userLat}
            userLng={userLng}
          />
        </div>
      </section>

      {/* ═══════ STYLES ═══════ */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .bfr{margin:-48px}
        .bfr-sec{height:100vh;display:flex;padding:40px 48px;gap:24px;box-sizing:border-box;transition:opacity .4s,filter .4s;overflow:hidden}
        .bfr-sec.locked{opacity:.15;pointer-events:none;filter:blur(3px)}
        .bfr-num-col{display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:44px;padding-top:2px}
        .bfr-circ{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;border:2px solid var(--border);color:var(--text-muted);background:#fff;transition:all .35s;flex-shrink:0}
        .bfr-circ.active{background:var(--text-primary);border-color:var(--text-primary);color:#fff}
        .bfr-circ.done{background:var(--primary);border-color:var(--primary);color:#fff}
        .bfr-line{flex:1;width:2px;background:var(--border-light);margin-top:10px;transition:background .4s}
        .bfr-line.filled{background:var(--primary)}
        .bfr-main{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden}
        .bfr-tag{display:inline-flex;align-items:center;gap:6px;font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;font-weight:700;color:var(--primary);background:var(--primary-light);padding:5px 14px;border-radius:20px;width:fit-content;margin-bottom:14px}
        .bfr-h1{font-family:'Inter',-apple-system,sans-serif;font-size:2.5rem;font-weight:800;color:var(--text-primary);margin:0 0 10px;line-height:1.1;letter-spacing:-.03em}
        .bfr-p{font-size:.9375rem;color:var(--text-secondary);line-height:1.6;margin:0 0 28px;max-width:560px}

        /* ── Step 1 centered container — LARGER ── */
        .bfr-s1-center{justify-content:center;align-items:center}
        .bfr-s1-card{width:100%;max-width:720px;text-align:left}

        .bfr-choices{display:flex;flex-direction:column;gap:16px;margin-bottom:28px}
        .bfr-choice{display:flex;align-items:center;gap:22px;width:100%;text-align:left;padding:26px 30px;background:#fff;border:1.5px solid var(--border-light);border-radius:18px;cursor:pointer;transition:all .2s;font-family:inherit}
        .bfr-choice:hover{border-color:rgba(126,38,37,.25)}
        .bfr-choice.on{border-color:var(--primary);background:rgba(126,38,37,.02)}
        .bfr-choice-i{width:62px;height:62px;border-radius:16px;background:var(--bg-muted);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .bfr-choice.on .bfr-choice-i{background:var(--primary-light)}
        .bfr-choice-t{flex:1}
        .bfr-choice-t strong{display:block;font-size:1.125rem;font-weight:700;color:var(--text-primary);margin-bottom:4px}
        .bfr-choice-t span{font-size:.9rem;color:var(--text-secondary)}
        .bfr-chk{color:var(--primary);flex-shrink:0}

        .bfr-inp-wrap{background:var(--bg-muted);border-radius:18px;padding:26px 30px}
        .bfr-lbl{display:block;font-weight:700;font-size:.8125rem;color:var(--text-primary);margin-bottom:14px}
        .bfr-sb-wrap{position:relative}
        .bfr-sb{display:flex;align-items:center;background:#fff;border-radius:48px;padding:6px 6px 6px 20px;box-shadow:0 2px 8px rgba(61,27,17,.04)}
        .bfr-sb-icon{color:var(--text-muted);flex-shrink:0;margin-right:12px}
        .bfr-sb-input{flex:1;border:none;outline:none;background:transparent;font-size:.9375rem;color:var(--text-primary);font-family:'Inter',sans-serif;min-width:0;padding:6px 0}
        .bfr-sb-input::placeholder{color:var(--text-muted)}
        .bfr-sb-btn{display:inline-flex;align-items:center;gap:7px;background:var(--primary);color:#fff;border:none;border-radius:40px;padding:13px 24px;font-weight:700;font-size:.8125rem;cursor:pointer;transition:background .2s;white-space:nowrap;font-family:'Inter',sans-serif}
        .bfr-sb-btn:hover{background:var(--primary-hover)}.bfr-sb-btn:disabled{opacity:.45;cursor:not-allowed}
        .bfr-ac{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border-radius:12px;box-shadow:0 8px 28px rgba(61,27,17,.1);overflow:hidden;z-index:50;border:1px solid var(--border-light)}
        .bfr-ac-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:12px 20px;border:none;background:transparent;font-size:.875rem;color:var(--text-secondary);cursor:pointer;transition:all .15s;border-bottom:1px solid rgba(61,27,17,.04);font-family:'Inter',sans-serif}
        .bfr-ac-item:last-child{border-bottom:none}.bfr-ac-item:hover{background:var(--bg-muted);color:var(--text-primary)}
        .bfr-cls{display:flex;align-items:center;gap:12px;margin-top:14px;padding:14px 20px;background:#fff;border-radius:12px;border:1px solid var(--success-border)}
        .bfr-cls div{display:flex;flex-direction:column;gap:2px}.bfr-cls strong{font-size:.875rem;color:var(--text-primary)}.bfr-cls span{font-size:.75rem;color:var(--text-secondary)}

        /* ── DEPARTMENT BANNER (half-width) ── */
        .bfr-dept-banner{display:flex;align-items:center;gap:14px;padding:14px 20px;background:var(--primary);border-radius:14px;margin-bottom:16px;color:#fff;max-width:50%}
        .bfr-dept-icon{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .bfr-dept-text{flex:1;display:flex;flex-direction:column;gap:1px;min-width:0}
        .bfr-dept-label{font-size:.5625rem;text-transform:uppercase;letter-spacing:.1em;font-weight:600;opacity:.7}
        .bfr-dept-name{font-size:1.125rem;font-weight:800;letter-spacing:-.01em}
        .bfr-dept-badge{font-size:.625rem;font-weight:700;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,.2);white-space:nowrap}

        /* ── LOCATION BAR ── */
        .bfr-locbar{margin-bottom:12px;position:relative}
        .bfr-locbar-inner{display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid var(--border-light);border-radius:14px;padding:8px 10px 8px 16px;max-width:calc(100% - 274px)}
        .bfr-locbar-input{flex:1;border:none;outline:none;background:transparent;font-size:.8125rem;color:var(--text-primary);font-family:'Inter',sans-serif}
        .bfr-locbar-input::placeholder{color:var(--text-muted)}
        .bfr-locbar-gps,.bfr-locbar-confirm{display:inline-flex;align-items:center;gap:5px;padding:8px 14px;border-radius:10px;border:none;font-size:.6875rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;white-space:nowrap}
        .bfr-locbar-gps{background:var(--bg-muted);color:var(--primary)}.bfr-locbar-gps:hover{background:var(--primary-light)}
        .bfr-locbar-gps:disabled{opacity:.5;cursor:not-allowed}
        .bfr-locbar-confirm{background:var(--primary);color:#fff}.bfr-locbar-confirm:hover{background:var(--primary-hover)}
        .bfr-locbar-change{padding:8px 14px;border-radius:10px;border:1.5px solid var(--border);background:transparent;font-size:.6875rem;font-weight:600;cursor:pointer;color:var(--text-secondary);font-family:'Inter',sans-serif}
        .bfr-locbar-hint{font-size:.6875rem;color:var(--text-muted);margin:6px 0 0 4px;font-style:italic}

        /* ── Location autocomplete ── */
        .bfr-loc-ac{position:absolute;top:100%;left:0;max-width:calc(100% - 274px);width:100%;background:#fff;border-radius:12px;box-shadow:0 8px 28px rgba(61,27,17,.12);border:1px solid var(--border-light);z-index:60;overflow:hidden;margin-top:4px}
        .bfr-loc-ac-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 16px;border:none;background:transparent;cursor:pointer;transition:all .15s;border-bottom:1px solid rgba(61,27,17,.04);font-family:'Inter',sans-serif}
        .bfr-loc-ac-item:last-child{border-bottom:none}
        .bfr-loc-ac-item:hover{background:var(--bg-muted)}
        .bfr-loc-ac-item svg{color:var(--primary);flex-shrink:0}
        .bfr-loc-ac-text{display:flex;flex-direction:column;gap:1px;min-width:0}
        .bfr-loc-ac-text strong{font-size:.75rem;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bfr-loc-ac-text span{font-size:.625rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

        /* ── FILTER PILLS ── */
        .bfr-filter-bar{display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;position:relative;z-index:10;background:var(--bg);padding:8px 14px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.05);border:1px solid var(--border-light);flex-shrink:0}
        .bfr-pills{display:flex;gap:6px}
        .bfr-pill{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:32px;border:1.5px solid var(--border);background:#fff;font-size:.75rem;font-weight:600;color:var(--text-secondary);cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
        .bfr-pill:hover{background:var(--bg-muted)}.bfr-pill.on{background:var(--primary);border-color:var(--primary);color:#fff}
        .bfr-mf-wrap{position:relative;margin-left:4px}
        .bfr-mf-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:32px;border:1.5px solid var(--border);background:#fff;font-size:.75rem;font-weight:600;color:var(--text-secondary);cursor:pointer;font-family:'Inter',sans-serif}
        .bfr-mf-btn:hover{background:var(--bg-muted)}
        .bfr-badge{background:var(--primary);color:#fff;font-size:.5625rem;padding:1px 6px;border-radius:10px;font-weight:700}
        .bfr-mf-dd{position:absolute;top:calc(100% + 6px);right:0;width:220px;background:#fff;border-radius:14px;box-shadow:0 8px 28px rgba(61,27,17,.12);border:1px solid var(--border-light);padding:6px 0;z-index:50}
        .bfr-mf-item{display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:.6875rem;color:var(--text-secondary);cursor:pointer;transition:background .15s}
        .bfr-mf-item:hover{background:var(--bg-muted)}.bfr-mf-item input[type="checkbox"]{accent-color:var(--primary);width:14px;height:14px}.bfr-mf-item span{flex:1}
        .bfr-mf-clear{width:100%;padding:8px 14px;text-align:center;font-size:.625rem;font-weight:700;color:var(--primary);background:transparent;border:none;border-top:1px solid var(--border-light);cursor:pointer;font-family:'Inter',sans-serif}
        .bfr-count{font-size:.6875rem;color:var(--text-muted);font-weight:600;margin-left:auto}

        /* ── GRID: map-first, list-sidebar ── */
        .bfr-s2-grid{display:grid;grid-template-columns:1fr 260px;gap:14px;flex:1;min-height:0;overflow:hidden}
        .bfr-map-area{position:relative;border-radius:14px;overflow:hidden;min-height:0}
        .bfr-map{width:100%;height:100%;z-index:1}
        .bfr-flist{display:flex;flex-direction:column;gap:6px;overflow-y:auto;padding-right:4px}
        .bfr-fc{width:100%;text-align:left;background:#fff;border:1.5px solid var(--border-light);border-radius:10px;overflow:hidden;cursor:pointer;transition:all .2s;font-family:inherit;flex-shrink:0}
        .bfr-fc:hover{border-color:var(--border)}.bfr-fc.on{border-color:var(--primary);box-shadow:0 2px 12px rgba(126,38,37,.08)}
        .bfr-fc-top{display:flex;justify-content:space-between;padding:6px 12px;border-bottom:1px solid var(--border-light);font-size:.4375rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--text-muted)}
        .bfr-fc-top .free{color:var(--success)}
        .bfr-fc-mid{padding:10px 12px}
        .bfr-fc-mid h4{font-size:.75rem;font-weight:700;margin:0 0 2px;color:var(--text-primary)}
        .bfr-fc-mid p{font-size:.5625rem;color:var(--text-secondary);margin:0 0 6px}
        .bfr-fc-meta{display:flex;gap:8px;margin-bottom:6px}
        .bfr-fc-dist{font-size:.5625rem;font-weight:700;color:var(--primary);background:var(--primary-light);padding:2px 8px;border-radius:20px}
        .bfr-fc-time{font-size:.5625rem;font-weight:600;color:var(--text-muted);background:var(--bg-muted);padding:2px 8px;border-radius:20px}
        .bfr-fc-tags{display:flex;gap:3px;flex-wrap:wrap}
        .bfr-fc-tags span{font-size:.4375rem;padding:1px 6px;border-radius:20px;background:var(--bg-muted);color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:.04em}

        .bfr-empty{padding:24px;text-align:center}.bfr-empty p{font-size:.8125rem;color:var(--text-secondary);margin:0 0 10px}

        .bfr-prompt{position:absolute;bottom:14px;left:14px;right:14px;z-index:20}
        .bfr-prompt-card{background:#fff;border-radius:14px;padding:16px 18px;box-shadow:0 6px 24px rgba(0,0,0,.15)}
        .bfr-prompt-card h4{font-size:.875rem;font-weight:800;margin:0 0 2px;color:var(--text-primary)}
        .bfr-prompt-card p{font-size:.6875rem;color:var(--text-secondary);margin:0 0 4px}
        .bfr-prompt-r{font-size:.625rem;color:var(--primary);font-weight:600;display:block;margin-bottom:10px}
        .bfr-prompt-btns{display:flex;gap:8px}
        .bfr-pri-btn{display:inline-flex;align-items:center;gap:6px;background:var(--primary);color:#fff;border:none;border-radius:40px;padding:9px 18px;font-weight:700;font-size:.6875rem;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
        .bfr-pri-btn:hover{background:var(--primary-hover)}.bfr-pri-btn:disabled{opacity:.35;cursor:not-allowed}
        .bfr-ghost-btn{background:transparent;border:1.5px solid var(--border);border-radius:40px;padding:9px 14px;font-weight:600;font-size:.6875rem;cursor:pointer;color:var(--text-secondary);font-family:'Inter',sans-serif;transition:all .2s}
        .bfr-ghost-btn:hover{background:var(--bg-muted)}

        /* ═══════ STEP 3 — REDESIGNED ═══════ */
        .bfr-loading{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center}
        .bfr-loading strong{font-size:1rem;font-weight:800;color:var(--text-primary)}.bfr-loading span{font-size:.75rem;color:var(--text-secondary)}

        /* Grid: receipt left + map right */
        .bfr-s3-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;flex:1;min-height:0;overflow:hidden}

        .bfr-receipt{background:#fff;border-radius:16px;border:1.5px solid var(--border-light);box-shadow:0 4px 20px rgba(61,27,17,.04);overflow-y:auto;display:flex;flex-direction:column}
        .bfr-rh{padding:18px 22px;border-bottom:1px dashed var(--border-light);flex-shrink:0}
        .bfr-rl{font-size:.5rem;text-transform:uppercase;letter-spacing:.1em;font-weight:700;color:var(--text-muted);display:block;margin-bottom:3px}
        .bfr-rh h2{font-size:1.25rem;font-weight:800;color:var(--primary);margin:0 0 2px}.bfr-rh p{font-size:.6875rem;color:var(--text-secondary);margin:0}

        /* ── Vertical stepper ── */
        .bfr-stepper{padding:16px 22px;flex:1;display:flex;flex-direction:column}
        .bfr-step-node{position:relative;display:flex;align-items:flex-start;gap:14px;padding-bottom:0}
        .bfr-step-connector{position:absolute;left:16px;top:-2px;width:3px;height:calc(100% + 2px);border-radius:2px;z-index:0}
        .bfr-step-connector.dest{background:var(--primary)!important}
        .bfr-step-dot{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.12)}
        .bfr-step-dot.origin{background:#4285f4}
        .bfr-step-dot.dest{background:var(--primary)}
        .bfr-step-dot.leg{border:3px solid #fff}
        .bfr-step-body{flex:1;padding-bottom:18px;min-width:0}
        .bfr-step-title{font-size:.8125rem;font-weight:700;color:var(--text-primary);display:block}
        .bfr-step-sub{font-size:.6875rem;color:var(--text-secondary);display:block;margin-top:1px}
        .bfr-step-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
        .bfr-step-mode{font-size:.6875rem;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-block}
        .bfr-step-fare{font-size:.875rem;font-weight:800;color:var(--text-primary)}
        .bfr-step-desc{font-size:.6875rem;color:var(--text-secondary);line-height:1.55;display:block}

        .bfr-rtotals{display:flex;justify-content:space-between;align-items:flex-end;padding:16px 22px;background:var(--bg-muted);border-top:1px solid var(--border-light);flex-shrink:0}
        .bfr-rtotals>div{display:flex;flex-direction:column;gap:3px}.bfr-rtotals strong{font-size:.9375rem;font-weight:800}
        .bfr-rbig{font-size:1.375rem!important;color:var(--primary)}

        /* ── Route Map (right side) ── */
        .bfr-route-map-area{border-radius:16px;overflow:hidden;position:relative;min-height:0;display:flex;flex-direction:column}
        .bfr-route-map{flex:1;min-height:300px;z-index:1}
        .bfr-route-legend{display:flex;gap:10px;padding:8px 14px;background:#fff;border-top:1px solid var(--border-light);flex-shrink:0;flex-wrap:wrap}
        .bfr-legend-item{display:inline-flex;align-items:center;gap:6px;font-size:.625rem;font-weight:700;color:var(--text-secondary);font-family:'Inter',sans-serif}
        .bfr-legend-line{width:22px;height:4px;border-radius:2px;display:inline-block}
        .bfr-route-marker{background:transparent!important;border:none!important}

        /* ── Leaflet overrides ── */
        .bfr-marker{background:transparent!important;border:none!important}
        .leaflet-tooltip{border-radius:8px!important;padding:7px 10px!important;box-shadow:0 4px 12px rgba(0,0,0,.12)!important;border:1px solid var(--border-light)!important;font-family:'Inter',sans-serif!important}
        .bfr-user-tip{background:#4285f4!important;color:#fff!important;border:none!important;font-weight:700!important;font-size:10px!important}
        .bfr-user-tip::before{border-top-color:#4285f4!important}

        /* ── Pulsing GPS marker ── */
        .bfr-pulse-wrap{background:transparent!important;border:none!important}
        .bfr-pulse-ring{width:40px;height:40px;border-radius:50%;background:rgba(66,133,244,.25);animation:bpulse 2s ease-out infinite}
        @keyframes bpulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}

        .fade-in{animation:bfade .3s ease-out forwards}
        @keyframes bfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bspin{to{transform:rotate(360deg)}}

        /* ── Step 4 ── */
        .bfr-docs-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;width:100%;max-width:900px}
        .bfr-doc-card{background:#fff;border-radius:16px;border:1.5px solid var(--border-light);box-shadow:0 4px 20px rgba(61,27,17,.04);padding:24px;display:flex;flex-direction:column}
        .bfr-doc-card.pgh{border-color:var(--primary);background:rgba(126,38,37,.02)}
        .bfr-doc-h{display:flex;align-items:center;gap:12px;margin-bottom:20px}
        .bfr-doc-i{width:40px;height:40px;border-radius:12px;background:var(--bg-muted);color:var(--text-primary);display:flex;align-items:center;justify-content:center}
        .bfr-doc-i.pgh{background:var(--primary);color:#fff}
        .bfr-doc-h h3{font-size:1.125rem;font-weight:800;color:var(--text-primary);margin:0}
        .bfr-doc-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px}
        .bfr-doc-item{display:flex;align-items:flex-start;gap:12px;cursor:pointer;font-family:'Inter',sans-serif}
        .bfr-doc-item input[type="checkbox"]{accent-color:var(--primary);width:18px;height:18px;margin-top:2px}
        .bfr-doc-item span{font-size:.8125rem;color:var(--text-secondary);line-height:1.5}
        .bfr-doc-item strong{font-size:.9375rem;font-weight:700;color:var(--text-primary)}
      `}} />
    </div>
  )
}
