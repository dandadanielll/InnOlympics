import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GABAI_GEMINI_KEY?.trim()
    if (!apiKey) {
      console.error('Missing GABAI_GEMINI_KEY in .env.local')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }
    
    const { recallInput, audioBase64, mimeType, script, language } = (await req.json()) as {
      recallInput?: string
      audioBase64?: string
      mimeType?: string
      script?: string
      language?: string
    }

    const systemPrompt = `
You are a highly capable Philippine medical instruction parser.
Your job is to listen to the patient's raw audio recording (if provided) and read their text notes (if any) from their clinic visit.
You must accurately transcribe the audio and reconstruct their notes into clear, structured, actionable instructions.

Inputs:
- Patient's Raw Text Notes (from Voice-to-Text UI): "${recallInput || 'None'}"
- Audio Recording: ${audioBase64 ? 'Provided' : 'None'}
- Original Script / Context (What they planned to ask): "${script || 'None'}"
- Preferred Language: ${language === 'english' ? 'English' : 'Filipino/Taglish'}

Instructions:
1. Extract and categorize every instruction mentioned in the audio and text notes.
2. Categories must be one of: "Gamot", "Bawal", "Aktibidad", "Follow-up", "Iba pa".
3. Correct any obvious misspellings of medicines (e.g. "amox" -> Amoxicillin).
4. For each instruction, assign a confidence level:
   - "clear" (explicitly stated and easy to understand)
   - "reconstructed" (you had to infer the correct intent from audio or broken text)
   - "unclear" (it's ambiguous and the patient should verify)
5. If something is potentially dangerous or highly ambiguous (e.g. "inom gamot 10 times"), add a warning to the "flagged" array.

Output MUST be valid JSON matching this schema:
{
  "instructions": [
    {
      "category": "Gamot",
      "instruction": "Uminom ng Paracetamol 3 beses isang araw",
      "confidence": "clear"
    }
  ],
  "flagged": []
}
`

    const parts: any[] = [{ text: systemPrompt }]
    
    if (audioBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: audioBase64
        }
      })
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts }],
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
      console.error('JSON parse error in recall. Raw response:', raw)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
  } catch (err) {
    console.error('Recall API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
