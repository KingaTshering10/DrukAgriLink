"use client";
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProposal } from "@/app/coordinator/actions";
import { summarizeMatch } from "@/lib/matching/match";
import { formatNu } from "@/lib/finance/calc";
import { Sparkles } from "lucide-react";

type Listing = {
  id: string; farmer_id: string; available_qty: number; unit: string; min_price: number;
  dzongkhag: string; quality_grade: string | null; profiles?: { full_name: string };
};
type Order = { id: string; required_qty: number; unit: string; offered_price: number; delivery_location: string };
type SuggestedLine = { listingId: string; takeQty: number };

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending || disabled}>{pending ? "Creating…" : "Create proposal"}</button>;
}

export function MatchBuilder({
  order,
  listings,
  suggestedLines = [],
}: {
  order: Order;
  listings: Listing[];
  suggestedLines?: SuggestedLine[];
}) {
  const [alloc, setAlloc] = useState<Record<string, number>>({});
  const [state, action] = useFormState(createProposal, null as { error?: string } | null);

  const lines = useMemo(
    () =>
      listings
        .filter((l) => (alloc[l.id] ?? 0) > 0)
        .map((l) => ({
          listing_id: l.id, farmer_id: l.farmer_id, available_qty: l.available_qty,
          allocated_qty: alloc[l.id], unit_price: l.min_price,
        })),
    [alloc, listings]
  );

  const areas = Array.from(new Set(listings.filter((l) => alloc[l.id]).map((l) => l.dzongkhag))).join(", ");
  const summary = summarizeMatch(order.required_qty, order.offered_price, lines, areas);

  // Fill the allocation inputs from the algorithm's suggestion.
  function applySuggestion() {
    const next: Record<string, number> = {};
    for (const s of suggestedLines) next[s.listingId] = s.takeQty;
    setAlloc(next);
  }

  function clearAll() {
    setAlloc({});
  }

  return (
    <div className="space-y-4">
      {/* Apply-suggestion controls */}
      {suggestedLines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={applySuggestion} className="btn-primary">
            <Sparkles size={16} /> Apply suggestion
          </button>
          <button type="button" onClick={clearAll} className="btn-ghost">Clear all</button>
        </div>
      )}

      <div className="space-y-2">
        {listings.length === 0 && <p className="card text-sm text-gray-500">No compatible listings for this product.</p>}
        {listings.map((l) => {
          const isSuggested = suggestedLines.some((s) => s.listingId === l.id);
          return (
            <div key={l.id} className={`card flex flex-wrap items-center justify-between gap-3 ${isSuggested ? "ring-1 ring-forest/30" : ""}`}>
              <div>
                <p className="font-semibold text-forest-dark">
                  {l.profiles?.full_name ?? "Farmer"}
                  {isSuggested && <span className="ml-2 rounded-full bg-forest/10 px-1.5 py-0.5 text-[10px] font-semibold text-forest">suggested</span>}
                </p>
                <p className="text-sm text-gray-500">
                  {l.available_qty} {l.unit} avail · {formatNu(l.min_price)}/{l.unit} · grade {l.quality_grade ?? "—"} · {l.dzongkhag}
                </p>
              </div>
              <input
                type="number" min="0" max={l.available_qty} step="0.01" placeholder="0"
                className="input w-28"
                value={alloc[l.id] ?? ""}
                onChange={(e) => setAlloc({ ...alloc, [l.id]: Number(e.target.value) })}
              />
            </div>
          );
        })}
      </div>

      <div className="card bg-forest-light">
        <h3 className="mb-2 font-semibold text-forest-dark">Match summary</h3>
        <ul className="space-y-1 text-sm text-forest-dark">
          <li>Requested: {summary.requestedQty} {order.unit}</li>
          <li>Proposed: {summary.proposedQty} {order.unit}</li>
          <li>Fulfilment: {summary.fulfilmentPct}%</li>
          <li>Farmers: {summary.farmerCount}</li>
          <li>Avg farmer price: {formatNu(summary.avgFarmerPrice)} · Buyer: {formatNu(summary.buyerPrice)}</li>
        </ul>
        <p className="mt-2 text-sm text-forest-dark">{summary.explanation}</p>
        {!summary.valid && summary.errors.map((e) => <p key={e} className="mt-1 text-sm text-crimson">{e}</p>)}
      </div>

      <form action={action}>
        <input type="hidden" name="buyer_order_id" value={order.id} />
        <input type="hidden" name="required_qty" value={order.required_qty} />
        <input type="hidden" name="buyer_price" value={order.offered_price} />
        <input type="hidden" name="lines" value={JSON.stringify(lines)} />
        {state?.error && <p className="mb-2 text-sm text-crimson">{state.error}</p>}
        <Submit disabled={!summary.valid || lines.length === 0} />
      </form>
    </div>
  );
}