import Link from "next/link";
import { Sprout, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNu } from "@/lib/finance/calc";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const supabase = createClient();

  const { data: produce } = await supabase
    .from("public_available_produce")
    .select("id,product,available_qty,unit,min_price,dzongkhag")
    .limit(50);

  const { data: demand } = await supabase
    .from("public_open_demand")
    .select("id,product,required_qty,unit,offered_price,delivery_location")
    .limit(50);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest via-forest-dark to-[#3a1d0e]">
        <div className="animate-floaty absolute -right-8 top-6 h-48 w-48 rounded-full bg-saffron/20 blur-3xl" />
        <div className="mx-auto max-w-5xl px-4 py-14 text-white">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 font-bold"><Sprout size={22} /> DrukAgriLink</Link>
          <h1 className="reveal max-w-2xl text-3xl font-bold sm:text-4xl">The marketplace, live</h1>
          <p className="reveal mt-2 max-w-xl text-white/80" style={{ animationDelay: "80ms" }}>
            Browse available produce and active buyer demand across Bhutan. Sign up to connect and trade.
          </p>
          <div className="reveal mt-5 flex gap-3" style={{ animationDelay: "160ms" }}>
            <Link href="/register" className="btn bg-saffron text-forest-dark hover:brightness-95">Get started</Link>
            <Link href="/login" className="btn border border-white/40 text-white hover:bg-white/10">Log in</Link>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </section>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        {/* Available produce */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-forest-dark">
            <Sprout size={20} className="text-forest" /> Available produce
          </h2>
          {produce?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {produce.map((p: any) => (
                <div key={p.id} className="feature-card rounded-2xl border border-black/5 bg-white p-5" style={{ ["--accent" as any]: "#1f5c3d" }}>
                  <p className="font-semibold text-forest-dark">{p.product}</p>
                  <p className="mt-1 text-sm text-gray-500">{p.available_qty} {p.unit} · from {formatNu(p.min_price)}/{p.unit}</p>
                  <p className="mt-1 text-xs text-gray-400">{p.dzongkhag}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">No produce listed right now.</p>}
        </section>

        {/* Open demand */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-forest-dark">
            <ShoppingCart size={20} className="text-marigold" /> Buyers looking for produce
          </h2>
          {demand?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {demand.map((d: any) => (
                <div key={d.id} className="feature-card rounded-2xl border border-black/5 bg-white p-5" style={{ ["--accent" as any]: "#e8722b" }}>
                  <p className="font-semibold text-forest-dark">{d.product}</p>
                  <p className="mt-1 text-sm text-gray-500">{d.required_qty} {d.unit} · offering {formatNu(d.offered_price)}/{d.unit}</p>
                  <p className="mt-1 text-xs text-gray-400">{d.delivery_location ?? "—"}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">No open demand right now.</p>}
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-forest-light p-8 text-center">
          <h3 className="text-xl font-bold text-forest-dark">Ready to trade?</h3>
          <p className="mt-1 text-sm text-gray-600">Create an account to list produce, place orders, and connect.</p>
          <Link href="/register" className="btn-primary mt-4 inline-flex">Create your account</Link>
        </section>
      </main>
    </>
  );
}