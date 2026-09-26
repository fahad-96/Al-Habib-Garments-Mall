import React, { useCallback, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";
import Img from "../../ui/Img";
import { useIsDesktop } from "../../../hooks/useMediaQuery";

const wrap = (i, n) => (n ? ((i % n) + n) % n : 0);

function Thumbnails({ images, index, onSelect }) {
  return (
    <ul className="flex flex-col gap-3" aria-label="Product images">
      {images.map((src, i) => {
        const active = i === index;
        return (
          <li key={`${src}-${i}`}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={active ? "true" : undefined}
              className={`img-frame block aspect-[3/4] w-full transition-shadow duration-200 ${active ? "ring-1 ring-ink ring-offset-2 ring-offset-paper" : "hover:ring-1 hover:ring-neutral-400 hover:ring-offset-2 hover:ring-offset-paper"}`}
            >
              <Img src={src} alt="" className={`h-full w-full object-cover transition-opacity duration-200 ${active ? "" : "opacity-75 hover:opacity-100"}`} fallbackLabel={String(i + 1)} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// Desktop: thumbnail column + large image. Hover follows the cursor at 2x; click or Enter locks the zoom,
// arrow keys move between images, Escape leaves the zoom.
function DesktopGallery({ images, alt }) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(null);
  const [locked, setLocked] = useState(false);
  const frame = useRef(null);
  const count = images.length;
  const current = images[index] || "";
  const zoom = hover || (locked ? { x: 50, y: 50 } : null);

  const go = useCallback(
    (i) => {
      setIndex(wrap(i, count));
      setHover(null);
      setLocked(false);
    },
    [count]
  );

  const onMove = (e) => {
    const r = frame.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return;
    setHover({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const onKey = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "Escape" && (locked || hover)) {
      e.preventDefault();
      setLocked(false);
      setHover(null);
    }
  };

  return (
    <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-4 xl:grid-cols-[5rem_minmax(0,1fr)] xl:gap-5">
      <Thumbnails images={images} index={index} onSelect={go} />
      {/* Height-capped so the whole image sits inside a 900px-tall viewport under the sticky header. */}
      <div className="relative h-[calc(100vh-9.5rem)] max-h-[56rem] min-h-[28rem] w-auto max-w-full justify-self-start">
        <button
          type="button"
          ref={frame}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          onClick={() => setLocked((l) => !l)}
          onKeyDown={onKey}
          className={`img-frame block aspect-[3/4] h-full max-w-full ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          aria-label={`${alt}, image ${index + 1} of ${count}. ${zoom ? "Press Enter to leave zoom." : "Press Enter to zoom, arrow keys to change image."}`}
        >
          <Img
            key={current}
            src={current}
            alt={`${alt}, view ${index + 1}`}
            eager
            className="h-full w-full object-cover transition-transform duration-500 ease-soft will-change-transform"
            style={{ transform: zoom ? "scale(2)" : "scale(1)", transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%" }}
          />
        </button>
        <span
          className={`pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-1.5 bg-paper/90 px-2.5 py-1.5 text-2xs font-medium uppercase tracking-micro text-ink transition-opacity duration-200 ${zoom ? "opacity-0" : "opacity-100"}`}
          aria-hidden="true"
        >
          <ZoomIn className="h-3.5 w-3.5" strokeWidth={1.5} />
          Hover to zoom
        </span>
        {count > 1 && (
          <span className="pointer-events-none absolute bottom-4 left-4 bg-paper/90 px-2.5 py-1.5 text-2xs tabular-nums text-ink" aria-hidden="true">
            {index + 1} / {count}
          </span>
        )}
      </div>
    </div>
  );
}

// Mobile: full-width snap carousel with a counter and dot indicators.
function MobileGallery({ images, alt }) {
  const track = useRef(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const onScroll = () => {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    setIndex(wrap(Math.round(el.scrollLeft / el.clientWidth), count));
  };

  const goTo = (i) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: wrap(i, count) * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div className="relative">
        <div ref={track} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" aria-roledescription="carousel" aria-label={`${alt} images`}>
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="img-frame aspect-[3/4] w-full shrink-0 snap-center" role="group" aria-roledescription="slide" aria-label={`Image ${i + 1} of ${count}`}>
              <Img src={src} alt={`${alt}, view ${i + 1}`} eager={i === 0} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        {count > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-3 bg-paper/90 px-2 py-1 text-2xs tabular-nums text-ink" aria-live="polite">
            {index + 1} / {count}
          </span>
        )}
      </div>
      {count > 1 && (
        <div className="mt-1 flex justify-center" aria-label="Choose image">
          {images.map((src, i) => (
            <button key={`${src}-${i}`} type="button" onClick={() => goTo(i)} aria-label={`Image ${i + 1}`} aria-current={i === index ? "true" : undefined} className="flex h-10 w-8 items-center justify-center">
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-4 bg-ink" : "w-1.5 bg-neutral-300"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Gallery({ images = [], alt = "" }) {
  const desktop = useIsDesktop();
  const list = images.length ? images : [""];
  return desktop ? <DesktopGallery images={list} alt={alt} /> : <MobileGallery images={list} alt={alt} />;
}
