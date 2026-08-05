"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";

export async function createFarm(_prev: unknown, formData: FormData) {
  const profile = await requireRole("farmer");

  const name = String(formData.get("name") ?? "").trim();
  const dzongkhag = String(formData.get("dzongkhag") ?? "").trim();
  const gewog = String(formData.get("gewog") ?? "").trim();
  const sizeRaw = String(formData.get("size_acres") ?? "").trim();

  if (!name) return { error: "Farm name is required." };
  const size_acres = sizeRaw ? Number(sizeRaw) : null;
  if (size_acres !== null && (isNaN(size_acres) || size_acres < 0)) {
    return { error: "Size must be a positive number." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("farms").insert({
    farmer_id: profile.id,
    name,
    dzongkhag: dzongkhag || null,
    gewog: gewog || null,
    size_acres,
  });
  if (error) return { error: error.message };

  revalidatePath("/farmer/dashboard");
  redirect("/farmer/dashboard");
}