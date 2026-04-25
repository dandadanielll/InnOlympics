import { NextRequest, NextResponse } from 'next/server';
import { generateScript } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carePlanSummary, languagePreference, priorEncounters } = body;

    if (!carePlanSummary) {
      return NextResponse.json({ error: 'carePlanSummary is required' }, { status: 400 });
    }

    const script = await generateScript({ carePlanSummary, languagePreference: languagePreference || 'taglish', priorEncounters });
    return NextResponse.json(script);
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
}
