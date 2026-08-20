import { Users, Sprout, ShoppingCart, Truck, Package, HandCoins } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { CountUp } from "@/components/CountUp";
import { formatNu } from "@/lib/finance/calc";

export default async function AdminDashboard() {
  const profile = await requireRole("admin");
  const supabase = createClient();

  const { data: stats } = await supabase.rpc("admin_stats");
  const s = (stats as any) ?? {};

  const userStats = [
    { icon: Sprout, label: "Farmers", value: s.farmers ?? 0, accent: "#1f5c3d" },
    { icon: ShoppingCart, label: "Buyers", value: s.buyers ?? 0, accent: "#f4a300" },
    { icon: Users, label: "Coordinators", value: s.coordinators ?? 0, accent: "#e8722b" },
    { icon: Truck, label: "Transporters", value: s.transporters ?? 0, accent: "#b5322e" },
  ];

  const activityStats = [
    { icon: Package, label: "Harvests listed", value: s.harvests ?? 0, sub: `${s.harvests_available ?? 0} available` },
    { icon: ShoppingCart, label: "Orders placed", value: s.orders ?? 0, sub: `${s.orders_open ?? 0} open` },
    { icon: Truck, label: "Shipments", value: s.shipments ?? 0, sub: `${s.delivered ?? 0} delivered` },
  ];

  return (
    <>
      <AppHeader name={profile.full_name} role="Admin" userId={profile.id} />

      <section className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark">
        <div className="animate-floaty absolute -right-6 top-2 h-40 w-40 rounded-full bg-saffron/15 blur-3xl" />
        <div className="mx-auto max-w-5xl px-4 py-8 text-white">
          <p className="reveal text-sm text-white/70">Platform overview</p>
          <h1 className="reveal text-2xl font-bold sm:text-3xl" style={{ animationDelay: "80ms" }}>Admin dashboard</h1>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </section>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Users by role</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {userStats.map((st) => (
              <div key={st.label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: st.accent }}>
                  <st.icon size={18} />
                </div>
                <p className="text-2xl font-bold text-forest-dark"><CountUp end={st.value} /></p>
                <p className="text-xs text-gray-500">{st.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Platform activity</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {activityStats.map((st) => (
              <div key={st.label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest-light text-forest">
                  <st.icon size={18} />
                </div>
                <p className="text-2xl font-bold text-forest-dark"><CountUp end={st.value} /></p>
                <p className="text-xs text-gray-500">{st.label}</p>
                <p className="mt-1 text-xs text-gray-400">{st.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Volume &amp; value moved</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white">
                <Package size={18} />
              </div>
              <p className="text-3xl font-bold text-forest-dark"><CountUp end={Number(s.total_volume_kg ?? 0)} /> kg</p>
              <p className="text-xs text-gray-500">Total produce moved</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-saffron text-forest-dark">
                <HandCoins size={18} />
              </div>
              <p className="text-3xl font-bold text-forest-dark">{formatNu(Number(s.total_value_nu ?? 0))}</p>
              <p className="text-xs text-gray-500">Total value transacted</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}