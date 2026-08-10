"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { notify } from "@/lib/notify";
import type { ShipmentStatus } from "@/lib/types/db";

// Friendly messages per stage, tailored a little per audience.
const STAGE_TITLE: Partial<Record<ShipmentStatus, string>> = {
  accepted: "Transport accepted",
  collecting: "Produce is being collected",
  in_transit: "Produce is in transit",
  delivered: "Produce delivered",
};

export async function updateShipment(shipmentId: string, status: ShipmentStatus) {
  const profile = await requireRole("transport");
  const supabase = createClient();

  // RLS restricts updates to shipments assigned to this provider.
  await supabase.from("shipments").update({ status }).eq("id", shipmentId);

  // Only these stages are worth notifying everyone about.
  const notifyStages: ShipmentStatus[] = ["collecting", "in_transit", "delivered"];

  if (notifyStages.includes(status)) {
    // Load the shipment + its route.
    const { data: shipment } = await supabase
      .from("shipments")
      .select("proposal_id, vehicle_id, collection_location, delivery_location")
      .eq("id", shipmentId)
      .single();

    if (shipment && (shipment as any).proposal_id) {
      const s = shipment as any;
      const route = `${s.collection_location} → ${s.delivery_location}`;
      const recipients = new Set<string>();

      // Coordinator (owns the proposal) + the buyer order behind it.
      const { data: proposal } = await supabase
        .from("match_proposals")
        .select("coordinator_id, buyer_order_id")
        .eq("id", s.proposal_id)
        .single();

      if (proposal?.coordinator_id) recipients.add(proposal.coordinator_id);

      // Buyer = owner of the organization on the buyer order.
      if (proposal?.buyer_order_id) {
        const { data: order } = await supabase
          .from("buyer_orders")
          .select("buyer_org_id")
          .eq("id", proposal.buyer_order_id)
          .single();
        if ((order as any)?.buyer_org_id) {
          const { data: org } = await supabase
            .from("buyer_organizations")
            .select("owner_id")
            .eq("id", (order as any).buyer_org_id)
            .single();
          if ((org as any)?.owner_id) recipients.add((org as any).owner_id);
        }
      }

      // Farmers = everyone allocated on this proposal.
      const { data: allocs } = await supabase
        .from("match_allocations")
        .select("farmer_id")
        .eq("proposal_id", s.proposal_id);
      for (const a of allocs ?? []) {
        if ((a as any).farmer_id) recipients.add((a as any).farmer_id);
      }

      // The transporter themselves don't need their own update.
      recipients.delete(profile.id);

      const title = STAGE_TITLE[status] ?? "Trip update";
      const body =
        status === "delivered"
          ? `The produce has been delivered. Route: ${route}.`
          : status === "in_transit"
          ? `The produce is on its way. Route: ${route}.`
          : `The produce is being collected. Route: ${route}.`;

      // Notify each party (link points to their notifications for now).
      for (const userId of recipients) {
        await notify(userId, title, body, "/notifications");
      }
    }
  }

  // On delivery, free the vehicle so it can take new trips.
  if (status === "delivered") {
    const { data: shipment } = await supabase
      .from("shipments")
      .select("vehicle_id")
      .eq("id", shipmentId)
      .single();
    if ((shipment as any)?.vehicle_id) {
      await supabase.from("vehicles").update({ available: true }).eq("id", (shipment as any).vehicle_id);
    }
  }

  revalidatePath("/transport/dashboard");
}