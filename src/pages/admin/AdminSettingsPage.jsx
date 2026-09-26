import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useShop } from "../../context/ShopContext";
import { fetchSettings, saveSettings } from "../../lib/adminApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import Seo from "../../components/ui/Seo";
import PageHeader from "../../components/admin/PageHeader";
import { ErrorCard } from "../../components/admin/config/ConfigCard";
import StoreSection from "../../components/admin/config/StoreSection";
import ContactSection from "../../components/admin/config/ContactSection";
import DeliverySection from "../../components/admin/config/DeliverySection";
import AnnouncementSection from "../../components/admin/config/AnnouncementSection";
import SaveBar from "../../components/admin/config/SaveBar";
import { firstErrorSection, formToSettings, isDirty, settingsToForm, validateSettings } from "../../components/admin/config/settingsUtils";

const Block = ({ className = "" }) => <div className={`animate-pulse bg-neutral-900 ${className}`} aria-hidden="true" />;

function SettingsSkeleton() {
  return (
    <div role="status" aria-label="Loading settings" className="space-y-10">
      {[3, 6, 4, 2].map((fields, i) => (
        <div key={i} className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <div>
            <Block className="h-6 w-28" />
            <Block className="mt-3 h-3 w-40" />
          </div>
          <div className="admin-card grid gap-5 p-6 sm:grid-cols-2">
            {Array.from({ length: fields }).map((_, f) => (
              <div key={f}>
                <Block className="h-2.5 w-20" />
                <Block className="mt-2 h-11 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { supabase } = useAdmin();
  const { settings: liveSettings, toast, refreshCatalog } = useShop();

  const loader = useCallback(() => (supabase ? fetchSettings(supabase) : Promise.resolve(null)), [supabase]);
  const { data, loading, error, reload } = useAsyncData(loader);

  // `base` is what the database holds; `form` is what the admin is typing.
  const [base, setBase] = useState(null);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    const next = settingsToForm(data);
    setBase(next);
    setForm(next);
    setErrors({});
  }, [data]);

  // Without a database there is nothing to save: show the built-in settings, read only.
  useEffect(() => {
    if (supabase) return;
    const next = settingsToForm(liveSettings);
    setBase(next);
    setForm(next);
  }, [supabase, liveSettings]);

  const dirty = useMemo(() => isDirty(form, base), [form, base]);

  const patch = (changes) => {
    setForm((f) => ({ ...f, ...changes }));
    const touched = Object.keys(changes);
    if (touched.some((k) => errors[k])) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !touched.includes(k))));
  };

  const discard = () => {
    setForm(base);
    setErrors({});
  };

  const save = useCallback(async () => {
    if (!form || !supabase || saving) return;
    const next = validateSettings(form);
    setErrors(next);
    const section = firstErrorSection(next);
    if (section) {
      document.getElementById(`section-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast("Check the highlighted fields.", { type: "error" });
      return;
    }
    setSaving(true);
    try {
      const saved = settingsToForm(await saveSettings(supabase, formToSettings(form)));
      setBase(saved);
      setForm(saved);
      toast("Settings saved. The store is using them now.", { type: "success" });
      refreshCatalog?.();
    } catch (e) {
      toast(e?.message || "Settings could not be saved.", { type: "error", duration: 6000 });
    } finally {
      setSaving(false);
    }
  }, [form, supabase, saving, toast, refreshCatalog]);

  // Ctrl/Cmd+S saves; leaving the page with unsaved edits asks first.
  useEffect(() => {
    if (!dirty) return undefined;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    const onUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [dirty, save]);

  const firstLoad = loading && !form;
  const failedCold = Boolean(error) && !form;
  const description = !supabase ? "Connect the store to Supabase to edit these." : firstLoad ? "Loading settings." : "Everything here goes live the moment you save.";

  return (
    <div className="mx-auto max-w-6xl">
      <Seo title="Settings" noindex />
      <PageHeader title="Settings" description={description} />

      {error && <ErrorCard className="mb-6" title="Settings could not load." message={error} onRetry={reload} loading={loading} />}

      {firstLoad ? (
        <SettingsSkeleton />
      ) : failedCold || !form ? null : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          noValidate
          className={`transition-opacity duration-300 ${!supabase ? "pointer-events-none opacity-60" : ""}`}
          aria-disabled={!supabase}
        >
          <StoreSection form={form} errors={errors} patch={patch} />
          <ContactSection form={form} errors={errors} patch={patch} />
          <DeliverySection form={form} errors={errors} patch={patch} />
          <AnnouncementSection form={form} errors={errors} patch={patch} />
          <SaveBar dirty={dirty} saving={saving} disabled={!supabase} onSave={save} onDiscard={discard} note={Object.keys(errors).length ? "Some fields need attention" : ""} />
        </form>
      )}
    </div>
  );
}
