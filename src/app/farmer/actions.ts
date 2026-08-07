"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { harvestSchema } from "@/lib/validation/schemas";
import { notify } from "@/lib/notify";

export async function respondAllocation(allocationId: string, accept: boolean) {
  const profile = await requireRole("farmer");
  const supabase = createClient();

  // Update the allocation status.
  await supabase
    .from("match_allocations")
    .update({ status: accept ? "accepted" : "declined" })
    .eq("id", allocationId);

  // Look up the allocation's parent proposal id and quantity.
  const { data: alloc } = await supabase
    .from("match_allocations")
    .select("allocated_qty, proposal_id")
    .eq("id", allocationId)
    .single();

  // Look up the coordinator who owns that proposal.
  if (alloc?.proposal_id) {
    const { data: proposal } = await supabase
      .from("match_proposals")
      .select("coordinator_id")
      .eq("id", alloc.proposal_id)
      .single();

    if (proposal?.coordinator_id) {
      await notify(
        proposal.coordinator_id,
        accept ? "Farmer accepted allocation" : "Farmer declined allocation",
        `${profile.full_name} ${accept ? "accepted" : "declined"} an allocation of ${alloc.allocated_qty ?? ""} units.`
      );
    }
  }

  revalidatePath("/farmer/dashboard");
}