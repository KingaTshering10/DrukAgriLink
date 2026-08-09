import Link from "next/link";
import { Plus, ShoppingCart, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";
import { ProposalActions } from "@/app/buyer/ProposalActions";

export default async function BuyerDashboard() {
  const profile = await requireRole("buyer");
  const supabase = createClient();

  const { count: unread } = await supabase
    .from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", profile.id).eq("read", false);

  const { data: orgs } = await supabase
    .from("buyer_organizations").select("id").eq("owner_id", profile.id);
  const hasOrg = (orgs?.length ?? 0) > 0;

  const { data: orders } = await supabase
    .from("buyer_orders")
    .select("id,required_qty,unit,offered_price,required_delivery_date,status,products(name),buyer_organizations!inner(owner_id)")
    .eq("buyer_organizations.owner_id", profile.id)
    .order("created_at", { ascending: false });

  const { data: proposals } = await supabase
    .from("match_proposals")
    .select("id,status,explanation,buyer_orders!inner(buyer_organizations!inner(owner_id))")
    .eq("buyer_orders.buyer_organizations.owner_id", profile.id)
    .eq("status", "pending_farmers")
    .order("created_at", { ascending: false });

  const total = orders?.length ?? 0;
  const openCount = orders?.filter((o: any) => o.status === "open").length ?? 0;
  const confirmedCount = orders?.filter((o: any) => o.status === "confirmed").length ?? 0;

  const stats = [
    { icon: ShoppingCart, label: "Total orders", value: total, accent: "#1f5c3d" },
    { icon: Clock, label: "Open", value: openCount, accent: "#f4a300" },
    { icon: CheckCircle2, label: "Confirmed", value: confirmedCount, accent: "#e8722b" },
  ];

  return (
    <>
      <AppHeader name={profile.full_name} role="Buyer" unread={unread ?? 0} />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="animate-gradient absolute inset-0 -z-10 bg-gradient-to-br from-forest via-forest-dark to-[#3a1d0e]" />
        <div className="animate-floaty absolute -right-10 top-4 -z-10 h-52 w-52 rounded-full bg-saffron/25 blur-3xl" />
        <div className="animate-floaty absolute left-10 top-24 -z-10 h-40 w-40 rounded-full bg-marigold/20 blur-3xl" style={{ animationDelay: "1.5s" }} />
        <div className="animate-floaty absolute left-1/2 bottom-0 -z-10 h-32 w-32 rounded-full bg-crimson/20 blur-2xl" style={{ animationDelay: "3s" }} />

        <div className="mx-auto max-w-4xl px-4 pb-24 pt-12 text-white sm:pb-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="reveal">
              <p className="mb-1 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
                <Sparkles size={12} /> Procurement desk
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">Welcome back, {profile.full_name.split(" ")[0]}</h1>
              <p className="mt-1 text-sm text-white/75">Manage your demand and confirm matches from farmers.</p>
            </div>
            <div className="reveal flex gap-2" style={{ animationDelay: "120ms" }}>
              <Link href="/buyer/organization/new" className="btn border border-white/40 text-white hover:bg-white/10"><Plus size={16} /> Organization</Link>
              <Link href="/buyer/orders/new" className="btn bg-saffron text-forest-dark hover:brightness-95"><Plus size={16} /> New order</Link>
            </div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </section>

      <main className="mx-auto -mt-16 max-w-4xl space-y-8 px-4 pb-12">
        {/* STAT CARDS — floating over the hero */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="feature-card reveal rounded-2xl border border-black/5 bg-white p-4 sm:p-5"
              style={{ animationDelay: `${i * 90}ms`, ["--accent" as any]: s.accent }}
            >
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: s.accent }}>
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-forest-dark sm:text-3xl">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {!hasOrg && (
          <div className="reveal card border-saffron/40 bg-saffron/10">
            <p className="font-semibold text-forest-dark">Set up your organization first</p>
            <p className="mt-1 text-sm text-gray-600">You need a buyer organization before creating orders.</p>
            <Link href="/buyer/organization/new" className="btn-primary mt-3 inline-flex"><Plus size={16} /> Create organization</Link>
          </div>
        )}

        {/* PROPOSALS — glowing action area */}
        {proposals?.length ? (
          <section className="reveal">
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-marigold opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-marigold" />
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-forest-dark">Proposals awaiting your approval</h2>
            </div>
            <div className="space-y-3">
              {proposals.map((p: any) => (
                <div key={p.id} className="relative overflow-hidden rounded-2xl border border-marigold/30 bg-gradient-to-br from-marigold/5 to-white p-5">
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-saffron to-crimson" />
                  <div className="flex items-center justify-between gap-4 pl-2">
                    <p className="text-sm text-gray-700">{p.explanation}</p>
                    <ProposalActions proposalId={p.id} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ORDERS */}
        <section className="reveal" style={{ animationDelay: "80ms" }}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Your orders</h2>
          {orders?.length ? (
            <div className="space-y-3">
              {orders.map((o: any) => (
                <Link
                  key={o.id}
                  href={`/buyer/orders/${o.id}`}
                  className="feature-card group flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5"
                  style={{ ["--accent" as any]: "#1f5c3d" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-light text-forest transition group-hover:scale-110">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-forest-dark">{o.products?.name} · {o.required_qty} {o.unit}</p>
                      <p className="text-sm text-gray-500">Offer {formatNu(o.offered_price)}/{o.unit} · by {o.required_delivery_date}</p>
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          ) : <Empty title="No orders yet" hint="Create a procurement order to receive proposals." />}
        </section>
      </main>
    </>
  );
}