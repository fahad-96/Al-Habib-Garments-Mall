import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({ eyebrow, title, description, to, linkLabel = "View all", align = "left", className = "", dark = false }) {
  const center = align === "center";
  return (
    <div className={`flex ${center ? "flex-col items-center text-center" : "flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"} ${className}`}>
      <div className={center ? "max-w-2xl" : ""}>
        {eyebrow && <p className={dark ? "eyebrow-dark" : "eyebrow"}>{eyebrow}</p>}
        <h2 className={`mt-2 font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl ${dark ? "text-paper" : "text-ink"}`}>{title}</h2>
        {description && <p className={`mt-3 max-w-xl text-sm ${dark ? "text-neutral-400" : "text-neutral-500"}`}>{description}</p>}
      </div>
      {to && (
        <Link to={to} className={`group -my-3 inline-flex min-h-10 items-center gap-2 text-2xs font-medium uppercase tracking-micro ${dark ? "text-paper" : "text-ink"} ${center ? "mt-1" : ""}`}>
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
