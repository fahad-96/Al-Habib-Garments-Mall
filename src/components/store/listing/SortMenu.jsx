import React, { useId } from "react";
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

// Mobile: bottom sheet with one tap per option.
export function SortDrawer({ open, onClose, value, onChange }) {
  return (
    <Drawer open={open} onClose={onClose} side="bottom" title="Sort by">
      <ul className="px-5 py-2" role="radiogroup" aria-label="Sort by">
        {SORT_OPTIONS.map((o) => {
          const on = o.value === value;
          return (
            <li key={o.value} className="border-b border-line last:border-b-0">
              <button
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  onChange(o.value);
                  onClose();
                }}
                className={`flex min-h-[3.25rem] w-full items-center justify-between py-3 text-left text-[15px] ${on ? "font-medium" : "text-neutral-700"}`}
              >
                {o.label}
                {on && <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="safe-bottom h-4" />
    </Drawer>
  );
}
