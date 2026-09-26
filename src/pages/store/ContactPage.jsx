import React from "react";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import Seo from "../../components/ui/Seo";
import Reveal from "../../components/ui/Reveal";
import PageIntro from "../../components/store/static/PageIntro";
import StoreDetails from "../../components/store/static/StoreDetails";
import MapEmbed from "../../components/store/static/MapEmbed";
import MessageForm from "../../components/store/static/MessageForm";

export default function ContactPage() {
  const { settings, toast } = useShop();
  const mapsQuery = settings.mapsQuery || [settings.storeName, settings.address].filter(Boolean).join(", ");

  return (
    <div className="container pb-20 pt-8 sm:pt-10 lg:pt-14">
      <Seo title="Contact" description={`Find ${settings.storeName || "Al Habib Garments Mall"} in Kunzer, Tangmarg. Address, opening hours, WhatsApp and directions.`} />

      <PageIntro eyebrow="Contact" title="Talk to us." lead="WhatsApp is the quickest way to reach the shop. We reply during store hours, usually within the hour, and we are happy to check a size or a colour before you order." />

      <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5" delay={0.05}>
          <h2 className="sr-only">Store details</h2>
          <StoreDetails settings={settings} showSocials />
        </Reveal>
        <Reveal className="lg:col-span-7" delay={0.1}>
          <MapEmbed query={mapsQuery} />
        </Reveal>
      </div>

      <section className="mt-16 border-t border-line pt-10 lg:mt-24 lg:pt-14" aria-labelledby="message-heading">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Write to us</p>
            <h2 id="message-heading" className="mt-3 font-display text-3xl leading-[1.05] tracking-tight text-balance sm:text-4xl">
              Send us a message
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
              Sizes, stock, an order you have placed, or a piece you saw in the shop window. Write it here and it opens in WhatsApp, ready to send from your own number.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Already ordered? You can also{" "}
              <Link to="/track" className="text-ink underline underline-offset-4 hover:opacity-60">
                track your order
              </Link>
              .
            </p>
          </Reveal>
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
            <MessageForm settings={settings} onSent={() => toast("Opening WhatsApp with your message", { type: "success" })} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
