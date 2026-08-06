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

export async function updateHarvest(harvestId: string, _prev: unknown, formData: FormData) {
  const profile = await requireRole("farmer");
  const supabase = createClient();

  // Confirm the harvest belongs to this farmer.
  const { data: owned } = await supabase
    .from("harvest_listings")
    .select("id")
    .eq("id", harvestId)
    .eq("farmer_id", profile.id)
    .single();
  if (!owned) return { error: "Harvest not found." };

  const forecast_qty = Number(formData.get("forecast_qty"));
  const available_qty = Number(formData.get("available_qty"));
  const min_price = Number(formData.get("min_price"));
  if (isNaN(forecast_qty) || forecast_qty <= 0) return { error: "Forecast qty must be greater than 0." };
  if (isNaN(available_qty) || available_qty < 0) return { error: "Available qty must be 0 or more." };
  if (available_qty > forecast_qty) return { error: "Available cannot exceed forecast." };
  if (isNaN(min_price) || min_price < 0) return { error: "Min price must be 0 or more." };

  const { error } = await supabase.from("harvest_listings").update({
    farm_id: String(formData.get("farm_id")),
    product_id: String(formData.get("product_id")),
    forecast_qty,
    available_qty,
    unit: String(formData.get("unit")),
    min_price,
    expected_harvest_date: String(formData.get("expected_harvest_date")),
    quality_grade: String(formData.get("quality_grade")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  }).eq("id", harvestId);
  if (error) return { error: error.message };

  revalidatePath(`/farmer/harvests/${harvestId}`);
  revalidatePath("/farmer/harvests");
  redirect(`/farmer/harvests/${harvestId}`);
}