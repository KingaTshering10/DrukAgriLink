"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";

export async function deleteOrder(orderId: string) {
  const profile = await requireRole("buyer");
  const supabase = createClient();

  // Confirm the order belongs to this buyer's org before deleting.
  const { data: owned } = await supabase
    .from("buyer_orders")
    .select("id,buyer_organizations!inner(owner_id)")
    .eq("id", orderId)
    .eq("buyer_organizations.owner_id", profile.id)
    .single();

  if (!owned) return; // not yours — do nothing

  await supabase.from("buyer_orders").delete().eq("id", orderId);

  revalidatePath("/buyer/dashboard");
  redirect("/buyer/dashboard");
}