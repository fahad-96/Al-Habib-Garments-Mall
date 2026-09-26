import React from "react";
import { InstagramIcon } from "../../ui/SocialIcons";
import Reveal from "../../ui/Reveal";

export default function InstagramBand({ settings = {} }) {
  const handle = String(settings.instagram || "").replace(/^@/, "").trim();
  if (!handle) return null;

  return (
    <section className="mt-20 border-t border-line lg:mt-28">
      <div className="container py-16 text-center lg:py-24">
        <Reveal className="flex flex-col items-center">
          <InstagramIcon className="h-5 w-5" />
          <p className="eyebrow mt-4">Follow along</p>
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block max-w-full break-words font-display text-4xl leading-none tracking-tight underline-offset-8 transition-colors hover:underline sm:text-6xl lg:text-7xl"
          >
            @{handle}
          </a>
          <p className="mt-5 max-w-sm text-sm text-neutral-500">New arrivals, the odd snow day and what people are wearing in Kunzer, first on Instagram.</p>
        </Reveal>
      </div>
    </section>
  );
}
