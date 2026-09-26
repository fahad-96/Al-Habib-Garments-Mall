import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({ title, description, actions, backTo, backLabel = "Back", eyebrow }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {backTo && (
          <Link to={backTo} className="mb-3 inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-micro text-neutral-400 hover:text-paper">
            <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
          </Link>
        )}
        {eyebrow && <p className="eyebrow-dark">{eyebrow}</p>}
        <h1 className="font-display text-3xl leading-none text-paper sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-neutral-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
