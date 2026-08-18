"use client";
import { useEffect, useRef, useState } from "react";

function Counter({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const duration = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out
      setValue(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, end]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-bold text-forest-dark sm:text-5xl">
        {value.toLocaleString()}{suffix}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}

export function AnimatedStats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Counter end={45} suffix="+" label="Farmers connected" />
      <Counter end={20} suffix="+" label="Institutional buyers" />
      <Counter end={120000} suffix=" kg" label="Produce moved" />
    </div>
  );
}