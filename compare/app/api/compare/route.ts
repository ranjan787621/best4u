import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { items, pincode } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: '.env.local me GEMINI_API_KEY missing hai!' },
        { status: 400 }
      );
    }

    const promptText = `Act as an Indian Quick-Commerce price comparator (Blinkit, Zepto, Swiggy Instamart).
Compare total estimated price, delivery time, and top options for item: "${items}" at Pincode: ${pincode}.

Provide:
1. Estimated Prices on Blinkit, Zepto, Swiggy Instamart
2. Fastest Delivery Option
3. Best Value/High-Rated Recommendation
4. Smart Saving Tip`;

    // High demand traffic ke liye retry logic
    const fetchWithRetry = async (retries = 2, delayMs = 1500): Promise<any> => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (response.status === 429 || data?.error?.message?.includes('high demand')) {
        if (retries > 0) {
          await new Promise((res) => setTimeout(res, delayMs));
          return fetchWithRetry(retries - 1, delayMs * 2);
        }
      }

      return { response, data };
    };

    const { response, data } = await fetchWithRetry();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || 'Google API Error' },
        { status: response.status }
      );
    }

    const resultText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No result returned.';

    return NextResponse.json({ result: resultText });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal Server Failure' },
      { status: 500 }
    );
  }
}