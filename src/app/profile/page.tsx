import { getProfile } from "@/lib/auth/guard";
import { AppHeader } from "@/components/AppHeader";

export default async function ProfilePage() {
  const p = await getProfile();
  const rows = [
    ["Name", p.full_name], ["Role", p.role], ["Phone", p.phone ?? "—"],
    ["Dzongkhag", p.dzongkhag ?? "—"], ["Gewog", p.gewog ?? "—"],
  ];
  return (
    <>
      <AppHeader name={p.full_name} role={p.role} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-forest-dark">Profile</h1>
        <div className="card divide-y divide-black/5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">{k}</span><span className="font-medium text-forest-dark">{v}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
