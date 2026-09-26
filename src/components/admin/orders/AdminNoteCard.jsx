import React, { useEffect, useState } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { useShop } from "../../../context/ShopContext";
import { saveOrderNote } from "../../../lib/adminApi";
import Button from "../../ui/Button";
import { Textarea } from "../../ui/Fields";
import OrderCard from "./OrderCard";

const MAX = 2000;

export default function AdminNoteCard({ order, onSaved }) {
  const { supabase } = useAdmin();
  const { toast } = useShop();
  const saved = order?.adminNote || "";
  const [note, setNote] = useState(saved);
  const [saving, setSaving] = useState(false);

  // A different order (or a fresh copy of this one) resets the draft.
  useEffect(() => {
    setNote(saved);
  }, [order?.id, saved]);

  const dirty = note !== saved;

  const save = async () => {
    if (!supabase || !dirty) return;
    setSaving(true);
    try {
      const updated = await saveOrderNote(supabase, order.id, note);
      onSaved?.(updated);
      toast("Note saved", { type: "success" });
    } catch (e) {
      toast(e?.message || "Could not save the note.", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <OrderCard title="Admin note" aside={<span className="text-xs text-neutral-500">Only the team sees this</span>}>
      <Textarea dark aria-label="Admin note" rows={4} maxLength={MAX} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Courier reference, alterations, anything the team should know." />
      <div className="mt-3 flex items-center justify-between gap-4">
        <span className="text-xs tabular-nums text-neutral-600">
          {note.length}/{MAX}
        </span>
        <Button variant="inverse" size="sm" onClick={save} loading={saving} disabled={!dirty || saving}>
          Save note
        </Button>
      </div>
    </OrderCard>
  );
}
