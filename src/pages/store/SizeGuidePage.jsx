import React, { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { waLink } from "../../lib/whatsapp";
import Seo from "../../components/ui/Seo";
import Reveal from "../../components/ui/Reveal";
import Button from "../../components/ui/Button";
import WhatsAppIcon from "../../components/ui/WhatsAppIcon";
import PageIntro from "../../components/store/static/PageIntro";
import SizeTable from "../../components/store/static/SizeTable";
import MeasureTips from "../../components/store/static/MeasureTips";

const guideKey = (g, i) => g.slug || g.id || String(i);

export default function SizeGuidePage() {
  const { sizeGuides, settings } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const guides = (sizeGuides || []).filter((g) => g && g.title);
  const requested = searchParams.get("guide") || "";
  const [activeKey, setActiveKey] = useState(() => (guides.some((g, i) => guideKey(g, i) === requested) ? requested : guides[0] ? guideKey(guides[0], 0) : ""));
  const baseId = useId();

  // If the catalog swaps (dummy to live), keep a valid selection.
  useEffect(() => {
    if (!guides.length) return;
    if (!guides.some((g, i) => guideKey(g, i) === activeKey)) setActiveKey(guideKey(guides[0], 0));
  }, [guides, activeKey]);

  const activeIndex = Math.max(0, guides.findIndex((g, i) => guideKey(g, i) === activeKey));
  const active = guides[activeIndex] || null;
  const hemming = guides.find((g) => (g.appliesTo?.sizeSets || []).includes("waist"))?.note || "";
  const enquiry = waLink(settings.whatsappNumber, `Hi ${settings.storeName || "Al Habib Garments Mall"}, could you help me with a size? My measurements are:`);

  const select = (key) => {
    setActiveKey(key);
    const next = new URLSearchParams(searchParams);
    next.set("guide", key);
    setSearchParams(next, { replace: true });
  };

  const onKeyDown = (e) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const last = guides.length - 1;
    const nextIndex = e.key === "Home" ? 0 : e.key === "End" ? last : e.key === "ArrowRight" ? (activeIndex + 1) % guides.length : (activeIndex - 1 + guides.length) % guides.length;
    select(guideKey(guides[nextIndex], nextIndex));
    e.currentTarget.querySelectorAll("[role=tab]")[nextIndex]?.focus();
  };

  return (
    <div className="container pb-20 pt-8 sm:pt-10 lg:pt-14">
      <Seo title="Size guide" description="Size charts for men's and women's apparel, track pants and kids, with a short guide to measuring at home." />

      <PageIntro eyebrow="Fit" title="Size guide." lead="Measurements are in inches unless the column says otherwise. If you sit between two sizes, or you are buying for someone else, send us the numbers on WhatsApp and we will check the piece on the shelf before you order." />

      {guides.length === 0 ? (
        <Reveal className="mt-10 border-y border-line py-14 text-center">
          <p className="font-display text-2xl">No charts yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">We are adding the size charts. In the meantime, send us your usual size and height and we will confirm the fit.</p>
          <Button href={enquiry} target="_blank" rel="noreferrer" className="mt-6">
            <WhatsAppIcon className="h-4 w-4" color="#25D366" />
            Ask about fit
          </Button>
        </Reveal>
      ) : (
        <Reveal className="mt-10 lg:mt-14" delay={0.05}>
          <div role="tablist" aria-label="Size charts" onKeyDown={onKeyDown} className="no-scrollbar -mx-4 flex overflow-x-auto border-b border-line px-4 max-lg:mask-fade-r sm:mx-0 sm:px-0">
            {guides.map((g, i) => {
              const key = guideKey(g, i);
              const selected = i === activeIndex;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${i}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(key)}
                  className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-1 py-3 text-[13px] font-medium uppercase tracking-micro transition-colors first:pl-0 sm:px-2 sm:py-4 ${selected ? "border-ink text-ink" : "border-transparent text-neutral-500 hover:text-ink"} ${i > 0 ? "ml-5 sm:ml-8" : ""}`}
                >
                  {g.title}
                </button>
              );
            })}
          </div>

          {active && (
            <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${activeIndex}`} className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-8">
                <SizeTable columns={active.columns} rows={active.rows} caption={`${active.title} size chart`} />
              </div>
              <aside className="lg:col-span-4">
                <div className="border-t border-ink pt-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
                  <p className="eyebrow">Fit note</p>
                  {active.note && <p className="mt-2 text-sm leading-relaxed text-neutral-700">{active.note}</p>}
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">Measurements are of the garment laid flat unless the column names a part of the body.</p>
                  <a href={enquiry} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-10 items-center gap-2 text-2xs font-medium uppercase tracking-micro text-ink hover:opacity-60">
                    <WhatsAppIcon className="h-4 w-4" color="#25D366" />
                    Ask about fit
                  </a>
                </div>
              </aside>
            </div>
          )}
        </Reveal>
      )}

      <MeasureTips hemmingNote={hemming ? `${hemming} Send your inseam, or the length of a pair you like, on WhatsApp.` : ""} className="mt-20 lg:mt-28" />
    </div>
  );
}
