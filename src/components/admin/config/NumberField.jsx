import React, { useId } from "react";

// Whole-number input with a quiet prefix or suffix (₹, %, days), in the same dress as Fields.Input.
export default function NumberField({ label, name, value, onChange, prefix, suffix, hint, error, placeholder = "", className = "", min = 0, disabled = false }) {
  const auto = useId();
  const id = name ? `${auto}-${name}` : auto;
  return (
    <div className={className}>
      <label htmlFor={id} className="label label-dark">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={min}
          step={1}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={`field field-dark tabular-nums disabled:opacity-50 ${prefix ? "pl-8" : ""} ${suffix ? "pr-14" : ""} ${error ? "border-red-600" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
