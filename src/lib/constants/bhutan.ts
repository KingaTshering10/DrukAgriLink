// Representative Bhutan locations & product names (fictional demo scope).
export const DZONGKHAGS = [
  "Thimphu", "Paro", "Punakha", "Wangdue Phodrang", "Chukha",
] as const;

export const GEWOGS: Record<string, string[]> = {
  Thimphu: ["Kawang", "Mewang", "Chang"],
  Paro: ["Lamgong", "Doteng", "Lango"],
  Punakha: ["Guma", "Toewang"],
  "Wangdue Phodrang": ["Phobji", "Thedtsho"],
  Chukha: ["Bongo"],
};

export const PRODUCTS = ["Potato", "Chilli", "Tomato", "Cabbage", "Apple"] as const;
export const QUALITY_GRADES = ["A", "B", "C"] as const;
export const UNITS = ["kg", "quintal", "crate"] as const;
export const CURRENCY = "Nu.";
