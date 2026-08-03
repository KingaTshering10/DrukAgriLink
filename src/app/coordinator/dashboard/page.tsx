import Link from "next/link";
import { GitMerge } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";

export default async function CoordinatorDashboard() {
  const profile = await requireRole("coordinator");
  const supabase = createClient();
  const [{ data: orders }, { data: supply }, { data: proposals }] = await Promise.all([
    supabase.from("buyer_orders").select("id,required_qty,unit,offered_price,status,products(name)").eq("status", "open"),
    supabase.from("harvest_listings").select("id,available_qty,unit,min_price,dzongkhag,products(name)").eq("status", "available"),
    supabase.from("match_proposals").select("id,status,explanation").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <>
      <AppHeader name={profile.full_name} role="Coordinator" />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <h1 className="text-xl font-bold text-forest-dark">Coordination desk</h1>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500">Open buyer demand</h2>
          </div>
          {orders?.length ? (
            <div className="space-y-2">
              {orders.map((o: any) => (
                <div key={o.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-forest-dark">{o.products?.name} · {o.required_qty} {o.unit}</p>
                    <p className="text-sm text-gray-500">Offer {formatNu(o.offered_price)}/{o.unit}</p>
                  </div>
                  <Link href={`/coordinator/match/new?order=${o.id}`} className="btn-ghost"><GitMerge size={16} /> Build match</Link>
                </div>
              ))}
            </div>
          ) : <Empty title="No open orders" />}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Available supply</h2>
          {supply?.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {supply.map((s: any) => (
                <div key={s.id} className="card">
                  <p className="font-semibold text-forest-dark">{s.products?.name}</p>
                  <p className="text-sm text-gray-500">{s.available_qty} {s.unit} · {formatNu(s.min_price)}/{s.unit} · {s.dzongkhag}</p>
                </div>
              ))}
            </div>
          ) : <Empty title="No available listings" />}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Recent proposals</h2>
          {proposals?.length ? (
            <div className="space-y-2">
              {proposals.map((p: any) => (
                <div key={p.id} className="card">
                  <div className="mb-1"><StatusBadge status={p.status} /></div>
                  <p className="text-sm text-gray-600">{p.explanation}</p>
                </div>
              ))}
            </div>
          ) : <Empty title="No proposals yet" />}
        </section>
      </main>
    </>
  );
}
