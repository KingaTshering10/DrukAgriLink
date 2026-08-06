import { createClient } from "@/lib/supabase/server";

/** Create an in-app notification for a user. Safe to call from server actions. */
export async function notify(userId: string, title: string, body: string) {
  const supabase = createClient();
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    body,
  });
}