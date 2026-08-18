import Link from "next/link";
import { Sprout, Users, Truck, HandCoins } from "lucide-react";
import { AnimatedStats } from "./AnimatedStats";

export default function Landing() {
  const features = [
    { icon: Sprout, title: "List your crops", body: "Farmers publish available produce with price, grade and location.", accent: "#1f5c3d", tag: "For farmers" },
    { icon: Users, title: "Pool your supply", body: "Coordinators pool small harvests to meet larger buyer orders.", accent: "#f4a300", tag: "For coordinators" },
    { icon: Truck, title: "Share vehicles", body: "Assign vehicles and track collection stop by stop.", accent: "#e8722b", tag: "For transport" },
    { icon: HandCoins, title: "Clear payments", body: "Every deduction shown; net amount due per farmer, no hidden fees.", accent: "#b5322e", tag: "Transparent" },
  ];

  return (
    <main className="overflow-hidden">
      {/* HERO with animated gradient + floating shapes */}
      <section className="relative isolate">
        <div className="animate-gradient absolute inset-0 -z-10 bg-gradient-to-br from-forest via-forest-dark to-[#3a1d0e]" />
        {/* floating cultural shapes */}
        <div className="animate-floaty absolute -left-10 top-10 -z-10 h-40 w-40 rounded-full bg-saffron/20 blur-2xl" />
        <div className="animate-floaty absolute right-0 top-40 -z-10 h-56 w-56 rounded-full bg-marigold/20 blur-3xl" style={{ animationDelay: "1.5s" }} />
        <div className="animate-floaty absolute bottom-0 left-1/3 -z-10 h-32 w-32 rounded-full bg-crimson/20 blur-2xl" style={{ animationDelay: "3s" }} />

        <div className="mx-auto max-w-4xl px-4 py-24 text-white sm:py-32">
          <p className="reveal mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm backdrop-blur">
            Kuzuzangpo la · Welcome
          </p>
          <h1 className="reveal max-w-2xl text-4xl font-bold leading-tight sm:text-6xl" style={{ animationDelay: "120ms" }}>
            From Bhutan&apos;s farms to the nation&apos;s tables.
          </h1>
          <p className="reveal mt-5 max-w-xl text-lg text-white/85" style={{ animationDelay: "260ms" }}>
            DrukAgriLink helps small farmers pool their produce, connect with institutional
            buyers, and coordinate shared transport across the Dragon Kingdom.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3" style={{ animationDelay: "400ms" }}>
            <Link href="/register" className="btn bg-saffron text-forest-dark hover:brightness-95">Get started</Link>
            <Link href="/browse" className="btn border border-white/40 text-white hover:bg-white/10">Browse marketplace</Link>
            <Link href="/login" className="btn border border-white/40 text-white hover:bg-white/10">Log in</Link>
          </div>
        </div>

        {/* cultural border motif */}
        <div className="h-2 w-full bg-gradient-to-r from-saffron via-marigold to-crimson" />
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <AnimatedStats />
      </section>

      {/* FEATURES with scroll-reveal + colorful interactive cards */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <h2 className="reveal mb-8 text-center text-2xl font-bold text-forest-dark">How DrukAgriLink works</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="feature-card group reveal rounded-2xl border border-black/5 bg-white p-6"
              style={{ animationDelay: `${i * 140}ms`, ["--accent" as any]: f.accent }}
            >
              <div
                className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                style={{ background: f.accent }}
              >
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-forest-dark">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{f.body}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-forest opacity-0 transition group-hover:opacity-100">
                {f.tag} →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION band with motif */}
      <section className="relative bg-forest-dark py-16 text-center text-white">
        <div className="h-2 w-full bg-gradient-to-r from-crimson via-marigold to-saffron absolute top-0 left-0" />
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to reach more markets?</h2>
          <p className="mt-3 text-white/80">Join farmers, buyers, and coordinators across Bhutan.</p>
          <Link href="/register" className="btn mt-6 inline-flex bg-saffron text-forest-dark hover:brightness-95">
            Create your account
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5 py-8 text-center text-sm text-gray-500">
        Developed and maintained by Kinley Rabgay · Software Developer · Prices shown as Nu. (BTN)
      </footer>
    </main>
  );
}