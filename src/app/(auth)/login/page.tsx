"use client";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Log in"}</button>;
}

export default function Login() {
  const [state, action] = useFormState(signIn, null as { error?: string } | null);
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold text-forest-dark">Welcome back</h1>
      <p className="mb-6 text-sm text-gray-500">Log in to DrukAgriLink.</p>
      <form action={action} className="card space-y-4">
        <div><label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" placeholder="farmer1@druk.demo" /></div>
        <div><label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="input" placeholder="••••••••" /></div>
        {state?.error && <p className="text-sm text-crimson">{state.error}</p>}
        <Submit />
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        No account? <Link href="/register" className="font-semibold text-forest">Register</Link>
      </p>
      <p className="mt-2 text-center text-xs text-gray-400">Demo: farmer1@druk.demo · Druk@2024</p>
    </main>
  );
}
