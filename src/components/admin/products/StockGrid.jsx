import React, { useId, useState } from "react";

const whole = (n) => Math.max(0, Math.floor(Number(n) || 0));

// One number input per offered size, drawn as a hairline grid.
export default function StockGrid({ sizes = [], stock = {}, onChange, colorName = "" }) {
  const [fill, setFill] = useState("");
  const fillId = useId();
  const total = sizes.reduce((s, size) => s + whole(stock[size]), 0);

  const setOne = (size, value) => onChange({ ...stock, [size]: whole(value) });
  const setAll = (value) => onChange({ ...stock, ...Object.fromEntries(sizes.map((s) => [s, whole(value)])) });
  const applyFill = () => {
    if (fill === "") return;
    setAll(fill);
    setFill("");
  };

  if (!sizes.length) return <p className="text-xs text-neutral-500">Offer at least one size in the Sizes section to enter stock.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label label-dark mb-0">
          Stock per size <span className="ml-1 normal-case tracking-normal text-neutral-500">{total} in total</span>
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor={fillId} className="sr-only">
            Quantity for every size
          </label>
          <input
            id={fillId}
            type="number"
            min={0}
            inputMode="numeric"
            value={fill}
            onChange={(e) => setFill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyFill();
              }
            }}
            placeholder="Qty"
            className="field field-dark field-sm h-10 w-16 text-center tabular-nums"
          />
          <button type="button" onClick={applyFill} disabled={fill === ""} className="btn btn-inverse-outline btn-sm">
            Set all
          </button>
          <button type="button" onClick={() => setAll(0)} className="btn btn-inverse-outline btn-sm">
            Zero
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 pl-px pt-px sm:grid-cols-6 lg:grid-cols-8">
        {sizes.map((size) => {
          const n = whole(stock[size]);
          return (
            <label key={size} className="relative -ml-px -mt-px flex flex-col border border-neutral-800 px-1 py-2 text-center transition-colors focus-within:z-10 focus-within:border-neutral-400">
              <span className="truncate text-2xs font-medium uppercase tracking-[0.08em] text-neutral-500">{size}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={n}
                onChange={(e) => setOne(size, e.target.value)}
                onFocus={(e) => e.target.select()}
                aria-label={`${colorName ? `${colorName}, ` : ""}size ${size} stock`}
                className={`mt-1 w-full bg-transparent text-center text-base tabular-nums focus:outline-none focus:ring-0 ${n > 0 ? "text-paper" : "text-neutral-600"}`}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
