"use client";
import { useFormState } from "react-dom";
import { assignTransport } from "./actions";

type Vehicle = { id: string; registration_no: string; vehicle_type: string; capacity_kg: number | null };

export function AssignTransport({ proposalId, vehicles }: { proposalId: string; vehicles: Vehicle[] }) {
  const bound = assignTransport.bind(null, proposalId);
  const [state, action] = useFormState(bound, null as { error?: string } | null);

  if (vehicles.length === 0) {
    return (
      <div className="card border-saffron/40 bg-saffron/10 text-sm text-gray-600">
        No available vehicles right now. Transporters need to register an available vehicle before you can assign a trip.
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4">
      <div>
        <label className="label">Vehicle</label>
        <select name="vehicle_id" className="input" required defaultValue="">
          <option value="" disabled>Select an available vehicle…</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration_no} · {v.vehicle_type}{v.capacity_kg ? ` · ${v.capacity_kg} kg` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Collection location</label>
          <input name="collection_location" className="input" placeholder="e.g. Bongo, Chukha" required />
        </div>
        <div>
          <label className="label">Delivery location</label>
          <input name="delivery_location" className="input" placeholder="e.g. Thimphu" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Collection date <span className="font-normal text-gray-400">(optional)</span></label>
          <input name="collection_date" type="date" className="input" />
        </div>
        <div>
          <label className="label">Delivery date <span className="font-normal text-gray-400">(optional)</span></label>
          <input name="delivery_date" type="date" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Total transport cost (Nu.)</label>
        <input name="transport_cost" type="number" min="0" step="0.01" className="input" placeholder="e.g. 5000" required />
        <p className="mt-1 text-xs text-gray-400">Split across farmers in proportion to their sale value.</p>
      </div>
      {state?.error && <p className="rounded-lg bg-crimson/10 px-3 py-2 text-sm text-crimson">{state.error}</p>}
      <button type="submit" className="btn-primary">Assign transport</button>
    </form>
  );
}