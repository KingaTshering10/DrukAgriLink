"use client";
import { useFormState, useFormStatus } from "react-dom";
import { createOrder } from "@/app/buyer/actions";
import { QUALITY_GRADES, UNITS } from "@/lib/constants/bhutan";

type Opt = { id: string; name: string };
function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending}>{pending ? "Creating…" : "Create order"}</button>;
}

export function OrderForm({ orgs, products }: { orgs: Opt[]; products: Opt[] }) {
  const [state, action] = useFormState(createOrder, null as { error?: string } | null);
  return (
    <form action={action} className="card space-y-4">
      <div><label className="label" htmlFor="buyer_org_id">Organization</label>
        <select id="buyer_org_id" name="buyer_org_id" required className="input">
          {orgs.length === 0 && <option value="">No organization on file</option>}
          {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select></div>
      <div><label className="label" htmlFor="product_id">Product</label>
        <select id="product_id" name="product_id" required className="input">
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="required_qty">Required qty</label>
          <input id="required_qty" name="required_qty" type="number" min="0.01" step="0.01" required className="input" /></div>
        <div><label className="label" htmlFor="unit">Unit</label>
          <select id="unit" name="unit" className="input">{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="offered_price">Offered price / unit</label>
          <input id="offered_price" name="offered_price" type="number" min="0" step="0.01" required className="input" /></div>
        <div><label className="label" htmlFor="min_quality_grade">Min grade</label>
          <select id="min_quality_grade" name="min_quality_grade" className="input">{QUALITY_GRADES.map((q) => <option key={q}>{q}</option>)}</select></div>
      </div>
      <div><label className="label" htmlFor="required_delivery_date">Required delivery date</label>
        <input id="required_delivery_date" name="required_delivery_date" type="date" required className="input" /></div>
      <div><label className="label" htmlFor="delivery_location">Delivery location</label>
        <input id="delivery_location" name="delivery_location" required className="input" /></div>
      <div><label className="label" htmlFor="packaging">Packaging</label>
        <input id="packaging" name="packaging" className="input" placeholder="e.g. 25kg sacks" /></div>
      <input type="hidden" name="status" value="open" />
      {state?.error && <p className="text-sm text-crimson">{state.error}</p>}
      <Submit />
    </form>
  );
}
