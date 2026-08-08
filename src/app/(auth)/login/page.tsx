"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Sprout, Eye, EyeOff, Check } from "lucide-react";
import { signIn } from "../actions";

const PERKS = [
  "Track your harvests, orders, and matches",
  "Get notified the moment a deal moves",
  "Coordinate transport across Bhutan",
];

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Log in"}</button>;
}

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [state, action] = useFormState(signIn, null as { error?: string } | null);

  return (
    <main className="min-h-screen overflow-hidden md:grid md:grid-cols-[1.1fr_1fr]">
      {/* LEFT — animated welcome panel */}
      <aside className="relative hidden md:block">
        <div className="animate-gradient absolute inset-0 bg-gradient-to-br from-forest via-forest-dark to-[#3a1d0e]" />
        <div className="animate-floaty absolute -left-8 top-16 h-40 w-40 rounded-full bg-saffron/20 blur-2xl" />
        <div className="animate-floaty absolute right-4 top-52 h-56 w-56 rounded-full bg-marigold/20 blur-3xl" style={{ animationDelay: "1.5s" }} />
        <div className="animate-floaty absolute bottom-16 left-1/3 h-32 w-32 rounded-full bg-crimson/20 blur-2xl" style={{ animationDelay: "3s" }} />

        <div className="relative flex h-full flex-col justify-center px-12 py-16 text-white">
          <Link href="/" className="reveal mb-8 flex items-center gap-2 text-lg font-bold">
            <Sprout size={24} /> DrukAgriLink
          </Link>

          <p className="reveal mb-3 inline-block w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm backdrop-blur" style={{ animationDelay: "120ms" }}>
            Kuzuzangpo la · Welcome back
          </p>
          <h2 className="reveal max-w-sm text-3xl font-bold leading-tight" style={{ animationDelay: "240ms" }}>
            Good to see you again.
          </h2>

          <ul className="reveal mt-8 space-y-3" style={{ animationDelay: "360ms" }}>
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/90">
                <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-saffron text-forest-dark">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial card */}
          <figure className="reveal mt-10 max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur" style={{ animationDelay: "480ms" }}>
            <div className="mb-2 text-saffron" aria-hidden>★★★★★</div>
            <blockquote className="text-sm leading-relaxed text-white/90">
              “Before DrukAgriLink my potatoes often went unsold. Now a coordinator pools my harvest
              with others and I reach buyers I never could on my own.”
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-saffron font-bold text-forest-dark">P</span>
              <span>
                <p className="text-sm font-semibold">Pema, farmer</p>
                <p className="text-xs text-white/60">Chukha · sample story</p>
              </span>
            </figcaption>
          </figure>
        </div>

        <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </aside>

      {/* RIGHT — the form */}
      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-lg font-bold text-forest md:hidden">
            <Sprout size={22} /> DrukAgriLink
          </Link>

          <h1 className="reveal mb-1 text-2xl font-bold text-forest-dark">Welcome back</h1>
          <p className="reveal mb-6 text-sm text-gray-500" style={{ animationDelay: "80ms" }}>Log in to DrukAgriLink.</p>

          <form action={action} className="reveal card space-y-5" style={{ animationDelay: "160ms" }}>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" name="password" required
                  type={showPw ? "text" : "password"}
                  className="input pr-10" placeholder="Your password"
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-forest"
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {state?.error && (
              <p className="rounded-lg bg-crimson/10 px-3 py-2 text-sm text-crimson">{state.error}</p>
            )}
            <Submit />
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            No account? <Link href="/register" className="font-semibold text-forest hover:underline">Register</Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">Demo: farmer1@druk.demo · Druk@2024</p>
        </div>
      </section>
    </main>
  );
}