"use client";
import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { respondProposal } from "./actions";

export function ProposalActions({ proposalId }: { proposalId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <button type="button" disabled={pending}
        onClick={() => startTransition(() => respondProposal(proposalId, true))}
        className="btn-primary"><Check size={16} /> Approve</button>
      <button type="button" disabled={pending}
        onClick={() => startTransition(() => respondProposal(proposalId, false))}
        className="btn-ghost text-crimson"><X size={16} /> Reject</button>
    </div>
  );
}