import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { MatchBuilder } from "./MatchBuilder";
import { Empty } from "@/components/ui/Empty";
import { suggestMatch, type Candidate } from "@/lib/matching/suggest";
import { formatNu } from "@/lib/finance/calc";
import { MapPin } from "lucide-react";

export default async function NewMatch({ searchParams }: { searchParams: { order?: string } }) {
  const profile = await requireRole("coordinator");
  const supabase = createClient();
  const orderId = searchParams.order;
  if (!orderId) return <><AppHeader name={profile.full_name} role="Coordinator" /><main className="mx-auto max-w-lg px-4 py-6"><Empty title="No order selected" hint="Pick an order from the dashboard." /></main></>;

  const { data: order } = await supabase
    .from("buyer_orders")
    .select("id,required_qty,unit,offered_price,product_id,delivery_location,products(name)")
    .eq("id", orderId).single();
  if (!order) return <><AppHeader name={profile.full_name} role="Coordinator" /><main className="mx-auto max-w-lg px-4 py-6"><Empty title="Order not found" /></main></>;

  // compatible listings: same product, available
  const { data: listings } = await supabase
    .from("harvest_listings")
    .select("id,farmer_id,available_qty,unit,min_price,dzongkhag,quality_grade,profiles(full_name)")
    .eq("product_id", (order as any).product_id)
    .eq("status", "available");

  const o = order as any;
  const ls = (listings as any) ?? [];

  // --- Run the multi-factor match-suggestion algorithm ---
  const candidates: Candidate[] = ls.map((l: any) => ({
    listingId: l.id,
    farmerName: l.profiles?.full_name ?? "Farmer",
    availableQty: Number(l.available_qty ?? 0),
    unitPrice: Number(l.min_price ?? 0),
    dzongkhag: l.dzongkhag ?? null,
    qualityGrade: l.quality_grade ?? null,
  }));
  const suggestion = suggestMatch(candidates, Number(o.required_qty), o.delivery_location ?? null);

  return (
    <>
      <AppHeader name={profile.full_name} role="Coordinator" />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-1 text-xl font-bold text-forest-dark">Build a match</h1>
        <p className="mb-4 text-sm text-gray-500">
          {o.products?.name} · needs {o.required_qty} {o.unit} · to {o.delivery_location}
        </p>

        {/* Suggested allocation */}
        {suggestion.allocations.length > 0 && (
          <div className="mb-5 rounded-2xl border border-forest/20 bg-forest-light/40 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white text-xs font-bold">✦</span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-forest-dark">Suggested allocation</h2>
            </div>
            <p className="mb-3 text-xs text-gray-500">
              Ranked by a blend of proximity to {o.delivery_location ?? "delivery"}, price, quality, and quantity. A starting point — adjust as you like.
            </p>

            <div className="space-y-2">
              {suggestion.allocations.map((a) => (
                <div key={a.listingId} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold text-forest-dark">{a.farmerName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {a.dzongkhag ?? "—"}
                      {a.proximity === 1 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-forest/10 px-1.5 py-0.5 text-[10px] font-semibold text-forest">
                          <MapPin size={9} /> same dzongkhag
                        </span>
                      )}
                      {a.proximity === 0.5 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-saffron/15 px-1.5 py-0.5 text-[10px] font-semibold text-marigold">
                          <MapPin size={9} /> nearby
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-forest-dark">{a.takeQty} {o.unit}</p>
                    <p className="text-xs text-gray-500">@ {formatNu(a.unitPrice)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-forest/10 pt-3 text-xs text-gray-600">
              <span>Fills <b className="text-forest-dark">{suggestion.filledQty}/{suggestion.requiredQty} {o.unit}</b></span>
              <span>Avg price <b className="text-forest-dark">{formatNu(suggestion.avgPrice)}</b></span>
              {suggestion.fullyFilled
                ? <span className="font-semibold text-forest">✓ Fully filled</span>
                : <span className="font-semibold text-marigold">⚠ Short by {suggestion.requiredQty - suggestion.filledQty} {o.unit}</span>}
            </div>
          </div>
        )}

        <MatchBuilder order={o} listings={ls} />
      </main>
    </>
  );
}