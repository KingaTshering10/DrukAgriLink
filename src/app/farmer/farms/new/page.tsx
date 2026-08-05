"use client";
import { useFormState } from "react-dom";
import Link from "next/link";
import { LocationPicker } from "@/components/LocationPicker";
import { createFarm } from "./actions";

const initial = { error: "" };

export default function NewFarm() {
  const [state, action] = useFormState(createFarm, initial);
  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-forest-dark">Create your farm</h1>
      <form action={action} className="card space-y-4">
        <div>
          <label className="label">Farm name</label>
          <input name="name" className="input" placeholder="e.g. Kinga's Farm" required />
        </div>

        <LocationPicker required />

        <div>
          <label className="label">Size (acres)</label>
          <input name="size_acres" type="number" step="0.1" min="0" className="input" placeholder="e.g. 2.5" />
        </div>

        {state?.error && <p className="text-sm text-crimson">{state.error}</p>}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Create farm</button>
          <Link href="/farmer/dashboard" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </main>
  );
}