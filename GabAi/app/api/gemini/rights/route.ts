import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GABAI_GEMINI_KEY?.trim()
    if (!apiKey) {
      console.error('Missing GABAI_GEMINI_KEY in .env.local')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const { symptoms, facilityLevel, philHealth, language, history } = (await req.json()) as {
      symptoms: string
      facilityLevel: string
      philHealth: string
      language: string
      history?: any[]
    }

    const systemPrompt = `
You are a Philippine Patient Rights legal advocate. Your job is to generate 3 to 5 highly relevant patient rights based on the user's specific context and the Philippine healthcare system, with the exact legal basis for each right.

Context Memory (Alaala Ko):
- Previous Encounters: ${JSON.stringify(history || [])}
Use this history to see if they are returning for the same issue and if they have recurring rights (like right to follow-up).

User context:
- Symptoms/Condition: ${symptoms || 'Unknown'}
- Facility Level Routed To: ${facilityLevel || 'Unknown'}
- PhilHealth Status: ${philHealth}
- Preferred Language: ${language === 'english' ? 'English' : 'Filipino/Taglish'}

Instructions:
1. Provide highly specific rights that apply to their situation.
2. If they are going to a Barangay Health Center (BHC) and have PhilHealth, mention the Konsulta Package and free medicines (PhilHealth Circular 2020-0014).
3. If they are going to a hospital (especially public) or ER, mention their right to emergency care without deposit (R.A. 8344), right to itemized billing (DOH A.O. 2008-0016), or right to informed consent (Civil Code Art. 19, DOH guidelines).
4. If they are unsure about PhilHealth, mention their right to point-of-service enrollment if indigent (R.A. 11223 - UHC Act).
5. Provide actionable, factual, and legally sound advice in the Philippines.
6. The "right" should be a short Filipino/Taglish title (e.g. "Karapatan sa Impormasyon at Pahintulot").
7. The "how" MUST BE a comprehensive, single paragraph (3-4 sentences). It must explicitly explain: What the right means, HOW to use/avail it exactly, and WHAT ARE THE REQUIREMENTS if applicable (e.g., PhilHealth ID, valid ID, indigency certificate). Make it sound natural and helpful, like: "Bago ka sumailalim sa chest xray, may karapatan kang malaman kung bakit ito kailangan..."
8. The "article" must be the specific Philippine law or memo (e.g. "R.A. 8344").

Output MUST be valid JSON matching this schema:
{
  "rights": [
    {
      "right": "Pamagat ng karapatan",
      "how": "Paano gamitin, paano i-avail, at ano ang requirements...",
      "article": "R.A. 8344"
    }
  ]
}
`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
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
