"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Sprout, ShoppingCart, GitMerge, Truck } from "lucide-react";
import { signUp } from "../actions";

const OPTIONS = [
  { role: "farmer", icon: Sprout, label: "Farmer", hint: "List and sell harvests", accent: "#1f5c3d" },
  { role: "buyer", icon: ShoppingCart, label: "Buyer", hint: "Order produce in bulk", accent: "#f4a300" },
  { role: "coordinator", icon: GitMerge, label: "Coordinator", hint: "Combine supply & demand", accent: "#e8722b" },
  { role: "transport", icon: Truck, label: "Transport", hint: "Move produce", accent: "#b5322e" },
] as const;

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending}>{pending ? "Creating…" : "Create account"}</button>;
}

export default function Register() {
  const [role, setRole] = useState<string>("farmer");
  const [state, action] = useFormState(signUp, null as { error?: string } | null);

  return (
    <main className="min-h-screen overflow-hidden md:grid md:grid-cols-2">
      {/* LEFT — animated Bhutanese welcome panel (desktop) */}
      <aside className="relative hidden md:block">
        <div className="animate-gradient absolute inset-0 bg-gradient-to-br from-forest via-forest-dark to-[#3a1d0e]" />
        <div className="animate-floaty absolute -left-8 top-16 h-40 w-40 rounded-full bg-saffron/20 blur-2xl" />
        <div className="animate-floaty absolute right-4 top-52 h-56 w-56 rounded-full bg-marigold/20 blur-3xl" style={{ animationDelay: "1.5s" }} />
        <div className="animate-floaty absolute bottom-10 left-1/3 h-32 w-32 rounded-full bg-crimson/20 blur-2xl" style={{ animationDelay: "3s" }} />

        <div className="relative flex h-full flex-col justify-center px-12 text-white">
          <Link href="/" className="reveal mb-8 flex items-center gap-2 text-lg font-bold">
            <Sprout size={24} /> DrukAgriLink
          </Link>
          <p className="reveal mb-3 inline-block w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm backdrop-blur" style={{ animationDelay: "120ms" }}>
            Kuzuzangpo la · Welcome
          </p>
          <h2 className="reveal max-w-sm text-3xl font-bold leading-tight" style={{ animationDelay: "240ms" }}>
            Join Bhutan&apos;s farm-to-market network.
          </h2>
          <p className="reveal mt-4 max-w-sm text-white/80" style={{ animationDelay: "360ms" }}>
            Whether you grow, buy, coordinate, or transport — DrukAgriLink connects you to the
            people who move produce across the Dragon Kingdom.
          </p>
        </div>
        {/* flag-motif edge */}
        <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </aside>

      {/* RIGHT — the form */}
      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* mobile brand + motif */}
          <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-lg font-bold text-forest md:hidden">
            <Sprout size={22} /> DrukAgriLink
          </Link>

          <h1 className="reveal mb-1 text-2xl font-bold text-forest-dark">Create your account</h1>
          <p className="reveal mb-6 text-sm text-gray-500" style={{ animationDelay: "80ms" }}>Choose the role that fits you.</p>

          <form action={action} className="reveal card space-y-5" style={{ animationDelay: "160ms" }}>
            <input type="hidden" name="role" value={role} />

            <div className="grid grid-cols-2 gap-3">
              {OPTIONS.map((o) => {
                const selected = role === o.role;
                return (
                  <button
                    type="button"
                    key={o.role}
                    onClick={() => setRole(o.role)}
                    className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-200
                      ${selected
                        ? "border-transparent shadow-md -translate-y-0.5"
                        : "border-black/10 bg-white hover:-translate-y-0.5 hover:shadow-sm"}`}
                    style={selected ? { boxShadow: `0 0 0 2px ${o.accent}` } : undefined}
                  >
                    <span
                      className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-white transition-transform duration-200 group-hover:scale-110"
                      style={{ background: o.accent }}
                    >
                      <o.icon size={18} />
                    </span>
                    <p className="text-sm font-semibold text-forest-dark">{o.label}</p>
                    <p className="text-xs text-gray-500">{o.hint}</p>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="label" htmlFor="full_name">Full name</label>
              <input id="full_name" name="full_name" required className="input" placeholder="e.g. Kinga Tshering" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required minLength={8} className="input" placeholder="At least 8 characters" />
              <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
            </div>

            {state?.error && (
              <p className="rounded-lg bg-crimson/10 px-3 py-2 text-sm text-crimson">{state.error}</p>
            )}
            <Submit />
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Have an account? <Link href="/login" className="font-semibold text-forest hover:underline">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}