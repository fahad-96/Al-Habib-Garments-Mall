import React from "react";
import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { waLink } from "../../../lib/whatsapp";
import Button from "../../ui/Button";
import Reveal from "../../ui/Reveal";
import WhatsAppIcon from "../../ui/WhatsAppIcon";

export default function VisitStore({ settings = {} }) {
  const mapsQuery = settings.mapsQuery || [settings.storeName, settings.address].filter(Boolean).join(", ");
  const directions = mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}` : "";
  const whatsapp = waLink(settings.whatsappNumber, `Hi ${settings.storeName || "Al Habib Garments Mall"}, I'd like to visit the shop. Are you open today?`);
  const rows = [
    { icon: MapPin, label: "Address", value: settings.address },
    { icon: Clock, label: "Hours", value: settings.hours },
    { icon: Phone, label: "Phone", value: settings.phoneDisplay },
  ].filter((r) => r.value);

  return (
    <section className="container mt-20 lg:mt-28">
      <div className="grid gap-10 border-t border-line pt-10 lg:grid-cols-12 lg:gap-12 lg:pt-16">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow">Visit the store</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-balance lg:text-5xl">Come by, try it on, talk to us.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-[15px]">
            The shop sits on the main market road in Kunzer, on the way up to Tangmarg and Gulmarg. Bring the family and we will find the size.
          </p>
        </Reveal>
        <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
          {rows.length > 0 && (
            <dl className="divide-y divide-line border-y border-line">
              {rows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-4 py-4 sm:py-5">
                  <dt className="flex shrink-0 items-start pt-0.5 text-neutral-500">
                    <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    <span className="sr-only">{label}</span>
                  </dt>
                  <dd className="text-sm leading-relaxed text-neutral-800">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={whatsapp} target="_blank" rel="noreferrer">
              <WhatsAppIcon className="h-4 w-4" color="#25D366" />
              Message on WhatsApp
            </Button>
            {directions && (
              <Button href={directions} target="_blank" rel="noreferrer" variant="secondary">
                Get directions
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
