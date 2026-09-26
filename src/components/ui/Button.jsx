import React from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  inverse: "btn-inverse",
  "inverse-outline": "btn-inverse-outline",
};
const SIZES = { sm: "btn-sm", md: "btn-md", lg: "btn-lg" };

export default function Button({ as, to, href, variant = "primary", size = "md", loading = false, className = "", children, full = false, ...rest }) {
  const cls = ["btn", VARIANTS[variant] || VARIANTS.primary, SIZES[size] || SIZES.md, full ? "w-full" : "", className].join(" ");
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    );
  }
  const Tag = as || "button";
  return (
    <Tag type={Tag === "button" ? rest.type || "button" : undefined} className={cls} disabled={loading || rest.disabled} {...rest}>
      {content}
    </Tag>
  );
}
