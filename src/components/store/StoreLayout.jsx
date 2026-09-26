import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import SearchOverlay from "./SearchOverlay";
import WhatsAppFloat from "./WhatsAppFloat";
import Preloader from "./Preloader";
import Toaster from "../ui/Toaster";
import { PageSkeleton } from "../ui/Skeleton";
import { useShop } from "../../context/ShopContext";

export default function StoreLayout() {
  const { catalogError } = useShop();
  return (
    <div className="flex min-h-screen flex-col">
      <Preloader />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      {catalogError && <p className="bg-neutral-100 py-2 text-center text-xs text-neutral-600">{catalogError}</p>}
      <main id="main" className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <Toaster />
      <WhatsAppFloat />
    </div>
  );
}
