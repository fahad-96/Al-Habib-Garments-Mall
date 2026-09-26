import React, { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import AnnouncementBar from "./AnnouncementBar";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import SearchOverlay from "./SearchOverlay";
import WhatsAppFloat from "./WhatsAppFloat";
import Preloader from "./Preloader";
import ErrorBoundary from "./ErrorBoundary";
import Toaster from "../ui/Toaster";
import { PageSkeleton } from "../ui/Skeleton";
import { useShop } from "../../context/ShopContext";

// Skip link: move focus to the content without adding a fragment entry to the history.
const skipToContent = (e) => {
  const main = document.getElementById("main");
  if (!main) return;
  e.preventDefault();
  main.focus();
};

export default function StoreLayout() {
  const { catalogError } = useShop();
  const { key } = useLocation();
  return (
    // Framer-motion animations follow the shopper's reduced-motion setting, like the CSS ones.
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <Preloader />
        <a href="#main" onClick={skipToContent} className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <AnnouncementBar />
        <Header />
        {catalogError && <CatalogNotice />}
        <main id="main" tabIndex={-1} className="flex-1 outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
          <ErrorBoundary resetKey={key}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <CartDrawer />
        <SearchOverlay />
        <Toaster />
        <WhatsAppFloat />
      </div>
    </MotionConfig>
  );
}

// Shown when the shop's catalog could not be refreshed and the saved one is on screen.
function CatalogNotice() {
  const { refreshCatalog } = useShop();
  const [busy, setBusy] = useState(false);
  const retry = async () => {
    setBusy(true);
    try {
      await refreshCatalog?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <p className="bg-neutral-100 px-4 py-2 text-center text-xs text-neutral-600" role="status">
      Some items may be out of date.{" "}
      <button type="button" onClick={retry} disabled={busy} className="relative font-medium text-ink underline underline-offset-4 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] disabled:opacity-60">
        Refresh
      </button>{" "}
      to try again.
    </p>
  );
}
