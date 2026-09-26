import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../../ui/Fields";
import { parseTags } from "./productEditor";
import EditorSection from "./EditorSection";

export default function TagsEditor({ tags = [], onChange }) {
  const [text, setText] = useState(tags.join(", "));

  const commit = (raw) => {
    setText(raw);
    onChange(parseTags(raw));
  };
  const remove = (tag) => {
    const next = tags.filter((t) => t !== tag);
    setText(next.join(", "));
    onChange(next);
  };

  return (
    <EditorSection id="tags" title="Tags" description="Comma-separated words that help search and related products: winter, rain, travel.">
      <Input dark label="Tags" value={text} onChange={(e) => commit(e.target.value)} onBlur={() => setText(tags.join(", "))} placeholder="winter, rain, travel" autoComplete="off" />
      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
          {tags.map((tag) => (
            <li key={tag} className="inline-flex h-10 items-center border border-neutral-700 pl-3 text-xs text-neutral-200">
              {tag}
              <button type="button" onClick={() => remove(tag)} className="flex h-full w-9 items-center justify-center text-neutral-500 transition-colors hover:text-paper" aria-label={`Remove tag ${tag}`}>
                <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </EditorSection>
  );
}
