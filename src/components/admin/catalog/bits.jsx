import React from "react";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import Img from "../../ui/Img";
import Button from "../../ui/Button";

// Small shared pieces for the catalog admin pages (categories, collections, banners).

// Portrait artwork thumbnail. Defaults to the 40x50 list size.
export function ArtThumb({ src, alt = "", className = "h-[50px] w-10", label = "", dim = false }) {
  return (
    <div className={`shrink-0 overflow-hidden bg-neutral-900 ${dim ? "opacity-50" : ""} ${className}`}>
      {src ? (
        <Img src={src} alt={alt} className="h-full w-full object-cover" fallbackLabel={label} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-600" aria-hidden="true">
          <ImageOff className="h-4 w-4" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

export function IconButton({ icon: Icon, label, onClick, className = "", size = "h-10 w-10", ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex shrink-0 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent ${size} ${className}`}
      {...rest}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}

export function RowActions({ name, onEdit, onDelete, className = "" }) {
  return (
    <div className={`flex shrink-0 items-center ${className}`}>
      <IconButton icon={Pencil} label={`Edit ${name}`} onClick={onEdit} />
      <IconButton icon={Trash2} label={`Delete ${name}`} onClick={onDelete} />
    </div>
  );
}

// Toggle-style on/off pill used in lists: solid when live, muted when hidden.
export function LivePill({ active, className = "" }) {
  return (
    <span className={`inline-flex shrink-0 items-center px-2 py-0.5 text-2xs font-medium uppercase tracking-micro leading-relaxed ${active ? "bg-paper text-ink" : "border border-neutral-800 text-neutral-500"} ${className}`}>
      {active ? "Active" : "Hidden"}
    </span>
  );
}

export function LoadError({ what = "This page", error, onRetry, loading = false }) {
  return (
    <div className="admin-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
      <div>
        <p className="text-sm text-paper">{what} could not load.</p>
        <p className="mt-1 text-xs text-neutral-400">{error}</p>
      </div>
      <Button variant="inverse-outline" size="sm" onClick={onRetry} loading={loading}>
        Try again
      </Button>
    </div>
  );
}

// Bordered box that holds a Toggle so it lines up with a neighbouring input.
export function ToggleBox({ children, className = "" }) {
  return <div className={`flex min-h-[3.1rem] items-center border border-neutral-800 px-4 py-3 ${className}`}>{children}</div>;
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
