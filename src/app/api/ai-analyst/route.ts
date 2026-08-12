import { NextRequest, NextResponse } from 'next/server';
import { processAIQuery } from '@/lib/aiEngine';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const aiResult = processAIQuery(prompt.trim());

    return NextResponse.json(aiResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process AI query', details: error.message },
      { status: 500 }
    );
  }
}
