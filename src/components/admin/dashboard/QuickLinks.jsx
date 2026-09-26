import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ClipboardList, Image, Package, Settings } from "lucide-react";

const LINKS = [
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function QuickLinks({ className = "" }) {
  return (
    <nav aria-label="Quick links" className={`grid grid-cols-2 gap-px border border-neutral-800 bg-neutral-800 sm:grid-cols-4 ${className}`}>
      {LINKS.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className="group flex min-h-[3.25rem] items-center justify-between gap-3 bg-neutral-950 px-4 py-3 text-sm text-neutral-200 transition-colors hover:bg-neutral-900 hover:text-paper sm:px-5">
          <span className="inline-flex items-center gap-3">
            <Icon className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-paper" strokeWidth={1.5} aria-hidden="true" />
            {label}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-neutral-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper" aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}
