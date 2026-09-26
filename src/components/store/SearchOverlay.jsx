import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { searchSuggestions } from "../../lib/catalogUtils";
import { formatINR } from "../../lib/format";
import { productImage } from "../../lib/catalogUtils";
import Img from "../ui/Img";
import { useLockBody } from "../../hooks/useLockBody";

const POPULAR = ["Jacket", "Hoodie", "Tee", "Track pants", "Backpack", "Beanie"];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, products, categories } = useShop();
  const [q, setQ] = useState("");
  const input = useRef(null);
  const navigate = useNavigate();
  useLockBody(searchOpen);

  useEffect(() => {
    if (searchOpen) {
      setQ("");
      setTimeout(() => input.current?.focus(), 50);
    }
  }, [searchOpen]);
  useEffect(() => {
    if (!searchOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const { products: hits, categories: catHits } = searchSuggestions(products, categories, q, 6);

  const go = (term) => {
    const t = String(term || q).trim();
    if (!t) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(t)}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close search" onClick={() => setSearchOpen(false)} />
          <motion.div className="relative max-h-[92vh] overflow-y-auto bg-paper" initial={{ y: -16 }} animate={{ y: 0 }} exit={{ y: -16 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} role="dialog" aria-label="Search">
            <form
              className="container flex h-16 items-center gap-3 border-b border-line"
              onSubmit={(e) => {
                e.preventDefault();
                go();
              }}
            >
              <Search className="h-5 w-5 shrink-0 text-neutral-500" strokeWidth={1.5} />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jackets, hoodies, bags..." className="h-full flex-1 bg-transparent text-base outline-none placeholder:text-neutral-400" aria-label="Search products" autoComplete="off" />
              <button type="button" onClick={() => setSearchOpen(false)} className="-mr-2 p-2 hover:opacity-60" aria-label="Close">
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
                      <ul className="mt-3 space-y-2">
                        {catHits.map((c) => (
                          <li key={c.key}>
                            <button type="button" onClick={() => { setSearchOpen(false); navigate(`/shop/${c.department}/${c.slug}`); }} className="text-sm hover:underline underline-offset-4">
                              <span className="text-neutral-500">{c.department === "men" ? "Men" : c.department === "women" ? "Women" : "Kids"} / </span>
                              {c.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-neutral-500">No matching categories.</p>
                    )}
                    <button type="button" onClick={() => go()} className="mt-6 inline-flex items-center gap-2 text-2xs font-medium uppercase tracking-micro hover:opacity-60">
                      See all results for “{q.trim()}” <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="md:col-span-8">
                    <p className="eyebrow">Products</p>
                    {hits.length ? (
                      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                        {hits.map((p) => (
                          <li key={p.slug}>
                            <button type="button" onClick={() => { setSearchOpen(false); navigate(`/product/${p.slug}`); }} className="flex w-full items-center gap-3 text-left hover:bg-neutral-50">
                              <div className="img-frame h-16 w-12 shrink-0">
                                <Img src={productImage(p)} alt="" className="h-full w-full object-cover" />
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
