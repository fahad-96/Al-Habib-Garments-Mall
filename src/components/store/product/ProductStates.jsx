import React from "react";
import { Search } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import Seo from "../../ui/Seo";
import Button from "../../ui/Button";
import { Skeleton } from "../../ui/Skeleton";

export function ProductSkeleton() {
  return (
    <div className="container py-5 lg:py-6" aria-busy="true" aria-label="Loading product">
      <Skeleton className="h-3 w-48" />
      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">
        <div className="-mx-4 sm:mx-auto sm:max-w-lg lg:col-span-7 lg:mx-0 lg:max-w-none">
          <div className="lg:grid lg:grid-cols-[4.25rem_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[5rem_minmax(0,1fr)] xl:gap-5">
            <div className="hidden lg:flex lg:flex-col lg:gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full" />
              ))}
            </div>
            <Skeleton className="aspect-[3/4] w-full" />
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:max-w-none">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-9 w-4/5" />
          <Skeleton className="mt-3 h-3 w-2/3" />
          <Skeleton className="mt-8 h-7 w-32" />
          <Skeleton className="mt-10 h-3 w-16" />
          <div className="mt-3 flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-full" />
            ))}
          </div>
          <Skeleton className="mt-8 h-3 w-12" />
          <div className="mt-3 flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-12" />
            ))}
          </div>
          <Skeleton className="mt-10 h-14 w-full" />
          <Skeleton className="mt-3 h-14 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductNotFound() {
  const { setSearchOpen } = useShop();
  return (
    <div className="container py-20 lg:py-28">
      <Seo title="Product not found" noindex />
      <div className="mx-auto max-w-md text-center">
        <p className="eyebrow">Product</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight">We could not find that piece</h1>
        <p className="mt-4 text-sm text-neutral-500">It may have sold through or moved shelves. The shop floor has plenty more.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/shop">Back to shop</Button>
          <Button variant="secondary" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
