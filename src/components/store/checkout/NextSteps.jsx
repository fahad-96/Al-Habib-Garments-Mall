import React from "react";

// Splits "Dispatched within 24 hours. 2 to 4 days across J&K, 5 to 8 across India."
// into the dispatch sentence and the delivery sentence(s).
const splitNote = (note) => {
  const parts = String(note || "")
    .split(/\.\s+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((s) => `${s}.`);
  return [parts[0] || "", parts.slice(1).join(" ")];
};

export default function NextSteps({ settings = {}, className = "" }) {
  const [dispatch, delivery] = splitNote(settings.deliveryNote);
  const steps = [
    { title: "We confirm on WhatsApp", text: "Within the hour we check size, colour and address with you." },
    { title: "We pack and dispatch", text: dispatch || "Dispatched within 24 hours of confirmation." },
    { title: "Delivery in 2 to 8 days", text: delivery || "2 to 4 days across Jammu & Kashmir, 5 to 8 days across India." },
  ];

  return (
    <section className={className} aria-labelledby="next-steps-heading">
      <h2 id="next-steps-heading" className="eyebrow">
        What happens next
      </h2>
      <ol className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="bg-paper p-5 sm:p-6">
            <span className="font-display text-2xl leading-none text-neutral-400 tabular-nums">0{i + 1}</span>
            <p className="mt-4 text-sm font-medium leading-snug">{s.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
