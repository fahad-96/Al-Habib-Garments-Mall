import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Input, Textarea } from "../../ui/Fields";
import WhatsAppIcon from "../../ui/WhatsAppIcon";
import SettingsSection from "./SettingsSection";
import { cleanInstagram, cleanWhatsApp, SECTIONS, waPreview } from "./settingsUtils";

const meta = SECTIONS.find((s) => s.id === "contact");

export default function ContactSection({ form, errors, patch }) {
  const preview = waPreview(form.whatsappNumber);
  return (
    <SettingsSection id={meta.id} title={meta.title} description={meta.description}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Input
            dark
            name="whatsappNumber"
            label="WhatsApp number"
            value={form.whatsappNumber}
            onChange={(e) => patch({ whatsappNumber: e.target.value.replace(/\D/g, "").slice(0, 15) })}
            onBlur={() => patch({ whatsappNumber: cleanWhatsApp(form.whatsappNumber) })}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="919622553899"
            error={errors.whatsappNumber}
            hint={preview ? undefined : "Digits only. A 10-digit number gets 91 added in front."}
          />
          {preview && !errors.whatsappNumber && (
            <a href={`https://${preview}`} target="_blank" rel="noreferrer" className="group mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-paper">
              <WhatsAppIcon className="h-3.5 w-3.5" color="#25D366" />
              <span className="tabular-nums underline-offset-4 group-hover:underline">{preview}</span>
              <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            </a>
          )}
        </div>
        <Input dark name="phoneDisplay" label="Number as written" value={form.phoneDisplay} onChange={(e) => patch({ phoneDisplay: e.target.value })} placeholder="+91 96225 53899" hint="How it is printed on the site and in messages." />
        <Input dark name="email" type="email" label="Email" value={form.email} onChange={(e) => patch({ email: e.target.value })} placeholder="hello@alhabibgarments.in" autoComplete="email" error={errors.email} hint="Optional." />
        <Input dark name="hours" label="Opening hours" value={form.hours} onChange={(e) => patch({ hours: e.target.value })} placeholder="Open every day, 10:00 AM to 8:00 PM" />
      </div>
      <Textarea dark name="address" className="mt-5" label="Address" rows={2} value={form.address} onChange={(e) => patch({ address: e.target.value })} placeholder="Main Market, Kunzer, Tangmarg, Baramulla, Jammu & Kashmir" />
      <Input dark name="mapsQuery" className="mt-5" label="Google Maps search" value={form.mapsQuery} onChange={(e) => patch({ mapsQuery: e.target.value })} placeholder="Al Habib Garments Mall, Kunzer, Tangmarg" hint="What the Directions button searches for. Use the exact name of your Google listing." />
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Input dark name="instagram" label="Instagram" value={form.instagram} onChange={(e) => patch({ instagram: e.target.value })} onBlur={() => patch({ instagram: cleanInstagram(form.instagram) })} placeholder="alhabibgarments" autoComplete="off" spellCheck={false} hint="Handle only, without the @." />
        <Input dark name="facebook" type="url" label="Facebook page" value={form.facebook} onChange={(e) => patch({ facebook: e.target.value })} placeholder="https://www.facebook.com/alhabibgm/" autoComplete="off" spellCheck={false} error={errors.facebook} hint="The full link to the page." />
      </div>
    </SettingsSection>
  );
}
