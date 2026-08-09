"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";

export async function createVehicle(_prev: unknown, formData: FormData) {
  const profile = await requireRole("transport");

  const registration_no = String(formData.get("registration_no") ?? "").trim();
  const vehicle_type = String(formData.get("vehicle_type") ?? "").trim();
  const service_area = String(formData.get("service_area") ?? "").trim();
  const capacityRaw = String(formData.get("capacity_kg") ?? "").trim();
  const refrigerated = formData.get("refrigerated") === "on";

  if (!registration_no) return { error: "Registration number is required." };
  if (!vehicle_type) return { error: "Please select a vehicle type." };
  const capacity_kg = capacityRaw ? Number(capacityRaw) : null;
  if (capacity_kg !== null && (isNaN(capacity_kg) || capacity_kg <= 0)) {
    return { error: "Capacity must be a positive number." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("vehicles").insert({
    provider_id: profile.id,
    registration_no,
    vehicle_type,
    capacity_kg,
    refrigerated,
    service_area: service_area || null,
    available: true,
  });
  if (error) return { error: error.message };

  revalidatePath("/transport/dashboard");
  redirect("/transport/dashboard");
}