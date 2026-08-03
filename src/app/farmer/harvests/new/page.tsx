import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { HarvestForm } from "./HarvestForm";

export default async function NewHarvest() {
  const profile = await requireRole("farmer");
  const supabase = createClient();
  const [{ data: farms }, { data: products }] = await Promise.all([
    supabase.from("farms").select("id,name,dzongkhag,gewog").eq("farmer_id", profile.id),
    supabase.from("products").select("id,name").order("name"),
  ]);
  return (
    <>
      <AppHeader name={profile.full_name} role="Farmer" />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-forest-dark">New harvest listing</h1>
        <HarvestForm farms={farms ?? []} products={products ?? []} />
      </main>
    </>
  );
}
