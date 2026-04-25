import { NextResponse } from 'next/server'

const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
]

export async function GET() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ status: 'warn', error: 'Missing GEMINI_API_KEY' }, { status: 200 })
  }

  for (const model of MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: "Reply with the word OK" }] }]
        })
      })

      const data = await response.json()

      if (data.error) {
        const code = data.error.code
        // Quota exhausted - try next model
        if (code === 429) {
          console.warn(`[HealthCheck] ${model} quota exhausted, trying next...`)
          continue
        }
        console.warn(`[HealthCheck] ${model} error:`, data.error.message)
        continue
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      console.log(`[HealthCheck] ${model} is healthy.`)
      return NextResponse.json({ status: 'ok', model, message: 'Gemini API is healthy', response: text })

    } catch (err: any) {
      console.warn(`[HealthCheck] ${model} threw error:`, err.message)
      continue
    }
  }

  // All models quota-exhausted - return 200 so it doesn't break the app warmup
  console.warn('[HealthCheck] All models quota exhausted, returning degraded status (app still runs)')
  return NextResponse.json({ status: 'degraded', message: 'All Gemini models quota-exhausted. App runs on static fallback.' }, { status: 200 })
}
