"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Sprout, ShoppingCart, GitMerge, Truck } from "lucide-react";
import { signUp } from "../actions";

const OPTIONS = [
  { role: "farmer", icon: Sprout, label: "Farmer", hint: "List and sell harvests" },
  { role: "buyer", icon: ShoppingCart, label: "Buyer", hint: "Order produce in bulk" },
  { role: "coordinator", icon: GitMerge, label: "Coordinator", hint: "Combine supply & demand" },
  { role: "transport", icon: Truck, label: "Transport", hint: "Move produce" },
] as const;

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending}>{pending ? "Creating…" : "Create account"}</button>;
}

export default function Register() {
  const [role, setRole] = useState<string>("farmer");
  const [state, action] = useFormState(signUp, null as { error?: string } | null);
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold text-forest-dark">Create your account</h1>
      <p className="mb-6 text-sm text-gray-500">Choose the role that fits you.</p>
      <form action={action} className="card space-y-4">
        <input type="hidden" name="role" value={role} />
        <div className="grid grid-cols-2 gap-2">
          {OPTIONS.map((o) => (
            <button type="button" key={o.role} onClick={() => setRole(o.role)}
              className={`rounded-xl border p-3 text-left ${role === o.role ? "border-forest bg-forest-light" : "border-black/10 bg-white"}`}>
              <o.icon className="text-forest" size={18} />
              <p className="mt-1 text-sm font-semibold text-forest-dark">{o.label}</p>
              <p className="text-xs text-gray-500">{o.hint}</p>
            </button>
          ))}
        </div>
        <div><label className="label" htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" required className="input" /></div>
        <div><label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" /></div>
        <div><label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} className="input" />
          <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p></div>
        {state?.error && <p className="text-sm text-crimson">{state.error}</p>}
        <Submit />
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Have an account? <Link href="/login" className="font-semibold text-forest">Log in</Link>
      </p>
    </main>
  );
}
