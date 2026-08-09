import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";
import { ProposalActions } from "@/app/buyer/ProposalActions";

export default async function BuyerDashboard() {
  const profile = await requireRole("buyer");
  const supabase = createClient();

  const { count: unread } = await supabase
    .from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", profile.id).eq("read", false);

  const { data: orgs } = await supabase
    .from("buyer_organizations").select("id").eq("owner_id", profile.id);
  const hasOrg = (orgs?.length ?? 0) > 0;

  const { data: orders } = await supabase
    .from("buyer_orders")
    .select("id,required_qty,unit,offered_price,required_delivery_date,status,products(name),buyer_organizations!inner(owner_id)")
    .eq("buyer_organizations.owner_id", profile.id)
    .order("created_at", { ascending: false });

  const { data: proposals } = await supabase
    .from("match_proposals")
    .select("id,status,explanation,buyer_orders!inner(buyer_organizations!inner(owner_id))")
    .eq("buyer_orders.buyer_organizations.owner_id", profile.id)
    .eq("status", "pending_farmers")
    .order("created_at", { ascending: false });

  const openCount = orders?.filter((o: any) => o.status === "open").length ?? 0;

  return (
    <>
      <AppHeader name={profile.full_name} role="Buyer" unread={unread ?? 0} />

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Header row */}
        <div className="flex flex-col gap-4 border-b border-black/5 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-forest-dark">Procurement</h1>
            <p className="mt-1 text-sm text-gray-500">
              {orders?.length ?? 0} order{(orders?.length ?? 0) === 1 ? "" : "s"} · {openCount} open
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/buyer/organization/new" className="btn-ghost"><Plus size={16} /> Organization</Link>
            <Link href="/buyer/orders/new" className="btn-primary"><Plus size={16} /> New order</Link>
          </div>
        </div>

        {!hasOrg && (
          <div className="card border-saffron/40 bg-saffron/10">
            <p className="font-semibold text-forest-dark">Set up your organization first</p>
            <p className="mt-1 text-sm text-gray-600">You need a buyer organization before creating orders.</p>
            <Link href="/buyer/organization/new" className="btn-primary mt-3 inline-flex"><Plus size={16} /> Create organization</Link>
          </div>
        )}

        {/* Proposals — quietly highlighted with a left accent */}
        {proposals?.length ? (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-500">Proposals to review</h2>
            <div className="space-y-2">
              {proposals.map((p: any) => (
                <div key={p.id} className="card flex items-center justify-between gap-4 border-l-4 border-l-saffron">
                  <p className="text-sm text-gray-700">{p.explanation}</p>
                  <ProposalActions proposalId={p.id} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Orders */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Your orders</h2>
          {orders?.length ? (
            <div className="space-y-2">
              {orders.map((o: any) => (
                <Link
                  key={o.id}
                  href={`/buyer/orders/${o.id}`}
                  className="card flex items-center justify-between transition hover:shadow-md hover:-translate-y-0.5"
                >
                  <div>
                    <p className="font-semibold text-forest-dark">{o.products?.name} · {o.required_qty} {o.unit}</p>
                    <p className="text-sm text-gray-500">Offer {formatNu(o.offered_price)}/{o.unit} · by {o.required_delivery_date}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          ) : <Empty title="No orders yet" hint="Create a procurement order to receive proposals." />}
        </section>
      </main>
    </>
  );
}