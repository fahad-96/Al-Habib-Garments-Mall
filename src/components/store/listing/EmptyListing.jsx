import React from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, Tag, Layers, ShoppingBag } from "lucide-react";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";
import { useShop } from "../../../context/ShopContext";

const POPULAR = [
  { label: "Men's jackets", to: "/shop/men/jackets" },
  { label: "Women's jackets", to: "/shop/women/jackets" },
  { label: "Hoodies", to: "/shop/men/sweatshirts" },
  { label: "T-shirts", to: "/shop/men/t-shirts" },
  { label: "Bags & luggage", to: "/shop/accessories/bags" },
  { label: "Beanies", to: "/shop/accessories/beanies" },
];

function ChipLinks({ items }) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {items.map((i) => (
        <li key={i.to}>
          <Link to={i.to} className="chip">
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// One empty state per situation. `filtered` means the base set had items but the filters removed them all.
export default function EmptyListing({ mode, q, department, category, collection, filtered = false, onClear, onSearch }) {
  const { departments } = useShop();
  if (filtered) {
    return (
      <EmptyState
        icon={Layers}
        title="Nothing matches these filters"
        description="Loosen a size, colour or price and the pieces come back."
        action={
          <Button variant="secondary" onClick={onClear}>
            Clear all filters
          </Button>
        }
      />
    );
  }

  if (mode === "search") {
    if (!q) {
      return (
        <EmptyState
          icon={Search}
          title="Search the store"
          description="Try a piece, a colour or a fabric. Jackets, black, fleece."
          action={
            <div className="space-y-5">
              <Button variant="secondary" onClick={onSearch}>
                Start searching
              </Button>
              <ChipLinks items={POPULAR} />
            </div>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={Search}
        title={
          <>
            Nothing for <span className="italic [overflow-wrap:anywhere]">“{q.length > 60 ? `${q.slice(0, 60).trimEnd()}…` : q}”</span>
          </>
        }
        description="Try jackets, hoodies, bags, or browse a popular category."
        action={<ChipLinks items={POPULAR} />}
      />
    );
  }

  if (mode === "new") {
    return (
      <EmptyState
        icon={Sparkles}
        title="Nothing new this week"
        description="Fresh pieces arrive most weeks. Until then, the full range is a tap away."
        action={
          <Button variant="secondary" to="/shop">
            Shop everything
          </Button>
        }
      />
    );
  }

  if (mode === "sale") {
    return (
      <EmptyState
        icon={Tag}
        title="No markdowns right now"
        description="Sale pieces appear here the moment prices drop. Check back soon or message us on WhatsApp for a quote."
        action={
          <Button variant="secondary" to="/shop">
            Shop everything
          </Button>
        }
      />
    );
  }

  if (mode === "collection") {
    if (!collection) {
      return (
        <EmptyState
          icon={Layers}
          title="That collection is not here"
          description="It may have been retired or renamed. Every current edit is on the collections page."
          action={
            <Button variant="secondary" to="/collections">
              See all collections
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={Layers}
        title="Being put together"
        description="This edit has no pieces yet. Have a look at the others while it fills up."
        action={
          <Button variant="secondary" to="/collections">
            See all collections
          </Button>
        }
      />
    );
  }

  if ((mode === "department" || mode === "category") && !department) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="We do not have that department"
        description="Choose one of the departments below."
        action={<ChipLinks items={departments.map((d) => ({ label: d.name, to: `/shop/${d.key}` }))} />}
      />
    );
  }

  if (mode === "category" && !category) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="That category is not here"
        description={`It may have moved. Everything for ${department.name.toLowerCase()} is one tap away.`}
        action={
          <Button variant="secondary" to={`/shop/${department.key}`}>
            Shop all {department.name.toLowerCase()}
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={ShoppingBag}
      title="Nothing here yet"
      description={department ? `New ${department.name.toLowerCase()} pieces arrive most weeks. Browse the rest of the store meanwhile.` : "The shelves are being stocked. Come back in a little while."}
      action={
        <Button variant="secondary" to={department ? `/shop/${department.key}` : "/shop"}>
          {department ? `Shop all ${department.name.toLowerCase()}` : "Shop everything"}
        </Button>
      }
    />
  );
}
