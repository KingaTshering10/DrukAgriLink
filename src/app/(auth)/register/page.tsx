"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Sprout, ShoppingCart, GitMerge, Truck, Eye, EyeOff, Check } from "lucide-react";
import { signUp } from "../actions";

const OPTIONS = [
  { role: "farmer", icon: Sprout, label: "Farmer", hint: "List and sell harvests", accent: "#1f5c3d" },
  { role: "buyer", icon: ShoppingCart, label: "Buyer", hint: "Order produce in bulk", accent: "#f4a300" },
  { role: "coordinator", icon: GitMerge, label: "Coordinator", hint: "Combine supply & demand", accent: "#e8722b" },
  { role: "transport", icon: Truck, label: "Transport", hint: "Move produce", accent: "#b5322e" },
] as const;

const PERKS = [
  "Reach institutional buyers across Bhutan",
  "Fair, transparent pricing — no hidden fees",
  "Share transport and cut delivery costs",
];

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full" disabled={pending || disabled}>
      {pending ? "Creating…" : "Create account"}
    </button>
  );
}

export default function Register() {
  const [role, setRole] = useState<string>("farmer");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [state, action] = useFormState(signUp, null as { error?: string; success?: boolean } | null);

  const mismatch = confirm.length > 0 && password !== confirm;
  const matched = confirm.length > 0 && password === confirm;

  // Success screen after signup (email confirmation required).
  if (state?.success) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-light text-forest">
          <Sprout size={28} />
        </div>
        <h1 className="text-2xl font-bold text-forest-dark">Check your email</h1>
        <p className="mt-2 text-gray-600">
          We&apos;ve sent a confirmation link to your inbox. Click it to activate your account, then log in.
        </p>
        <Link href="/login" className="btn-primary mt-6">Go to login</Link>
      </main>
    );
  }

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
            Kuzuzangpo la · Welcome
          </p>
          <h2 className="reveal max-w-sm text-3xl font-bold leading-tight" style={{ animationDelay: "240ms" }}>
            Join Bhutan&apos;s farm-to-market network.
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
        </div>
        <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </aside>

      {/* RIGHT — the form */}
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
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
                      ${selected ? "border-transparent shadow-md -translate-y-0.5" : "border-black/10 bg-white hover:-translate-y-0.5 hover:shadow-sm"}`}
                    style={selected ? { boxShadow: `0 0 0 2px ${o.accent}` } : undefined}
                  >
                    <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-white transition-transform duration-200 group-hover:scale-110" style={{ background: o.accent }}>
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
              <label className="label" htmlFor="phone">Phone <span className="font-normal text-gray-400">(optional)</span></label>
              <input id="phone" name="phone" type="tel" className="input" placeholder="e.g. 17XXXXXX" />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" name="password" required minLength={8}
                  type={showPw ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10" placeholder="At least 8 characters"
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-forest"
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="confirm_password">Confirm password</label>
              <div className="relative">
                <input
                  id="confirm_password" name="confirm_password" required
                  type={showPw ? "text" : "password"}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className={`input pr-10 ${mismatch ? "border-crimson focus:ring-crimson/30" : matched ? "border-forest" : ""}`}
                  placeholder="Re-enter your password"
                />
                {matched && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest" />}
              </div>
              {mismatch && <p className="mt-1 text-xs text-crimson">Passwords do not match.</p>}
            </div>

            {state?.error && (
              <p className="rounded-lg bg-crimson/10 px-3 py-2 text-sm text-crimson">{state.error}</p>
            )}
            <Submit disabled={mismatch || password.length === 0 || confirm.length === 0} />
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Have an account? <Link href="/login" className="font-semibold text-forest hover:underline">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}