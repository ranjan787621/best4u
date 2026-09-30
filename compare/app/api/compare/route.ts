import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { product1, product2 } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const prompt = `Compare these two products in detail and highlight which one is better and why:\n1. ${product1}\n2. ${product2}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to compare products' }, { status: 500 });
  }
}