import Link from "next/link";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";
import { EarningsChart } from "./EarningsChart";

export default async function FarmerEarnings() {
  const profile = await requireRole("farmer");
  const supabase = createClient();

  const { count: unread } = await supabase
    .from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", profile.id).eq("read", false);

  // Payment records for this farmer, with the collection breakdown + product.
  const { data: payments } = await supabase
    .from("payment_records")
    .select("id,amount,status,created_at,collection_records(accepted_qty,unit_price,transport_deduction,other_deduction,net_amount_due,products(name))")
    .eq("farmer_id", profile.id)
    .order("created_at", { ascending: false });

  const rows = (payments ?? []).map((p: any) => {
    const c = p.collection_records ?? {};
    const gross = Number(c.accepted_qty ?? 0) * Number(c.unit_price ?? 0);
    return {
      id: p.id,
      status: p.status,
      product: c.products?.name ?? "—",
      qty: Number(c.accepted_qty ?? 0),
      unit_price: Number(c.unit_price ?? 0),
      gross,
      transport: Number(c.transport_deduction ?? 0),
      other: Number(c.other_deduction ?? 0),
      net: Number(c.net_amount_due ?? p.amount ?? 0),
    };
  });

  const totalPending = rows.filter((r) => r.status === "pending").reduce((s, r) => s + r.net, 0);
  const totalPaid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.net, 0);

  return (
    <>
      <AppHeader name={profile.full_name} role="Farmer" unread={unread ?? 0} />

      {/* Gradient header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark">
        <div className="animate-floaty absolute -right-6 top-2 h-40 w-40 rounded-full bg-saffron/15 blur-3xl" />
        <div className="mx-auto max-w-3xl px-4 py-8 text-white">
          <p className="reveal text-sm text-white/70">Earnings</p>
          <h1 className="reveal text-2xl font-bold sm:text-3xl" style={{ animationDelay: "80ms" }}>Your payments</h1>
          <div className="reveal mt-4 flex gap-6" style={{ animationDelay: "160ms" }}>
            <div>
              <p className="text-2xl font-bold">{formatNu(totalPending)}</p>
              <p className="text-xs text-white/70">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNu(totalPaid)}</p>
              <p className="text-xs text-white/70">Received</p>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </section>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        {rows.length ? (
          rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-forest-dark">{r.product} · {r.qty} units</p>
                <span className={`badge ${r.status === "paid" ? "bg-forest-light text-forest" : "bg-saffron/20 text-marigold"}`}>
                  {r.status === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross ({r.qty} × {formatNu(r.unit_price)})</span>
                  <span className="text-forest-dark">{formatNu(r.gross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transport deduction</span>
                  <span className="text-crimson">− {formatNu(r.transport)}</span>
                </div>
                {r.other > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Other deduction</span>
                    <span className="text-crimson">− {formatNu(r.other)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-black/5 pt-2 font-semibold">
                  <span className="text-forest-dark">Net amount due</span>
                  <span className="text-forest-dark">{formatNu(r.net)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Empty title="No payments yet" hint="Payments appear here once your produce is scheduled for delivery." />
        )}

        <Link href="/farmer/dashboard" className="btn-ghost">← Back to dashboard</Link>
      </main>
    </>
  );
}