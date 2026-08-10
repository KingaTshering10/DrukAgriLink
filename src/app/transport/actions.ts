"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { notify } from "@/lib/notify";
import type { ShipmentStatus } from "@/lib/types/db";

export async function updateShipment(shipmentId: string, status: ShipmentStatus) {
  const profile = await requireRole("transport");
  const supabase = createClient();

  // RLS restricts updates to shipments assigned to this provider.
  await supabase.from("shipments").update({ status }).eq("id", shipmentId);

  // When a trip is delivered: notify the coordinator and free the vehicle.
  if (status === "delivered") {
    const { data: shipment } = await supabase
      .from("shipments")
      .select("proposal_id, vehicle_id, collection_location, delivery_location")
      .eq("id", shipmentId)
      .single();

    if (shipment) {
      // 1) Notify the coordinator who owns the proposal.
      if ((shipment as any).proposal_id) {
        const { data: proposal } = await supabase
          .from("match_proposals")
          .select("coordinator_id")
          .eq("id", (shipment as any).proposal_id)
          .single();

        if (proposal?.coordinator_id) {
          await notify(
            proposal.coordinator_id,
            "Trip delivered",
            `${profile.full_name} delivered the trip: ${(shipment as any).collection_location} → ${(shipment as any).delivery_location}.`,
            `/coordinator/proposals/${(shipment as any).proposal_id}`
          );
        }
      }

      // 2) Free the vehicle so it can take new trips.
      if ((shipment as any).vehicle_id) {
        await supabase.from("vehicles").update({ available: true }).eq("id", (shipment as any).vehicle_id);
      }
    }
  }

  revalidatePath("/transport/dashboard");
}