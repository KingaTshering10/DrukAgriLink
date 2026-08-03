import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Empty } from "@/components/ui/Empty";
import { formatNu } from "@/lib/finance/calc";

export default async function MyHarvests() {
  const profile = await requireRole("farmer");
  const supabase = createClient();
  const { data } = await supabase
    .from("harvest_listings")
    .select("id,forecast_qty,available_qty,unit,min_price,expected_harvest_date,quality_grade,status,products(name)")
    .eq("farmer_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <AppHeader name={profile.full_name} role="Farmer" />
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-forest-dark">My harvests</h1>
          <Link href="/farmer/harvests/new" className="btn-primary"><Plus size={16} /> New</Link>
        </div>
        {data?.length ? (
          <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-forest-light text-left text-forest-dark">
                <tr><th className="p-3">Product</th><th className="p-3">Available</th><th className="p-3">Min price</th><th className="p-3">Grade</th><th className="p-3">Harvest</th><th className="p-3">Status</th></tr>
              </thead>
              <tbody>
                {data.map((l: any) => (
                  <tr key={l.id} className="border-t border-black/5">
                    <td className="p-3 font-medium">{l.products?.name}</td>
                    <td className="p-3">{l.available_qty}/{l.forecast_qty} {l.unit}</td>
                    <td className="p-3">{formatNu(l.min_price)}</td>
                    <td className="p-3">{l.quality_grade ?? "—"}</td>
                    <td className="p-3">{l.expected_harvest_date}</td>
                    <td className="p-3"><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty title="No harvests yet" />}
      </main>
    </>
  );
}
