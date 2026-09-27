import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "../ui/SocialIcons";
import { useShop } from "../../context/ShopContext";
import WhatsAppIcon from "../ui/WhatsAppIcon";
import Logo from "./Logo";
import { waLink } from "../../lib/whatsapp";

// Phones get 40px-tall rows (touch targets); from sm up the lists return to a calm 20px rhythm.
const LIST = "mt-3 text-sm text-neutral-300 sm:mt-4 sm:space-y-2.5";
const ROW = "flex min-h-10 items-center hover:text-paper sm:inline sm:min-h-0";
const ICON = "flex h-10 w-10 items-center justify-center text-neutral-300 hover:text-paper";

export default function Footer() {
  const { settings, departments } = useShop();
  const year = new Date().getFullYear();
  const ig = settings.instagram ? `https://instagram.com/${String(settings.instagram).replace(/^@/, "")}` : "";
  return (
    <footer className="mt-20 bg-ink text-paper">
      <div className="container grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo inverse />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-neutral-400">{settings.about?.split(". ").slice(0, 2).join(". ")}.</p>
          <div className="-ml-2.5 mt-4 flex items-center gap-1">
            {ig && (
              <a href={ig} target="_blank" rel="noreferrer" className={ICON} aria-label="Instagram">
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer" className={ICON} aria-label="Facebook">
                <FacebookIcon className="h-5 w-5" />
              </a>
            )}
            <a href={waLink(settings.whatsappNumber, `Hi ${settings.storeName}, I have a question.`)} target="_blank" rel="noreferrer" className={ICON} aria-label="WhatsApp">
              <WhatsAppIcon className="h-5 w-5" color="#25D366" />
            </a>
          </div>
          <nav aria-label="Legal" className="mt-3 flex flex-wrap gap-x-5 text-2xs uppercase tracking-micro text-neutral-400">
            <Link to="/policies#privacy" className="inline-flex min-h-10 items-center hover:text-paper">Privacy</Link>
            <Link to="/policies#terms" className="inline-flex min-h-10 items-center hover:text-paper">Terms</Link>
          </nav>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
          <div>
            <p className="eyebrow-dark">Shop</p>
            <ul className={LIST}>
              {departments.map((d) => (
                <li key={d.key}>
                  <Link to={`/shop/${d.key}`} className={ROW}>{d.name}</Link>
                </li>
              ))}
              <li><Link to="/new" className={ROW}>New in</Link></li>
              <li><Link to="/collections" className={ROW}>Collections</Link></li>
              <li><Link to="/sale" className={ROW}>Sale</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow-dark">Help</p>
            <ul className={LIST}>
              <li><Link to="/track" className={ROW}>Track your order</Link></li>
              <li><Link to="/size-guide" className={ROW}>Size guide</Link></li>
              <li><Link to="/policies#shipping" className={ROW}>Shipping and delivery</Link></li>
              <li><Link to="/policies#returns" className={ROW}>Returns and exchanges</Link></li>
              <li><Link to="/contact" className={ROW}>Contact us</Link></li>
              <li><Link to="/about" className={ROW}>Our story</Link></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="eyebrow-dark">Visit</p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-300">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.5} />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.5} />
                <span>{settings.hours}</span>
              </li>
              <li className="flex gap-3">
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0" color="#25D366" />
                <a href={waLink(settings.whatsappNumber, `Hi ${settings.storeName}, I have a question.`)} target="_blank" rel="noreferrer" className="-my-2.5 inline-flex min-h-10 items-center tabular-nums hover:text-paper">
                  {settings.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-800">
        {/* Stacked and centred below lg; from lg a 1fr/auto/1fr grid keeps the credit centred on the page,
            with the copyright on the left. (The admin sign-in is not linked from the store: go to /admin.) */}
        <div className="container flex flex-col items-center gap-3 py-6 text-center text-2xs uppercase tracking-micro text-neutral-400 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6 lg:py-5 lg:pr-24 lg:text-left">
          <p>© {year} {settings.storeName}. {settings.tagline}.</p>
          <p className="font-display text-sm normal-case italic tracking-normal text-neutral-500 lg:text-center">
            Made with <span className="not-italic text-paper/70" aria-label="love">♥</span> By{" "}
            <a
              href="https://fahad-yousuf.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 underline decoration-neutral-600 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper/60"
            >
              Fahad Yousuf
            </a>{" "}
            in Srinagar
          </p>
        </div>
      </div>
    </footer>
  );
}
