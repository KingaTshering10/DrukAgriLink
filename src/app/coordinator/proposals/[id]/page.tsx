import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNu } from "@/lib/finance/calc";

export default async function ProposalDetail({ params }: { params: { id: string } }) {
  const profile = await requireRole("coordinator");
  const supabase = createClient();

  // Load the proposal + its buyer order (only if this coordinator created it).
  const { data: proposal } = await supabase
    .from("match_proposals")
    .select("id,status,explanation,buyer_approved,buyer_order_id,buyer_orders(required_qty,unit,offered_price,products(name),buyer_organizations(name))")
    .eq("id", params.id)
    .eq("coordinator_id", profile.id)
    .single();

  if (!proposal) notFound();

  const p = proposal as any;

  // Load the allocations under this proposal, with each farmer + product.
  const { data: allocations } = await supabase
    .from("match_allocations")
    .select("id,allocated_qty,unit_price,status,profiles(full_name),harvest_listings(products(name))")
    .eq("proposal_id", params.id)
    .order("created_at", { ascending: true });

  const order = p.buyers_order ?? p.buyer_orders;

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
            {order?.products?.name} · {order?.required_qty} {order?.unit}
          </p>
          <p className="text-sm text-gray-500">
            {order?.buyer_organizations?.name} · offer {formatNu(order?.offered_price)}/{order?.unit}
          </p>
          {p.explanation && <p className="pt-2 text-sm text-gray-600">{p.explanation}</p>}
        </div>

        {/* Allocations */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Farmer allocations</h2>
          {allocations?.length ? (
            <div className="space-y-2">
              {allocations.map((a: any) => (
                <div key={a.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-forest-dark">
                      {a.profiles?.full_name ?? "Farmer"} · {a.harvest_listings?.products?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {a.allocated_qty} units @ {formatNu(a.unit_price)}/unit
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">No allocations.</p>}
        </div>

        <Link href="/coordinator/dashboard" className="btn-ghost">← Back to desk</Link>
      </main>
    </>
  );
}