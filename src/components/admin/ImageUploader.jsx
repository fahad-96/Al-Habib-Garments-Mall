import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, X } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { uploadImage, validateImageFile } from "../../lib/images";
import { sanitizeImageUrl } from "../../lib/format";
import Img from "../ui/Img";

// Uploads to Supabase storage (compressed to WebP) and returns public URLs.
//   single:   <ImageUploader value={url} onChange={setUrl} />
//   multiple: <ImageUploader multiple value={[urls]} onChange={setUrls} max={8} />
export default function ImageUploader({ value, onChange, multiple = false, max = 8, folder = "products", nameHint = "image", label, hint, aspect = "aspect-[3/4]" }) {
  const { supabase } = useAdmin();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [urlMode, setUrlMode] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [dragging, setDragging] = useState(false);

  const urls = multiple ? (Array.isArray(value) ? value : []).filter(Boolean) : value ? [value] : [];
  const emit = (next) => onChange?.(multiple ? next : next[0] || "");

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setError("");
    const room = multiple ? Math.max(0, max - urls.length) : 1;
    const chosen = files.slice(0, room);
    if (!chosen.length) {
      setError(`You can add up to ${max} images.`);
      return;
    }
    for (const f of chosen) {
      const problem = validateImageFile(f);
      if (problem) {
        setError(problem);
        return;
      }
    }
    if (!supabase) {
      setError("Connect Supabase to upload images.");
      return;
    }
    setBusy(true);
    try {
      const uploaded = [];
      for (const f of chosen) uploaded.push(await uploadImage(supabase, f, folder, nameHint));
      emit(multiple ? [...urls, ...uploaded] : uploaded);
    } catch (e) {
      setError(e?.message || "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = (i) => emit(urls.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= urls.length) return;
    const next = [...urls];
    [next[i], next[j]] = [next[j], next[i]];
    emit(next);
  };
  const addUrl = () => {
    const clean = sanitizeImageUrl(urlDraft);
    if (!clean) {
      setError("Enter a full https:// image URL or a site path starting with /.");
      return;
    }
    emit(multiple ? [...urls, clean].slice(0, max) : [clean]);
    setUrlDraft("");
    setUrlMode(false);
    setError("");
  };

  const canAdd = multiple ? urls.length < max : urls.length === 0;

  return (
    <div>
      {label && <p className="label label-dark">{label}</p>}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {urls.map((u, i) => (
          <div key={`${u}-${i}`} className={`group relative overflow-hidden border border-neutral-800 bg-neutral-900 ${aspect}`}>
            <Img src={u} alt="" className="h-full w-full object-cover" />
            {i === 0 && multiple && <span className="absolute left-1 top-1 bg-paper px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-micro text-ink">Main</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              {multiple ? (
                <div className="flex gap-0.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-paper disabled:opacity-30" aria-label="Move left">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === urls.length - 1} className="p-1 text-paper disabled:opacity-30" aria-label="Move right">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => remove(i)} className="p-1 text-paper" aria-label="Remove image">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
            disabled={busy}
            className={`flex ${aspect} flex-col items-center justify-center gap-2 border border-dashed text-neutral-400 transition-colors hover:border-neutral-400 hover:text-paper ${dragging ? "border-paper text-paper" : "border-neutral-700"}`}
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" strokeWidth={1.5} />}
            <span className="px-2 text-center text-[11px] leading-tight">{busy ? "Uploading" : multiple ? "Add photos" : "Add photo"}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span>{hint || "PNG, JPG or WEBP up to 8 MB. Photos are compressed automatically."}</span>
        {canAdd && (
          <button type="button" onClick={() => setUrlMode((m) => !m)} className="inline-flex items-center gap-1 text-neutral-300 hover:text-paper">
            <Link2 className="h-3 w-3" /> Use an image URL
          </button>
        )}
      </div>
      {urlMode && (
        <div className="mt-2 flex gap-2">
          <input value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="https://..." className="field field-dark field-sm flex-1" />
          <button type="button" onClick={addUrl} className="btn btn-inverse btn-sm">Add</button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
