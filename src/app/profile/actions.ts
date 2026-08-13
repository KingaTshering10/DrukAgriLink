"use server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(_prev: unknown, formData: FormData) {
  const profile = await getProfile();
  const supabase = createClient();

  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dzongkhag = String(formData.get("dzongkhag") ?? "").trim();
  const gewog = String(formData.get("gewog") ?? "").trim();
  const chiwog = String(formData.get("chiwog") ?? "").trim();

  if (!full_name) return { error: "Name is required." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone: phone || null,
      dzongkhag: dzongkhag || null,
      gewog: gewog || null,
      chiwog: chiwog || null,
    })
    .eq("id", profile.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: true };
}