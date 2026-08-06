"use client";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { QUALITY_GRADES, UNITS } from "@/lib/constants/bhutan";
import { updateOrder } from "./actions";

type Opt = { id: string; name: string };

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>;
}

export function EditOrderForm({ order, products }: { order: any; products: Opt[] }) {
  const update = updateOrder.bind(null, order.id);
  const [state, action] = useFormState(update, null as { error?: string } | null);
  return (
    <form action={action} className="card space-y-4">
      <div><label className="label" htmlFor="product_id">Product</label>
        <select id="product_id" name="product_id" required className="input" defaultValue={order.product_id}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="required_qty">Required qty</label>
          <input id="required_qty" name="required_qty" type="number" min="0.01" step="0.01" required className="input" defaultValue={order.required_qty} /></div>
        <div><label className="label" htmlFor="unit">Unit</label>
          <select id="unit" name="unit" className="input" defaultValue={order.unit}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="offered_price">Offered price / unit</label>
          <input id="offered_price" name="offered_price" type="number" min="0" step="0.01" required className="input" defaultValue={order.offered_price} /></div>
        <div><label className="label" htmlFor="min_quality_grade">Min grade</label>
          <select id="min_quality_grade" name="min_quality_grade" className="input" defaultValue={order.min_quality_grade ?? ""}>{QUALITY_GRADES.map((q) => <option key={q}>{q}</option>)}</select></div>
      </div>
      <div><label className="label" htmlFor="required_delivery_date">Required delivery date</label>
        <input id="required_delivery_date" name="required_delivery_date" type="date" required className="input" defaultValue={order.required_delivery_date ?? ""} /></div>
      <div><label className="label" htmlFor="delivery_location">Delivery location</label>
        <input id="delivery_location" name="delivery_location" required className="input" defaultValue={order.delivery_location ?? ""} /></div>
      <div><label className="label" htmlFor="packaging">Packaging</label>
        <input id="packaging" name="packaging" className="input" placeholder="e.g. 25kg sacks" defaultValue={order.packaging ?? ""} /></div>
      {state?.error && <p className="text-sm text-crimson">{state.error}</p>}
      <div className="flex gap-3">
        <Submit />
        <Link href={`/buyer/orders/${order.id}`} className="btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}