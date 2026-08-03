import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { TripActions } from "./TripActions";

export default async function TransportDashboard() {
  const profile = await requireRole("transport");
  const supabase = createClient();
  const [{ data: vehicles }, { data: trips }] = await Promise.all([
    supabase.from("vehicles").select("id,registration_no,vehicle_type,capacity_kg,refrigerated,available").eq("provider_id", profile.id),
    supabase.from("shipments").select("id,collection_date,delivery_date,collection_location,delivery_location,status").eq("provider_id", profile.id).order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <AppHeader name={profile.full_name} role="Transport" />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <h1 className="text-xl font-bold text-forest-dark">My fleet & trips</h1>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Vehicles</h2>
          {vehicles?.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {vehicles.map((v: any) => (
                <div key={v.id} className="card">
                  <p className="font-semibold text-forest-dark">{v.registration_no}</p>
                  <p className="text-sm text-gray-500">
                    {v.vehicle_type} · {v.capacity_kg} kg{v.refrigerated ? " · refrigerated" : ""}
                  </p>
                  <div className="mt-2"><StatusBadge status={v.available ? "available" : "cancelled"} /></div>
                </div>
              ))}
            </div>
          ) : <Empty title="No vehicles registered" />}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Assigned trips</h2>
          {trips?.length ? (
            <div className="space-y-2">
              {trips.map((t: any) => (
                <div key={t.id} className="card">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-forest-dark">{t.collection_location} → {t.delivery_location}</p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-sm text-gray-500">Collect {t.collection_date ?? "TBD"} · Deliver {t.delivery_date ?? "TBD"}</p>
                  <TripActions id={t.id} status={t.status} />
                </div>
              ))}
            </div>
          ) : <Empty title="No trips assigned" hint="Coordinators will assign trips here." />}
        </section>
      </main>
    </>
  );
}
