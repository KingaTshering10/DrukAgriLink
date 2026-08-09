import Link from "next/link";
import { GitMerge, ShoppingCart, Sprout, FileText } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";

export default async function CoordinatorDashboard() {
  const profile = await requireRole("coordinator");
  const supabase = createClient();

  const { count: unread } = await supabase
    .from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", profile.id).eq("read", false);

  const [{ data: orders }, { data: supply }, { data: proposals }] = await Promise.all([
    supabase.from("buyer_orders").select("id,required_qty,unit,offered_price,status,products(name)").eq("status", "open"),
    supabase.from("harvest_listings").select("id,available_qty,unit,min_price,dzongkhag,products(name)").eq("status", "available"),
    supabase.from("match_proposals").select("id,status,explanation").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { icon: ShoppingCart, label: "Open demand", value: orders?.length ?? 0, accent: "#f4a300" },
    { icon: Sprout, label: "Available supply", value: supply?.length ?? 0, accent: "#1f5c3d" },
    { icon: FileText, label: "Recent proposals", value: proposals?.length ?? 0, accent: "#e8722b" },
  ];

  return (
    <>
      <AppHeader name={profile.full_name} role="Coordinator" unread={unread ?? 0} />

      {/* Gradient header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark">
        <div className="animate-floaty absolute -right-6 top-2 h-40 w-40 rounded-full bg-saffron/15 blur-3xl" />
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-8 text-white">
          <p className="reveal text-sm text-white/70">Coordination desk</p>
          <h1 className="reveal text-2xl font-bold sm:text-3xl" style={{ animationDelay: "80ms" }}>
            Match supply with demand
          </h1>
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

        {/* Open buyer demand */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Open buyer demand</h2>
          {orders?.length ? (
            <div className="space-y-2">
              {orders.map((o: any) => (
                <div key={o.id} className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-saffron/15 text-marigold transition group-hover:scale-105">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-forest-dark">{o.products?.name} · {o.required_qty} {o.unit}</p>
                      <p className="text-sm text-gray-500">Offer {formatNu(o.offered_price)}/{o.unit}</p>
                    </div>
                  </div>
                  <Link href={`/coordinator/match/new?order=${o.id}`} className="btn-primary"><GitMerge size={16} /> Build match</Link>
                </div>
              ))}
            </div>
          ) : <Empty title="No open orders" />}
        </section>

        {/* Available supply */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Available supply</h2>
          {supply?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {supply.map((s: any) => (
                <div key={s.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-forest-light text-forest">
                      <Sprout size={17} />
                    </div>
                    <div>
                      <p className="font-semibold text-forest-dark">{s.products?.name}</p>
                      <p className="text-sm text-gray-500">{s.available_qty} {s.unit} · {formatNu(s.min_price)}/{s.unit} · {s.dzongkhag}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty title="No available listings" />}
        </section>

        {/* Recent proposals */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Recent proposals</h2>
          {proposals?.length ? (
            <div className="space-y-2">
              {proposals.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/coordinator/proposals/${p.id}`}
                  className="block rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-1"><StatusBadge status={p.status} /></div>
                  <p className="text-sm text-gray-600">{p.explanation}</p>
                </Link>
              ))}
            </div>
          ) : <Empty title="No proposals yet" />}
        </section>
      </main>
    </>
  );
}