import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { EditOrderForm } from "../EditOrderForm";

export default async function EditOrder({ params }: { params: { id: string } }) {
  const profile = await requireRole("buyer");
  const supabase = createClient();

  const [{ data: order }, { data: products }] = await Promise.all([
    supabase
      .from("buyer_orders")
      .select("id,product_id,required_qty,unit,offered_price,required_delivery_date,delivery_location,min_quality_grade,packaging,buyer_organizations!inner(owner_id)")
      .eq("id", params.id)
      .eq("buyer_organizations.owner_id", profile.id)
      .single(),
    supabase.from("products").select("id,name").order("name"),
  ]);

  if (!order) notFound();

  return (
    <>
      <AppHeader name={profile.full_name} role="Buyer" />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-forest-dark">Edit order</h1>
        <EditOrderForm order={order} products={products ?? []} />
      </main>
    </>
  );
}