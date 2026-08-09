"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { notify } from "@/lib/notify";

export async function assignTransport(proposalId: string, _prev: unknown, formData: FormData) {
  const profile = await requireRole("coordinator");
  const supabase = createClient();

  // Security: the proposal must belong to this coordinator, and be confirmed.
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

  if (!vehicle_id) return { error: "Please select a vehicle." };
  if (!collection_location || !delivery_location) return { error: "Collection and delivery locations are required." };

  // Look up the vehicle's provider (the transporter) and confirm it's available.
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id,provider_id,available,registration_no")
    .eq("id", vehicle_id)
    .single();
  if (!vehicle || !vehicle.available) return { error: "That vehicle is not available." };

  // Create the shipment (starts as "assigned").
  const { error } = await supabase.from("shipments").insert({
    proposal_id: proposalId,
    vehicle_id,
    provider_id: vehicle.provider_id,
    collection_location,
    delivery_location,
    collection_date: collection_date || null,
    delivery_date: delivery_date || null,
    status: "assigned",
  });
  if (error) return { error: error.message };

  // Mark the vehicle busy.
  await supabase.from("vehicles").update({ available: false }).eq("id", vehicle_id);

  // Notify the transporter.
  await notify(
    vehicle.provider_id,
    "New trip assigned",
    `You've been assigned a trip: ${collection_location} → ${delivery_location}.`,
    "/transport/dashboard"
  );

  revalidatePath(`/coordinator/proposals/${proposalId}`);
  redirect(`/coordinator/proposals/${proposalId}`);
}