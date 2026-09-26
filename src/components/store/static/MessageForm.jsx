import React, { useState } from "react";
import { Input, Textarea } from "../../ui/Fields";
import Button from "../../ui/Button";
import WhatsAppIcon from "../../ui/WhatsAppIcon";
import { openWhatsApp } from "../../../lib/whatsapp";

const composeMessage = ({ storeName, name, message }) => [`Hi ${storeName || "Al Habib Garments Mall"}, this is ${name}.`, "", message].join("\n");

// Tiny contact form. There is no inbox: submitting opens WhatsApp with the message pre-filled.
export default function MessageForm({ settings = {}, onSent, className = "" }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanMessage = message.trim();
    const next = {};
    if (!cleanName) next.name = "Tell us your name.";
    if (cleanMessage.length < 4) next.message = "Write a few words so we know how to help.";
    setErrors(next);
    if (Object.keys(next).length) return;
    openWhatsApp(settings.whatsappNumber, composeMessage({ storeName: settings.storeName, name: cleanName, message: cleanMessage }));
    setMessage("");
    onSent?.();
  };

  return (
    <form onSubmit={submit} noValidate className={className}>
      <div className="grid gap-5">
        <Input
          label="Your name"
          name="name"
          autoComplete="name"
          placeholder="Full name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((er) => ({ ...er, name: "" }));
          }}
          error={errors.name}
          required
        />
        <Textarea
          label="Message"
          name="message"
          rows={5}
          placeholder="A size question, an order number, or just what you are looking for."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((er) => ({ ...er, message: "" }));
          }}
          error={errors.message}
          required
        />
      </div>
      <div className="mt-6">
        <Button type="submit" className="w-full sm:w-auto sm:min-w-[16rem]">
          <WhatsAppIcon className="h-4 w-4" color="#25D366" />
          Send on WhatsApp
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">Opens WhatsApp with your message ready to send. We reply during store hours.</p>
      </div>
    </form>
  );
}
