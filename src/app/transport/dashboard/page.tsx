import Link from "next/link";
import { Plus, Truck, Package, Snowflake } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { TripActions } from "./TripActions";

export default async function TransportDashboard() {
  const profile = await requireRole("transport");
  const supabase = createClient();

  const { count: unread } = await supabase
    .from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", profile.id).eq("read", false);

  const [{ data: vehicles }, { data: trips }] = await Promise.all([
    supabase.from("vehicles").select("id,registration_no,vehicle_type,capacity_kg,refrigerated,service_area,available").eq("provider_id", profile.id),
    supabase.from("shipments").select("id,collection_date,delivery_date,collection_location,delivery_location,status").eq("provider_id", profile.id).order("created_at", { ascending: false }),
  ]);

  const hasVehicle = (vehicles?.length ?? 0) > 0;
  const activeTrips = trips?.filter((t: any) => !["delivered", "cancelled"].includes(t.status)).length ?? 0;

  const stats = [
    { icon: Truck, label: "Vehicles", value: vehicles?.length ?? 0, accent: "#1f5c3d" },
    { icon: Package, label: "Active trips", value: activeTrips, accent: "#f4a300" },
    { icon: Package, label: "Total trips", value: trips?.length ?? 0, accent: "#e8722b" },
  ];

  return (
    <>
      <AppHeader name={profile.full_name} role="Transport" unread={unread ?? 0} />

      {/* Gradient header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-dark">
        <div className="animate-floaty absolute -right-6 top-2 h-40 w-40 rounded-full bg-saffron/15 blur-3xl" />
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="reveal">
            <p className="text-sm text-white/70">Transport desk</p>
            <h1 className="text-2xl font-bold sm:text-3xl">My fleet &amp; trips</h1>
          </div>
          <Link href="/transport/vehicles/new" className="reveal btn bg-saffron text-forest-dark hover:brightness-95" style={{ animationDelay: "100ms" }}>
            <Plus size={16} /> Add vehicle
          </Link>
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

        {!hasVehicle && (
          <div className="card border-saffron/40 bg-saffron/10">
            <p className="font-semibold text-forest-dark">Register your first vehicle</p>
            <p className="mt-1 text-sm text-gray-600">Add a vehicle so coordinators can assign you collection and delivery trips.</p>
            <Link href="/transport/vehicles/new" className="btn-primary mt-3 inline-flex"><Plus size={16} /> Add vehicle</Link>
          </div>
        )}

        {/* Vehicles */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Vehicles</h2>
          {vehicles?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {vehicles.map((v: any) => (
                <div key={v.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-forest-light text-forest">
                      <Truck size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-forest-dark">{v.registration_no}</p>
                      <p className="truncate text-sm text-gray-500">
                        {v.vehicle_type} · {v.capacity_kg ?? "—"} kg
                        {v.service_area ? ` · ${v.service_area}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <StatusBadge status={v.available ? "available" : "cancelled"} />
                    {v.refrigerated && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-forest-light px-2 py-0.5 text-xs font-medium text-forest">
                        <Snowflake size={12} /> Refrigerated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty title="No vehicles registered" hint="Add a vehicle to start receiving trips." />}
        </section>

        {/* Assigned trips */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Assigned trips</h2>
          {trips?.length ? (
            <div className="space-y-2">
              {trips.map((t: any) => (
                <div key={t.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-forest-dark">{t.collection_location} → {t.delivery_location}</p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-sm text-gray-500">Collect {t.collection_date ?? "TBD"} · Deliver {t.delivery_date ?? "TBD"}</p>
                  <TripActions id={t.id} status={t.status} />
                </div>
              ))}
            </div>
          ) : <Empty title="No trips assigned" hint="Coordinators will assign trips here once your vehicle is available." />}
        </section>
      </main>
    </>
  );
}