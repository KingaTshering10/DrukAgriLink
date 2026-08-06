"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";

export async function deleteHarvest(harvestId: string) {
  const profile = await requireRole("farmer");
  const supabase = createClient();

  // Confirm the harvest belongs to this farmer before deleting.
  const { data: owned } = await supabase
    .from("harvest_listings")
    .select("id")
    .eq("id", harvestId)
    .eq("farmer_id", profile.id)
    .single();

  if (!owned) return; // not yours — do nothing

  await supabase.from("harvest_listings").delete().eq("id", harvestId);

  revalidatePath("/farmer/harvests");
  redirect("/farmer/harvests");
}