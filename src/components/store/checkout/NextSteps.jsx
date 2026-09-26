import React from "react";

const DAYS = /(\d{1,2})(?:\s*(?:to|-|–|—)\s*(\d{1,2}))?\s*(?:working\s+|business\s+)?days?\b/gi;
const mentionsDays = (s) => new RegExp(DAYS.source, "i").test(s);

// Splits "Dispatched within 24 hours. 2 to 4 days across J&K, 5 to 8 days across India."
// into the dispatch sentence and the delivery sentence(s) (those that give days).
const splitNote = (note) => {
  const sentences = String(note || "")
    .split(/\.\s+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((s) => `${s}.`);
  const isDelivery = (s) => mentionsDays(s) && !/dispatch/i.test(s);
  return [sentences.find((s) => !isDelivery(s)) || "", sentences.filter(isDelivery).join(" ")];
};

// "Delivery in 2 to 8 days" from the day ranges the shop wrote in its delivery note
// ("2 to 4 days ..., 5 to 8 days ..."); plain "Delivery" when the note gives no days.
const deliveryTitle = (text) => {
  const days = Array.from(String(text).matchAll(DAYS)).flatMap((m) => [m[1], m[2]].filter(Boolean).map(Number));
  if (!days.length) return "Delivery";
  const min = Math.min(...days);
  const max = Math.max(...days);
  if (min === max) return `Delivery in ${min} ${min === 1 ? "day" : "days"}`;
  return `Delivery in ${min} to ${max} days`;
};

const DEFAULT_DISPATCH = "Dispatched within 24 hours of confirmation.";

export default function NextSteps({ settings = {}, className = "" }) {
  const [dispatch, delivery] = splitNote(settings.deliveryNote);
  const steps = [
    { title: "We confirm on WhatsApp", text: "Within the hour we check size, colour and address with you." },
    { title: "We pack and dispatch", text: dispatch || DEFAULT_DISPATCH },
    { title: delivery ? deliveryTitle(delivery) : "Delivery", text: delivery || "We send the courier details on WhatsApp so you can follow the parcel." },
  ];

  return (
    <section className={className} aria-labelledby="next-steps-heading">
      <h2 id="next-steps-heading" className="eyebrow">
        What happens next
      </h2>
      <ol className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="bg-paper p-5 sm:p-6">
            {/* The list already announces the order; the big numerals are decoration. */}
            <span className="font-display text-2xl leading-none text-neutral-500 tabular-nums" aria-hidden="true">
              0{i + 1}
            </span>
            <p className="mt-4 text-sm font-medium leading-snug">{s.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
