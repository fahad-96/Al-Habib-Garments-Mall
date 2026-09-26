import React from "react";
import { Loader2 } from "lucide-react";

export default function Spinner({ className = "", label = "Loading" }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`} role="status" aria-label={label}>
      <Loader2 className="h-5 w-5 animate-spin text-neutral-400" aria-hidden="true" />
    </div>
  );
}
