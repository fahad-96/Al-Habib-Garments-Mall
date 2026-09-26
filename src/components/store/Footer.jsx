import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "../ui/SocialIcons";
import { useShop } from "../../context/ShopContext";
import WhatsAppIcon from "../ui/WhatsAppIcon";
import { waLink } from "../../lib/whatsapp";

export default function Footer() {
  const { settings, departments } = useShop();
  const year = new Date().getFullYear();
  const ig = settings.instagram ? `https://instagram.com/${String(settings.instagram).replace(/^@/, "")}` : "";
  return (
    <footer className="mt-20 bg-ink text-paper">
      <div className="container grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-3xl tracking-[0.04em]">AL HABIB</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.32em] text-neutral-400">Garments Mall</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-neutral-400">{settings.about?.split(". ").slice(0, 2).join(". ")}.</p>
          <div className="mt-6 flex items-center gap-4">
            {ig && (
              <a href={ig} target="_blank" rel="noreferrer" className="p-1 text-neutral-300 hover:text-paper" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer" className="p-1 text-neutral-300 hover:text-paper" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5" />
              </a>
            )}
            <a href={waLink(settings.whatsappNumber, `Hi ${settings.storeName}, I have a question.`)} target="_blank" rel="noreferrer" className="p-1 text-neutral-300 hover:text-paper" aria-label="WhatsApp">
              <WhatsAppIcon className="h-5 w-5" color="#25D366" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
          <div>
            <p className="eyebrow-dark">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-300">
              {departments.map((d) => (
                <li key={d.key}>
                  <Link to={`/shop/${d.key}`} className="hover:text-paper">{d.name}</Link>
                </li>
              ))}
              <li><Link to="/new" className="hover:text-paper">New In</Link></li>
              <li><Link to="/collections" className="hover:text-paper">Collections</Link></li>
              <li><Link to="/sale" className="hover:text-paper">Sale</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow-dark">Help</p>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-300">
              <li><Link to="/track" className="hover:text-paper">Track your order</Link></li>
              <li><Link to="/size-guide" className="hover:text-paper">Size guide</Link></li>
              <li><Link to="/policies#shipping" className="hover:text-paper">Shipping &amp; delivery</Link></li>
              <li><Link to="/policies#returns" className="hover:text-paper">Returns &amp; exchanges</Link></li>
              <li><Link to="/contact" className="hover:text-paper">Contact us</Link></li>
              <li><Link to="/about" className="hover:text-paper">Our story</Link></li>
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
                <a href={waLink(settings.whatsappNumber, `Hi ${settings.storeName}, I have a question.`)} target="_blank" rel="noreferrer" className="hover:text-paper">
                  {settings.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-800">
        <div className="container flex flex-col gap-3 py-5 pb-20 text-2xs uppercase tracking-micro text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:pb-5 sm:pr-24">
          <p>© {year} {settings.storeName}. {settings.tagline}.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/policies#privacy" className="hover:text-paper">Privacy</Link>
            <Link to="/policies#terms" className="hover:text-paper">Terms</Link>
            <Link to="/admin/login" className="hover:text-paper">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
