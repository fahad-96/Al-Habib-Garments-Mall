import React, { Suspense, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, Tags, Layers, Image, Ticket, Star, Ruler, Settings, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import Spinner from "../ui/Spinner";
import Toaster from "../ui/Toaster";

export const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/size-guides", label: "Size guides", icon: Ruler },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, signOut } = useAdmin();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current = ADMIN_NAV.find((n) => location.pathname.startsWith(n.to));

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Admin">
      {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-paper text-ink" : "text-neutral-400 hover:bg-neutral-900 hover:text-paper"}`}>
          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink text-paper lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden border-r border-neutral-800 lg:flex lg:min-h-screen lg:flex-col lg:sticky lg:top-0 lg:h-screen">
        <div className="px-6 py-6">
          <Link to="/admin/dashboard" className="block leading-none">
            <span className="font-display text-xl tracking-[0.04em]">AL HABIB</span>
            <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.32em] text-neutral-500">Admin</span>
          </Link>
        </div>
        {nav}
        <div className="border-t border-neutral-800 px-6 py-4 text-xs text-neutral-500">
          <p className="truncate" title={user?.email}>{user?.email}</p>
          <div className="mt-3 flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-paper">
              <ExternalLink className="h-3.5 w-3.5" /> View store
            </Link>
            <button type="button" onClick={signOut} className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-paper">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-col">
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-800 bg-ink px-4 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="-ml-2 p-2" aria-label="Open admin menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-2xs font-medium uppercase tracking-micro">{current?.label || "Admin"}</span>
          <Link to="/" className="p-2" aria-label="View store">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-ink py-4">
              <div className="flex items-center justify-between px-6 pb-4">
                <span className="font-display text-lg tracking-[0.04em]">AL HABIB</span>
                <button type="button" onClick={() => setOpen(false)} className="p-1" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav}
              <button type="button" onClick={signOut} className="mx-6 mt-4 inline-flex items-center gap-2 text-sm text-neutral-300">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        )}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
