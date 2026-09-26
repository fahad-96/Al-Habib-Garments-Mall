import React, { useId, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { SORT_OPTIONS } from "../../../lib/catalogUtils";
import Drawer from "../../ui/Drawer";

export const sortLabel = (value) => SORT_OPTIONS.find((o) => o.value === value)?.label || SORT_OPTIONS[0].label;

// Desktop: a quiet native select, labelled inline.
export default function SortSelect({ value, onChange, className = "" }) {
  const id = useId();
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label htmlFor={id} className="whitespace-nowrap text-2xs font-medium uppercase tracking-micro text-neutral-500">
        Sort by
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 appearance-none border border-neutral-300 bg-paper pl-3 pr-9 text-[13px] font-medium transition-colors hover:border-ink focus:border-ink focus:outline-none">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
      </div>
    </div>
  );
}

// Mobile: bottom sheet holding a native radio group. A tap (or Space / Enter) picks an option and
// closes the sheet; the arrow keys move through the options and re-sort behind it, as radios do,
// and leave the sheet open until the shopper confirms with Enter or closes it.
export function SortDrawer({ open, onClose, value, onChange }) {
  const name = useId();
  const arrowed = useRef(false);

  const onKeyDown = (e) => {
    if (e.key.startsWith("Arrow")) arrowed.current = true;
    else if (e.key === "Enter") {
      e.preventDefault();
      onClose();
    }
  };
  const pick = (next) => {
    onChange(next);
    if (arrowed.current) arrowed.current = false;
    else onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} side="bottom" title="Sort by">
      <fieldset className="px-5 py-2" onKeyDown={onKeyDown} onPointerDown={() => (arrowed.current = false)}>
        <legend className="sr-only">Sort by</legend>
        {SORT_OPTIONS.map((o) => {
          const on = o.value === value;
          return (
            <label key={o.value} className="flex min-h-[3.25rem] cursor-pointer items-center justify-between gap-4 border-b border-line py-3 text-[15px] last:border-b-0 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink has-[:focus-visible]:ring-offset-2">
              <input type="radio" name={name} value={o.value} checked={on} onChange={() => pick(o.value)} className="sr-only" data-autofocus={on ? "" : undefined} />
              <span className={on ? "font-medium text-ink" : "text-neutral-700"}>{o.label}</span>
              {on && <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />}
            </label>
          );
        })}
      </fieldset>
      <div className="safe-bottom h-4" />
    </Drawer>
  );
}
