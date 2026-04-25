import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { followUpStatus, userMessage, symptoms, toRemember, language, history } = await req.json()

    const apiKey = process.env.GABAI_GEMINI_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = `
You are a Filipino patient follow-up care advisor.
A patient recently visited a health facility and is now checking in on their recovery status.

Context Memory (Alaala Ko):
- Previous Encounters: ${JSON.stringify(history || [])}
Use this history to see if they have recurring issues.

Patient context:
- Original symptoms: ${symptoms || 'Hindi tinukoy'}
- Instructions to remember: ${Array.isArray(toRemember) && toRemember.length ? toRemember.join(', ') : 'Wala'}
- Selected status: ${followUpStatus}
- Additional details from patient: "${userMessage || 'Wala'}"

Based on this context, generate a warm, practical, plain-Filipino/Taglish follow-up message and recommended action.

Rules:
- You are NOT a doctor. Do not diagnose.
- If status is 'worse', always recommend returning to the facility or going to the ER if severe.
- If status is 'improving', affirm and remind them to complete their medications.
- If status is 'same', advise monitoring and set a clear threshold for when to return.
- Reference the original symptoms specifically if they exist.
- Keep message under 3 sentences.
- Keep recommendedAction under 2 sentences.

Output language: ${language ?? 'Filipino/Taglish'}

Respond ONLY in this JSON format:
{
  "message": "Warm follow-up message here",
  "recommendedAction": "What they should do next",
  "urgency": "low" | "medium" | "high"
}
`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Google API Error in Follow-up:', data)
      const errStr = JSON.stringify(data)
      const isQuota = errStr.includes('429') || errStr.includes('quota')
      return NextResponse.json(
        { error: isQuota ? 'quota_exceeded' : 'api_error', message: null },
        { status: 200 }
      )
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) {
      throw new Error('No text returned from Gemini')
    }

    try {
      const parsed = JSON.parse(raw)
      return NextResponse.json(parsed)
    } catch {
      console.error('JSON parse error in followup. Raw response:', raw)
      return NextResponse.json({ error: 'api_error', message: null }, { status: 200 })
    }
  } catch (err: unknown) {
    console.error('Follow-up API exception:', err)
    return NextResponse.json({ error: 'api_error', message: null }, { status: 200 })
  }
}
