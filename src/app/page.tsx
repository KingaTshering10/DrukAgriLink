import Link from "next/link";
import { Sprout, Users, Truck, HandCoins } from "lucide-react";

export default function Landing() {
  const features = [
    { icon: Sprout, title: "List your crops", body: "Farmers publish available produce with price, grade and location." },
    { icon: Users, title: "Pool your supply", body: "Coordinators pool small harvests to meet larger buyer orders." },
    { icon: Truck, title: "Share vehicles", body: "Assign vehicles and track collection stop by stop." },
    { icon: HandCoins, title: "Clear payments", body: "Every deduction shown; net amount due per farmer, no hidden fees." },
  ];
  return (
    <main>
      <section className="bg-forest text-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs">Bhutan · farm to buyer</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Combine harvests. Reach buyers. Move produce together.
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            DrukAgriLink helps small farmers pool their produce, connect with institutional
            buyers, and coordinate shared transport across Bhutan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn bg-saffron text-forest-dark hover:brightness-95">Get started</Link>
            <Link href="/login" className="btn border border-white/30 text-white hover:bg-white/10">Log in</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card">
              <f.icon className="text-forest" />
              <h3 className="mt-3 font-semibold text-forest-dark">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-black/5 py-8 text-center text-sm text-gray-500">
        Demo MVP · fictional data · prices shown as Nu. (BTN)
      </footer>
    </main>
  );
}
