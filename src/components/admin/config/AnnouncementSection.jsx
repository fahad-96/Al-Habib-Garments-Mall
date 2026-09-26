import React from "react";
import { Input, Toggle } from "../../ui/Fields";
import SettingsSection from "./SettingsSection";
import { ANNOUNCEMENT_MAX, SECTIONS } from "./settingsUtils";

const meta = SECTIONS.find((s) => s.id === "announcement");

// Mirrors src/components/store/AnnouncementBar.jsx so the admin sees the real thing.
function BarPreview({ text, enabled }) {
  return (
    <div className={`border border-neutral-800 bg-paper transition-opacity duration-300 ${enabled ? "" : "opacity-40"}`} aria-hidden="true">
      <div className="bg-ink text-paper">
        <p className="flex min-h-9 items-center justify-center px-4 py-2 text-center text-[10px] font-medium uppercase leading-snug tracking-[0.14em] sm:text-2xs sm:tracking-micro">
          <span className="text-balance">{text || "Your announcement appears here"}</span>
        </p>
      </div>
      <div className="flex h-12 items-center justify-center border-b border-line">
        <span className="font-display text-base tracking-[0.04em] text-ink">AL HABIB</span>
      </div>
    </div>
  );
}

export default function AnnouncementSection({ form, errors, patch }) {
  const used = form.announcementText.length;
  return (
    <SettingsSection id={meta.id} title={meta.title} description={meta.description}>
      <div className="border border-neutral-800 px-4 py-3.5">
        <Toggle dark checked={form.announcementEnabled} onChange={(announcementEnabled) => patch({ announcementEnabled })} label={form.announcementEnabled ? "Bar is showing" : "Bar is hidden"} description={form.announcementEnabled ? "Visible at the top of every page." : "Nothing shows until you switch it on."} />
      </div>
      <Input
        dark
        name="announcementText"
        className="mt-5"
        label="Text"
        value={form.announcementText}
        onChange={(e) => patch({ announcementText: e.target.value.slice(0, ANNOUNCEMENT_MAX) })}
        placeholder="Free delivery on orders over ₹1,999 · Order directly on WhatsApp"
        maxLength={ANNOUNCEMENT_MAX}
        error={errors.announcementText}
        hint={`${used} of ${ANNOUNCEMENT_MAX} characters. Keep it to one line; use · to separate two thoughts.`}
      />
      <div className="mt-5">
        <p className="eyebrow-dark">Preview</p>
        <div className="mt-2">
          <BarPreview text={form.announcementText.trim()} enabled={form.announcementEnabled} />
        </div>
      </div>
    </SettingsSection>
  );
}
