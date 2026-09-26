import React from "react";
import { Input, Textarea } from "../../ui/Fields";
import SettingsSection from "./SettingsSection";
import { SECTIONS } from "./settingsUtils";

const meta = SECTIONS.find((s) => s.id === "store");

export default function StoreSection({ form, errors, patch }) {
  return (
    <SettingsSection id={meta.id} title={meta.title} description={meta.description}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input dark name="storeName" label="Store name" value={form.storeName} onChange={(e) => patch({ storeName: e.target.value })} autoComplete="organization" error={errors.storeName} />
        <Input dark name="tagline" label="Tagline" value={form.tagline} onChange={(e) => patch({ tagline: e.target.value })} placeholder="Kunzer, Tangmarg" hint="Sits under the name in the footer and in page titles." />
      </div>
      <Textarea
        dark
        name="about"
        className="mt-5"
        label="About the store"
        rows={5}
        value={form.about}
        onChange={(e) => patch({ about: e.target.value })}
        placeholder="Who you are, what you stock, how orders work."
        hint={`Opens the About page. ${form.about.trim().split(/\s+/).filter(Boolean).length} words.`}
      />
    </SettingsSection>
  );
}
