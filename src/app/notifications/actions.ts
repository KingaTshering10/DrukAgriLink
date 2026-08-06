"use server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";

export async function markAllRead() {
  const profile = await getProfile();
  const supabase = createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", profile.id)
    .eq("read", false);
  revalidatePath("/notifications");
}