// Multi-factor match-suggestion algorithm.
// Scores each candidate farmer on a weighted, normalized blend of:
//   - location proximity (graded: same=1, adjacent=0.5, far=0 via dzongkhag adjacency)
//   - price              (cheaper is better)
//   - quality grade      (higher is better)
//   - quantity efficiency(can fill more of the order = fewer parties = simpler)
// Each factor is normalized to 0..1 so the weights express real priorities.
// Then greedily fills the order from the highest-scoring farmers.
//
// Extensions: real geo-coordinates + Haversine distance; a fairness term that
// favours farmers who've sold less recently; or a linear-programming optimum.

import { proximityScore } from "./adjacency";

export type Candidate = {
  listingId: string;
  farmerName: string;
  availableQty: number;
  unitPrice: number;
  dzongkhag: string | null;
  qualityGrade?: string | null;
};

export type Allocation = {
  listingId: string;
  farmerName: string;
  takeQty: number;
  unitPrice: number;
  dzongkhag: string | null;
  proximity: number; // 1 same, 0.5 adjacent, 0 far
  score: number;
};

export type Suggestion = {
  allocations: Allocation[];
  filledQty: number;
  requiredQty: number;
  fullyFilled: boolean;
  avgPrice: number;
};

// Tunable weights — how much each objective matters (should sum to ~1).
export const WEIGHTS = {
  location: 0.40,
  price: 0.30,
  quality: 0.15,
  quantity: 0.15,
};

// Map letter/quality grades to a 0..1 value. Higher grade = higher value.
function gradeValue(grade?: string | null): number {
  if (!grade) return 0.5; // unknown → neutral
  const g = grade.trim().toUpperCase();
  const table: Record<string, number> = { A: 1, B: 0.66, C: 0.33, D: 0 };
  return table[g] ?? 0.5;
}

export function suggestMatch(
  candidates: Candidate[],
  requiredQty: number,
  deliveryDzongkhag: string | null
): Suggestion {
  const usable = candidates.filter((c) => c.availableQty > 0);
  if (usable.length === 0) {
    return { allocations: [], filledQty: 0, requiredQty, fullyFilled: false, avgPrice: 0 };
  }

  // Normalization ranges for price and quantity.
  const prices = usable.map((c) => c.unitPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const maxQty = Math.max(...usable.map((c) => c.availableQty));

  const scored = usable.map((c) => {
    const proximity = proximityScore(c.dzongkhag, deliveryDzongkhag);
    // Cheaper → closer to 1. If all prices equal, everyone scores 1.
    const priceScore = maxPrice === minPrice ? 1 : (maxPrice - c.unitPrice) / (maxPrice - minPrice);
    const qualityScore = gradeValue(c.qualityGrade);
    // Can fill more of the order → higher. Capped at the order size.
    const quantityScore = maxQty === 0 ? 0 : Math.min(c.availableQty, requiredQty) / Math.min(maxQty, requiredQty || maxQty);

    const score =
      WEIGHTS.location * proximity +
      WEIGHTS.price * priceScore +
      WEIGHTS.quality * qualityScore +
      WEIGHTS.quantity * quantityScore;

    return { c, proximity, score };
  }).sort((a, b) => b.score - a.score);

  const allocations: Allocation[] = [];
  let remaining = requiredQty;

  for (const { c, proximity, score } of scored) {
    if (remaining <= 0) break;
    const takeQty = Math.min(c.availableQty, remaining);
    if (takeQty <= 0) continue;
    allocations.push({
      listingId: c.listingId,
      farmerName: c.farmerName,
      takeQty,
      unitPrice: c.unitPrice,
      dzongkhag: c.dzongkhag,
      proximity,
      score: Number(score.toFixed(3)),
    });
    remaining -= takeQty;
  }

  const filledQty = requiredQty - remaining;
  const totalValue = allocations.reduce((s, a) => s + a.takeQty * a.unitPrice, 0);
  const avgPrice = filledQty > 0 ? totalValue / filledQty : 0;

  return { allocations, filledQty, requiredQty, fullyFilled: remaining <= 0, avgPrice };
}