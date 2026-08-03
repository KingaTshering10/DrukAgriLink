"use client";
import { useFormState, useFormStatus } from "react-dom";
import { createHarvest } from "@/app/farmer/actions";
import { DZONGKHAGS, GEWOGS, QUALITY_GRADES, UNITS } from "@/lib/constants/bhutan";
import { useState } from "react";

type Opt = { id: string; name: string; dzongkhag?: string; gewog?: string };

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending}>{pending ? "Publishing…" : "Publish listing"}</button>;
}

export function HarvestForm({ farms, products }: { farms: Opt[]; products: Opt[] }) {
  const [state, action] = useFormState(createHarvest, null as { error?: string } | null);
  const [dz, setDz] = useState<string>(DZONGKHAGS[0]);
  return (
    <form action={action} className="card space-y-4">
      <div><label className="label" htmlFor="farm_id">Farm</label>
        <select id="farm_id" name="farm_id" required className="input">
          {farms.length === 0 && <option value="">No farm — create one first</option>}
          {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select></div>
      <div><label className="label" htmlFor="product_id">Product</label>
        <select id="product_id" name="product_id" required className="input">
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="forecast_qty">Forecast qty</label>
          <input id="forecast_qty" name="forecast_qty" type="number" min="0.01" step="0.01" required className="input" /></div>
        <div><label className="label" htmlFor="available_qty">Available qty</label>
          <input id="available_qty" name="available_qty" type="number" min="0" step="0.01" required className="input" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="unit">Unit</label>
          <select id="unit" name="unit" className="input">{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
        <div><label className="label" htmlFor="min_price">Min price / unit</label>
          <input id="min_price" name="min_price" type="number" min="0" step="0.01" required className="input" /></div>
      </div>
      <div><label className="label" htmlFor="expected_harvest_date">Expected harvest date</label>
        <input id="expected_harvest_date" name="expected_harvest_date" type="date" required className="input" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="dzongkhag">Dzongkhag</label>
          <select id="dzongkhag" name="dzongkhag" className="input" value={dz} onChange={(e) => setDz(e.target.value)}>
            {DZONGKHAGS.map((d) => <option key={d}>{d}</option>)}</select></div>
        <div><label className="label" htmlFor="gewog">Gewog</label>
          <select id="gewog" name="gewog" className="input">
            {(GEWOGS[dz] ?? []).map((g) => <option key={g}>{g}</option>)}</select></div>
      </div>
      <div><label className="label" htmlFor="quality_grade">Quality grade</label>
        <select id="quality_grade" name="quality_grade" className="input">{QUALITY_GRADES.map((q) => <option key={q}>{q}</option>)}</select></div>
      <div><label className="label" htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={2} className="input" /></div>
      <input type="hidden" name="status" value="available" />
      {state?.error && <p className="text-sm text-crimson">{state.error}</p>}
      <Submit />
    </form>
  );
}
