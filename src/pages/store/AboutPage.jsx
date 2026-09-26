import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { waLink } from "../../lib/whatsapp";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import Img from "../../components/ui/Img";
import Reveal from "../../components/ui/Reveal";
import WhatsAppIcon from "../../components/ui/WhatsAppIcon";
import StoreDetails, { directionsUrl } from "../../components/store/static/StoreDetails";

const FALLBACK_ABOUT =
  "Al Habib Garments Mall is Kunzer's multi-brand garments store, a short drive from Tangmarg on the road to Gulmarg. Jackets, hoodies, tees, track pants, bags and winter accessories for men, women and kids, chosen by hand and priced for families.";

const STORY = [
  "It is a family shop, and it sits on the main market road in Kunzer, where the road from Baramulla turns towards Tangmarg and climbs on to Gulmarg. Most of the people who walk in we know by name, or we know their parents. That changes how you buy. You choose pieces you would be glad to see again on the same street next winter, and you price them so that one visit can dress the whole house.",
  "The website is simply the shop, open a little later in the evening. Browse at home, send us the piece and the size on WhatsApp, and one of us will check the shelf, confirm the colour and pack it the same day. If you are nearby, come in and try it on. Nothing on a screen replaces that.",
];

const PRINCIPLES = [
  {
    title: "Chosen by hand",
    text: "We visit the brand distributors and wholesalers ourselves and pick what we would wear. If a piece will not hold up through a Kashmiri winter, it does not come on the shelf.",
  },
  {
    title: "Priced for families",
    text: "A jacket for father, a hoodie for mother, school layers for the children. Prices are set so that dressing everyone for the season stays sensible, and stay the same online as in the shop.",
  },
  {
    title: "Confirmed personally on WhatsApp",
    text: "There is no call centre. Every order is read by one of us, the size and colour are checked on the shelf, and we confirm with you before anything is packed.",
  },
];

// Split the admin-editable about text into paragraphs (blank lines or newlines), trimming stray whitespace.
const paragraphs = (text) =>
  String(text || "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

export default function AboutPage() {
  const { settings } = useShop();
  const intro = paragraphs(settings.about);
  const body = [...(intro.length ? intro : [FALLBACK_ABOUT]), ...STORY];
  const whatsapp = waLink(settings.whatsappNumber, `Hi ${settings.storeName || "Al Habib Garments Mall"}, I'd like to visit the shop. Are you open today?`);
  const directions = directionsUrl(settings);

  return (
    <div className="container pb-20 pt-8 sm:pt-10 lg:pt-14">
      <Seo title="Our story" description="A family garments shop in Kunzer, Tangmarg, dressing the villages along the Gulmarg road. Chosen by hand, priced for families, confirmed personally on WhatsApp." />

      <Reveal as="header" className="max-w-4xl">
        <p className="eyebrow">Our story</p>
        <h1 className="mt-3 font-display text-[2.75rem] leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">Dressing Kunzer since the first snow.</h1>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5" delay={0.05}>
          <figure>
            <div className="img-frame aspect-[3/4] bg-ink">
              <Img src="/image/art/about.svg" alt="Dark artwork with a fine chinar-leaf pattern, the emblem of the shop" eager className="h-full w-full object-cover" fallbackLabel="AH" />
            </div>
            <figcaption className="mt-3 text-2xs uppercase tracking-micro text-neutral-500">{settings.storeName || "Al Habib Garments Mall"} · {settings.tagline || "Kunzer, Tangmarg"}</figcaption>
          </figure>
        </Reveal>

        <Reveal className="lg:col-span-6 lg:col-start-7 lg:pt-2" delay={0.1}>
          <div className="prose-store max-w-xl lg:text-base lg:leading-8">
            {body.map((p, i) => (
              <p key={i} className={i === 0 ? "text-ink" : ""}>
                {p}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <Button to="/shop" variant="secondary" className="w-full sm:w-auto">
              Browse the shop
            </Button>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 text-2xs font-medium uppercase tracking-micro text-ink hover:opacity-60">
              <WhatsAppIcon className="h-4 w-4" color="#25D366" />
              Say hello on WhatsApp
            </a>
          </div>
        </Reveal>
      </div>

      <section className="mt-20 lg:mt-28" aria-labelledby="principles-heading">
        <Reveal>
          <p className="eyebrow">How we work</p>
          <h2 id="principles-heading" className="mt-3 max-w-2xl font-display text-3xl leading-[1.05] tracking-tight text-balance sm:text-4xl">
            Three things we have never changed.
          </h2>
        </Reveal>
        <ol className="mt-8 grid gap-px border-y border-line bg-line lg:mt-10 lg:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="bg-paper lg:px-8 lg:first:pl-0 lg:last:pr-0">
              <Reveal delay={i * 0.08} y={10} className="h-full py-7 lg:py-10">
                <span className="font-display text-3xl leading-none text-neutral-300" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-2xl leading-tight tracking-tight">{p.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">{p.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 lg:mt-28" aria-labelledby="visit-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Visit</p>
            <h2 id="visit-heading" className="mt-3 font-display text-3xl leading-[1.05] tracking-tight text-balance sm:text-4xl">
              Come by, try it on, talk to us.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">On the main market road in Kunzer, on the way up to Tangmarg and Gulmarg. Bring the family; we will find the size.</p>
          </Reveal>
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
            <StoreDetails settings={settings} />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
    </div>
  );
}
