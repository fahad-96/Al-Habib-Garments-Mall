import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", description, confirmLabel = "Confirm", danger = false }) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.();
      onClose?.();
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
          <Button variant="inverse" size="sm" onClick={confirm} loading={busy} className={danger ? "!border-red-500 !bg-red-500 !text-paper hover:!bg-red-600" : ""}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {description && <p className="text-sm text-neutral-300">{description}</p>}
    </Modal>
  );
}
