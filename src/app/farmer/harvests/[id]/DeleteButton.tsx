"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteHarvest } from "./actions";

export function DeleteButton({ harvestId }: { harvestId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn-ghost text-crimson"
      >
        <Trash2 size={16} /> Delete harvest
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Delete this harvest?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteHarvest(harvestId))}
        className="btn-primary bg-crimson hover:brightness-95"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="btn-ghost">
        Cancel
      </button>
    </div>
  );
}