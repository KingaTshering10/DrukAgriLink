import { Decimal } from "decimal.js";

// All money/quantity math goes through Decimal to avoid float drift.
// Inputs may be number | string; outputs are rounded to 2 dp as strings for storage
// and numbers for display convenience.

export type CollectionInput = {
  acceptedQty: number | string;
  unitPrice: number | string;
  transportDeduction?: number | string;
  otherDeduction?: number | string;
};

export type CollectionResult = {
  gross: string; // accepted * unitPrice
  transportDeduction: string;
  otherDeduction: string;
  netAmountDue: string; // gross - deductions, floored at 0
};

const d = (v: number | string | undefined): Decimal => new Decimal(v ?? 0);
const money = (x: Decimal): string => x.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);

export function computeCollection(input: CollectionInput): CollectionResult {
  const gross = d(input.acceptedQty).times(d(input.unitPrice));
  const transport = d(input.transportDeduction);
  const other = d(input.otherDeduction);
  let net = gross.minus(transport).minus(other);
  if (net.isNegative()) net = new Decimal(0);
  return {
    gross: money(gross),
    transportDeduction: money(transport),
    otherDeduction: money(other),
    netAmountDue: money(net),
  };
}

// Sum net amounts due across many collection records.
export function sumNetDue(records: { netAmountDue: number | string }[]): string {
  const total = records.reduce((acc, r) => acc.plus(d(r.netAmountDue)), new Decimal(0));
  return money(total);
}

// Format for display, e.g. 32 -> "Nu. 32.00"
export function formatNu(v: number | string): string {
  return `Nu. ${money(d(v))}`;
}
