import { getProfile } from "@/lib/auth/guard";
import { AppHeader } from "@/components/AppHeader";

export default async function Settings() {
  const p = await getProfile();
  return (
    <>
      <AppHeader name={p.full_name} role={p.role} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-forest-dark">Settings</h1>
        <div className="card space-y-3 text-sm text-gray-600">
          <p>Language: English (Dzongkha coming soon — see locales/dz.json).</p>
          <p>Currency: Nu. (BTN).</p>
          <p className="text-gray-400">Preference editing is out of scope for this first MVP.</p>
        </div>
      </main>
    </>
  );
}
