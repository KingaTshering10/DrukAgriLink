import Link from "next/link";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";

export default async function TransportEarnings() {
  const profile = await requireRole("transport");
  const supabase = createClient();

  const { count: unread } = await supabase
    .from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", profile.id).eq("read", false);

  // Every shipment assigned to this transporter, with its cost + route + status.
  const { data: shipments } = await supabase
    .from("shipments")
    .select("id,transport_cost,collection_location,delivery_location,status,delivery_date,created_at")
    .eq("provider_id", profile.id)
    .order("created_at", { ascending: false });

  const rows = shipments ?? [];
  const earned = rows
    .filter((s: any) => s.status === "delivered")
    .reduce((sum, s: any) => sum + Number(s.transport_cost ?? 0), 0);
  const pending = rows
    .filter((s: any) => s.status !== "delivered" && s.status !== "cancelled")
    .reduce((sum, s: any) => sum + Number(s.transport_cost ?? 0), 0);

  return (
    <>
      <AppHeader name={profile.full_name} role="Transport" unread={unread ?? 0} />

      {/* Gradient header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark">
        <div className="animate-floaty absolute -right-6 top-2 h-40 w-40 rounded-full bg-saffron/15 blur-3xl" />
        <div className="mx-auto max-w-3xl px-4 py-8 text-white">
          <p className="reveal text-sm text-white/70">Earnings</p>
          <h1 className="reveal text-2xl font-bold sm:text-3xl" style={{ animationDelay: "80ms" }}>Your trip earnings</h1>
          <div className="reveal mt-4 flex gap-6" style={{ animationDelay: "160ms" }}>
            <div>
              <p className="text-2xl font-bold">{formatNu(pending)}</p>
              <p className="text-xs text-white/70">In progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNu(earned)}</p>
              <p className="text-xs text-white/70">Earned (delivered)</p>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </section>

      <main className="mx-auto max-w-3xl space-y-3 px-4 py-8">
        {rows.length ? (
          rows.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <div>
                <p className="font-semibold text-forest-dark">{s.collection_location} → {s.delivery_location}</p>
                <p className="text-sm text-gray-500">
                  {formatNu(Number(s.transport_cost ?? 0))}
                  {s.delivery_date ? ` · deliver ${s.delivery_date}` : ""}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))
        ) : (
          <Empty title="No earnings yet" hint="Earnings appear here once trips are assigned to you." />
        )}

        <Link href="/transport/dashboard" className="btn-ghost">← Back to fleet</Link>
      </main>
    </>
  );
}