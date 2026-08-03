"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { orderSchema } from "@/lib/validation/schemas";

export async function createOrder(_prev: unknown, formData: FormData) {
  const profile = await requireRole("buyer");
  const parsed = orderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const supabase = createClient();
  // Confirm the org belongs to this buyer (RLS also enforces it).
  const { data: org } = await supabase
    .from("buyer_organizations").select("id").eq("id", parsed.data.buyer_org_id)
    .eq("owner_id", profile.id).single();
  if (!org) return { error: "You can only order for your own organization." };
  const { error } = await supabase.from("buyer_orders").insert(parsed.data);
  if (error) return { error: error.message };
  revalidatePath("/buyer/dashboard");
  redirect("/buyer/dashboard");
}

export async function respondProposal(proposalId: string, approve: boolean) {
  await requireRole("buyer");
  const supabase = createClient();
  await supabase.from("match_proposals")
    .update({ buyer_approved: approve, status: approve ? "confirmed" : "rejected" })
    .eq("id", proposalId);
  revalidatePath("/buyer/dashboard");
}
