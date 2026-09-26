import React from "react";
import Reveal from "../../ui/Reveal";

const TIPS = [
  { title: "Chest", text: "Wrap the tape under the arms, around the fullest part of the chest. Keep it level across the back and breathe out normally." },
  { title: "Waist", text: "Measure around the natural waist, the narrowest point above the hip bones, with the tape snug but not pulled tight." },
  { title: "Hip", text: "Stand with feet together and measure around the fullest part of the hips, roughly eight inches below the waist." },
  { title: "Length", text: "For jackets, hoodies and tees, measure from the highest point of the shoulder straight down to where you want the hem to sit." },
];

const ONE_SIZE = "Beanies are one size and stretch to fit. Bag dimensions are listed on each product as length × width × height in centimetres, so you can check they fit a laptop or a locker.";

export default function MeasureTips({ hemmingNote = "", className = "" }) {
  return (
    <section className={className} aria-labelledby="how-to-measure">
      <Reveal>
        <p className="eyebrow">Getting it right</p>
        <h2 id="how-to-measure" className="mt-3 font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl">
          How to measure
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">A soft tape and a friend make it easier. Measure over light clothing, and note the numbers in inches so they compare with the chart.</p>
      </Reveal>
      <ol className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {TIPS.map((tip, i) => (
          <li key={tip.title} className="bg-paper">
            <Reveal delay={i * 0.06} y={10} className="h-full p-5 sm:p-6">
              <span className="font-display text-2xl leading-none text-neutral-300">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-sm font-medium">{tip.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 sm:text-[13px]">{tip.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
      <Reveal delay={0.1}>
        <dl className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2 sm:gap-10">
          <div>
            <dt className="text-sm font-medium">Beanies and bags</dt>
            <dd className="mt-1.5 text-[13px] leading-relaxed text-neutral-600">{ONE_SIZE}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium">Track pants and trousers</dt>
            <dd className="mt-1.5 text-[13px] leading-relaxed text-neutral-600">{hemmingNote || "Pick your waist size and leave the length to us. We hem trousers free of charge, in the shop or before we dispatch; send your inseam or the length of a pair you like on WhatsApp."}</dd>
          </div>
        </dl>
      </Reveal>
    </section>
  );
}
