import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the friendly help assistant for DrukAgriLink, a farm-to-market coordination platform for Bhutan. It connects four roles: farmers (list harvests, accept allocation offers, see earnings), buyers (create procurement orders, approve matches), coordinators (pool farmer supply to meet buyer demand, build match proposals, assign transport), and transporters (register vehicles, deliver trips).

Key facts:
- Farmers receive their full produce price; transport is charged separately to the buyer.
- The workflow: farmer lists harvest -> coordinator builds a match -> farmer accepts -> buyer approves -> coordinator assigns a vehicle -> transporter delivers (assigned, accepted, collecting, in transit, delivered).
- Prices are in Bhutanese Ngultrum (Nu.).
- Users can filter their dashboards by product and status, edit their profile, and see real-time notifications.

Answer questions about how to use the platform clearly and concisely. Be warm and helpful. If asked something unrelated to DrukAgriLink or farming/agriculture logistics, gently steer back. Keep answers short (a few sentences).`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI is not configured." }, { status: 500 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", err);
      return NextResponse.json({ error: "The assistant couldn't respond right now." }, { status: 502 });
    }

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't come up with a response.";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Chat route error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}