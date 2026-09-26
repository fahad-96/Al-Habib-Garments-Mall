import React from "react";
import Button from "../../ui/Button";

// Sticky footer for long forms. Sits flush on phones and floats as a bordered island on desktop.
export default function SaveBar({ dirty, saving = false, disabled = false, onSave, onDiscard, note = "" }) {
  return (
    <div className="safe-bottom sticky bottom-0 z-30 -mx-4 mt-2 border-t border-neutral-700 bg-neutral-950/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-6 lg:mx-0 lg:border lg:px-5 lg:shadow-pop" role="region" aria-label="Save changes">
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2.5 text-sm" aria-live="polite">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${dirty ? "bg-paper" : "bg-neutral-700"}`} aria-hidden="true" />
          <span className={`truncate ${dirty ? "text-paper" : "text-neutral-500"}`}>{note || (dirty ? "Unsaved changes" : "All changes saved")}</span>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="inverse-outline" size="sm" onClick={onDiscard} disabled={!dirty || saving}>
            Discard
          </Button>
          <Button variant="inverse" size="sm" onClick={onSave} loading={saving} disabled={!dirty || disabled}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
