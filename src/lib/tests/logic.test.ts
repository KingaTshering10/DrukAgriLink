import { describe, it, expect } from "vitest";
import { computeCollection, sumNetDue, formatNu } from "@/lib/finance/calc";
import { harvestSchema, orderSchema, proposalSchema } from "@/lib/validation/schemas";
import { summarizeMatch } from "@/lib/matching/match";
import { canAccess } from "@/lib/auth/roles";

const U = "11111111-0000-0000-0000-000000000001";
const U2 = "11111111-0000-0000-0000-000000000002";
const L = "77777777-0000-0000-0000-000000000001";

describe("finance", () => {
  it("gross = accepted * price, net subtracts deductions", () => {
    const r = computeCollection({ acceptedQty: 800, unitPrice: 33, transportDeduction: 500, otherDeduction: 200 });
    expect(r.gross).toBe("26400.00");
    expect(r.netAmountDue).toBe("25700.00");
  });
  it("net floored at zero when deductions exceed gross", () => {
    const r = computeCollection({ acceptedQty: 1, unitPrice: 10, transportDeduction: 50 });
    expect(r.netAmountDue).toBe("0.00");
  });
  it("no float drift (0.1 + 0.2 style)", () => {
    const r = computeCollection({ acceptedQty: 3, unitPrice: 0.1 });
    expect(r.gross).toBe("0.30");
  });
  it("sumNetDue adds records", () => {
    expect(sumNetDue([{ netAmountDue: "25700.00" }, { netAmountDue: "9000.00" }])).toBe("34700.00");
  });
  it("formats currency", () => {
    expect(formatNu(32)).toBe("Nu. 32.00");
  });
});

describe("harvest validation", () => {
  const base = {
    farm_id: "66666666-0000-0000-0000-000000000001",
    product_id: "55555555-0000-0000-0000-000000000001",
    forecast_qty: 800, available_qty: 800, unit: "kg",
    expected_harvest_date: "2026-09-01", min_price: 32,
    dzongkhag: "Thimphu", gewog: "Kawang",
  };
  it("accepts a valid listing", () => {
    expect(harvestSchema.safeParse(base).success).toBe(true);
  });
  it("rejects zero quantity", () => {
    expect(harvestSchema.safeParse({ ...base, forecast_qty: 0 }).success).toBe(false);
  });
  it("rejects negative price", () => {
    expect(harvestSchema.safeParse({ ...base, min_price: -1 }).success).toBe(false);
  });
  it("rejects available > forecast", () => {
    expect(harvestSchema.safeParse({ ...base, available_qty: 900 }).success).toBe(false);
  });
});

describe("order validation", () => {
  const base = {
    buyer_org_id: "88888888-0000-0000-0000-000000000001",
    product_id: "55555555-0000-0000-0000-000000000001",
    required_qty: 1500, unit: "kg", offered_price: 35,
    required_delivery_date: "2026-09-10", delivery_location: "Thimphu",
  };
  it("accepts valid order", () => {
    expect(orderSchema.safeParse(base).success).toBe(true);
  });
  it("rejects non-positive quantity", () => {
    expect(orderSchema.safeParse({ ...base, required_qty: 0 }).success).toBe(false);
  });
});

describe("matching", () => {
  it("summarizes a valid multi-farmer match", () => {
    const s = summarizeMatch(
      1500, 35,
      [
        { listing_id: L, farmer_id: U, available_qty: 800, allocated_qty: 800, unit_price: 33 },
        { listing_id: "x", farmer_id: U2, available_qty: 500, allocated_qty: 500, unit_price: 33 },
      ],
      "Thimphu & Paro"
    );
    expect(s.valid).toBe(true);
    expect(s.farmerCount).toBe(2);
    expect(s.proposedQty).toBe(1300);
    expect(s.fulfilmentPct).toBeCloseTo(86.7, 1);
    expect(s.avgFarmerPrice).toBe("33.00");
  });
  it("flags allocation exceeding available supply", () => {
    const s = summarizeMatch(1000, 35, [
      { listing_id: L, farmer_id: U, available_qty: 500, allocated_qty: 800, unit_price: 30 },
    ]);
    expect(s.valid).toBe(false);
    expect(s.errors.length).toBeGreaterThan(0);
  });
  it("flags proposed exceeding required", () => {
    const s = summarizeMatch(500, 35, [
      { listing_id: L, farmer_id: U, available_qty: 800, allocated_qty: 800, unit_price: 30 },
    ]);
    expect(s.valid).toBe(false);
  });
  it("proposal schema needs at least one line", () => {
    const bad = proposalSchema.safeParse({ buyer_order_id: "88888888-0000-0000-0000-000000000001", required_qty: 100, lines: [] });
    expect(bad.success).toBe(false);
  });
});

describe("role permissions", () => {
  it("only matching role can access an area", () => {
    expect(canAccess("farmer", "farmer")).toBe(true);
    expect(canAccess("farmer", "coordinator")).toBe(false);
    expect(canAccess(null, "farmer")).toBe(false);
  });
});
