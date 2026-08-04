"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";

export async function createOrganization(_prev: unknown, formData: FormData) {
  const profile = await requireRole("buyer");

  const name = String(formData.get("name") ?? "").trim();
  const contact_phone = String(formData.get("contact_phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name) return { error: "Organization name is required." };

  const supabase = createClient();
  const { error } = await supabase.from("buyer_organizations").insert({
    owner_id: profile.id,
    name,
    contact_phone: contact_phone || null,
    address: address || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/buyer/dashboard");
  redirect("/buyer/dashboard");
}