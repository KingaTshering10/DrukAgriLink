import Link from "next/link";
import { GitMerge, ShoppingCart, Sprout, FileText, Truck, Search } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";
import { CountUp } from "@/components/CountUp";

export default async function CoordinatorDashboard({
  searchParams,
}: {
  searchParams: { product?: string; location?: string };
}) {
  const profile = await requireRole("coordinator");
  const supabase = createClient();

  const productFilter = (searchParams.product ?? "").trim();
  const locationFilter = (searchParams.location ?? "").trim();

  const { count: unread } = await supabase
    .from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", profile.id).eq("read", false);

  // Product list for the filter dropdown.
  const { data: products } = await supabase.from("products").select("id,name").order("name");

  // Open buyer demand — filtered.
  let ordersQuery = supabase
    .from("buyer_orders")
    .select("id,required_qty,unit,offered_price,status,delivery_location,products!inner(name)")
    .eq("status", "open");
  if (productFilter) ordersQuery = ordersQuery.eq("products.name", productFilter);
  if (locationFilter) ordersQuery = ordersQuery.ilike("delivery_location", `%${locationFilter}%`);
  const { data: orders } = await ordersQuery;

  // Available supply — filtered.
  let supplyQuery = supabase
    .from("harvest_listings")
    .select("id,available_qty,unit,min_price,dzongkhag,products!inner(name)")
    .eq("status", "available");
  if (productFilter) supplyQuery = supplyQuery.eq("products.name", productFilter);
  if (locationFilter) supplyQuery = supplyQuery.ilike("dzongkhag", `%${locationFilter}%`);
  const { data: supply } = await supplyQuery;

  const { data: proposals } = await supabase
    .from("match_proposals")
    .select("id,status,explanation,buyer_orders(products(name),buyer_organizations(name))")
    .eq("coordinator_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { icon: ShoppingCart, label: "Open demand", value: orders?.length ?? 0, accent: "#f4a300" },
    { icon: Sprout, label: "Available supply", value: supply?.length ?? 0, accent: "#1f5c3d" },
    { icon: FileText, label: "Recent proposals", value: proposals?.length ?? 0, accent: "#e8722b" },
  ];

  const hasFilter = productFilter || locationFilter;

  return (
    <>
      <AppHeader name={profile.full_name} role="Coordinator" unread={unread ?? 0} userId={profile.id} />

      {/* Gradient header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark">
        <div className="animate-floaty absolute -right-6 top-2 h-40 w-40 rounded-full bg-saffron/15 blur-3xl" />
        <div className="mx-auto max-w-4xl px-4 py-8 text-white">
          <p className="reveal text-sm text-white/70">Coordination desk</p>
          <h1 className="reveal text-2xl font-bold sm:text-3xl" style={{ animationDelay: "80ms" }}>Match supply with demand</h1>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </section>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className="reveal flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition hover:shadow-md" style={{ animationDelay: `${i * 80}ms` }}>
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

        {/* Filter bar — a GET form that puts filters in the URL */}
        <form method="GET" className="card flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label" htmlFor="product">Product</label>
            <select id="product" name="product" className="input" defaultValue={productFilter}>
              <option value="">All products</option>
              {products?.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="label" htmlFor="location">Location</label>
            <input id="location" name="location" className="input" placeholder="e.g. Thimphu" defaultValue={locationFilter} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary"><Search size={16} /> Filter</button>
            {hasFilter && <Link href="/coordinator/dashboard" className="btn-ghost">Clear</Link>}
          </div>
        </form>

        {/* Open buyer demand */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">
            Open buyer demand{hasFilter ? " (filtered)" : ""}
          </h2>
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
                      <p className="text-sm text-gray-500">Offer {formatNu(o.offered_price)}/{o.unit}{o.delivery_location ? ` · ${o.delivery_location}` : ""}</p>
                    </div>
                  </div>
                  <Link href={`/coordinator/match/new?order=${o.id}`} className="btn-primary"><GitMerge size={16} /> Build match</Link>
                </div>
              ))}
            </div>
          ) : <Empty title={hasFilter ? "No matching orders" : "No open orders"} />}
        </section>

        {/* Available supply */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">
            Available supply{hasFilter ? " (filtered)" : ""}
          </h2>
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
          ) : <Empty title={hasFilter ? "No matching listings" : "No available listings"} />}
        </section>

        {/* Recent proposals */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Recent proposals</h2>
          {proposals?.length ? (
            <div className="space-y-2">
              {proposals.map((p: any) => {
                const order = p.buyer_orders;
                return (
                  <div key={p.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-forest-dark">{order?.products?.name ?? "Proposal"}</span>
                          {order?.buyer_organizations?.name && <span className="text-sm text-gray-500">for {order.buyer_organizations.name}</span>}
                          <StatusBadge status={p.status} />
                        </div>
                        <p className="text-sm text-gray-600">{p.explanation}</p>
                      </div>
                      <div className="flex flex-none flex-col gap-2">
                        <Link href={`/coordinator/proposals/${p.id}`} className="btn-ghost text-sm">View</Link>
                        {p.status === "confirmed" && (
                          <Link href={`/coordinator/proposals/${p.id}`} className="btn-primary text-sm"><Truck size={15} /> Assign</Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <Empty title="No proposals yet" />}
        </section>
      </main>
    </>
  );
}