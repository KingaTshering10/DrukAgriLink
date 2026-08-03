"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import type { ShipmentStatus } from "@/lib/types/db";

export async function updateShipment(shipmentId: string, status: ShipmentStatus) {
  await requireRole("transport");
  const supabase = createClient();
  // RLS restricts updates to shipments assigned to this provider.
  await supabase.from("shipments").update({ status }).eq("id", shipmentId);
  revalidatePath("/transport/dashboard");
}
