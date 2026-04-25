import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GABAI_GEMINI_KEY?.trim()
    if (!apiKey) {
      console.error('Missing GABAI_GEMINI_KEY in .env.local')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const { symptoms, facilityLevel, philHealth, language } = (await req.json()) as {
      symptoms: string
      facilityLevel: string
      philHealth: string
      language: string
    }

    const systemPrompt = `
You are a Philippine Patient Rights advocate. Your job is to generate 3 to 5 highly relevant patient rights and practical reminders based on the user's specific context, disposition, and the Philippine healthcare system.

User context:
- Symptoms/Condition: ${symptoms || 'Unknown'}
- Facility Level Routed To: ${facilityLevel || 'Unknown'}
- PhilHealth Status: ${philHealth}
- Preferred Language: ${language === 'english' ? 'English' : 'Filipino/Taglish'}

Instructions:
1. Provide highly specific rights that apply to their situation.
2. If they are going to a Barangay Health Center (BHC) and have PhilHealth, mention the Konsulta Package and free medicines.
3. If they are going to a hospital (especially public) or ER, mention their right to emergency care without deposit (R.A. 8344), right to itemized billing, or right to refuse treatment.
4. If they are unsure about PhilHealth, mention their right to point-of-service enrollment if indigent.
5. Provide actionable, factual, and legally sound advice in the Philippines.
6. The "right" should be a short title, and "how" should be a 1-2 sentence practical explanation on how to exercise it.

Output MUST be valid JSON matching this schema:
{
  "rights": [
    {
      "right": "Title of the right",
      "how": "Practical explanation"
    }
  ]
}
`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Google API Error:', data)
      return NextResponse.json({ 
        error: 'Google API Error: ' + (data.error?.message || 'Unknown error')
      }, { status: 500 })
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) {
      throw new Error('No text returned from Gemini')
    }

    try {
      const parsed = JSON.parse(raw)
      return NextResponse.json(parsed)
    } catch {
      console.error('JSON parse error in rights. Raw response:', raw)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
  } catch (err) {
    console.error('Rights API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
