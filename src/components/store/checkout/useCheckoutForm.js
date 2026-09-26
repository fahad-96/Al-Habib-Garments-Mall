import { useCallback, useState } from "react";
import { isValidPincode, normalizePhone } from "../../../lib/format";

export const validateCustomer = (c = {}) => {
  const errors = {};
  if (String(c.name || "").trim().length < 2) errors.name = "Enter your full name.";
  if (!normalizePhone(c.phone)) errors.phone = "Enter a 10-digit Indian mobile number.";
  if (String(c.address || "").trim().length < 6) errors.address = "Enter your delivery address.";
  if (!String(c.city || "").trim()) errors.city = "Enter your city or village.";
  if (String(c.pincode || "").trim() && !isValidPincode(c.pincode)) errors.pincode = "Enter a valid 6-digit PIN code.";
  return errors;
};

// Binds the persisted customer record to the delivery form and owns its errors.
export function useCheckoutForm(customer, setCustomer) {
  const [errors, setErrors] = useState({});

  const clear = useCallback((field) => setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev)), []);

  const bind = useCallback(
    (field) => ({
      name: field,
      value: customer[field] || "",
      error: errors[field],
      onChange: (e) => {
        setCustomer({ [field]: e.target.value });
        clear(field);
      },
    }),
    [customer, errors, setCustomer, clear]
  );

  // Tidy the phone into ten digits once the user leaves the field.
  const normalizePhoneField = useCallback(() => {
    const clean = normalizePhone(customer.phone);
    if (clean && clean !== customer.phone) setCustomer({ phone: clean });
  }, [customer.phone, setCustomer]);

  const validateAll = useCallback(() => {
    const next = validateCustomer(customer);
    setErrors(next);
    return next;
  }, [customer]);

  return { errors, bind, normalizePhoneField, validateAll };
}
