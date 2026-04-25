import { NextResponse } from 'next/server'

const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
]

// Simple in-memory cache to avoid rate-limit hits on repeated queries
const cache = new Map<string, any>()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { needType, query } = body

    // Check cache first
    const cacheKey = `${needType}:${query}`
    if (cache.has(cacheKey)) {
      console.log('[classify] Cache hit for:', cacheKey)
      return NextResponse.json(cache.get(cacheKey))
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    
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

  } catch (error) {
    console.error('[classify] Classification Error:', error)
    return NextResponse.json({
      title: "Fallback Router",
      class: "General Consultation",
      risk: "Local Health Center"
    }, { status: 200 })
  }
}
