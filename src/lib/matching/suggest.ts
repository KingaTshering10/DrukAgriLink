// Match-suggestion algorithm.
// Given a buyer's demand and available harvest listings, suggest an allocation
// that prefers farmers near the delivery location and with lower prices.
//
// Approach (documented for clarity):
//   1. Score each candidate on a weighted blend of:
//        - location proximity  (same dzongkhag as delivery = bonus)
//        - price               (lower is better)
//   2. Sort candidates by score (best first).
//   3. Greedily take quantity from the best candidates until demand is filled.
//
// This is a transparent heuristic. Natural extensions: real geo-coordinates with
// Haversine distance, a dzongkhag adjacency graph, or a linear-programming optimum.

export type Candidate = {
  listingId: string;
  farmerName: string;
  availableQty: number;
  unitPrice: number;
  dzongkhag: string | null;
};

export type Allocation = {
  listingId: string;
  farmerName: string;
  takeQty: number;
  unitPrice: number;
  dzongkhag: string | null;
  sameDzongkhag: boolean;
};

export type Suggestion = {
  allocations: Allocation[];
  filledQty: number;
  requiredQty: number;
  fullyFilled: boolean;
  avgPrice: number;
};

// Weights: how much each factor matters. Tune these to change behaviour.
const LOCATION_BONUS = 1000; // large so same-dzongkhag generally wins ties on price

export function suggestMatch(
  candidates: Candidate[],
  requiredQty: number,
  deliveryDzongkhag: string | null
): Suggestion {
  // Score: higher is better. Same-dzongkhag adds a big bonus; lower price adds score.
  const scored = candidates
    .filter((c) => c.availableQty > 0)
    .map((c) => {
      const sameDz = !!deliveryDzongkhag && c.dzongkhag === deliveryDzongkhag;
      const locationScore = sameDz ? LOCATION_BONUS : 0;
      // Cheaper = higher score. Use negative price so lower price ranks higher.
      const priceScore = -c.unitPrice;
      return { c, sameDz, score: locationScore + priceScore };
    })
    .sort((a, b) => b.score - a.score);

  const allocations: Allocation[] = [];
  let remaining = requiredQty;

  for (const { c, sameDz } of scored) {
    if (remaining <= 0) break;
    const takeQty = Math.min(c.availableQty, remaining);
    if (takeQty <= 0) continue;
    allocations.push({
      listingId: c.listingId,
      farmerName: c.farmerName,
      takeQty,
      unitPrice: c.unitPrice,
      dzongkhag: c.dzongkhag,
      sameDzongkhag: sameDz,
    });
    remaining -= takeQty;
  }

  const filledQty = requiredQty - remaining;
  const totalValue = allocations.reduce((s, a) => s + a.takeQty * a.unitPrice, 0);
  const avgPrice = filledQty > 0 ? totalValue / filledQty : 0;

  return {
    allocations,
    filledQty,
    requiredQty,
    fullyFilled: remaining <= 0,
    avgPrice,
  };
}