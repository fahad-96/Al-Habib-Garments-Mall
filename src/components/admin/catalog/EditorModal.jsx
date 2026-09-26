import React, { useCallback, useId } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";

// Dark modal with a form body and a Cancel / Save footer. Enter submits, Escape and the
// backdrop close it (unless a save is in flight). `error` shows in the footer.
export default function EditorModal({ open, onClose, title, size = "md", busy = false, error = "", hint = "", submitLabel = "Save", onSubmit, children }) {
  const formId = useId();
  const close = useCallback(() => {
    if (!busy) onClose?.();
  }, [busy, onClose]);
  const submit = (e) => {
    e.preventDefault();
    if (!busy) onSubmit?.();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      size={size}
      dark
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`min-w-0 text-xs leading-5 ${error ? "text-red-400" : "text-neutral-500"}`} role={error ? "alert" : undefined}>
            {error || hint}
          </p>
          <div className="flex shrink-0 justify-end gap-2">
            <Button variant="inverse-outline" size="sm" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button variant="inverse" size="sm" type="submit" form={formId} loading={busy}>
              {submitLabel}
            </Button>
          </div>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} noValidate>
        {children}
      </form>
    </Modal>
  );
}
