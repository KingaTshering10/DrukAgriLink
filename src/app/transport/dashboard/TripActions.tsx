"use client";
import { updateShipment } from "@/app/transport/actions";
import type { ShipmentStatus } from "@/lib/types/db";

const NEXT: Partial<Record<ShipmentStatus, { label: string; to: ShipmentStatus }[]>> = {
  proposed: [{ label: "Accept", to: "accepted" }, { label: "Decline", to: "cancelled" }],
  assigned: [{ label: "Accept", to: "accepted" }, { label: "Decline", to: "cancelled" }],
  accepted: [{ label: "Start collecting", to: "collecting" }],
  collecting: [{ label: "Mark in transit", to: "in_transit" }],
  in_transit: [{ label: "Mark delivered", to: "delivered" }],
};

export function TripActions({ id, status }: { id: string; status: ShipmentStatus }) {
  const actions = NEXT[status] ?? [];
  if (!actions.length) return null;
  return (
    <div className="mt-3 flex gap-2">
      {actions.map((a) => (
        <button key={a.to} onClick={() => updateShipment(id, a.to)}
          className={a.to === "cancelled" ? "btn-ghost !text-crimson" : "btn-primary"}>
          {a.label}
        </button>
      ))}
    </div>
  );
}
