"use client";
import { useFormState } from "react-dom";
import Link from "next/link";
import { createVehicle } from "./actions";

const VEHICLE_TYPES = ["Pickup truck", "Light truck", "Medium truck", "Heavy truck", "Refrigerated van", "Van"];

const initial = { error: "" };

export default function NewVehicle() {
  const [state, action] = useFormState(createVehicle, initial);
  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-forest-dark">Register a vehicle</h1>
      <form action={action} className="card space-y-4">
        <div>
          <label className="label">Registration number</label>
          <input name="registration_no" className="input" placeholder="e.g. BT-1-A1234" required />
        </div>
        <div>
          <label className="label">Vehicle type</label>
          <select name="vehicle_type" className="input" required defaultValue="">
            <option value="" disabled>Select type…</option>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Capacity (kg)</label>
          <input name="capacity_kg" type="number" min="1" step="1" className="input" placeholder="e.g. 1500" />
        </div>
        <div>
          <label className="label">Service area <span className="font-normal text-gray-400">(optional)</span></label>
          <input name="service_area" className="input" placeholder="e.g. Thimphu – Paro – Chukha" />
        </div>
        <label className="flex items-center gap-2 text-sm text-forest-dark">
          <input type="checkbox" name="refrigerated" className="h-4 w-4 rounded border-black/20" />
          Refrigerated
        </label>

        {state?.error && <p className="rounded-lg bg-crimson/10 px-3 py-2 text-sm text-crimson">{state.error}</p>}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Register vehicle</button>
          <Link href="/transport/dashboard" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </main>
  );
}