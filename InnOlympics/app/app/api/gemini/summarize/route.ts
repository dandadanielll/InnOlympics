import { NextRequest, NextResponse } from 'next/server';
import { summarizeEncounter } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawTranscript, languagePreference } = body;

    if (!rawTranscript) {
      return NextResponse.json({ error: 'rawTranscript is required' }, { status: 400 });
    }

    const summary = await summarizeEncounter({ rawTranscript, languagePreference: languagePreference || 'taglish' });
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Encounter summarization error:', error);
    return NextResponse.json({ error: 'Failed to summarize encounter' }, { status: 500 });
  }
}
