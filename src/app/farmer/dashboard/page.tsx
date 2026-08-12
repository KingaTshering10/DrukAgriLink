import Link from "next/link";
import { Plus, Sprout, Package, GitMerge, Wallet } from "lucide-react";
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
    .from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", profile.id).eq("read", false);

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

  const pendingCount = allocations?.filter((a: any) => a.status === "proposed").length ?? 0;

  const stats = [
    { icon: Sprout, label: "Farms", value: farms?.length ?? 0, accent: "#1f5c3d" },
    { icon: Package, label: "Harvests", value: listings?.length ?? 0, accent: "#f4a300" },
    { icon: GitMerge, label: "Pending offers", value: pendingCount, accent: "#e8722b" },
  ];

  return (
    <>
      <AppHeader name={profile.full_name} role="Farmer" unread={unread ?? 0} />

      {/* Gradient header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark">
        <div className="animate-floaty absolute -right-6 top-2 h-40 w-40 rounded-full bg-saffron/15 blur-3xl" />
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="reveal">
            <p className="text-sm text-white/70">Kuzuzangpo la</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{profile.full_name.split(" ")[0]}&apos;s farm desk</h1>
          </div>
          <div className="reveal flex flex-wrap gap-2" style={{ animationDelay: "100ms" }}>
            <Link href="/farmer/earnings" className="btn border border-white/40 text-white hover:bg-white/10"><Wallet size={16} /> Earnings</Link>
            <Link href="/farmer/farms/new" className="btn border border-white/40 text-white hover:bg-white/10"><Plus size={16} /> Farm</Link>
            <Link href="/farmer/harvests/new" className="btn bg-saffron text-forest-dark hover:brightness-95"><Plus size={16} /> New harvest</Link>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </section>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="reveal flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition hover:shadow-md"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl text-white" style={{ background: s.accent }}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-forest-dark sm:text-2xl">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {!hasFarm && (
          <div className="card border-saffron/40 bg-saffron/10">
            <p className="font-semibold text-forest-dark">Set up your farm first</p>
            <p className="mt-1 text-sm text-gray-600">You need a farm before publishing harvest listings.</p>
            <Link href="/farmer/farms/new" className="btn-primary mt-3 inline-flex"><Plus size={16} /> Create farm</Link>
          </div>
        )}

        {/* Match opportunities */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Match opportunities</h2>
          {allocations?.length ? (
            <div className="space-y-2">
              {allocations.map((a: any) => (
                <div
                  key={a.id}
                  className={`card flex items-center justify-between ${a.status === "proposed" ? "border-l-4 border-l-saffron" : ""}`}
                >
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

        {/* Recent harvests */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Recent harvests</h2>
          {listings?.length ? (
            <div className="space-y-2">
              {listings.map((l: any) => (
                <Link
                  key={l.id}
                  href={`/farmer/harvests/${l.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-forest-light text-forest transition group-hover:scale-105">
                      <Sprout size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-forest-dark">{l.products?.name}</p>
                      <p className="text-sm text-gray-500">{l.available_qty}/{l.forecast_qty} {l.unit} · {formatNu(l.min_price)}/{l.unit}</p>
                    </div>
                  </div>
                  <StatusBadge status={l.status} />
                </Link>
              ))}
            </div>
          ) : <Empty title="No harvests yet" hint="Publish your first listing to reach buyers." />}
        </section>
      </main>
    </>
  );
}