"use client";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { QUALITY_GRADES, UNITS } from "@/lib/constants/bhutan";
import { updateHarvest } from "./actions";

type Opt = { id: string; name: string };

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>;
}

export function EditHarvestForm({ harvest, farms, products }: { harvest: any; farms: Opt[]; products: Opt[] }) {
  const update = updateHarvest.bind(null, harvest.id);
  const [state, action] = useFormState(update, null as { error?: string } | null);
  return (
    <form action={action} className="card space-y-4">
      <div><label className="label" htmlFor="farm_id">Farm</label>
        <select id="farm_id" name="farm_id" required className="input" defaultValue={harvest.farm_id}>
          {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select></div>
      <div><label className="label" htmlFor="product_id">Product</label>
        <select id="product_id" name="product_id" required className="input" defaultValue={harvest.product_id}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="forecast_qty">Forecast qty</label>
          <input id="forecast_qty" name="forecast_qty" type="number" min="0.01" step="0.01" required className="input" defaultValue={harvest.forecast_qty} /></div>
        <div><label className="label" htmlFor="available_qty">Available qty</label>
          <input id="available_qty" name="available_qty" type="number" min="0" step="0.01" required className="input" defaultValue={harvest.available_qty} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="unit">Unit</label>
          <select id="unit" name="unit" className="input" defaultValue={harvest.unit}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
        <div><label className="label" htmlFor="min_price">Min price / unit</label>
          <input id="min_price" name="min_price" type="number" min="0" step="0.01" required className="input" defaultValue={harvest.min_price} /></div>
      </div>
      <div><label className="label" htmlFor="expected_harvest_date">Expected harvest date</label>
        <input id="expected_harvest_date" name="expected_harvest_date" type="date" required className="input" defaultValue={harvest.expected_harvest_date ?? ""} /></div>
      <div><label className="label" htmlFor="quality_grade">Quality grade</label>
        <select id="quality_grade" name="quality_grade" className="input" defaultValue={harvest.quality_grade ?? ""}>{QUALITY_GRADES.map((q) => <option key={q}>{q}</option>)}</select></div>
      <div><label className="label" htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={2} className="input" defaultValue={harvest.notes ?? ""} /></div>
      {state?.error && <p className="text-sm text-crimson">{state.error}</p>}
      <div className="flex gap-3">
        <Submit />
        <Link href={`/farmer/harvests/${harvest.id}`} className="btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}