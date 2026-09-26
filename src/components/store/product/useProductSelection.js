import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MAX_QTY_PER_LINE, primaryVariant, sortSizes, variantStock, variantTotalStock } from "../../../lib/catalogUtils";

const sameColor = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

// Colour (kept in ?color=), size and quantity for one product, plus the stock those choices imply.
export function useProductSelection(product) {
  const [searchParams, setSearchParams] = useSearchParams();
  const variants = useMemo(() => product?.variants || [], [product]);
  const colorParam = searchParams.get("color");

  const variant = useMemo(() => variants.find((v) => sameColor(v.color, colorParam)) || primaryVariant(product), [variants, colorParam, product]);

  const setColor = useCallback(
    (color) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("color", color);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const sizes = useMemo(() => sortSizes(product?.sizes || [], product?.sizeSet), [product]);
  const stockFor = useCallback((size) => variantStock(variant, size), [variant]);
  const onlySize = sizes.length === 1 ? sizes[0] : "";

  const [size, setSizeState] = useState(() => (onlySize && variantStock(variant, onlySize) > 0 ? onlySize : ""));
  const [sizeError, setSizeError] = useState(false);
  const [qty, setQtyState] = useState(1);

  // Keep the chosen size only while the selected colour still has it; a single-size piece picks itself.
  useEffect(() => {
    setSizeState((current) => {
      if (current && variantStock(variant, current) > 0) return current;
      return onlySize && variantStock(variant, onlySize) > 0 ? onlySize : "";
    });
  }, [variant, onlySize]);

  const setSize = useCallback((next) => {
    setSizeState(next);
    setSizeError(false);
  }, []);
  const flagSizeError = useCallback(() => setSizeError(true), []);

  const selectedStock = size ? stockFor(size) : 0;
  const maxQty = Math.max(1, Math.min(size ? selectedStock : MAX_QTY_PER_LINE, MAX_QTY_PER_LINE));
  const safeQty = Math.min(Math.max(1, qty), maxQty);
  const setQty = useCallback((n) => setQtyState(Math.max(1, Math.min(Number(n) || 1, MAX_QTY_PER_LINE))), []);

  return {
    variant,
    setColor,
    sizes,
    size,
    setSize,
    sizeError,
    flagSizeError,
    stockFor,
    selectedStock,
    qty: safeQty,
    setQty,
    maxQty,
    colorSoldOut: variantTotalStock(variant) <= 0,
  };
}
