import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";
import { AllocationActions } from "@/app/farmer/AllocationActions";

export default async function FarmerDashboard() {
  const profile = await requireRole("farmer");
  const supabase = createClient();

  const { count: unread } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("read", false);

  const { data: farms } = await supabase
    .from("farms").select("id").eq("farmer_id", profile.id);
  const hasFarm = (farms?.length ?? 0) > 0;

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
      <AppHeader name={profile.full_name} role="Farmer" unread={unread ?? 0} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-forest-dark">Kuzuzangpo, {profile.full_name.split(" ")[0]}</h1>
          <div className="flex gap-2">
            <Link href="/farmer/farms/new" className="btn-ghost"><Plus size={16} /> New farm</Link>
            <Link href="/farmer/harvests/new" className="btn-primary"><Plus size={16} /> New harvest</Link>
          </div>
        </div>

        {!hasFarm && (
          <div className="card border-saffron/40 bg-saffron/10">
            <p className="font-semibold text-forest-dark">Set up your farm first</p>
            <p className="mt-1 text-sm text-gray-600">
              You need a farm before publishing harvest listings.
            </p>
            <Link href="/farmer/farms/new" className="btn-primary mt-3 inline-flex">
              <Plus size={16} /> Create farm
            </Link>
          </div>
        )}

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Recent harvests</h2>
          {listings?.length ? (
            <div className="space-y-2">
              {listings.map((l: any) => (
                <Link
                  key={l.id}
                  href={`/farmer/harvests/${l.id}`}
                  className="card flex items-center justify-between transition hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-forest-dark">{l.products?.name}</p>
                    <p className="text-sm text-gray-500">{l.available_qty}/{l.forecast_qty} {l.unit} · {formatNu(l.min_price)}/{l.unit}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </Link>
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
                  {a.status === "proposed"
                    ? <AllocationActions allocationId={a.id} />
                    : <StatusBadge status={a.status} />}
                </div>
              ))}
            </div>
          ) : <Empty title="No proposals" hint="Coordinators will send allocations here." />}
        </section>
      </main>
    </>
  );
}