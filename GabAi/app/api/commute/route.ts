import { NextResponse } from 'next/server'

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
  }
}
