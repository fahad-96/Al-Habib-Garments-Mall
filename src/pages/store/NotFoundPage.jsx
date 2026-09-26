import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/Button";
import Reveal from "../../components/ui/Reveal";

export default function NotFoundPage() {
  const { setSearchOpen, departments } = useShop();
  const links = [...departments.map((d) => ({ to: `/shop/${d.key}`, label: d.name })), { to: "/", label: "Home" }];
  return (
    <div className="container flex min-h-[60vh] flex-col justify-center py-20 text-center lg:min-h-[70vh]">
      <Seo title="Page not found" description="The page you were looking for is not here." noindex />
      <Reveal className="mx-auto max-w-xl">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 font-display text-6xl leading-none tracking-tight sm:text-8xl lg:text-9xl">Not here.</h1>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-neutral-600">The link may be old, or the piece has sold through and left the shelf. Try a search, or start from one of the departments.</p>
        <div className="mt-8">
          <Button type="button" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Search the shop
          </Button>
        </div>
        <nav aria-label="Popular destinations" className="mt-10 border-t border-line pt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-flex min-h-10 items-center text-2xs font-medium uppercase tracking-micro text-ink underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Reveal>
    </div>
  );
}
