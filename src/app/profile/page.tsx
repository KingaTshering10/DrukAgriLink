import { getProfile } from "@/lib/auth/guard";
import { AppHeader } from "@/components/AppHeader";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const p = await getProfile();
  return (
    <>
      <AppHeader name={p.full_name} role={p.role} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-1 text-xl font-bold text-forest-dark">Profile</h1>
        <p className="mb-4 text-sm text-gray-500">Update your details below.</p>
        <ProfileForm
          initial={{
            full_name: p.full_name ?? "",
            role: p.role ?? "",
            phone: p.phone ?? "",
            dzongkhag: p.dzongkhag ?? "",
            gewog: p.gewog ?? "",
          }}
        />
      </main>
    </>
  );
}