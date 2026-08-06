"use client";
import { useFormState } from "react-dom";
import Link from "next/link";
import { LocationPicker } from "@/components/LocationPicker";
import { createOrganization } from "./actions";

const initial = { error: "" };

export default function NewOrganization() {
  const [state, action] = useFormState(createOrganization, initial);
  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-forest-dark">Create your organization</h1>
      <form action={action} className="card space-y-4">
        <div>
          <label className="label">Organization name</label>
          <input name="name" className="input" placeholder="e.g. Thimphu Fresh Produce" required />
        </div>
        <div>
          <label className="label">Contact phone</label>
          <input name="contact_phone" className="input" placeholder="e.g. 17XXXXXX" />
        </div>
        <div>
          <label className="label">Address</label>
          <input name="address" className="input" placeholder="e.g. Norzin Lam, Thimphu" />
        </div>

        <LocationPicker />

        {state?.error && <p className="text-sm text-crimson">{state.error}</p>}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Create organization</button>
          <Link href="/buyer/dashboard" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </main>
  );
}