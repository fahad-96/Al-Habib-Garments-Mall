import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", description, confirmLabel = "Confirm", danger = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      dark
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="inverse-outline" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={danger ? "inverse-outline" : "inverse"} size="sm" onClick={confirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {description && <p className="text-sm text-neutral-300">{description}</p>}
      {error && <p className="mt-3 text-xs font-medium text-paper" role="alert">{error}</p>}
    </Modal>
  );
}
