import Link from "next/link";
import { getProfile } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { Empty } from "@/components/ui/Empty";
import { markAllRead } from "./actions";

export default async function Notifications() {
  const profile = await getProfile();
  const supabase = createClient();
  const { data } = await supabase.from("notifications").select("id,title,body,read,link,created_at")
    .eq("user_id", profile.id).order("created_at", { ascending: false });

  const unread = (data ?? []).filter((n: any) => !n.read).length;

  return (
    <>
      <AppHeader name={profile.full_name} role={profile.role} unread={unread} />
      <main className="mx-auto max-w-2xl space-y-3 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-forest-dark">Notifications</h1>
          {unread > 0 && (
            <form action={markAllRead}>
              <button className="btn-ghost text-sm">Mark all read</button>
            </form>
          )}
        </div>
        {data?.length ? data.map((n: any) => {
          const inner = (
            <>
              <p className="font-semibold text-forest-dark">{n.title}</p>
              <p className="text-sm text-gray-500">{n.body}</p>
            </>
          );
          return n.link ? (
            <Link key={n.id} href={n.link} className={`card block transition hover:shadow-md ${n.read ? "opacity-70" : ""}`}>
              {inner}
            </Link>
          ) : (
            <div key={n.id} className={`card ${n.read ? "opacity-70" : ""}`}>{inner}</div>
          );
        }) : <Empty title="No notifications" />}
      </main>
    </>
  );
}