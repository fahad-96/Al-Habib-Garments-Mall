import React from "react";
import Reveal from "../../ui/Reveal";

// Editorial page header shared by the utility pages: eyebrow, display title, short lead.
export default function PageIntro({ eyebrow, title, lead, children, className = "" }) {
  return (
    <Reveal as="header" className={`max-w-3xl ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h1>
      {lead && <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-600 sm:text-base">{lead}</p>}
      {children}
    </Reveal>
  );
}
