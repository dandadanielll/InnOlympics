import { NextResponse } from 'next/server'

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
}
