import { NextRequest, NextResponse } from 'next/server';
import { generateCarePlan } from '@/lib/gemini';
import { facilitiesToContext } from '@/data/facilities';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawInput, location, hasPhilHealth, languagePreference, alaalaSummary } = body;

    if (!rawInput || !location) {
      return NextResponse.json({ error: 'rawInput and location are required' }, { status: 400 });
    }

    const facilitiesContext = facilitiesToContext(location);

    const carePlan = await generateCarePlan({
      rawInput,
      location,
      hasPhilHealth: hasPhilHealth || 'unsure',
      languagePreference: languagePreference || 'taglish',
      facilitiesContext,
      alaalaSummary,
    });

    return NextResponse.json(carePlan);
  } catch (error) {
    console.error('Care navigation error:', error);
    return NextResponse.json({ error: 'Failed to generate care plan' }, { status: 500 });
  }
}
