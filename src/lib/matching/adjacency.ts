// Dzongkhag adjacency for Bhutan's 20 dzongkhags.
// "near" is graded: same (1.0) > adjacent (0.5) > far (0.0).
//
// NOTE: This adjacency list is hand-built from general geographic knowledge of
// Bhutan and should be verified against an authoritative map before production
// use. It's a reasonable approximation for demonstrating graded proximity.

export const DZONGKHAG_ADJACENCY: Record<string, string[]> = {
  Bumthang: ["Trongsa", "Lhuentse", "Mongar", "Zhemgang"],
  Chukha: ["Thimphu", "Paro", "Haa", "Samtse", "Dagana"],
  Dagana: ["Chukha", "Wangdue Phodrang", "Tsirang", "Sarpang", "Thimphu"],
  Gasa: ["Punakha", "Thimphu", "Wangdue Phodrang"],
  Haa: ["Paro", "Chukha", "Samtse"],
  Lhuentse: ["Bumthang", "Mongar", "Trashiyangtse"],
  Mongar: ["Bumthang", "Lhuentse", "Trashigang", "Pemagatshel", "Zhemgang", "Trashiyangtse"],
  Paro: ["Thimphu", "Haa", "Chukha"],
  Pemagatshel: ["Mongar", "Trashigang", "Samdrup Jongkhar", "Zhemgang"],
  Punakha: ["Thimphu", "Gasa", "Wangdue Phodrang"],
  Samdrup Jongkhar: ["Pemagatshel", "Trashigang"],
  Samtse: ["Chukha", "Haa", "Dagana"],
  Sarpang: ["Dagana", "Tsirang", "Zhemgang", "Wangdue Phodrang"],
  Thimphu: ["Paro", "Chukha", "Punakha", "Gasa", "Dagana", "Wangdue Phodrang"],
  Trashigang: ["Mongar", "Pemagatshel", "Samdrup Jongkhar", "Trashiyangtse"],
  Trashiyangtse: ["Lhuentse", "Mongar", "Trashigang"],
  Trongsa: ["Bumthang", "Wangdue Phodrang", "Zhemgang", "Sarpang"],
  Tsirang: ["Dagana", "Sarpang", "Wangdue Phodrang"],
  Wangdue Phodrang: ["Thimphu", "Punakha", "Gasa", "Trongsa", "Tsirang", "Sarpang", "Dagana", "Zhemgang"],
  Zhemgang: ["Bumthang", "Trongsa", "Sarpang", "Mongar", "Pemagatshel", "Wangdue Phodrang"],
};

// Returns 1.0 (same), 0.5 (adjacent), or 0.0 (far / unknown).
export function proximityScore(from: string | null, to: string | null): number {
  if (!from || !to) return 0;
  if (from === to) return 1;
  const neighbors = DZONGKHAG_ADJACENCY[to] ?? [];
  return neighbors.includes(from) ? 0.5 : 0;
}