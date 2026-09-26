import React, { useId } from "react";
import { Check, ChevronDown } from "lucide-react";

const wrap = (dark) => ({ label: dark ? "label label-dark" : "label", field: dark ? "field field-dark" : "field" });

export function Input({ label, hint, error, dark = false, className = "", id, ...rest }) {
  const auto = useId();
  const fid = id || auto;
  const c = wrap(dark);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fid} className={c.label}>
          {label}
        </label>
      )}
      <input id={fid} className={`${c.field} ${error ? "border-red-600" : ""}`} aria-invalid={Boolean(error)} {...rest} />
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className={`mt-1.5 text-xs ${dark ? "text-neutral-500" : "text-neutral-500"}`}>{hint}</p> : null}
    </div>
  );
}

export function Textarea({ label, hint, error, dark = false, className = "", id, rows = 4, ...rest }) {
  const auto = useId();
  const fid = id || auto;
  const c = wrap(dark);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fid} className={c.label}>
          {label}
        </label>
      )}
      <textarea id={fid} rows={rows} className={`${c.field} resize-y ${error ? "border-red-600" : ""}`} aria-invalid={Boolean(error)} {...rest} />
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

export function Select({ label, hint, error, dark = false, className = "", id, children, ...rest }) {
  const auto = useId();
  const fid = id || auto;
  const c = wrap(dark);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fid} className={c.label}>
          {label}
        </label>
      )}
      <div className="relative">
        <select id={fid} className={`${c.field} appearance-none pr-10 ${error ? "border-red-600" : ""}`} {...rest}>
          {children}
        </select>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${dark ? "text-neutral-400" : "text-neutral-500"}`} aria-hidden="true" />
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({ label, checked, onChange, dark = false, className = "", disabled = false, count }) {
  return (
    <label className={`group flex cursor-pointer items-center gap-3 py-1.5 text-sm ${disabled ? "opacity-40" : ""} ${dark ? "text-neutral-200" : "text-neutral-800"} ${className}`}>
      <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center border transition-colors ${checked ? (dark ? "border-paper bg-paper text-ink" : "border-ink bg-ink text-paper") : dark ? "border-neutral-600 group-hover:border-neutral-400" : "border-neutral-400 group-hover:border-ink"}`}>
        {checked && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange?.(e.target.checked)} disabled={disabled} />
      <span className="flex-1">{label}</span>
      {count != null && <span className={`text-xs ${dark ? "text-neutral-500" : "text-neutral-400"}`}>{count}</span>}
    </label>
  );
}

export function Toggle({ label, checked, onChange, dark = false, description, className = "" }) {
  return (
    <label className={`flex cursor-pointer items-start justify-between gap-4 ${className}`}>
      <span>
        <span className={`block text-sm font-medium ${dark ? "text-neutral-100" : "text-ink"}`}>{label}</span>
        {description && <span className={`block text-xs ${dark ? "text-neutral-500" : "text-neutral-500"}`}>{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange?.(e.target.checked)} />
        <span className={`h-6 w-11 rounded-full transition-colors ${checked ? (dark ? "bg-paper" : "bg-ink") : dark ? "bg-neutral-700" : "bg-neutral-300"}`} />
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full transition-transform ${checked ? "translate-x-5" : ""} ${dark ? (checked ? "bg-ink" : "bg-neutral-300") : "bg-paper"}`} />
      </span>
    </label>
  );
}
