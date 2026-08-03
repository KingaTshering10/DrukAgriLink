import { getProfile } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { Empty } from "@/components/ui/Empty";

export default async function Notifications() {
  const profile = await getProfile();
  const supabase = createClient();
  const { data } = await supabase.from("notifications").select("id,title,body,read,created_at")
    .eq("user_id", profile.id).order("created_at", { ascending: false });
  return (
    <>
      <AppHeader name={profile.full_name} role={profile.role} />
      <main className="mx-auto max-w-2xl space-y-3 px-4 py-6">
        <h1 className="text-xl font-bold text-forest-dark">Notifications</h1>
        {data?.length ? data.map((n: any) => (
          <div key={n.id} className={`card ${n.read ? "opacity-70" : ""}`}>
            <p className="font-semibold text-forest-dark">{n.title}</p>
            <p className="text-sm text-gray-500">{n.body}</p>
          </div>
        )) : <Empty title="No notifications" />}
      </main>
    </>
  );
}
