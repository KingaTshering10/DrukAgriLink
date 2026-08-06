import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { EditHarvestForm } from "../EditHarvestForm";

export default async function EditHarvest({ params }: { params: { id: string } }) {
  const profile = await requireRole("farmer");
  const supabase = createClient();

  const [{ data: harvest }, { data: farms }, { data: products }] = await Promise.all([
    supabase
      .from("harvest_listings")
      .select("id,farm_id,product_id,forecast_qty,available_qty,unit,min_price,expected_harvest_date,quality_grade,notes")
      .eq("id", params.id)
      .eq("farmer_id", profile.id)
      .single(),
    supabase.from("farms").select("id,name").eq("farmer_id", profile.id),
    supabase.from("products").select("id,name").order("name"),
  ]);

  if (!harvest) notFound();

  return (
    <>
      <AppHeader name={profile.full_name} role="Farmer" />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-forest-dark">Edit harvest</h1>
        <EditHarvestForm harvest={harvest} farms={farms ?? []} products={products ?? []} />
      </main>
    </>
  );
}