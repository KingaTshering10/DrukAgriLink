import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNu } from "@/lib/finance/calc";
import { DeleteButton } from "./DeleteButton";

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const profile = await requireRole("buyer");
  const supabase = createClient();

  const { data: order } = await supabase
    .from("buyer_orders")
    .select("id,required_qty,unit,offered_price,required_delivery_date,delivery_location,min_quality_grade,packaging,notes,status,products(name),buyer_organizations!inner(name,owner_id)")
    .eq("id", params.id)
    .eq("buyer_organizations.owner_id", profile.id)
    .single();

  if (!order) notFound();

  const o = order as any;

  // Charges: trace order → proposal → shipment (transport cost) and collection records (produce cost).
  let produceCost = 0;
  let transportCost = 0;
  let hasShipment = false;

  const { data: proposal } = await supabase
    .from("match_proposals")
    .select("id")
    .eq("buyer_order_id", o.id)
    .eq("status", "confirmed")
    .maybeSingle();

  if (proposal?.id) {
    // Shipment (transport cost charged to the buyer).
    const { data: shipment } = await supabase
      .from("shipments")
      .select("transport_cost")
      .eq("proposal_id", proposal.id)
      .maybeSingle();
    if (shipment) {
      hasShipment = true;
      transportCost = Number((shipment as any).transport_cost ?? 0);
    }

    // Produce cost = sum of farmer net amounts for this deal's collection records.
    const { data: collections } = await supabase
      .from("collection_records")
      .select("net_amount_due, shipments!inner(proposal_id)")
      .eq("shipments.proposal_id", proposal.id);
    produceCost = (collections ?? []).reduce(
      (sum, c: any) => sum + Number(c.net_amount_due ?? 0),
      0
    );
  }

  const totalCost = produceCost + transportCost;

  const rows: [string, string][] = [
    ["Product", o.products?.name ?? "—"],
    ["Organization", o.buyer_organizations?.name ?? "—"],
    ["Required quantity", `${o.required_qty} ${o.unit}`],
    ["Offered price", `${formatNu(o.offered_price)} / ${o.unit}`],
    ["Delivery by", o.required_delivery_date ?? "—"],
    ["Delivery location", o.delivery_location ?? "—"],
    ["Minimum grade", o.min_quality_grade ?? "—"],
    ["Packaging", o.packaging ?? "—"],
    ["Notes", o.notes ?? "—"],
  ];

  return (
    <>
      <AppHeader name={profile.full_name} role="Buyer" />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-forest-dark">Order details</h1>
          <StatusBadge status={o.status} />
        </div>

        <div className="card divide-y divide-black/5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="text-right font-medium text-forest-dark">{v}</span>
            </div>
          ))}
        </div>

        {/* Charges breakdown — shown once the deal is confirmed and priced */}
        {produceCost > 0 || transportCost > 0 ? (
          <div className="card">
            <p className="mb-2 text-sm font-semibold text-gray-500">Charges</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Produce cost</span>
                <span className="text-forest-dark">{formatNu(produceCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transport {hasShipment ? "" : "(pending)"}</span>
                <span className="text-forest-dark">{formatNu(transportCost)}</span>
              </div>
              <div className="flex justify-between border-t border-black/5 pt-2 font-semibold">
                <span className="text-forest-dark">Total payable</span>
                <span className="text-forest-dark">{formatNu(totalCost)}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Farmers receive the full produce price. Transport is charged separately.
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <Link href="/buyer/dashboard" className="btn-ghost">← Back to orders</Link>
          <div className="flex gap-2">
            <Link href={`/buyer/orders/${o.id}/edit`} className="btn-ghost">Edit order</Link>
            <DeleteButton orderId={o.id} />
          </div>
        </div>
      </main>
    </>
  );
}