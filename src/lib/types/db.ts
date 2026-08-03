import type { Role } from "@/lib/auth/roles";

export type ListingStatus =
  | "draft" | "available" | "partially_allocated" | "fully_allocated" | "collected" | "cancelled";
export type OrderStatus =
  | "draft" | "open" | "proposed" | "confirmed" | "delivered" | "completed" | "cancelled";
export type ProposalStatus =
  | "draft" | "pending_farmers" | "pending_buyer" | "confirmed" | "rejected" | "cancelled";
export type AllocationStatus = "proposed" | "accepted" | "declined";
export type ShipmentStatus =
  | "proposed" | "assigned" | "accepted" | "collecting" | "in_transit" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid";

export type Profile = {
  id: string; full_name: string; role: Role; phone: string | null;
  dzongkhag: string | null; gewog: string | null;
};
export type Product = { id: string; name: string; category: string | null; default_unit: string };
export type Farm = {
  id: string; farmer_id: string; name: string; dzongkhag: string; gewog: string; size_acres: number | null;
};
export type HarvestListing = {
  id: string; farmer_id: string; farm_id: string; product_id: string;
  forecast_qty: number; available_qty: number; unit: string; expected_harvest_date: string;
  min_price: number; dzongkhag: string; gewog: string; quality_grade: string | null;
  notes: string | null; status: ListingStatus; created_at: string;
};
export type BuyerOrder = {
  id: string; buyer_org_id: string; product_id: string; required_qty: number; unit: string;
  offered_price: number; required_delivery_date: string; delivery_location: string;
  min_quality_grade: string | null; packaging: string | null; notes: string | null;
  status: OrderStatus; created_at: string;
};
