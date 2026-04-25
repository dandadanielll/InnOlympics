import { NextRequest, NextResponse } from 'next/server';
import { generateWhatsAppSummary } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encounterData, languagePreference } = body;

    if (!encounterData) {
      return NextResponse.json({ error: 'encounterData is required' }, { status: 400 });
    }

    const summary = await generateWhatsAppSummary({
      encounterData: JSON.stringify(encounterData),
      languagePreference: languagePreference || 'taglish',
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('WhatsApp summary error:', error);
    return NextResponse.json({ error: 'Failed to generate WhatsApp summary' }, { status: 500 });
  }
}
