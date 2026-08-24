"use client";
import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Loader2 } from "lucide-react";
import { DZONGKHAG_COORDS } from "@/lib/constants/dzongkhag-coords";

type Daily = { date: string; max: number; min: number; code: number };

// Map Open-Meteo weather codes to a label + icon.
function describe(code: number): { label: string; Icon: any } {
  if (code === 0) return { label: "Clear", Icon: Sun };
  if (code <= 3) return { label: "Partly cloudy", Icon: Cloud };
  if (code <= 48) return { label: "Foggy", Icon: Cloud };
  if (code <= 67) return { label: "Rainy", Icon: CloudRain };
  if (code <= 77) return { label: "Snowy", Icon: CloudSnow };
  if (code <= 82) return { label: "Rain showers", Icon: CloudRain };
  if (code <= 86) return { label: "Snow showers", Icon: CloudSnow };
  return { label: "Stormy", Icon: Wind };
}

export function WeatherCard({ dzongkhag }: { dzongkhag: string | null }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState<{ temp: number; code: number } | null>(null);
  const [daily, setDaily] = useState<Daily[]>([]);

  const coords = dzongkhag ? DZONGKHAG_COORDS[dzongkhag] : null;

  useEffect(() => {
    if (!coords) { setLoading(false); return; }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setCurrent({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code });
        const days: Daily[] = d.daily.time.map((date: string, i: number) => ({
          date,
          max: Math.round(d.daily.temperature_2m_max[i]),
          min: Math.round(d.daily.temperature_2m_min[i]),
          code: d.daily.weather_code[i],
        }));
        setDaily(days);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [coords?.lat, coords?.lon]);

  if (!dzongkhag || !coords) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Set your dzongkhag in your profile to see local weather.</p>
      </div>
    );
  }

  const now = current ? describe(current.code) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-sky-50 to-white shadow-sm">
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Weather · {dzongkhag}</p>
          {loading ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-gray-400"><Loader2 size={16} className="animate-spin" /> Loading…</p>
          ) : error ? (
            <p className="mt-2 text-sm text-gray-400">Weather unavailable right now.</p>
          ) : current && now ? (
            <div className="mt-1 flex items-center gap-3">
              <now.Icon size={36} className="text-forest" />
              <div>
                <p className="text-3xl font-bold text-forest-dark">{current.temp}°C</p>
                <p className="text-sm text-gray-500">{now.label}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {!loading && !error && daily.length > 0 && (
        <div className="grid grid-cols-4 gap-1 border-t border-black/5 bg-white/50 p-3">
          {daily.map((d, i) => {
            const { Icon } = describe(d.code);
            const label = i === 0 ? "Today" : new Date(d.date).toLocaleDateString("en", { weekday: "short" });
            return (
              <div key={d.date} className="flex flex-col items-center gap-1 rounded-lg py-2 text-center">
                <span className="text-xs font-medium text-gray-500">{label}</span>
                <Icon size={18} className="text-forest" />
                <span className="text-xs font-semibold text-forest-dark">{d.max}°</span>
                <span className="text-[10px] text-gray-400">{d.min}°</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}