import React, { Component } from "react";
import { useShop } from "../../context/ShopContext";
import { waLink } from "../../lib/whatsapp";
import Button from "../ui/Button";
import WhatsAppIcon from "../ui/WhatsAppIcon";

// Keeps one broken page from blanking the whole storefront: the header, footer and bag stay usable,
// and the page area shows a calm way out. It resets when the shopper navigates (resetKey changes).
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: props.resetKey };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) return { error: null, resetKey: props.resetKey };
    return null;
  }

  render() {
    if (this.state.error) return <ErrorFallback />;
    return this.props.children;
  }
}

function ErrorFallback() {
  const { settings } = useShop();
  const storeName = settings?.storeName || "Al Habib Garments Mall";
  const whatsapp = waLink(settings?.whatsappNumber, `Hi ${storeName}, a page on your website did not open for me.`);
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Sorry about that</p>
      <h1 className="mt-4 max-w-lg text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">This page did not load properly.</h1>
      <p className="mt-4 max-w-md text-balance text-[15px] leading-relaxed text-neutral-600">Reloading usually fixes it. Your bag and wishlist are saved on this device.</p>
      <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
        <Button type="button" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <Button to="/" variant="secondary">
          Go home
        </Button>
      </div>
      <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-8 inline-flex min-h-10 items-center gap-2 text-sm text-neutral-700 underline-offset-4 hover:text-ink hover:underline">
        <WhatsAppIcon className="h-4 w-4" color="#25D366" />
        Still stuck? Message us on WhatsApp
      </a>
    </div>
  );
}
