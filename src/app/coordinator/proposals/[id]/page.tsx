import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNu } from "@/lib/finance/calc";
import { AssignTransport } from "./AssignTransport";

export default async function ProposalDetail({ params }: { params: { id: string } }) {
  const profile = await requireRole("coordinator");
  const supabase = createClient();

  // 1) The proposal (only if this coordinator owns it).
  const { data: proposal } = await supabase
    .from("match_proposals")
    .select("id,status,explanation,buyer_approved,buyer_order_id")
    .eq("id", params.id)
    .eq("coordinator_id", profile.id)
    .single();
  if (!proposal) notFound();
  const p = proposal as any;

  // 2) The buyer order behind it.
  const { data: order } = await supabase
    .from("buyer_orders")
    .select("required_qty,unit,offered_price,products(name),buyer_organizations(name)")
    .eq("id", p.buyer_order_id)
    .single();
  const o = order as any;

  // 3) The allocations under this proposal.
  const { data: allocs } = await supabase
    .from("match_allocations")
    .select("id,allocated_qty,unit_price,status,farmer_id,listing_id")
    .eq("proposal_id", params.id)
    .order("created_at", { ascending: true });

  // 4) Farmer names + product names (reliable per-row lookups).
  const rows = [];
  for (const a of allocs ?? []) {
    const [{ data: farmer }, { data: listing }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", (a as any).farmer_id).single(),
      supabase.from("harvest_listings").select("products(name)").eq("id", (a as any).listing_id).single(),
    ]);
    rows.push({
      ...(a as any),
      farmerName: (farmer as any)?.full_name ?? "Farmer",
      productName: (listing as any)?.products?.name ?? "—",
    });
  }

  // 5) Available vehicles (for assigning transport) + any existing shipment.
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id,registration_no,vehicle_type,capacity_kg")
    .eq("available", true);

  const { data: existingShipment } = await supabase
    .from("shipments")
    .select("id,collection_location,delivery_location,status")
    .eq("proposal_id", params.id)
    .maybeSingle();

  return (
    <>
      <AppHeader name={profile.full_name} role="Coordinator" />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-forest-dark">Proposal details</h1>
          <StatusBadge status={p.status} />
        </div>

        {/* Buyer order summary */}
        <div className="card space-y-1">
          <p className="text-sm font-semibold text-gray-500">Buyer demand</p>
          <p className="font-semibold text-forest-dark">
            {o?.products?.name ?? "—"} · {o?.required_qty} {o?.unit}
          </p>
          <p className="text-sm text-gray-500">
            {o?.buyer_organizations?.name ?? "—"} · offer {formatNu(o?.offered_price ?? 0)}/{o?.unit}
          </p>
          {p.explanation && <p className="pt-2 text-sm text-gray-600">{p.explanation}</p>}
        </div>

        {/* Allocations */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Farmer allocations</h2>
          {rows.length ? (
            <div className="space-y-2">
              {rows.map((a: any) => (
                <div key={a.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-forest-dark">{a.farmerName} · {a.productName}</p>
                    <p className="text-sm text-gray-500">{a.allocated_qty} units @ {formatNu(a.unit_price)}/unit</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">No allocations.</p>}
        </div>

        {/* Transport assignment — only for confirmed proposals */}
        {p.status === "confirmed" && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-500">Transport</h2>
            {existingShipment ? (
              <div className="card flex items-center justify-between">
                <p className="text-sm text-forest-dark">
                  {existingShipment.collection_location} → {existingShipment.delivery_location}
                </p>
                <StatusBadge status={existingShipment.status} />
              </div>
            ) : (
              <AssignTransport proposalId={p.id} vehicles={vehicles ?? []} />
            )}
          </div>
        )}

        <Link href="/coordinator/dashboard" className="btn-ghost">← Back to desk</Link>
      </main>
    </>
  );
}