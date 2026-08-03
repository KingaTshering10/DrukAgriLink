import { Decimal } from "decimal.js";
import type { AllocationLine } from "@/lib/validation/schemas";

export type MatchSummary = {
  requestedQty: number;
  proposedQty: number;
  fulfilmentPct: number; // 0..100, capped
  farmerCount: number;
  avgFarmerPrice: string;
  buyerPrice: string;
  valid: boolean;
  errors: string[];
  explanation: string;
};

// Validates allocations and builds a plain-language summary — no opaque score.
export function summarizeMatch(
  requiredQty: number,
  buyerPrice: number,
  lines: AllocationLine[],
  collectionArea?: string
): MatchSummary {
  const errors: string[] = [];

  // no allocation may exceed the listing's available quantity
  for (const l of lines) {
    if (l.allocated_qty > l.available_qty) {
      errors.push(`Allocation of ${l.allocated_qty} exceeds available ${l.available_qty} for a listing`);
    }
  }

  const proposed = lines.reduce((a, l) => a.plus(l.allocated_qty), new Decimal(0));
  const proposedQty = proposed.toNumber();

  if (proposedQty > requiredQty) {
    errors.push(`Proposed ${proposedQty} exceeds required ${requiredQty}`);
  }

  const uniqueFarmers = new Set(lines.map((l) => l.farmer_id));
  const farmerCount = uniqueFarmers.size;

  // weighted average farmer price by allocated quantity
  const weighted = lines.reduce(
    (a, l) => a.plus(new Decimal(l.unit_price).times(l.allocated_qty)),
    new Decimal(0)
  );
  const avg = proposedQty > 0 ? weighted.dividedBy(proposed) : new Decimal(0);

  const fulfilment = requiredQty > 0 ? Math.min(100, (proposedQty / requiredQty) * 100) : 0;
  const fulfilmentPct = Math.round(fulfilment * 10) / 10;

  const explanation =
    `This proposal combines produce from ${farmerCount} ` +
    `${farmerCount === 1 ? "farmer" : "farmers"} and fulfils ${fulfilmentPct}% of the buyer's ` +
    `requested ${requiredQty} unit(s). Average farmer price is Nu. ${avg.toFixed(2)} against a ` +
    `buyer offer of Nu. ${buyerPrice.toFixed(2)}` +
    (collectionArea ? `, collected from ${collectionArea}.` : ".");

  return {
    requestedQty: requiredQty,
    proposedQty,
    fulfilmentPct,
    farmerCount,
    avgFarmerPrice: avg.toFixed(2),
    buyerPrice: new Decimal(buyerPrice).toFixed(2),
    valid: errors.length === 0,
    errors,
    explanation,
  };
}
