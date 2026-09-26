import React from "react";
import { Check } from "lucide-react";
import { ORDER_STATUSES } from "../../../data/catalog";
import { formatDate, formatDateTime } from "../../../lib/format";

const STEPS = ORDER_STATUSES.filter((s) => s.key !== "cancelled");

// Customer-facing wording; falls back to the admin description.
const COPY = {
  new: "We have your order and will confirm it with you on WhatsApp.",
  confirmed: "Confirmed with you. Your pieces are set aside.",
  packed: "Packed and ready to leave the shop.",
  shipped: "Handed to the courier and on its way.",
  delivered: "Delivered to you.",
};

const lastAt = (history, key) => {
  const hits = history.filter((h) => h?.status === key && h?.at);
  return hits.length ? hits[hits.length - 1].at : "";
};

// Vertical order progress built from ORDER_STATUSES; cancellation is shown as its own note.
export default function StatusTimeline({ status = "new", history = [], className = "" }) {
  const list = Array.isArray(history) ? history : [];
  const cancelled = status === "cancelled";
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  const seen = new Set(list.map((h) => h?.status).filter(Boolean));
  const reached = (i) => seen.has(STEPS[i].key) || (!cancelled && currentIdx >= i);

  return (
    <div className={className}>
      <ol className="space-y-0">
        {STEPS.map((s, i) => {
          const done = reached(i);
          const current = !cancelled && i === currentIdx;
          const last = i === STEPS.length - 1;
          const at = lastAt(list, s.key);
          // State is carried by shape and words, not only by colour: a filled check for done steps,
          // a dashed ring and lighter weight for steps still to come, plus a hidden label for screen readers.
          return (
            <li key={s.key} className="relative flex gap-5 pb-8 last:pb-0" aria-current={current ? "step" : undefined}>
              {!last && <span aria-hidden="true" className={`absolute left-[7px] top-5 h-full w-px ${reached(i + 1) ? "bg-ink" : "bg-neutral-300"}`} />}
              <span
                className={`relative mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${done ? "border-ink bg-ink" : "border-dashed border-neutral-500 bg-paper"}`}
                aria-hidden="true"
              >
                {done && <Check className="h-2.5 w-2.5 text-paper" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className={`text-sm ${done ? "font-medium text-ink" : "text-neutral-600"}`}>
                    {s.label}
                    <span className="sr-only">{current ? " (current step)" : done ? " (done)" : " (still to come)"}</span>
                  </p>
                  {current && <span className="eyebrow" aria-hidden="true">Current</span>}
                  {at && <span className="ml-auto text-xs tabular-nums text-neutral-500">{formatDateTime(at)}</span>}
                </div>
                <p className={`mt-0.5 text-xs leading-relaxed ${done ? "text-neutral-600" : "text-neutral-500"}`}>{COPY[s.key] || s.description}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {cancelled && (
        <div className="mt-8 border border-ink p-4">
          <p className="text-sm font-medium">This order was cancelled{lastAt(list, "cancelled") ? ` on ${formatDate(lastAt(list, "cancelled"))}` : ""}.</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">If that was not you, message us on WhatsApp and we will look into it straight away.</p>
        </div>
      )}
    </div>
  );
}
