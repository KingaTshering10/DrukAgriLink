import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { OrderForm } from "./OrderForm";

export default async function NewOrder() {
  const profile = await requireRole("buyer");
  const supabase = createClient();
  const [{ data: orgs }, { data: products }] = await Promise.all([
    supabase.from("buyer_organizations").select("id,name").eq("owner_id", profile.id),
    supabase.from("products").select("id,name").order("name"),
  ]);
  return (
    <>
      <AppHeader name={profile.full_name} role="Buyer" />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-forest-dark">New procurement order</h1>
        <OrderForm orgs={orgs ?? []} products={products ?? []} />
      </main>
    </>
  );
}
