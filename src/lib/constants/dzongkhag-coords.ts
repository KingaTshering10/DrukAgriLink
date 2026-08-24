// Approximate coordinates (main town) for each of Bhutan's 20 dzongkhags.
// Used to fetch localized weather. Approximate is fine for a forecast.
export const DZONGKHAG_COORDS: Record<string, { lat: number; lon: number }> = {
  "Thimphu": { lat: 27.4712, lon: 89.6339 },
  "Paro": { lat: 27.4305, lon: 89.4133 },
  "Punakha": { lat: 27.5921, lon: 89.8797 },
  "Wangdue Phodrang": { lat: 27.4861, lon: 89.8994 },
  "Haa": { lat: 27.3894, lon: 89.2847 },
  "Chukha": { lat: 26.8608, lon: 89.3839 },
  "Samtse": { lat: 26.8983, lon: 89.0956 },
  "Dagana": { lat: 27.0961, lon: 89.8756 },
  "Tsirang": { lat: 27.0219, lon: 90.1233 },
  "Sarpang": { lat: 26.8639, lon: 90.2675 },
  "Trongsa": { lat: 27.5025, lon: 90.5075 },
  "Bumthang": { lat: 27.5416, lon: 90.7326 },
  "Zhemgang": { lat: 27.2147, lon: 90.6572 },
  "Mongar": { lat: 27.2792, lon: 91.2394 },
  "Lhuentse": { lat: 27.6667, lon: 91.1833 },
  "Trashigang": { lat: 27.3328, lon: 91.5539 },
  "Trashiyangtse": { lat: 27.6117, lon: 91.4986 },
  "Pemagatshel": { lat: 27.0378, lon: 91.4028 },
  "Samdrup Jongkhar": { lat: 26.8006, lon: 91.5056 },
  "Gasa": { lat: 27.9061, lon: 89.7264 },
};