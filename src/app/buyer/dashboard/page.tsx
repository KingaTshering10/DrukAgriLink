import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";

export default async function BuyerDashboard() {
  const profile = await requireRole("buyer");
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("buyer_orders")
    .select("id,required_qty,unit,offered_price,required_delivery_date,status,products(name),buyer_organizations!inner(owner_id)")
    .eq("buyer_organizations.owner_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <AppHeader name={profile.full_name} role="Buyer" />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-forest-dark">Procurement</h1>
          <Link href="/buyer/orders/new" className="btn-primary"><Plus size={16} /> New order</Link>
        </div>
        {orders?.length ? (
          <div className="space-y-2">
            {orders.map((o: any) => (
              <div key={o.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-forest-dark">{o.products?.name} · {o.required_qty} {o.unit}</p>
                  <p className="text-sm text-gray-500">Offer {formatNu(o.offered_price)}/{o.unit} · by {o.required_delivery_date}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        ) : <Empty title="No orders yet" hint="Create a procurement order to receive proposals." />}
      </main>
    </>
  );
}
