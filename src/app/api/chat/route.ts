import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the friendly help assistant for DrukAgriLink, a farm-to-market coordination platform for Bhutan. It connects four roles: farmers (list harvests, accept allocation offers, see earnings), buyers (create procurement orders, approve matches), coordinators (pool farmer supply to meet buyer demand, build match proposals, assign transport), and transporters (register vehicles, deliver trips).

Key facts:
- Farmers receive their full produce price; transport is charged separately to the buyer.
- The workflow: farmer lists harvest -> coordinator builds a match -> farmer accepts -> buyer approves -> coordinator assigns a vehicle -> transporter delivers (assigned, accepted, collecting, in transit, delivered).
- Prices are in Bhutanese Ngultrum (Nu.).
- Users can filter their dashboards by product and status, edit their profile, and see real-time notifications.

Answer questions about how to use the platform clearly and concisely. Be warm and helpful. If asked something unrelated, gently steer back. Keep answers short (a few sentences).`;

// Current Gemini Flash models (Aug 2026). We try the newest, then fall back.
const MODELS = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-flash-latest"];

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI is not configured (no key found)." }, { status: 500 });
    }

    const body = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    let lastErr = "";
    for (const model of MODELS) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body,
        }
      );

      const raw = await res.text();

      if (res.ok) {
        const data = JSON.parse(raw);
        const reply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ??
          "Sorry, I couldn't come up with a response.";
        return NextResponse.json({ reply });
      }

      lastErr = raw;
      // If it's a "model not found", try the next model; otherwise stop.
      if (res.status !== 404) break;
    }

    console.error("Gemini API error:", lastErr);
    return NextResponse.json({ error: `Gemini error: ${lastErr.slice(0, 300)}` }, { status: 502 });
  } catch (e: any) {
    console.error("Chat route error:", e);
    return NextResponse.json({ error: `Server error: ${e?.message ?? "unknown"}` }, { status: 500 });
  }
}