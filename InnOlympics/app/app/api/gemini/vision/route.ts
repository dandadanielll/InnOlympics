import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType, languagePreference } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'imageBase64 and mimeType are required' }, { status: 400 });
    }

    const analysis = await analyzeDocument({
      imageBase64,
      mimeType,
      languagePreference: languagePreference || 'taglish',
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Document vision error:', error);
    return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 });
  }
}
