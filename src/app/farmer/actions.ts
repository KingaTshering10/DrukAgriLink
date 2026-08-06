"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { harvestSchema } from "@/lib/validation/schemas";

export async function createHarvest(_prev: unknown, formData: FormData) {
  const profile = await requireRole("farmer");
  const parsed = harvestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = createClient();
  const chiwog = String(formData.get("chiwog") ?? "").trim() || null;
  // RLS also enforces ownership; we set farmer_id from the session, never the form.
  const { error } = await supabase.from("harvest_listings").insert({
    ...parsed.data,
    chiwog,
    farmer_id: profile.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/farmer/harvests");
  redirect("/farmer/harvests");
}

export async function respondAllocation(allocationId: string, accept: boolean) {
  await requireRole("farmer");
  const supabase = createClient();
  // RLS restricts this update to the farmer's own allocation rows.
  await supabase
    .from("match_allocations")
    .update({ status: accept ? "accepted" : "declined" })
    .eq("id", allocationId);
  revalidatePath("/farmer/dashboard");
}