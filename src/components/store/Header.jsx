import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, ChevronDown, ChevronRight, X } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import Logo from "./Logo";
import Drawer from "../ui/Drawer";

const NAV_EXTRA = [
  { to: "/new", label: "New In" },
  { to: "/collections", label: "Collections" },
  { to: "/sale", label: "Sale" },
];

export default function Header() {
  const { cartCount, wishlist, setCartOpen, setSearchOpen, categoriesFor, collections, departments } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mega, setMega] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMega(null);
  }, [location.pathname]);

  const linkCls = ({ isActive }) => `relative whitespace-nowrap py-2 text-[13px] font-medium uppercase tracking-micro transition-opacity hover:opacity-60 ${isActive ? "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-ink" : ""}`;

  return (
    <header className={`sticky top-0 z-50 bg-paper transition-shadow ${scrolled ? "shadow-[0_1px_0_0_#e5e5e5]" : "border-b border-line"}`} onMouseLeave={() => setMega(null)}>
      <div className="container flex h-[68px] items-center gap-4 sm:h-[72px]">
        {/* Left: mobile menu + brand */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button type="button" className="-ml-2 p-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Logo />
        </div>

        {/* Centre: desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-6 xl:gap-8 lg:flex" aria-label="Primary">
          {departments.map((d) => (
            <div key={d.key} onMouseEnter={() => setMega(d.key)} className="relative">
              <NavLink to={`/shop/${d.key}`} className={linkCls} onFocus={() => setMega(d.key)}>
                {d.navLabel || d.name}
              </NavLink>
            </div>
          ))}
          {NAV_EXTRA.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkCls} onMouseEnter={() => setMega(null)}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: actions */}
        <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2">
          <button type="button" onClick={() => setSearchOpen(true)} className="p-2 hover:opacity-60" aria-label="Search">
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Link to="/wishlist" className="relative hidden p-2 hover:opacity-60 sm:inline-flex" aria-label={`Wishlist, ${wishlist.length} items`}>
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {wishlist.length > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-paper">{wishlist.length}</span>}
          </Link>
          <button type="button" onClick={() => setCartOpen(true)} className="relative p-2 hover:opacity-60" aria-label={`Bag, ${cartCount} items`}>
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {cartCount > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-paper">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Mega menu (desktop) */}
      <AnimatePresence>
        {mega && (
          <motion.div
            key={mega}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full hidden border-t border-line bg-paper shadow-[0_24px_40px_-24px_rgba(0,0,0,0.25)] lg:block"
            onMouseEnter={() => setMega(mega)}
          >
            <div className="container grid grid-cols-12 gap-10 py-8">
              <div className="col-span-3">
                <p className="eyebrow">{departments.find((d) => d.key === mega)?.name}</p>
                <p className="mt-2 max-w-xs font-display text-2xl leading-tight">{departments.find((d) => d.key === mega)?.tagline}</p>
                <Link to={`/shop/${mega}`} className="mt-4 inline-flex items-center gap-1 text-2xs font-medium uppercase tracking-micro hover:opacity-60">
                  Shop all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <ul className="col-span-6 grid grid-cols-3 gap-x-8 gap-y-2">
                {categoriesFor(mega).map((c) => (
                  <li key={c.key}>
                    <Link to={`/shop/${c.department}/${c.slug}`} className="block py-1 text-sm text-neutral-700 hover:text-ink hover:underline underline-offset-4">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="col-span-3 border-l border-line pl-8">
                <p className="eyebrow">Collections</p>
                <ul className="mt-3 space-y-2">
                  {collections.slice(0, 4).map((c) => (
                    <li key={c.slug}>
                      <Link to={`/collections/${c.slug}`} className="text-sm text-neutral-700 hover:text-ink hover:underline underline-offset-4">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile navigation drawer */}
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} side="left" title="Menu" width="max-w-sm">
        <MobileNav departments={departments} categoriesFor={categoriesFor} collections={collections} wishlistCount={wishlist.length} />
      </Drawer>
    </header>
  );
}

function MobileNav({ departments, categoriesFor, collections, wishlistCount }) {
  const [open, setOpen] = useState(departments[0]?.key || "men");
  return (
    <nav className="px-5 py-2" aria-label="Mobile">
      {departments.map((d) => {
        const isOpen = open === d.key;
        return (
          <div key={d.key} className="border-b border-line">
            <button type="button" className="flex w-full items-center justify-between py-4 text-left" onClick={() => setOpen(isOpen ? null : d.key)} aria-expanded={isOpen}>
              <span className="text-[13px] font-medium uppercase tracking-micro">{d.name}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                  <li>
                    <Link to={`/shop/${d.key}`} className="block py-2 pl-3 text-sm font-medium">
                      Shop all {d.name.toLowerCase()}
                    </Link>
                  </li>
                  {categoriesFor(d.key).map((c) => (
                    <li key={c.key}>
                      <Link to={`/shop/${c.department}/${c.slug}`} className="block py-2 pl-3 text-sm text-neutral-700">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                  <li className="h-2" />
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      {NAV_EXTRA.map((n) => (
        <Link key={n.to} to={n.to} className="flex items-center justify-between border-b border-line py-4 text-[13px] font-medium uppercase tracking-micro">
          {n.label}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ))}
      <div className="mt-6 space-y-3 text-sm text-neutral-700">
        <Link to="/wishlist" className="flex items-center gap-3">
          <Heart className="h-4 w-4" strokeWidth={1.5} /> Wishlist {wishlistCount > 0 && <span className="text-neutral-400">({wishlistCount})</span>}
        </Link>
        <Link to="/track" className="block">Track order</Link>
        <Link to="/size-guide" className="block">Size guide</Link>
        <Link to="/contact" className="block">Visit us in Kunzer</Link>
      </div>
      {collections.length > 0 && (
        <div className="mt-8">
          <p className="eyebrow">Collections</p>
          <ul className="mt-2 space-y-2">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link to={`/collections/${c.slug}`} className="text-sm text-neutral-700">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

export { X };
