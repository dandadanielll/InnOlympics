import { NextRequest, NextResponse } from 'next/server';
import { evaluateFollowUp } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userResponse, encounterSummary, languagePreference } = body;

    if (!userResponse || !encounterSummary) {
      return NextResponse.json({ error: 'userResponse and encounterSummary are required' }, { status: 400 });
    }

    const result = await evaluateFollowUp({ userResponse, encounterSummary, languagePreference: languagePreference || 'taglish' });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Follow-up evaluation error:', error);
    return NextResponse.json({ error: 'Failed to evaluate follow-up' }, { status: 500 });
  }
}
