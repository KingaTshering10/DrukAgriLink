import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the friendly help assistant for DrukAgriLink, a farm-to-market coordination platform for Bhutan. It connects four roles: farmers (list harvests, accept allocation offers, see earnings), buyers (create procurement orders, approve matches), coordinators (pool farmer supply to meet buyer demand, build match proposals, assign transport), and transporters (register vehicles, deliver trips).

Key facts:
- Farmers receive their full produce price; transport is charged separately to the buyer.
- The workflow: farmer lists harvest -> coordinator builds a match -> farmer accepts -> buyer approves -> coordinator assigns a vehicle -> transporter delivers (assigned, accepted, collecting, in transit, delivered).
- Prices are in Bhutanese Ngultrum (Nu.).
- Users can filter their dashboards by product and status, edit their profile, and see real-time notifications.

Answer questions about how to use the platform clearly and concisely. Be warm and helpful. If asked something unrelated, gently steer back. Keep answers short (a few sentences).`;

const MODELS = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-flash-latest"];

async function callGemini(apiKey: string, model: string, body: string) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body,
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Please type a question." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "The assistant isn't available right now. Please try again later." });
    }

    const body = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    for (const model of MODELS) {
      // Try each model, with up to 2 retries on temporary overload (503).
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await callGemini(apiKey, model, body);
        const raw = await res.text();

        if (res.ok) {
          const data = JSON.parse(raw);
          const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ??
            "Sorry, I couldn't come up with a response. Could you rephrase?";
          return NextResponse.json({ reply });
        }

        // 503 = overloaded → wait briefly and retry the same model.
        if (res.status === 503) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        // 404 = model not available → break to try the next model.
        if (res.status === 404) break;

        // Any other error → log it server-side, stop.
        console.error("Gemini API error:", raw);
        return NextResponse.json({
          reply: "I'm having trouble responding right now. Please try again in a moment.",
        });
      }
    }

    // All models/retries exhausted (usually sustained overload).
    return NextResponse.json({
      reply: "The assistant is very busy at the moment. Please try again in a few seconds. 🙏",
    });
  } catch (e) {
    console.error("Chat route error:", e);
    return NextResponse.json({
      reply: "Something went wrong on my end. Please try again.",
    });
  }
}