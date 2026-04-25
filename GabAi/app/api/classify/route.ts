import { NextResponse } from 'next/server'
<<<<<<< HEAD
import { CONDITIONS } from '@/app/navigator/before/conditions'

// ── Correct Gemini model list for v1beta ─────────────────────────────────────
const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',   // correct v1beta model name (no -latest suffix)
]

// ── Simple cache (per session) ───────────────────────────────────────────────
const cache = new Map<string, any>()

// ── Local rule-based classifier ───────────────────────────────────────────────
// Used as fallback when Gemini quota is exhausted.
// Matches query against conditions.ts database — same data the app already uses.
function localClassify(needType: string, query: string): { title: string; class: string; risk: string } | null {
  if (!query?.trim()) return null
  const q = query.toLowerCase().trim()

  // 1. Try to find exact label match first
  let match = CONDITIONS.find(c => c.label.toLowerCase() === q)

  // 2. Try aliases
  if (!match) match = CONDITIONS.find(c => c.searchAliases.some(a => a.toLowerCase() === q))

  // 3. Try partial label match (query contains label or label contains query)
  if (!match) match = CONDITIONS.find(c =>
    c.label.toLowerCase().includes(q) || q.includes(c.label.toLowerCase())
  )

  // 4. Try partial alias match
  if (!match) match = CONDITIONS.find(c =>
    c.searchAliases.some(a => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))
  )

  // 5. Token-level match across all fields
  if (!match) {
    const tokens = q.split(/[\s,/()\-]+/).filter(t => t.length >= 3)
    match = CONDITIONS.find(c => {
      const haystack = (c.label + ' ' + c.searchAliases.join(' ') + ' ' + c.department).toLowerCase()
      return tokens.some(t => haystack.includes(t))
    })
  }

  if (match) {
    return {
      title: match.label,
      class: match.department,
      risk: match.careLevel,
    }
  }

  // 6. Service-type lookup when needType === 'service'
  if (needType === 'service') {
    const serviceMap: Record<string, { class: string; risk: string }> = {
      'xray': { class: 'Radiology / Diagnostic Imaging', risk: 'Diagnostic Center' },
      'x-ray': { class: 'Radiology / Diagnostic Imaging', risk: 'Diagnostic Center' },
      'chest x-ray': { class: 'Radiology / Diagnostic Imaging', risk: 'Diagnostic Center' },
      'cxr': { class: 'Radiology / Diagnostic Imaging', risk: 'Diagnostic Center' },
      'ultrasound': { class: 'Radiology / Diagnostic Imaging', risk: 'Diagnostic Center or Hospital' },
      'ecg': { class: 'Cardiology / ECG Lab', risk: 'Diagnostic Center or Hospital' },
      'ekg': { class: 'Cardiology / ECG Lab', risk: 'Diagnostic Center or Hospital' },
      'cbc': { class: 'Laboratory (Hematology)', risk: 'Diagnostic Center or BHC' },
      'blood': { class: 'Laboratory Services', risk: 'Diagnostic Center or BHC' },
      'mri': { class: 'Radiology / MRI', risk: 'Tertiary Hospital' },
      'ct scan': { class: 'Radiology / CT Scan', risk: 'Tertiary Hospital' },
      'dialysis': { class: 'Nephrology / Dialysis', risk: 'Tertiary Hospital' },
      'vaccination': { class: 'Immunization / Vaccine', risk: 'Primary/BHC' },
      'vaccine': { class: 'Immunization / Vaccine', risk: 'Primary/BHC' },
      'dental': { class: 'Dental / Oral Health', risk: 'Primary/BHC or Dental Clinic' },
      'check up': { class: 'General Medicine / OPD', risk: 'Primary/BHC' },
      'checkup': { class: 'General Medicine / OPD', risk: 'Primary/BHC' },
      'consultation': { class: 'General Medicine / OPD', risk: 'Primary/BHC' },
      'physical exam': { class: 'General Medicine', risk: 'Primary/BHC' },
      'chemotherapy': { class: 'Oncology / Chemotherapy', risk: 'Tertiary Hospital' },
      'radiation': { class: 'Oncology / Radiation Therapy', risk: 'Tertiary Hospital' },
      'physical therapy': { class: 'Rehabilitation Medicine', risk: 'Secondary/Tertiary Hospital' },
      'rehab': { class: 'Rehabilitation Medicine', risk: 'Secondary/Tertiary Hospital' },
    }
    for (const [key, val] of Object.entries(serviceMap)) {
      if (q.includes(key)) {
        return { title: query, class: val.class, risk: val.risk }
      }
    }
  }

  return null
}

// ── Main handler ─────────────────────────────────────────────────────────────
=======

const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
]

// Simple in-memory cache to avoid rate-limit hits on repeated queries
const cache = new Map<string, any>()

>>>>>>> b9b228b8cf10fe3be73db9e51f1b8c69a95098be
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { needType, query } = body

<<<<<<< HEAD
=======
    // Check cache first
>>>>>>> b9b228b8cf10fe3be73db9e51f1b8c69a95098be
    const cacheKey = `${needType}:${query}`
    if (cache.has(cacheKey)) {
      console.log('[classify] Cache hit for:', cacheKey)
      return NextResponse.json(cache.get(cacheKey))
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
<<<<<<< HEAD

    // ── Attempt Gemini (all models) ────────────────────────────────────────
    if (GEMINI_API_KEY) {
      const context = needType === 'diagnosis'
        ? `The user stated their diagnosis/condition is: "${query}". Classify the necessary healthcare facility type.`
        : `The user needs a specific healthcare service/procedure: "${query}". Classify the necessary healthcare facility type.`

      const prompt = `
        ${context}
        Return a JSON object STRICTLY with the following structure:
        {
          "title": "A short 2-3 word summary of the action",
          "class": "The Target Department or Service Type",
          "risk": "The Recommended Care Level (e.g., Primary Care, Diagnostic Center, General Hospital)"
        }
        Do not include markdown blocks, just the raw JSON.
      `

      for (const model of MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            }
          )

          const data = await response.json()
          console.log(`[classify] Model: ${model}, Status: ${response.status}`)

          if (data.error) {
            if (data.error.code === 429) {
              console.warn(`[classify] ${model} quota exhausted, trying next model...`)
            } else {
              console.warn(`[classify] ${model} error:`, data.error.message)
            }
            continue
          }

          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (!text) {
            console.warn(`[classify] No text from ${model}`)
            continue
          }

          let cleaned = text.trim()
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
          }

          const parsed = JSON.parse(cleaned)
          console.log(`[classify] Success with ${model}:`, parsed)
          cache.set(cacheKey, parsed)
          return NextResponse.json(parsed)

        } catch (modelErr) {
          console.warn(`[classify] Failed with ${model}:`, modelErr)
        }
      }
    }

    // ── Local rule-based fallback (zero quota) ─────────────────────────────
    console.warn('[classify] All Gemini models failed — using local rule-based classifier')
    const local = localClassify(needType, query)
    if (local) {
      console.log('[classify] Local classifier result:', local)
      cache.set(cacheKey, local)
      return NextResponse.json(local)
    }

    // ── Last resort generic fallback ───────────────────────────────────────
    const generic = {
      title: query || 'General Checkup',
      class: 'General Consultation',
      risk: 'Local Health Center',
    }
    return NextResponse.json(generic)
=======
    
    if (!GEMINI_API_KEY) {
      console.error('[classify] Missing GEMINI_API_KEY')
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 })
    }

    const context = needType === 'diagnosis'
      ? `The user stated their diagnosis/condition is: "${query}". Classify the necessary healthcare facility type.`
      : `The user needs a specific healthcare service/procedure: "${query}". Classify the necessary healthcare facility type.`

    const prompt = `
      ${context}
      Return a JSON object STRICTLY with the following structure:
      {
        "title": "A short 2-3 word summary of the action",
        "class": "The Target Department or Service Type",
        "risk": "The Recommended Care Level (e.g., Primary Care, Diagnostic Center, General Hospital)"
      }
      Do not include markdown blocks, just the raw JSON.
    `

    // Try each model in order until one works
    for (const model of MODELS) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        })

        const data = await response.json()
        
        // Log raw response for debugging
        console.log(`[classify] Model: ${model}, Status: ${response.status}, Response:`, JSON.stringify(data).slice(0, 500))

        // Check for API-level errors
        if (data.error) {
          console.warn(`[classify] API error with ${model}:`, data.error.message)
          continue // try next model
        }

        // Extract text from candidates
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
          // Check if it was blocked
          const blockReason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason
          console.warn(`[classify] No text from ${model}. Reason: ${blockReason || 'unknown'}`)
          continue // try next model
        }

        // Parse the JSON response (handle potential markdown wrapping)
        let cleaned = text.trim()
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
        }

        const parsed = JSON.parse(cleaned)
        console.log(`[classify] Success with ${model}:`, parsed)
        cache.set(cacheKey, parsed) // Cache the result
        return NextResponse.json(parsed)

      } catch (modelErr) {
        console.warn(`[classify] Failed with model ${model}:`, modelErr)
        continue
      }
    }

    // All models failed — return graceful fallback
    console.error('[classify] All models failed, using fallback')
    return NextResponse.json({
      title: "General Checkup",
      class: "General Consultation",
      risk: "Local Health Center"
    }, { status: 200 })
>>>>>>> b9b228b8cf10fe3be73db9e51f1b8c69a95098be

  } catch (error) {
    console.error('[classify] Classification Error:', error)
    return NextResponse.json({
<<<<<<< HEAD
      title: 'Fallback Router',
      class: 'General Consultation',
      risk: 'Local Health Center',
=======
      title: "Fallback Router",
      class: "General Consultation",
      risk: "Local Health Center"
>>>>>>> b9b228b8cf10fe3be73db9e51f1b8c69a95098be
    }, { status: 200 })
  }
}
