import Link from "next/link";
import { Plus, ShoppingCart, Clock, CheckCircle2, Search } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";
import { ProposalActions } from "@/app/buyer/ProposalActions";

export default async function BuyerDashboard({
  searchParams,
}: {
  searchParams: { product?: string; status?: string };
}) {
  const profile = await requireRole("buyer");
  const supabase = createClient();

  const productFilter = (searchParams.product ?? "").trim();
  const statusFilter = (searchParams.status ?? "").trim();
  const hasFilter = Boolean(productFilter || statusFilter);

  const { count: unread } = await supabase
    .from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", profile.id).eq("read", false);

  const { data: orgs } = await supabase
    .from("buyer_organizations").select("id").eq("owner_id", profile.id);
  const hasOrg = (orgs?.length ?? 0) > 0;

  const { data: products } = await supabase.from("products").select("id,name").order("name");

  // Orders — filtered.
  let ordersQuery = supabase
    .from("buyer_orders")
    .select("id,required_qty,unit,offered_price,required_delivery_date,status,products!inner(name),buyer_organizations!inner(owner_id)")
    .eq("buyer_organizations.owner_id", profile.id)
    .order("created_at", { ascending: false });
  if (productFilter) ordersQuery = ordersQuery.eq("products.name", productFilter);
  if (statusFilter) ordersQuery = ordersQuery.eq("status", statusFilter);
  const { data: orders } = await ordersQuery;

  const { data: proposals } = await supabase
    .from("match_proposals")
    .select("id,status,explanation,buyer_orders!inner(buyer_organizations!inner(owner_id))")
    .eq("buyer_orders.buyer_organizations.owner_id", profile.id)
    .eq("status", "pending_farmers")
    .order("created_at", { ascending: false });

  // Stats from unfiltered totals — fetch a lightweight count set separately so filtering doesn't skew them.
  const { data: allOrders } = await supabase
    .from("buyer_orders")
    .select("status,buyer_organizations!inner(owner_id)")
    .eq("buyer_organizations.owner_id", profile.id);

  const total = allOrders?.length ?? 0;
  const openCount = allOrders?.filter((o: any) => o.status === "open").length ?? 0;
  const confirmedCount = allOrders?.filter((o: any) => o.status === "confirmed").length ?? 0;

  const stats = [
    { icon: ShoppingCart, label: "Total orders", value: total, accent: "#1f5c3d" },
    { icon: Clock, label: "Open", value: openCount, accent: "#f4a300" },
    { icon: CheckCircle2, label: "Confirmed", value: confirmedCount, accent: "#e8722b" },
  ];

  const STATUSES = ["open", "confirmed", "partially_allocated", "fulfilled", "cancelled"];

  return (
    <>
      <AppHeader name={profile.full_name} role="Buyer" unread={unread ?? 0} />

      {/* Gradient header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark">
        <div className="animate-floaty absolute -right-6 top-2 h-40 w-40 rounded-full bg-saffron/15 blur-3xl" />
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="reveal">
            <p className="text-sm text-white/70">Procurement desk</p>
            <h1 className="text-2xl font-bold sm:text-3xl">Welcome, {profile.full_name.split(" ")[0]}</h1>
          </div>
          <div className="reveal flex gap-2" style={{ animationDelay: "100ms" }}>
            <Link href="/buyer/organization/new" className="btn border border-white/40 text-white hover:bg-white/10"><Plus size={16} /> Organization</Link>
            <Link href="/buyer/orders/new" className="btn bg-saffron text-forest-dark hover:brightness-95"><Plus size={16} /> New order</Link>
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

        {!hasOrg && (
          <div className="card border-saffron/40 bg-saffron/10">
            <p className="font-semibold text-forest-dark">Set up your organization first</p>
            <p className="mt-1 text-sm text-gray-600">You need a buyer organization before creating orders.</p>
            <Link href="/buyer/organization/new" className="btn-primary mt-3 inline-flex"><Plus size={16} /> Create organization</Link>
          </div>
        )}

        {/* Proposals to review */}
        {proposals?.length ? (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-500">Proposals to review</h2>
            <div className="space-y-2">
              {proposals.map((p: any) => (
                <div key={p.id} className="card flex items-center justify-between gap-4 border-l-4 border-l-saffron">
                  <p className="text-sm text-gray-700">{p.explanation}</p>
                  <ProposalActions proposalId={p.id} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Orders with filter */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">
            {hasFilter ? "Your orders (filtered)" : "Your orders"}
          </h2>

          {/* Filter bar */}
          <form method="GET" className="card mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="label" htmlFor="product">Product</label>
              <select id="product" name="product" className="input" defaultValue={productFilter}>
                <option value="">All products</option>
                {products?.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" className="input" defaultValue={statusFilter}>
                <option value="">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary"><Search size={16} /> Filter</button>
              {hasFilter && <Link href="/buyer/dashboard" className="btn-ghost">Clear</Link>}
            </div>
          </form>

          {orders?.length ? (
            <div className="space-y-2">
              {orders.map((o: any) => (
                <Link
                  key={o.id}
                  href={`/buyer/orders/${o.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-forest-light text-forest transition group-hover:scale-105">
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
          ) : <Empty title={hasFilter ? "No matching orders" : "No orders yet"} hint={hasFilter ? "Try a different filter." : "Create a procurement order to receive proposals."} />}
        </section>
      </main>
    </>
  );
}