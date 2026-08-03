"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { summarizeMatch } from "@/lib/matching/match";
import type { AllocationLine } from "@/lib/validation/schemas";

// Create a proposal from an order + selected allocation lines (JSON in the form).
export async function createProposal(_prev: unknown, formData: FormData) {
  const profile = await requireRole("coordinator");
  const orderId = String(formData.get("buyer_order_id") ?? "");
  const requiredQty = Number(formData.get("required_qty") ?? 0);
  const buyerPrice = Number(formData.get("buyer_price") ?? 0);
  let lines: AllocationLine[] = [];
  try { lines = JSON.parse(String(formData.get("lines") ?? "[]")); } catch { /* ignore */ }

  const summary = summarizeMatch(requiredQty, buyerPrice, lines);
  if (!summary.valid) return { error: summary.errors[0] };
  if (lines.length === 0) return { error: "Select at least one listing." };

  const supabase = createClient();
  const { data: proposal, error } = await supabase
    .from("match_proposals")
    .insert({
      coordinator_id: profile.id,
      buyer_order_id: orderId,
      status: "pending_farmers",
      explanation: summary.explanation,
    })
    .select("id")
    .single();
  if (error || !proposal) return { error: error?.message ?? "Failed to create proposal." };

  const rows = lines.map((l) => ({
    proposal_id: proposal.id,
    listing_id: l.listing_id,
    farmer_id: l.farmer_id,
    allocated_qty: l.allocated_qty,
    unit_price: l.unit_price,
    status: "proposed" as const,
  }));
  await supabase.from("match_allocations").insert(rows);
  await supabase.from("buyer_orders").update({ status: "proposed" }).eq("id", orderId);

  revalidatePath("/coordinator/dashboard");
  redirect("/coordinator/dashboard");
}
