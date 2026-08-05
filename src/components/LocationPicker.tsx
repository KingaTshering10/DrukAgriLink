"use client";
import { useState } from "react";
import { DZONGKHAG_LIST, gewogsOf, chiwogsOf } from "@/lib/constants/bhutan-admin";

/**
 * Cascading Dzongkhag -> Gewog -> Chiwog/Village picker.
 * Submits three form fields: dzongkhag, gewog, chiwog.
 * Selecting a higher level resets the levels below it.
 */
export function LocationPicker({
  dzongkhag: dzName = "dzongkhag",
  gewog: gwName = "gewog",
  chiwog: chName = "chiwog",
  required = false,
}: {
  dzongkhag?: string;
  gewog?: string;
  chiwog?: string;
  required?: boolean;
}) {
  const [dz, setDz] = useState("");
  const [gw, setGw] = useState("");
  const [ch, setCh] = useState("");

  const gewogs = gewogsOf(dz);
  const chiwogs = chiwogsOf(dz, gw);

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Dzongkhag</label>
        <select
          name={dzName}
          className="input"
          value={dz}
          required={required}
          onChange={(e) => { setDz(e.target.value); setGw(""); setCh(""); }}
        >
          <option value="">Select dzongkhag…</option>
          {DZONGKHAG_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Gewog</label>
        <select
          name={gwName}
          className="input"
          value={gw}
          disabled={!dz}
          required={required}
          onChange={(e) => { setGw(e.target.value); setCh(""); }}
        >
          <option value="">{dz ? "Select gewog…" : "Select dzongkhag first"}</option>
          {gewogs.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Chiwog / Village</label>
        <select
          name={chName}
          className="input"
          value={ch}
          disabled={!gw}
          onChange={(e) => setCh(e.target.value)}
        >
          <option value="">{gw ? "Select chiwog…" : "Select gewog first"}</option>
          {chiwogs.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}