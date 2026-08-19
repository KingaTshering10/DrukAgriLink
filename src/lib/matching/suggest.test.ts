import { describe, it, expect } from "vitest";
import { suggestMatch, type Candidate } from "./suggest";

// Helper to build a candidate quickly.
function farmer(over: Partial<Candidate> & { listingId: string }): Candidate {
  return {
    farmerName: "Test Farmer",
    availableQty: 100,
    unitPrice: 50,
    dzongkhag: "Thimphu",
    qualityGrade: "A",
    ...over,
  };
}

describe("suggestMatch", () => {
  it("fully fills an order when supply is sufficient", () => {
    const candidates = [
      farmer({ listingId: "a", availableQty: 300 }),
    ];
    const result = suggestMatch(candidates, 200, "Thimphu");

    expect(result.fullyFilled).toBe(true);
    expect(result.filledQty).toBe(200);
    expect(result.allocations).toHaveLength(1);
    expect(result.allocations[0].takeQty).toBe(200);
  });

  it("reports a shortfall when supply is less than demand", () => {
    const candidates = [
      farmer({ listingId: "a", availableQty: 50 }),
      farmer({ listingId: "b", availableQty: 30 }),
    ];
    const result = suggestMatch(candidates, 200, "Thimphu");

    expect(result.fullyFilled).toBe(false);
    expect(result.filledQty).toBe(80); // 50 + 30
    expect(result.requiredQty).toBe(200);
  });

  it("prefers a same-dzongkhag farmer over a far one, all else equal", () => {
    const candidates = [
      farmer({ listingId: "far", dzongkhag: "Samdrup Jongkhar", availableQty: 100 }),
      farmer({ listingId: "near", dzongkhag: "Thimphu", availableQty: 100 }),
    ];
    // Delivery is Thimphu; both same price/quality/qty, so location decides.
    const result = suggestMatch(candidates, 100, "Thimphu");

    expect(result.allocations[0].listingId).toBe("near");
    expect(result.allocations[0].proximity).toBe(1);
  });

  it("prefers a cheaper farmer when location and everything else are equal", () => {
    const candidates = [
      farmer({ listingId: "pricey", unitPrice: 80, availableQty: 100 }),
      farmer({ listingId: "cheap", unitPrice: 40, availableQty: 100 }),
    ];
    const result = suggestMatch(candidates, 100, "Thimphu");

    expect(result.allocations[0].listingId).toBe("cheap");
  });

  it("recognises an adjacent dzongkhag as partial proximity", () => {
    const candidates = [
      // Paro is adjacent to Thimphu in the adjacency map.
      farmer({ listingId: "adjacent", dzongkhag: "Paro", availableQty: 100 }),
    ];
    const result = suggestMatch(candidates, 100, "Thimphu");

    expect(result.allocations[0].proximity).toBe(0.5);
  });

  it("returns an empty suggestion when there are no candidates", () => {
    const result = suggestMatch([], 100, "Thimphu");
    expect(result.allocations).toHaveLength(0);
    expect(result.fullyFilled).toBe(false);
    expect(result.filledQty).toBe(0);
  });
});