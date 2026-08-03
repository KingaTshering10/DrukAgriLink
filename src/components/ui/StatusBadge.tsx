// Status badge: text + colour, never colour alone (accessibility).
const MAP: Record<string, string> = {
  draft: "bg-black/5 text-gray-600",
  available: "bg-forest-light text-forest-dark",
  open: "bg-forest-light text-forest-dark",
  partially_allocated: "bg-saffron/15 text-marigold",
  proposed: "bg-saffron/15 text-marigold",
  pending_farmers: "bg-saffron/15 text-marigold",
  pending_buyer: "bg-saffron/15 text-marigold",
  fully_allocated: "bg-forest/10 text-forest",
  confirmed: "bg-forest/10 text-forest",
  accepted: "bg-forest/10 text-forest",
  in_transit: "bg-saffron/15 text-marigold",
  collecting: "bg-saffron/15 text-marigold",
  collected: "bg-forest/10 text-forest",
  delivered: "bg-forest/10 text-forest",
  completed: "bg-forest text-white",
  paid: "bg-forest text-white",
  pending: "bg-saffron/15 text-marigold",
  cancelled: "bg-crimson/10 text-crimson",
  rejected: "bg-crimson/10 text-crimson",
  declined: "bg-crimson/10 text-crimson",
};
export function StatusBadge({ status }: { status: string }) {
  const cls = MAP[status] ?? "bg-black/5 text-gray-600";
  return <span className={`badge ${cls}`}>{status.replace(/_/g, " ")}</span>;
}
