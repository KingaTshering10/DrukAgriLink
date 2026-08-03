import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { MatchBuilder } from "./MatchBuilder";
import { Empty } from "@/components/ui/Empty";

export default async function NewMatch({ searchParams }: { searchParams: { order?: string } }) {
  const profile = await requireRole("coordinator");
  const supabase = createClient();
  const orderId = searchParams.order;
  if (!orderId) return <><AppHeader name={profile.full_name} role="Coordinator" /><main className="mx-auto max-w-lg px-4 py-6"><Empty title="No order selected" hint="Pick an order from the dashboard." /></main></>;

  const { data: order } = await supabase
    .from("buyer_orders")
    .select("id,required_qty,unit,offered_price,product_id,delivery_location,products(name)")
    .eq("id", orderId).single();
  if (!order) return <><AppHeader name={profile.full_name} role="Coordinator" /><main className="mx-auto max-w-lg px-4 py-6"><Empty title="Order not found" /></main></>;

  // compatible listings: same product, available
  const { data: listings } = await supabase
    .from("harvest_listings")
    .select("id,farmer_id,available_qty,unit,min_price,dzongkhag,quality_grade,profiles(full_name)")
    .eq("product_id", (order as any).product_id)
    .eq("status", "available");

  return (
    <>
      <AppHeader name={profile.full_name} role="Coordinator" />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-1 text-xl font-bold text-forest-dark">Build a match</h1>
        <p className="mb-4 text-sm text-gray-500">
          {(order as any).products?.name} · needs {(order as any).required_qty} {(order as any).unit} · to {(order as any).delivery_location}
        </p>
        <MatchBuilder order={order as any} listings={(listings as any) ?? []} />
      </main>
    </>
  );
}
