import { z } from "zod";

// ---------- harvest listing ----------
export const harvestSchema = z
  .object({
    farm_id: z.string().uuid(),
    product_id: z.string().uuid(),
    forecast_qty: z.coerce.number().positive("Quantity must be greater than zero"),
    available_qty: z.coerce.number().min(0, "Available quantity cannot be negative"),
    unit: z.string().min(1).default("kg"),
    expected_harvest_date: z.string().min(1, "Harvest date is required"),
    min_price: z.coerce.number().min(0, "Price cannot be negative"),
    dzongkhag: z.string().min(1),
    gewog: z.string().min(1),
    quality_grade: z.string().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    status: z
      .enum(["draft", "available", "partially_allocated", "fully_allocated", "collected", "cancelled"])
      .default("draft"),
  })
  .refine((v) => v.available_qty <= v.forecast_qty, {
    message: "Available quantity cannot exceed forecast quantity",
    path: ["available_qty"],
  });
export type HarvestInput = z.infer<typeof harvestSchema>;

// ---------- buyer order ----------
export const orderSchema = z.object({
  buyer_org_id: z.string().uuid(),
  product_id: z.string().uuid(),
  required_qty: z.coerce.number().positive("Required quantity must be greater than zero"),
  unit: z.string().min(1).default("kg"),
  offered_price: z.coerce.number().min(0, "Offered price cannot be negative"),
  required_delivery_date: z.string().min(1, "Delivery date is required"),
  delivery_location: z.string().min(1, "Delivery location is required"),
  min_quality_grade: z.string().optional().nullable(),
  packaging: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  status: z
    .enum(["draft", "open", "proposed", "confirmed", "delivered", "completed", "cancelled"])
    .default("draft"),
});
export type OrderInput = z.infer<typeof orderSchema>;

// ---------- match allocation line ----------
export const allocationLineSchema = z.object({
  listing_id: z.string().uuid(),
  farmer_id: z.string().uuid(),
  available_qty: z.coerce.number().min(0),
  allocated_qty: z.coerce.number().positive("Allocated quantity must be greater than zero"),
  unit_price: z.coerce.number().min(0),
});
export type AllocationLine = z.infer<typeof allocationLineSchema>;

// A whole proposal: order + one or more allocation lines.
export const proposalSchema = z.object({
  buyer_order_id: z.string().uuid(),
  required_qty: z.coerce.number().positive(),
  lines: z.array(allocationLineSchema).min(1, "Select at least one farmer listing"),
});
export type ProposalInput = z.infer<typeof proposalSchema>;
