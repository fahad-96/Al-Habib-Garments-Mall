import React from "react";
import { Link } from "react-router-dom";
import { MAX_QTY_PER_LINE } from "../../../lib/catalogUtils";
import { discountPercent, formatINR } from "../../../lib/format";
import { useIsDesktop } from "../../../hooks/useMediaQuery";
import Img from "../../ui/Img";
import QtyStepper from "../../ui/QtyStepper";
import TextButton from "./TextButton";

// One row of the bag. `line` is a cartLines entry from useShop().
export default function BagLine({ line, onQty, onRemove, onMoveToWishlist }) {
  const desktop = useIsDesktop();
  const { available } = line;
  const max = Math.max(1, Math.min(line.stock, MAX_QTY_PER_LINE));
  const qty = available ? Math.min(line.qty, line.stock) : line.qty;
  const adjusted = available && line.qty > line.stock;
  const off = discountPercent(line.mrp, line.price);
  const href = `/product/${line.slug}`;
  const variant = [line.color, line.size].filter(Boolean).join(" · ");
  const lineTotal = formatINR(line.price * qty);

  const actions = (
    <>
      <TextButton onClick={onMoveToWishlist}>Move to wishlist</TextButton>
      <TextButton onClick={onRemove}>Remove</TextButton>
    </>
  );

  return (
    <li className="flex gap-4 py-6 sm:gap-6 sm:py-7">
      <Link to={href} className={`img-frame aspect-[3/4] w-24 shrink-0 sm:w-28 ${available ? "" : "opacity-40"}`} aria-label={line.title}>
        <Img src={line.image} alt={line.title} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className={`text-sm font-medium leading-snug ${available ? "text-ink" : "text-neutral-500"}`}>
              <Link to={href} className="underline-offset-4 hover:underline">
                {line.title}
              </Link>
            </h2>
            {variant && <p className="mt-1 text-xs text-neutral-500">{variant}</p>}
            {available ? (
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="tabular-nums">{formatINR(line.price)}</span>
                {off > 0 && (
                  <>
                    <span className="text-xs tabular-nums text-neutral-400 line-through">{formatINR(line.mrp)}</span>
                    <span className="text-2xs font-medium uppercase tracking-micro text-neutral-500">{off}% off</span>
                  </>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-neutral-500">No longer available</p>
            )}
          </div>
          {available && <p className="hidden shrink-0 text-sm font-semibold tabular-nums sm:block">{lineTotal}</p>}
        </div>

        <div className="mt-auto pt-4">
          {available ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <QtyStepper size={desktop ? "sm" : "md"} value={qty} max={max} onChange={onQty} />
                <p className="text-sm font-semibold tabular-nums sm:hidden">{lineTotal}</p>
                <div className="hidden items-center gap-6 sm:flex">{actions}</div>
              </div>
              {adjusted && <p className="mt-2 text-xs text-neutral-600">Only {line.stock} left, quantity adjusted.</p>}
              <div className="mt-1 flex items-center gap-6 sm:hidden">{actions}</div>
            </>
          ) : (
            <TextButton onClick={onRemove}>Remove</TextButton>
          )}
        </div>
      </div>
    </li>
  );
}
