import { NextResponse } from 'next/server'

<<<<<<< HEAD
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
        // Quota exhausted — try next model
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

  // All models quota-exhausted — return 200 so it doesn't break the app warmup
  console.warn('[HealthCheck] All models quota exhausted, returning degraded status (app still runs)')
  return NextResponse.json({ status: 'degraded', message: 'All Gemini models quota-exhausted. App runs on static fallback.' }, { status: 200 })
=======
export async function GET() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ status: 'fail', error: 'Missing GEMINI_API_KEY' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: "Reply with the word OK" }] }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[HealthCheck] Gemini API error:', err)
      return NextResponse.json({ status: 'fail', error: `API error: ${response.status}`, details: err }, { status: 500 })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    
    if (text === "OK") {
      console.log('[HealthCheck] Gemini API is healthy and reachable.')
      return NextResponse.json({ status: 'ok', message: 'Gemini API is healthy' })
    } else {
      console.warn('[HealthCheck] Gemini returned unexpected format:', text)
      return NextResponse.json({ status: 'warn', message: 'Received structured but unexpected response', response: text })
    }

  } catch (error: any) {
    console.error('[HealthCheck] Network/Execution error:', error)
    return NextResponse.json({ status: 'fail', error: error.message }, { status: 500 })
  }
>>>>>>> b9b228b8cf10fe3be73db9e51f1b8c69a95098be
}
