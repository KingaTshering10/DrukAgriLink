import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNu } from "@/lib/finance/calc";
import { TripActions } from "../../TripActions";

export default async function TripDetail({ params }: { params: { id: string } }) {
  const profile = await requireRole("transport");
  const supabase = createClient();

  // 1) The shipment (only if assigned to this transporter).
  const { data: shipment } = await supabase
    .from("shipments")
    .select("id,proposal_id,vehicle_id,collection_date,delivery_date,collection_location,delivery_location,driver_name,driver_phone,status")
    .eq("id", params.id)
    .eq("provider_id", profile.id)
    .single();
  if (!shipment) notFound();
  const s = shipment as any;

  // 2) The vehicle used.
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("registration_no,vehicle_type,capacity_kg")
    .eq("id", s.vehicle_id)
    .single();
  const v = vehicle as any;

  // 3) What's being transported — via the proposal → buyer order.
  let produce: any = null;
  if (s.proposal_id) {
    const { data: proposal } = await supabase
      .from("match_proposals")
      .select("buyer_order_id")
      .eq("id", s.proposal_id)
      .single();
    if ((proposal as any)?.buyer_order_id) {
      const { data: order } = await supabase
        .from("buyer_orders")
        .select("required_qty,unit,products(name),buyer_organizations(name)")
        .eq("id", (proposal as any).buyer_order_id)
        .single();
      produce = order;
    }
  }

  const rows: [string, string][] = [
    ["Route", `${s.collection_location} → ${s.delivery_location}`],
    ["Collection date", s.collection_date ?? "TBD"],
    ["Delivery date", s.delivery_date ?? "TBD"],
    ["Produce", produce ? `${produce.products?.name} · ${produce.required_qty} ${produce.unit}` : "—"],
    ["Buyer", produce?.buyer_organizations?.name ?? "—"],
    ["Vehicle", v ? `${v.registration_no} · ${v.vehicle_type}${v.capacity_kg ? ` · ${v.capacity_kg} kg` : ""}` : "—"],
    ["Driver", s.driver_name ?? "—"],
    ["Driver phone", s.driver_phone ?? "—"],
  ];

  return (
    <>
      <AppHeader name={profile.full_name} role="Transport" />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-forest-dark">Trip details</h1>
          <StatusBadge status={s.status} />
        </div>

        {/* Route highlight */}
        <div className="card bg-gradient-to-br from-forest-light to-white">
          <p className="text-sm text-gray-500">Route</p>
          <p className="text-lg font-bold text-forest-dark">{s.collection_location} → {s.delivery_location}</p>
          {produce && (
            <p className="mt-1 text-sm text-gray-600">
              Carrying {produce.products?.name} · {produce.required_qty} {produce.unit}
              {produce.buyer_organizations?.name ? ` for ${produce.buyer_organizations.name}` : ""}
            </p>
          )}
        </div>

        {/* Detail rows */}
        <div className="card divide-y divide-black/5">
          {rows.map(([k, val]) => (
            <div key={k} className="flex justify-between gap-4 py-2 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="text-right font-medium text-forest-dark">{val}</span>
            </div>
          ))}
        </div>

        {/* Status actions */}
        <div className="card">
          <p className="mb-2 text-sm font-semibold text-gray-500">Update trip status</p>
          <TripActions id={s.id} status={s.status} />
        </div>

        <Link href="/transport/dashboard" className="btn-ghost">← Back to fleet</Link>
      </main>
    </>
  );
}