import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { formatINR } from "../../lib/format";
import { scrollBehavior } from "../../lib/motion";
import { waLink } from "../../lib/whatsapp";
import Seo from "../../components/ui/Seo";
import WhatsAppIcon from "../../components/ui/WhatsAppIcon";
import PageIntro from "../../components/store/static/PageIntro";
import PolicyNav from "../../components/store/static/PolicyNav";
import PolicySection from "../../components/store/static/PolicySection";

const SECTIONS = [
  { id: "shipping", number: "01", label: "Shipping" },
  { id: "returns", number: "02", label: "Returns" },
  { id: "privacy", number: "03", label: "Privacy" },
  { id: "terms", number: "04", label: "Terms" },
];

const sectionFromHash = (hash) => {
  const id = String(hash || "").slice(1);
  return SECTIONS.some((s) => s.id === id) ? id : "";
};

// Where a section's top sits once it has been scrolled to: its scroll-margin, which clears the header and the sticky nav.
const restingTop = (el) => parseFloat(window.getComputedStyle(el).scrollMarginTop) || 0;

const scrollToSection = (id, behavior) => {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ block: "start", behavior });
  return true;
};

// The section being read: the last one whose top has passed a line a little under the sticky nav (or a
// third of the way down the screen, whichever is lower). Above the first section, that is the first one.
const sectionInView = () => {
  let current = SECTIONS[0].id;
  for (const s of SECTIONS) {
    const el = document.getElementById(s.id);
    if (!el) continue;
    const line = Math.max(restingTop(el) + 8, window.innerHeight * 0.3);
    if (el.getBoundingClientRect().top <= line) current = s.id;
  }
  return current;
};

export default function PoliciesPage() {
  const { settings, isSupabaseConfigured } = useShop();
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const { hash, key } = location;
  const [activeId, setActiveId] = useState(() => sectionFromHash(hash) || SECTIONS[0].id);
  // After a click in the section nav, keep that item lit while the page scrolls past the sections in between.
  const pinned = useRef(null);
  const arrivedAt = useRef(null);

  // Scroll to the section in the hash whenever the router lands on one: on arrival (this page is lazy-loaded, so
  // the global ScrollToTop may have given up before the anchors existed), and on every later link to a section,
  // including one to the section already in the URL (the footer's "Returns", say), which ScrollToTop leaves alone.
  useEffect(() => {
    // StrictMode runs this twice for the same history entry; both count as the arrival.
    const arrival = arrivedAt.current === null || arrivedAt.current === key;
    arrivedAt.current = key;
    const id = sectionFromHash(hash);
    if (!id) return undefined;

    // Back, forward and reload belong to ScrollToTop, which returns the shopper to where they were on that
    // entry. Only step in when the page opened on a section link and nothing has placed it yet.
    if (navigationType === "POP") {
      if (!arrival) return undefined;
      const frame = window.requestAnimationFrame(() => {
        if (window.scrollY === 0) scrollToSection(id, "auto");
      });
      return () => window.cancelAnimationFrame(frame);
    }

    pinned.current = { id, until: performance.now() + 1500 };
    const frame = window.requestAnimationFrame(() => {
      setActiveId(id);
      const el = document.getElementById(id);
      if (!el || Math.abs(el.getBoundingClientRect().top - restingTop(el)) <= 2) return;
      scrollToSection(id, arrival ? "auto" : scrollBehavior());
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hash, key, navigationType]);

  // Light the section being read in the nav.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const pin = pinned.current;
      if (pin) {
        const el = document.getElementById(pin.id);
        const settled = !el || Math.abs(el.getBoundingClientRect().top - restingTop(el)) <= 4;
        if (!settled && performance.now() < pin.until) return;
        pinned.current = null;
      }
      setActiveId(sectionInView());
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    // A wheel, touch or key press during the scroll hands the highlight back to the reader.
    const release = () => {
      pinned.current = null;
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    ["wheel", "touchstart", "keydown"].forEach((type) => window.addEventListener(type, release, { passive: true }));
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ["wheel", "touchstart", "keydown"].forEach((type) => window.removeEventListener(type, release));
    };
  }, []);

  // Route the in-page links through the router, so it always knows which section the URL names and a later
  // link to any section (from the footer, say) is seen as a change and scrolls. The effect above does the scrolling.
  const onSelect = (e, id) => {
    e.preventDefault();
    setActiveId(id);
    navigate({ search: location.search, hash: `#${id}` }, { replace: true });
  };

  const deliveryNote = String(settings.deliveryNote || "").trim() || "Delivery takes 2 to 4 days across Jammu & Kashmir and 5 to 8 days across the rest of India.";
  const noteCoversDispatch = /dispatch/i.test(deliveryNote);
  const fee = Number(settings.deliveryFee) || 0;
  const freeOver = Number(settings.freeDeliveryOver) || 0;
  const returnDays = Number(settings.returnDays) || 7;
  const storeName = settings.storeName || "Al Habib Garments Mall";
  const whatsapp = waLink(settings.whatsappNumber, `Hi ${storeName}, I have a question about my order.`);
  const returnsLink = waLink(settings.whatsappNumber, `Hi ${storeName}, I'd like to exchange or return a piece from my order.${isSupabaseConfigured ? " My order number is:" : ""}`);

  return (
    <div className="container pb-20 pt-8 sm:pt-10 lg:pt-14">
      <Seo title="Policies" description={`Shipping, returns, privacy and terms for ${storeName}. Plain English, no surprises.`} />

      <PageIntro eyebrow="The fine print" title="Policies." lead="Written the way we would explain it across the counter. If anything here is unclear, message us on WhatsApp and a person will answer." />

      <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="sticky top-[var(--header-h)] z-10 -mx-4 border-b border-line bg-paper/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-paper/85 lg:static lg:col-span-3 lg:mx-0 lg:border-b-0 lg:border-t lg:bg-transparent lg:px-0 lg:pt-8 lg:backdrop-blur-0">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <p className="eyebrow hidden lg:block lg:mb-4">On this page</p>
            <PolicyNav sections={SECTIONS} activeId={activeId} onSelect={onSelect} />
            <div className="mt-8 hidden text-xs leading-relaxed text-neutral-500 lg:block">
              <p>Still unsure about something?</p>
              <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-2 text-2xs font-medium uppercase tracking-micro text-ink hover:opacity-60">
                <WhatsAppIcon className="h-4 w-4" color="#25D366" />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-14 lg:col-span-8 lg:col-start-5 lg:mt-0 lg:space-y-20">
          <PolicySection id="shipping" number="01" title="Shipping and delivery" summary="Everything leaves from the shop in Kunzer, packed by us.">
            <p>
              Every order is confirmed with you on WhatsApp before it leaves the shop, and packed by us in Kunzer. {noteCoversDispatch ? "" : "Orders are dispatched within 24 hours of confirmation. "}
              {deliveryNote}
            </p>
            <p>
              {fee > 0 ? (
                <>
                  Delivery is {formatINR(fee)} per order{freeOver > 0 ? <>, and free from {formatINR(freeOver)}, counted after any coupon</> : null}. The fee is shown in your bag before you place the order.
                </>
              ) : (
                <>Delivery is free on every order.</>
              )}
            </p>
            <p>
              {settings.codEnabled !== false
                ? "Cash on delivery is available on most pincodes we serve; we confirm it for your address when we confirm the order. You can also pay by UPI or bank transfer once the order is confirmed."
                : "Payment is by UPI or bank transfer once the order is confirmed on WhatsApp. We share the details in the same chat."}
            </p>
            {isSupabaseConfigured ? (
              <p>
                Once the parcel is with the courier, we send you the tracking number on WhatsApp. You can also check the status any time on the{" "}
                <Link to="/track" className="text-ink underline underline-offset-4 hover:opacity-60">
                  track your order
                </Link>{" "}
                page. If nobody is available at the address, the courier tries again on the next working day.
              </p>
            ) : (
              <p>Once the parcel is with the courier, we send you the tracking number on WhatsApp, and you can ask us in the same chat where your order is at any time. If nobody is available at the address, the courier tries again on the next working day.</p>
            )}
          </PolicySection>

          <PolicySection id="returns" number="02" title="Returns and exchanges" summary={`You have ${returnDays} days from delivery. Exchanges are the easiest for everyone.`}>
            <p>If a piece does not fit or is not what you expected, message us within {returnDays} days of delivery. It should be unworn and unwashed, with the tags on and the original packing. We would much rather exchange than refund, so tell us the size or colour you need and we will hold it for you while yours comes back.</p>
            <p>Some things cannot come back once they leave the shop:</p>
            <ul>
              <li>Innerwear and socks, for hygiene.</li>
              <li>Track pants and trousers hemmed to your measurement, unless the hem itself is wrong.</li>
            </ul>
            <p>
              To start,{" "}
              <a href={returnsLink} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-4 hover:opacity-60">
                message us on WhatsApp
              </a>{" "}
              with {isSupabaseConfigured ? "your order number" : "the name and phone you ordered with"} and a photo of the piece. We will tell you where to send it, or you can bring it to the shop. If the piece arrived damaged or we sent the wrong item, we cover the courier both ways; otherwise the return courier is on you and the exchange is sent back free.
            </p>
            <p>Refunds, where agreed, are made by UPI or bank transfer within a few days of the piece reaching us and being checked.</p>
          </PolicySection>

          <PolicySection id="privacy" number="03" title="Privacy" summary="We keep what we need to send your parcel, and nothing more.">
            <p>To fulfil an order we keep your name, phone number and delivery address, together with what you ordered. That is all. There are no accounts and no passwords on this site.</p>
            <p>We do not sell or share your details with anyone, except the courier who needs your address and phone number to deliver the parcel.</p>
            <p>Your bag and wishlist are saved in your own browser&rsquo;s storage, on your device. They never leave it; clearing your browser data clears them too.</p>
            <p>Conversations on WhatsApp are between you and the shop&rsquo;s number, and are covered by WhatsApp&rsquo;s own terms. If you would like us to delete your details after an order is complete, message us and we will.</p>
          </PolicySection>

          <PolicySection id="terms" number="04" title="Terms" summary="Short, because they are the same terms we work to in the shop.">
            <p>All prices are in Indian rupees and include applicable taxes. The price you see on the site is the price in the shop.</p>
            <p>An order is final only once we have confirmed stock, size and colour with you on WhatsApp. Sizes sell through quickly in season, so on the rare occasion a piece has gone before we could confirm, we will offer the nearest alternative or cancel that line with no charge. A genuine pricing error on a listing is corrected at confirmation.</p>
            <p>Colours can vary slightly between the photograph and the piece: screens differ and dye lots vary between batches. Small differences of this kind are not a defect.</p>
            <p>
              This site is run by {storeName}, {settings.address || "Kunzer, Tangmarg"}. Questions about any of this go to{" "}
              <a href={whatsapp} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-4 hover:opacity-60">
                WhatsApp
              </a>
              . These policies may be updated from time to time; the current version is always the one on this page.
            </p>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}
