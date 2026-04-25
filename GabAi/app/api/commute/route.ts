import { NextResponse } from 'next/server'

<<<<<<< HEAD
// ── LTFRB 2024 Official Fare Matrix (hardcoded, 100% free) ───────────────────
const FARES = {
  jeepney: { base: 13, free: 4, perKm: 1.80 },
  bus:     { base: 15, free: 5, perKm: 2.20 },
  lrt:     { base: 13, max: 35 },
  mrt:     { base: 13, max: 28 },
}
const jeepneyFare = (km: number) => Math.round(Math.max(FARES.jeepney.base, FARES.jeepney.base + Math.max(0, km - FARES.jeepney.free) * FARES.jeepney.perKm))
const busFare     = (km: number) => Math.round(Math.max(FARES.bus.base, FARES.bus.base + Math.max(0, km - FARES.bus.free) * FARES.bus.perKm))
const lrtFare     = (km: number) => Math.min(FARES.lrt.max, Math.round(FARES.lrt.base + km * 1.5))
const mrtFare     = (km: number) => Math.min(FARES.mrt.max, Math.round(FARES.mrt.base + km * 1.0))

// ── Haversine straight-line distance (fallback) ───────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10
}

// ── Smart Manila transit pattern estimator ────────────────────────────────────
function buildCommutePlan(distKm: number, facilityName: string, destLat: number, destLng: number, originLat: number, originLng: number) {
  const legs: { mode: string; instruction: string; fare: number }[] = []

  const isManilaDest   = destLat >= 14.55 && destLat <= 14.62 && destLng >= 120.97 && destLng <= 121.02
  const isQCDest       = destLat >= 14.62 && destLat <= 14.75 && destLng >= 121.01 && destLng <= 121.12
  const isMakatiDest   = destLat >= 14.54 && destLat <= 14.57 && destLng >= 121.01 && destLng <= 121.04
  const isLaguna       = destLat <= 14.30
  const isBulacan      = originLat >= 14.80
  const isMRTCorridor  = originLng >= 121.00 && originLat >= 14.62

  // Walk
  if (distKm <= 0.6) {
    legs.push({ mode: 'Walk', instruction: `Maglakad papunta sa ${facilityName}. (${distKm} km)`, fare: 0 })
    return { totalTime: `${Math.round(distKm * 12)} mins`, totalFare: 0, legs }
  }
  // Tricycle
  if (distKm <= 1.5) {
    legs.push({ mode: 'Tricycle', instruction: `Sumakay ng tricycle papunta malapit sa ${facilityName}. (${distKm} km)`, fare: 15 })
    legs.push({ mode: 'Walk', instruction: `Maglakad papasok sa ${facilityName}.`, fare: 0 })
    return { totalTime: `${Math.round(distKm * 10 + 5)} mins`, totalFare: 15, legs }
  }
  // Jeepney (short)
  if (distKm <= 8) {
    const fare = jeepneyFare(distKm)
    const via  = isManilaDest ? 'papuntang Taft Avenue / Ermita' : isQCDest ? 'papuntang Quezon City' : isMakatiDest ? 'papuntang Makati' : 'papunta sa destinasyon'
    legs.push({ mode: 'Jeepney', instruction: `Sumakay ng jeep o bus ${via}. (${distKm} km)`, fare })
    legs.push({ mode: 'Walk', instruction: `Maglakad papasok sa ${facilityName}.`, fare: 0 })
    return { totalTime: `${Math.round(distKm * 7 + 10)} mins`, totalFare: fare, legs }
  }
  // MRT/LRT + Jeepney (medium)
  if (distKm <= 20) {
    const railKm = distKm * 0.55, jeepKm = distKm * 0.38
    const useMRT   = isMRTCorridor
    const railMode = useMRT ? 'MRT' : 'LRT'
    const railLine = useMRT ? 'MRT-3' : 'LRT-1 o LRT-2'
    const railF    = useMRT ? mrtFare(railKm) : lrtFare(railKm)
    const jeepF    = jeepneyFare(jeepKm)
    const hub      = isManilaDest ? 'Taft Avenue Station' : isQCDest ? 'North Avenue Station' : isMakatiDest ? 'Ayala Station' : 'pinakamalapit na station'
    legs.push({ mode: railMode, instruction: `Sumakay ng ${railLine} hanggang ${hub}. (±${railKm.toFixed(1)} km)`, fare: railF })
    legs.push({ mode: 'Jeepney', instruction: `Mula sa ${hub}, sumakay ng jeep papuntang ${facilityName}. (±${jeepKm.toFixed(1)} km)`, fare: jeepF })
    legs.push({ mode: 'Walk', instruction: `Maglakad papasok sa ${facilityName}.`, fare: 0 })
    return { totalTime: `${Math.round(distKm * 5 + 25)} mins`, totalFare: railF + jeepF, legs }
  }
  // Bus + Jeepney (long distance)
  {
    const busKm = distKm * 0.70, jeepKm = distKm * 0.25
    const busFareAmt = busFare(busKm), jeepFareAmt = jeepneyFare(jeepKm)
    const terminal = isBulacan ? 'Monumento Bus Terminal' : isLaguna ? 'Buendia / Alabang Bus Terminal' : 'pinakamalapit na bus terminal'
    legs.push({ mode: 'Bus', instruction: `Sumakay ng bus mula sa ${terminal} papuntang malapit sa ${facilityName}. (±${busKm.toFixed(1)} km)`, fare: busFareAmt })
    legs.push({ mode: 'Jeepney', instruction: `Mula sa bus stop, sumakay ng jeep papuntang ${facilityName}. (±${jeepKm.toFixed(1)} km)`, fare: jeepFareAmt })
    legs.push({ mode: 'Walk', instruction: `Maglakad papasok sa ${facilityName}.`, fare: 0 })
    return { totalTime: `${Math.round(distKm * 4 + 40)} mins`, totalFare: busFareAmt + jeepFareAmt, legs }
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { originLat, originLng, destinationLat, destinationLng, facilityName } = await req.json()

    if (!originLat || !originLng || !destinationLat || !destinationLng) {
      return NextResponse.json({ totalTime: '30 mins', totalFare: 13, legs: [
        { mode: 'Jeepney', instruction: `Sumakay ng jeep o bus papuntang ${facilityName || 'ospital'}.`, fare: 13 },
        { mode: 'Walk',    instruction: `Maglakad papasok sa ${facilityName || 'ospital'}.`,            fare: 0  },
      ], routeGeometry: null })
    }

    let distKm = haversineKm(originLat, originLng, destinationLat, destinationLng)
    let routeGeometry: any = null

    // ── OSRM: free, no API key, uses OpenStreetMap data ──────────────────────
    // Public demo server — suitable for hackathon/demo usage
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destinationLng},${destinationLat}?overview=full&geometries=geojson`
      const osrmRes = await fetch(osrmUrl, { signal: AbortSignal.timeout(5000) })
      const osrmData = await osrmRes.json()
      if (osrmData.code === 'Ok' && osrmData.routes?.length > 0) {
        // Use road distance (more realistic than haversine for urban routing)
        distKm = Math.round(osrmData.routes[0].distance / 100) / 10
        routeGeometry = osrmData.routes[0].geometry // GeoJSON LineString
        console.log(`[commute] OSRM road distance: ${distKm} km`)
      }
    } catch (e) {
      console.warn('[commute] OSRM unavailable, using haversine fallback:', e)
    }

    const plan = buildCommutePlan(distKm, facilityName || 'destinasyon', destinationLat, destinationLng, originLat, originLng)
    return NextResponse.json({ ...plan, routeGeometry })

  } catch (error) {
    console.error('[commute] Error:', error)
    return NextResponse.json({ totalTime: '30 mins', totalFare: 13, routeGeometry: null, legs: [
      { mode: 'Jeepney', instruction: 'Sumakay ng jeep o bus papunta sa destinasyon.', fare: 13 },
      { mode: 'Walk',    instruction: 'Maglakad papasok sa pasilidad.',               fare: 0  },
    ]}, { status: 200 })
=======
const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"]
const MOCK_PH_FARE_MATRIX = `Jeepney: Base fare ₱13.00 for first 4km, +₱1.80/km.\nLRT/MRT: ₱13.00-₱35.00.\nWalk: Free.`

// Cache removed to prevent static fallbacks from persisting across API changes

export async function POST(req: Request) {
  try {
    const { originLat, originLng, destinationLat, destinationLng, facilityName, documentCommute } = await req.json()
    const MAPS_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY
    const GEMINI_KEY = process.env.GEMINI_API_KEY

    let realRouteSteps = ""
    let totalKm = 0
    let totalMinutes = 0
    let googleRouteFound = false

    // Step 1: Try Google Maps Directions API for real transit data
    if (MAPS_KEY) {
      const originParam = `${originLat},${originLng}`
      const destParam = destinationLat && destinationLng
        ? `${destinationLat},${destinationLng}`
        : encodeURIComponent(facilityName || 'Manila')
      const mapsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}&destination=${destParam}&mode=transit&region=ph&key=${MAPS_KEY}`
      
      try {
        const mapsReq = await fetch(mapsUrl)
        const mapsData = await mapsReq.json()
        if (mapsData.routes && mapsData.routes.length > 0) {
          const leg = mapsData.routes[0].legs[0]
          totalKm = Math.round((leg.distance.value / 1000) * 10) / 10
          totalMinutes = Math.round(leg.duration.value / 60)
          googleRouteFound = true
          
          realRouteSteps = leg.steps.map((s: any) => {
            let mode = "Walk"
            let instr = s.html_instructions.replace(/<[^>]+>/g, '')
            if (s.travel_mode === "TRANSIT") {
              const type = s.transit_details?.line?.vehicle?.type?.toUpperCase() || ''
              mode = type === "SUBWAY" ? "MRT/LRT" : type === "BUS" ? "Bus/Jeepney" : "Transit"
              instr = `Ride ${s.transit_details?.line?.short_name || mode} towards ${s.transit_details?.headsign || 'destination'}`
            }
            return `[${mode}] ${instr} (${s.distance.text})`
          }).join(" | ")
        }
      } catch (err) {
         console.warn("Maps API fetch failed, using distance-based estimate")
      }
    }

    // Step 2: If no Google Route, compute haversine estimate
    if (!googleRouteFound) {
      if (destinationLat && destinationLng && originLat && originLng) {
        const R = 6371
        const dLat = (destinationLat - originLat) * Math.PI / 180
        const dLng = (destinationLng - originLng) * Math.PI / 180
        const a = Math.sin(dLat/2)**2 + Math.cos(originLat * Math.PI/180) * Math.cos(destinationLat * Math.PI/180) * Math.sin(dLng/2)**2
        totalKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10
        totalMinutes = Math.round(totalKm / 10 * 60) // ~10km/hr avg Manila transit
      } else {
        totalKm = 5
        totalMinutes = 30
      }
    }

    // Step 3: Try Gemini to generate Taglish narrative (optional enhancement)
    if (GEMINI_KEY) {
      const narrativeTarget = documentCommute 
        ? `How to get your document from ${facilityName}` 
        : `How to get to ${facilityName} for medical care`

      const prompt = `
        You are a helpful Manila healthcare navigation assistant. 
        The user needs to know: ${narrativeTarget}.
        Their starting location coords: ${originLat}, ${originLng}

        ${googleRouteFound ? `The ACTUAL transit directions from Google Maps are: "${realRouteSteps}"` : `No specific transit route was found. The straight-line distance is approximately ${totalKm} km.`}
        (Total distance: ${totalKm} km, Travel time: ~${totalMinutes} mins)

        Your task: Create a warm, native Taglish step-by-step commute sequence.
        ${googleRouteFound ? 'Translate the exact steps provided. DO NOT invent new streets or train lines.' : 'Provide generic but helpful jeepney/transit advice for traveling within Manila.'}
        Use this Fare Matrix for estimating costs per leg:
        ${MOCK_PH_FARE_MATRIX}

        Return ONLY a strict JSON object (no markdown fences) matching this schema:
        {
          "totalTime": "${totalMinutes} mins",
          "totalFare": 50.00,
          "narrative": "A short 1-sentence warm Taglish overview of the trip.",
          "legs": [
            {
              "mode": "Should be 'Walk', 'Jeepney', 'Bus', 'LRT', or 'MRT'",
              "instruction": "Taglish instruction... (e.g. Sumakay ng jeep papuntang Taft...)",
              "fare": 13.00
            }
          ]
        }
      `

      for (const modelName of MODELS) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1
              }
            })
          })
          const data = await response.json()
          
          if (data.error) {
            console.warn(`[commute] API error with ${modelName}:`, data.error.message)
            continue
          }

          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            let text = data.candidates[0].content.parts[0].text
            text = text.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '').trim()
            const parsed = JSON.parse(text)
            return NextResponse.json(parsed)
          }
        } catch (err) {
          console.warn(`[commute] ${modelName} failed, trying next`)
        }
      }
    }

    // Step 4: Pure static fallback — no Gemini needed
    // Build a reasonable response from the distance data we already have
    const jeepneyFare = Math.max(13, Math.round(13 + Math.max(0, totalKm - 4) * 1.80))
    const staticResult = {
      totalTime: `${totalMinutes} mins`,
      totalFare: jeepneyFare,
      narrative: `Mga ${totalMinutes} minuto ang byahe papuntang ${facilityName || 'hospital'}. Humigit-kumulang ${totalKm} km ang layo.`,
      legs: [
        ...(totalKm > 1 ? [{ mode: "Jeepney", instruction: `Sumakay ng jeep o bus papuntang ${facilityName || 'destinasyon'}. Mga ${totalKm} km ang layo.`, fare: jeepneyFare }] : []),
        { mode: "Walk", instruction: `Maglakad papasok sa ${facilityName || 'pasilidad'}.`, fare: 0 }
      ]
    }
    return NextResponse.json(staticResult)

  } catch (error) {
    console.error('Commute Error:', error)
    return NextResponse.json({
      totalTime: "30 mins",
      totalFare: 30.00,
      narrative: "May aberya sa system, pero ito ang estima namin.",
      legs: [
        { mode: "Jeepney", instruction: "Sumakay ng transportasyon papunta sa destinasyon.", fare: 15.00 },
        { mode: "Walk", instruction: "Maglakad papasok sa pasilidad.", fare: 0.00 }
      ]
    }, { status: 200 })
>>>>>>> b9b228b8cf10fe3be73db9e51f1b8c69a95098be
  }
}
