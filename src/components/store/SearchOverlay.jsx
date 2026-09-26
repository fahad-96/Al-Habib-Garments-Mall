import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { departmentName } from "../../data/catalog";
import { productImage, searchSuggestions } from "../../lib/catalogUtils";
import { formatINR } from "../../lib/format";
import Img from "../ui/Img";
import { useLockBody } from "../../hooks/useLockBody";
import { useFocusTrap } from "../../hooks/useFocusTrap";

const POPULAR = ["Jacket", "Hoodie", "Tee", "Track pants", "Backpack", "Beanie"];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, products, categories } = useShop();
  const [q, setQ] = useState("");
  const panel = useRef(null);
  const navigate = useNavigate();
  const close = () => setSearchOpen(false);
  useLockBody(searchOpen);
  useFocusTrap(searchOpen, panel, { onEscape: close, initialFocus: (root) => root.querySelector("input") });

  useEffect(() => {
    if (searchOpen) setQ("");
  }, [searchOpen]);

  const { products: hits, categories: catHits } = searchSuggestions(products, categories, q, 6);

  // `scrollTop` asks ScrollToTop to start the results at the top even when only the query changes.
  const visit = (to) => {
    setSearchOpen(false);
    navigate(to, { state: { scrollTop: true } });
  };
  const go = (term) => {
    const t = String(term || q).trim();
    if (t) visit(`/search?q=${encodeURIComponent(t)}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <button type="button" tabIndex={-1} className="absolute inset-0 bg-ink/40" aria-label="Close search" onMouseDown={(e) => e.preventDefault()} onClick={close} />
          <motion.div
            ref={panel}
            className="relative max-h-[92vh] overflow-y-auto bg-paper outline-none"
            initial={{ y: -16 }}
            animate={{ y: 0 }}
            exit={{ y: -16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <form
              role="search"
              className="container flex h-16 items-center gap-3 border-b border-line transition-colors focus-within:border-ink"
              onSubmit={(e) => {
                e.preventDefault();
                go();
              }}
            >
              <Search className="h-5 w-5 shrink-0 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
              <input
                type="search"
                enterKeyHint="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search jackets, hoodies, bags..."
                className="h-full min-w-0 flex-1 appearance-none bg-transparent text-base outline-none placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
                aria-label="Search products"
                autoComplete="off"
              />
              <button type="button" onClick={close} className="-mr-2.5 inline-flex h-10 w-10 shrink-0 items-center justify-center hover:opacity-60" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </form>
            <div className="container py-6">
              {!q.trim() ? (
                <div>
                  <p className="eyebrow">Popular searches</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {POPULAR.map((p) => (
                      <button key={p} type="button" onClick={() => go(p)} className="chip">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-8 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <p className="eyebrow">Categories</p>
                    {catHits.length ? (
                      <ul className="mt-2">
                        {catHits.map((c) => (
                          <li key={c.key}>
                            <button type="button" onClick={() => visit(`/shop/${c.department}/${c.slug}`)} className="flex min-h-10 w-full items-center text-left text-sm underline-offset-4 hover:underline">
                              <span>
                                <span className="text-neutral-500">{departmentName(c.department) || "Shop"} / </span>
                                {c.name}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-neutral-500">No matching categories.</p>
                    )}
                    <button type="button" onClick={() => go()} className="mt-4 inline-flex min-h-10 items-center gap-2 text-left text-2xs font-medium uppercase tracking-micro hover:opacity-60">
                      See all results for “{q.trim()}” <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="md:col-span-8">
                    <p className="eyebrow">Products</p>
                    {hits.length ? (
                      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                        {hits.map((p) => (
                          <li key={p.slug}>
                            <button type="button" onClick={() => visit(`/product/${p.slug}`)} className="flex w-full items-center gap-3 text-left hover:bg-neutral-50">
                              <div className="img-frame h-16 w-12 shrink-0">
                                <Img src={productImage(p)} alt="" sizes="48px" className="h-full w-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{p.title}</p>
                                <p className="text-xs text-neutral-500">{formatINR(p.price)}</p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-neutral-500">No products match “{q.trim()}”. Try a different word.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
