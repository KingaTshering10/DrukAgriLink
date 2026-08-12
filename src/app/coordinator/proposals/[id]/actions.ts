"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { notify } from "@/lib/notify";

export async function assignTransport(proposalId: string, _prev: unknown, formData: FormData) {
  const profile = await requireRole("coordinator");
  const supabase = createClient();

  const { data: proposal } = await supabase
    .from("match_proposals")
    .select("id,status")
    .eq("id", proposalId)
    .eq("coordinator_id", profile.id)
    .single();
  if (!proposal) return { error: "Proposal not found." };
  if (proposal.status !== "confirmed") return { error: "You can only assign transport to a confirmed proposal." };

  const vehicle_id = String(formData.get("vehicle_id") ?? "");
  const collection_location = String(formData.get("collection_location") ?? "").trim();
  const delivery_location = String(formData.get("delivery_location") ?? "").trim();
  const collection_date = String(formData.get("collection_date") ?? "").trim();
  const delivery_date = String(formData.get("delivery_date") ?? "").trim();
  const transport_cost = Number(formData.get("transport_cost") ?? 0);

  if (!vehicle_id) return { error: "Please select a vehicle." };
  if (!collection_location || !delivery_location) return { error: "Collection and delivery locations are required." };
  if (isNaN(transport_cost) || transport_cost < 0) return { error: "Enter a valid transport cost." };

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id,provider_id,available")
    .eq("id", vehicle_id)
    .single();
  if (!vehicle || !vehicle.available) return { error: "That vehicle is not available." };

  // Create the shipment. Transport cost is recorded here (charged to the buyer separately).
  const { data: shipment, error: shipErr } = await supabase
    .from("shipments")
    .insert({
      proposal_id: proposalId,
      vehicle_id,
      provider_id: vehicle.provider_id,
      collection_location,
      delivery_location,
      collection_date: collection_date || null,
      delivery_date: delivery_date || null,
      transport_cost,
      status: "assigned",
    })
    .select("id")
    .single();
  if (shipErr || !shipment) return { error: shipErr?.message ?? "Failed to create shipment." };

  await supabase.from("vehicles").update({ available: false }).eq("id", vehicle_id);

  // Generate farmer payments — FULL price, no transport deduction (farmers keep their full sale value).
  const { data: allocs } = await supabase
    .from("match_allocations")
    .select("id,farmer_id,listing_id,allocated_qty,unit_price")
    .eq("proposal_id", proposalId)
    .eq("status", "accepted");

  for (const a of allocs ?? []) {
    const qty = Number((a as any).allocated_qty);
    const price = Number((a as any).unit_price);
    const gross = qty * price;               // farmer's full amount
    const net = gross;                        // no deduction

    const { data: listing } = await supabase
      .from("harvest_listings")
      .select("product_id")
      .eq("id", (a as any).listing_id)
      .single();

    const { data: collection, error: colErr } = await supabase
      .from("collection_records")
      .insert({
        shipment_id: shipment.id,
        allocation_id: (a as any).id,
        farmer_id: (a as any).farmer_id,
        product_id: (listing as any)?.product_id,
        expected_qty: qty,
        presented_qty: qty,
        accepted_qty: qty,
        rejected_qty: 0,
        unit_price: price,
        transport_deduction: 0,               // farmers don't bear transport
        other_deduction: 0,
        net_amount_due: Number(net.toFixed(2)),
      })
      .select("id")
      .single();
    if (colErr) return { error: `Collection insert failed: ${colErr.message}` };

    if (collection?.id) {
      const { error: payErr } = await supabase.from("payment_records").insert({
        collection_record_id: collection.id,
        farmer_id: (a as any).farmer_id,
        amount: Number(net.toFixed(2)),
        status: "pending",
      });
      if (payErr) return { error: `Payment insert failed: ${payErr.message}` };
    }
  }

  await notify(
    vehicle.provider_id,
    "New trip assigned",
    `You've been assigned a trip: ${collection_location} → ${delivery_location}.`,
    "/transport/dashboard"
  );

  revalidatePath(`/coordinator/proposals/${proposalId}`);
  redirect(`/coordinator/proposals/${proposalId}`);
}