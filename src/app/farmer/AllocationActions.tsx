"use client";
import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { respondAllocation } from "./actions";

export function AllocationActions({ allocationId }: { allocationId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => respondAllocation(allocationId, true))}
        className="btn-primary"
      >
        <Check size={16} /> Accept
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => respondAllocation(allocationId, false))}
        className="btn-ghost text-crimson"
      >
        <X size={16} /> Decline
      </button>
    </div>
  );
}