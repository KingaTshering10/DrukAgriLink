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

export async function updateOrder(orderId: string, _prev: unknown, formData: FormData) {
  const profile = await requireRole("buyer");
  const supabase = createClient();

  // Confirm the order belongs to this buyer's org.
  const { data: owned } = await supabase
    .from("buyer_orders")
    .select("id,buyer_organizations!inner(owner_id)")
    .eq("id", orderId)
    .eq("buyer_organizations.owner_id", profile.id)
    .single();
  if (!owned) return { error: "Order not found." };

  const required_qty = Number(formData.get("required_qty"));
  const offered_price = Number(formData.get("offered_price"));
  if (isNaN(required_qty) || required_qty <= 0) return { error: "Quantity must be greater than 0." };
  if (isNaN(offered_price) || offered_price < 0) return { error: "Price must be 0 or more." };

  const { error } = await supabase.from("buyer_orders").update({
    product_id: String(formData.get("product_id")),
    required_qty,
    unit: String(formData.get("unit")),
    offered_price,
    required_delivery_date: String(formData.get("required_delivery_date")),
    delivery_location: String(formData.get("delivery_location") ?? "").trim(),
    min_quality_grade: String(formData.get("min_quality_grade")),
    packaging: String(formData.get("packaging") ?? "").trim() || null,
  }).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath(`/buyer/orders/${orderId}`);
  revalidatePath("/buyer/dashboard");
  redirect(`/buyer/orders/${orderId}`);
}