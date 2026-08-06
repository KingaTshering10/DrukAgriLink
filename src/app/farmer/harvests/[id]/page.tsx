import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatNu } from "@/lib/finance/calc";
import { DeleteButton } from "./DeleteButton";

export default async function HarvestDetail({ params }: { params: { id: string } }) {
  const profile = await requireRole("farmer");
  const supabase = createClient();

  const { data: harvest } = await supabase
    .from("harvest_listings")
    .select("id,forecast_qty,available_qty,unit,min_price,expected_harvest_date,quality_grade,dzongkhag,gewog,chiwog,notes,status,products(name),farms(name)")
    .eq("id", params.id)
    .eq("farmer_id", profile.id)
    .single();

  if (!harvest) notFound();

  const h = harvest as any;
  const rows: [string, string][] = [
    ["Product", h.products?.name ?? "—"],
    ["Farm", h.farms?.name ?? "—"],
    ["Available", `${h.available_qty} / ${h.forecast_qty} ${h.unit}`],
    ["Min price", `${formatNu(h.min_price)} / ${h.unit}`],
    ["Expected harvest", h.expected_harvest_date ?? "—"],
    ["Quality grade", h.quality_grade ?? "—"],
    ["Dzongkhag", h.dzongkhag ?? "—"],
    ["Gewog", h.gewog ?? "—"],
    ["Chiwog / Village", h.chiwog ?? "—"],
    ["Notes", h.notes ?? "—"],
  ];

  return (
    <>
      <AppHeader name={profile.full_name} role="Farmer" />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-forest-dark">Harvest details</h1>
          <StatusBadge status={h.status} />
        </div>

        <div className="card divide-y divide-black/5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="text-right font-medium text-forest-dark">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Link href="/farmer/harvests" className="btn-ghost">← Back to harvests</Link>
          <div className="flex gap-2">
            <Link href={`/farmer/harvests/${h.id}/edit`} className="btn-ghost">Edit harvest</Link>
            <DeleteButton harvestId={h.id} />
          </div>
        </div>
      </main>
    </>
  );
}