import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY in .env.local' }, { status: 500 });
  }

  try {
    const reqBody = await req.json();
    const prompt = reqBody.prompt;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Analyze trip error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
