import React from "react";
import { formatDateTime } from "../../../lib/format";
import { FLOW, flowIndex, statusDescription, statusLabel } from "./orderUtils";

// The forward flow (from ORDER_STATUSES) with the current step marked, then the
// raw status log in the order it happened.
export default function StatusFlow({ status = "new", history = [] }) {
  const entries = (Array.isArray(history) ? history : []).filter((h) => h && h.status);
  const cancelled = status === "cancelled";
  const idx = cancelled ? -1 : flowIndex(status);

  return (
    <>
      <div className="mt-6 border-t border-neutral-800 pt-5">
        <p className="label label-dark">How an order moves</p>
        <ol className="mt-3">
          {FLOW.map((s, i) => {
            const reached = i <= idx;
            const current = i === idx;
            const last = i === FLOW.length - 1;
            return (
              <li key={s.key} className="relative flex gap-4 pb-4 last:pb-0">
                {!last && <span aria-hidden="true" className={`absolute left-[5px] top-[18px] h-full w-px ${i < idx ? "bg-neutral-400" : "bg-neutral-800"}`} />}
                <span aria-hidden="true" className={`relative mt-[5px] h-[11px] w-[11px] shrink-0 rounded-full border ${reached ? "border-paper bg-paper" : "border-neutral-600 bg-neutral-950"} ${current ? "ring-4 ring-neutral-800" : ""}`} />
                <div className="min-w-0">
                  <p className={`text-sm leading-tight ${reached ? "font-medium text-paper" : "text-neutral-500"}`}>
                    {s.label}
                    {current && <span className="ml-2 text-2xs font-medium uppercase tracking-micro text-neutral-400">Now</span>}
                  </p>
                  <p className={`mt-0.5 text-xs leading-relaxed ${reached ? "text-neutral-400" : "text-neutral-600"}`}>{s.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
        {cancelled && <p className="mt-4 border border-neutral-800 px-3 py-2.5 text-xs leading-relaxed text-neutral-400">{statusDescription("cancelled")} Reopen it as new to put it back in the queue.</p>}
      </div>

      <div className="mt-6 border-t border-neutral-800 pt-5">
        <p className="label label-dark">History</p>
        {entries.length === 0 ? (
          <p className="mt-1 text-xs text-neutral-500">No status changes recorded yet.</p>
        ) : (
          <ol className="mt-1 divide-y divide-neutral-800/80">
            {entries.map((h, i) => {
              const latest = i === entries.length - 1;
              return (
                <li key={`${h.status}-${h.at || i}`} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                  <span className={latest ? "font-medium text-paper" : "text-neutral-300"}>{statusLabel(h.status)}</span>
                  <span className="shrink-0 text-xs tabular-nums text-neutral-500">{formatDateTime(h.at) || "—"}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </>
  );
}
