import { createClient } from "@/lib/supabase/server";

/** Create an in-app notification for a user. Optional link makes it clickable. */
export async function notify(userId: string, title: string, body: string, link?: string) {
  const supabase = createClient();
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    body,
    link: link ?? null,
  });
}