"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { DZONGKHAG_LIST, gewogsOf } from "@/lib/constants/bhutan-admin";
import { updateProfile } from "./actions";

type Initial = { full_name: string; role: string; phone: string; dzongkhag: string; gewog: string };

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>;
}

export function ProfileForm({ initial }: { initial: Initial }) {
  const [dzongkhag, setDzongkhag] = useState(initial.dzongkhag);
  const [gewog, setGewog] = useState(initial.gewog);
  const [state, action] = useFormState(updateProfile, null as { error?: string; success?: boolean } | null);

  const gewogs = dzongkhag ? gewogsOf(dzongkhag) : [];

  return (
    <form action={action} className="card space-y-4">
      <div>
        <label className="label" htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" required className="input" defaultValue={initial.full_name} />
      </div>

      <div>
        <label className="label">Role</label>
        <input className="input bg-gray-50 text-gray-500" value={initial.role} disabled />
        <p className="mt-1 text-xs text-gray-400">Role can&apos;t be changed here.</p>
      </div>

      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" className="input" defaultValue={initial.phone} placeholder="e.g. 17XXXXXX" />
      </div>

      <div>
        <label className="label" htmlFor="dzongkhag">Dzongkhag</label>
        <select
          id="dzongkhag" name="dzongkhag" className="input"
          value={dzongkhag}
          onChange={(e) => { setDzongkhag(e.target.value); setGewog(""); }}
        >
          <option value="">Select dzongkhag…</option>
          {DZONGKHAG_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="gewog">Gewog</label>
        <select
          id="gewog" name="gewog" className="input"
          value={gewog}
          onChange={(e) => setGewog(e.target.value)}
          disabled={!dzongkhag}
        >
          <option value="">{dzongkhag ? "Select gewog…" : "Select dzongkhag first"}</option>
          {gewogs.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {state?.error && <p className="rounded-lg bg-crimson/10 px-3 py-2 text-sm text-crimson">{state.error}</p>}
      {state?.success && <p className="rounded-lg bg-forest-light px-3 py-2 text-sm text-forest">Profile updated.</p>}

      <Submit />
    </form>
  );
}