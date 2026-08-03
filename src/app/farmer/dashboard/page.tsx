import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";

export default async function FarmerDashboard() {
  const profile = await requireRole("farmer");
  const supabase = createClient();
  const { data: listings } = await supabase
    .from("harvest_listings")
    .select("id,forecast_qty,available_qty,unit,min_price,status,products(name)")
    .eq("farmer_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const { data: allocations } = await supabase
    .from("match_allocations")
    .select("id,allocated_qty,unit_price,status")
    .eq("farmer_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <AppHeader name={profile.full_name} role="Farmer" />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-forest-dark">Kuzuzangpo, {profile.full_name.split(" ")[0]}</h1>
          <Link href="/farmer/harvests/new" className="btn-primary"><Plus size={16} /> New harvest</Link>
        </div>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Recent harvests</h2>
          {listings?.length ? (
            <div className="space-y-2">
              {listings.map((l: any) => (
                <div key={l.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-forest-dark">{l.products?.name}</p>
                    <p className="text-sm text-gray-500">{l.available_qty}/{l.forecast_qty} {l.unit} · {formatNu(l.min_price)}/{l.unit}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
            </div>
          ) : <Empty title="No harvests yet" hint="Publish your first listing to reach buyers." />}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Match opportunities</h2>
          {allocations?.length ? (
            <div className="space-y-2">
              {allocations.map((a: any) => (
                <div key={a.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-forest-dark">{a.allocated_qty} units @ {formatNu(a.unit_price)}</p>
                    <p className="text-sm text-gray-500">Proposed allocation</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          ) : <Empty title="No proposals" hint="Coordinators will send allocations here." />}
        </section>
      </main>
    </>
  );
}
