import React, { useId, useState } from "react";
import { Tag } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import Button from "../../ui/Button";
import TextButton from "./TextButton";

export default function CouponField({ className = "" }) {
  const { coupon, applyCoupon, removeCoupon } = useShop();
  const [code, setCode] = useState("");
  const id = useId();

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim() || coupon.checking) return;
    const res = await applyCoupon(code);
    if (res?.valid) setCode("");
  };

  if (coupon.valid && coupon.code) {
    return (
      <div className={className}>
        <p className="label">Coupon</p>
        <div className="flex h-12 items-center justify-between gap-3 border border-ink px-4">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <Tag className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="truncate font-medium tracking-wide">{coupon.code}</span>
          </span>
          <TextButton onClick={removeCoupon}>Remove</TextButton>
        </div>
        {coupon.message && <p className="mt-2 text-xs text-neutral-600">{coupon.message}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={className} noValidate>
      <label htmlFor={id} className="label">
        Coupon
      </label>
      <div className="flex">
        <input
          id={id}
          className="field h-12 min-w-0 flex-1 uppercase placeholder:normal-case"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={24}
        />
        <Button type="submit" variant="secondary" className="-ml-px h-12 shrink-0 px-5" loading={coupon.checking} disabled={!code.trim()}>
          Apply
        </Button>
      </div>
      {coupon.message && (
        <p className="mt-2 text-xs text-neutral-600" aria-live="polite">
          {coupon.message}
        </p>
      )}
    </form>
  );
}
