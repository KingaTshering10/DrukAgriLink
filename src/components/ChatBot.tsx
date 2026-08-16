"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Kuzuzangpo la! I'm the DrukAgriLink assistant. Ask me how anything works." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Draggable button position (bottom-right by default via CSS; we track an offset).
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef({ dragging: false, moved: false, startX: 0, startY: 0, offX: 0, offY: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Hide the "Need help?" hint after a while.
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // --- Dragging logic (mouse + touch), with a threshold so a tap still opens ---
  function onPointerDown(clientX: number, clientY: number) {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragState.current = {
      dragging: true,
      moved: false,
      startX: clientX,
      startY: clientY,
      offX: clientX - rect.left,
      offY: clientY - rect.top,
    };
  }
  function onPointerMove(clientX: number, clientY: number) {
    const d = dragState.current;
    if (!d.dragging) return;
    const dist = Math.hypot(clientX - d.startX, clientY - d.startY);
    if (dist > 5) d.moved = true; // moved enough → it's a drag, not a tap
    if (d.moved) {
      const size = 56;
      const x = Math.min(Math.max(0, clientX - d.offX), window.innerWidth - size);
      const y = Math.min(Math.max(0, clientY - d.offY), window.innerHeight - size);
      setPos({ x, y });
      setShowHint(false);
    }
  }
  function onPointerUp() {
    const wasMove = dragState.current.moved;
    dragState.current.dragging = false;
    // If it wasn't a drag, treat as a click → toggle the chat.
    if (!wasMove) setOpen((o) => !o);
  }

  useEffect(() => {
    const mm = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const mu = () => { if (dragState.current.dragging) onPointerUp(); };
    const tm = (e: TouchEvent) => { const t = e.touches[0]; if (t) onPointerMove(t.clientX, t.clientY); };
    const tu = () => { if (dragState.current.dragging) onPointerUp(); };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    window.addEventListener("touchmove", tm, { passive: true });
    window.addEventListener("touchend", tu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend", tu);
    };
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "bot", text: data.reply ?? "Sorry, something went wrong. Please try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "I couldn't reach the assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  // Button position: use dragged pos if present, else default bottom-right.
  const btnStyle: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" }
    : { right: 20, bottom: 20 };

  return (
    <>
      {/* "Need help?" label */}
      {!open && showHint && !pos && (
        <div className="fixed bottom-7 right-24 z-50 animate-fade-up rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
          Need help? 💬
        </div>
      )}

      {/* Floating draggable button with pulse */}
      <button
        ref={btnRef}
        onMouseDown={(e) => onPointerDown(e.clientX, e.clientY)}
        onTouchStart={(e) => { const t = e.touches[0]; if (t) onPointerDown(t.clientX, t.clientY); }}
        style={btnStyle}
        className="fixed z-50 inline-flex h-14 w-14 cursor-grab touch-none items-center justify-center rounded-full bg-forest text-white shadow-lg transition-transform hover:scale-105 active:cursor-grabbing active:scale-95"
        aria-label="Help assistant (tap to open, drag to move)"
      >
        {!open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-40" />}
        <span className="relative">{open ? <X size={22} /> : <MessageCircle size={22} />}</span>
      </button>

      {/* Chat panel — anchors near the button */}
      {open && (
        <div
          className="toast-in fixed z-50 flex h-[28rem] w-80 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
          style={pos
            ? { left: Math.min(pos.x, window.innerWidth - 340), top: Math.max(10, pos.y - 460) }
            : { right: 20, bottom: 88 }}
        >
          <div className="bg-gradient-to-r from-forest to-forest-dark px-4 py-3 text-white">
            <p className="font-semibold">DrukAgriLink Assistant</p>
            <p className="text-xs text-white/70">Ask me how the platform works</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user" ? "bg-forest text-white" : "bg-gray-100 text-forest-dark"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-400">Thinking…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-black/5 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Type a question…"
              className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
            <button onClick={send} disabled={loading} className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white transition hover:bg-forest-dark disabled:opacity-50" aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}