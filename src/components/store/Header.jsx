import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, ChevronDown, ChevronRight, X } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { pluralize } from "../../lib/format";
import Logo from "./Logo";
import Drawer from "../ui/Drawer";

// Hover must rest this long before the mega menu opens, so a pointer crossing the nav does not flash it.
const MEGA_OPEN_DELAY = 140;

const iconBtn = "relative h-10 w-10 shrink-0 items-center justify-center hover:opacity-60";
const badgeCls = "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-paper";

const NAV_EXTRA = [
  { to: "/new", label: "New in" },
  { to: "/collections", label: "Collections" },
  { to: "/sale", label: "Sale" },
];

export default function Header() {
  const { cartCount, wishlistProducts, setCartOpen, setSearchOpen, categoriesFor, collections, departments } = useShop();
  const wishlistCount = wishlistProducts.length;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mega, setMega] = useState(null);
  const megaTimer = useRef(0);
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

  // The mega menu is a hover preview of each department; the department link itself is the
  // keyboard and touch route. It closes on Escape, when focus leaves the header, and on navigation.
  useEffect(() => () => window.clearTimeout(megaTimer.current), []);
  useEffect(() => {
    if (!mega) return undefined;
    const onKey = (e) => e.key === "Escape" && setMega(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mega]);

  const closeMega = () => {
    window.clearTimeout(megaTimer.current);
    setMega(null);
  };
  const hoverDepartment = (key) => {
    window.clearTimeout(megaTimer.current);
    if (mega) setMega(key);
    else megaTimer.current = window.setTimeout(() => setMega(key), MEGA_OPEN_DELAY);
  };
  const megaDept = departments.find((d) => d.key === mega);

  const linkCls = ({ isActive }) => `relative whitespace-nowrap py-2 text-[13px] font-medium uppercase tracking-micro transition-opacity hover:opacity-60 ${isActive ? "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-ink" : ""}`;

  return (
    <header
      className={`sticky top-0 z-50 bg-paper transition-shadow ${scrolled ? "shadow-[0_1px_0_0_#e5e5e5]" : "border-b border-line"}`}
      onMouseLeave={closeMega}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) closeMega();
      }}
    >
      <div className="container flex h-[72px] items-center gap-4 sm:h-20 lg:h-[88px]">
        {/* Left: mobile menu + brand */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2" onMouseEnter={closeMega}>
          <button type="button" className={`-ml-2.5 inline-flex lg:hidden ${iconBtn}`} onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Logo />
        </div>

        {/* Centre: desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-6 xl:gap-8 lg:flex" aria-label="Primary">
          {departments.map((d) => (
            <div key={d.key} onMouseEnter={() => hoverDepartment(d.key)} onMouseLeave={() => window.clearTimeout(megaTimer.current)} className="relative">
              <NavLink to={`/shop/${d.key}`} className={linkCls}>
                {d.navLabel || d.name}
              </NavLink>
            </div>
          ))}
          {NAV_EXTRA.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkCls} onMouseEnter={closeMega}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: actions */}
        <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2" onMouseEnter={closeMega}>
          <button type="button" onClick={() => setSearchOpen(true)} className={`inline-flex ${iconBtn}`} aria-label="Search">
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Link to="/wishlist" className={`hidden sm:inline-flex ${iconBtn}`} aria-label={`Wishlist, ${pluralize(wishlistCount, "item")}`}>
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {wishlistCount > 0 && <span className={badgeCls} aria-hidden="true">{wishlistCount}</span>}
          </Link>
          <button type="button" onClick={() => setCartOpen(true)} className={`-mr-2.5 inline-flex ${iconBtn}`} aria-label={`Bag, ${pluralize(cartCount, "item")}`}>
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {cartCount > 0 && <span className={badgeCls} aria-hidden="true">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Mega menu (desktop hover preview). One panel whose contents follow the hovered department,
          so switching departments never stacks two panels. */}
      <AnimatePresence>
        {mega && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full hidden border-t border-line bg-paper shadow-[0_24px_40px_-24px_rgba(0,0,0,0.25)] lg:block"
          >
            <div className="container grid grid-cols-12 gap-10 py-8">
              <div className="col-span-3">
                <p className="eyebrow">{megaDept?.name}</p>
                <p className="mt-2 max-w-xs font-display text-2xl leading-tight">{megaDept?.tagline}</p>
                <Link to={`/shop/${mega}`} className="mt-4 inline-flex items-center gap-1 text-2xs font-medium uppercase tracking-micro hover:opacity-60">
                  Shop all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <ul className="col-span-6 grid grid-cols-3 content-start gap-x-8 gap-y-2">
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
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} side="left" title="Menu" width="max-w-[86vw] sm:max-w-sm">
        <MobileNav departments={departments} categoriesFor={categoriesFor} collections={collections} wishlistCount={wishlistCount} />
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
                    <Link to={`/shop/${d.key}`} className="block py-2.5 pl-3 text-sm font-medium">
                      Shop all {d.name.toLowerCase()}
                    </Link>
                  </li>
                  {categoriesFor(d.key).map((c) => (
                    <li key={c.key}>
                      <Link to={`/shop/${c.department}/${c.slug}`} className="block py-2.5 pl-3 text-sm text-neutral-700">
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
      <div className="mt-4 text-sm text-neutral-700">
        <Link to="/wishlist" className="flex min-h-11 items-center gap-3">
          <Heart className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> Wishlist {wishlistCount > 0 && <span className="text-neutral-500">({wishlistCount})</span>}
        </Link>
        <Link to="/track" className="flex min-h-11 items-center">Track your order</Link>
        <Link to="/size-guide" className="flex min-h-11 items-center">Size guide</Link>
        <Link to="/contact" className="flex min-h-11 items-center">Contact us</Link>
      </div>
      {collections.length > 0 && (
        <div className="mt-8">
          <p className="eyebrow">Collections</p>
          <ul className="mt-1">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link to={`/collections/${c.slug}`} className="flex min-h-10 items-center text-sm text-neutral-700">
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
