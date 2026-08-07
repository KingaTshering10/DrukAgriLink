"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { orderSchema } from "@/lib/validation/schemas";
import { notify } from "@/lib/notify";

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
  const profile = await requireRole("buyer");
  const supabase = createClient();

  // Load the proposal (need coordinator + order to notify and verify ownership).
  const { data: proposal } = await supabase
    .from("match_proposals")
    .select("id,coordinator_id,buyer_order_id,buyer_orders!inner(buyer_organizations!inner(owner_id))")
    .eq("id", proposalId)
    .single();
  if (!proposal) return;

  // Security: this proposal's order must belong to this buyer.
  const ownerId = (proposal as any)?.buyer_orders?.buyer_organizations?.owner_id;
  if (ownerId !== profile.id) return;

  // Update the proposal + the underlying order.
  await supabase.from("match_proposals")
    .update({ buyer_approved: approve, status: approve ? "confirmed" : "rejected" })
    .eq("id", proposalId);
  await supabase.from("buyer_orders")
    .update({ status: approve ? "confirmed" : "open" })
    .eq("id", (proposal as any).buyer_order_id);

  // Notify the coordinator of the decision.
  if ((proposal as any).coordinator_id) {
    await notify(
      (proposal as any).coordinator_id,
      approve ? "Buyer approved proposal" : "Buyer rejected proposal",
      `${profile.full_name} ${approve ? "approved" : "rejected"} a match proposal.`
    );
  }

  if (approve) {
    // Get the accepted allocations for this proposal.
    const { data: allocs } = await supabase
      .from("match_allocations")
      .select("id,listing_id,farmer_id,allocated_qty")
      .eq("proposal_id", proposalId)
      .eq("status", "accepted");

    for (const a of allocs ?? []) {
      // Notify the farmer their produce is confirmed.
      await notify(
        (a as any).farmer_id,
        "Sale confirmed",
        `The buyer confirmed your allocation of ${(a as any).allocated_qty} units.`
      );

      // Reduce that harvest's available quantity (make the numbers honest).
      const { data: listing } = await supabase
        .from("harvest_listings")
        .select("available_qty")
        .eq("id", (a as any).listing_id)
        .single();
      if (listing) {
        const newQty = Math.max(0, Number((listing as any).available_qty) - Number((a as any).allocated_qty));
        await supabase.from("harvest_listings")
          .update({
            available_qty: newQty,
            status: newQty === 0 ? "sold" : "available",
          })
          .eq("id", (a as any).listing_id);
      }
    }
  }

  revalidatePath("/buyer/dashboard");
}