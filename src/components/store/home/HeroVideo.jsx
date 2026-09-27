import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { sanitizeImageUrl } from "../../../lib/format";

const PORTRAIT = "(max-aspect-ratio: 4/5)";

// The built-in loops (scripts/hero-video/build.py) ship a smaller VP9 WebM next to each MP4; browsers that
// can play it take it, the rest fall back to the MP4. Any other URL is used as it is.
const LOCAL_LOOP = /^\/video\/.+\.mp4$/;
const sourcesFor = (src) => (LOCAL_LOOP.test(src) ? [{ src: `${src.slice(0, -4)}.webm`, type: "video/webm" }, { src, type: "video/mp4" }] : [{ src }]);

const matches = (query) => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches;

// Data saver or a 2G-class connection: keep the still frame and skip the download.
const lightMode = () => {
  const c = typeof navigator !== "undefined" ? navigator.connection : null;
  return Boolean(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || "")));
};

function usePortrait() {
  const [portrait, setPortrait] = useState(() => matches(PORTRAIT));
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia(PORTRAIT);
    const on = () => setPortrait(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return portrait;
}

// Waits for the page's own load event, so the video never competes with the first paint.
function usePageLoaded() {
  const [loaded, setLoaded] = useState(() => typeof document !== "undefined" && document.readyState === "complete");
  useEffect(() => {
    if (loaded) return undefined;
    const on = () => setLoaded(true);
    window.addEventListener("load", on, { once: true });
    return () => window.removeEventListener("load", on);
  }, [loaded]);
  return loaded;
}

// Full-bleed, muted, looping background video for a hero slide. The poster (the video's first frame)
// shows straight away; the video loads after the page has, plays only while its slide is showing and
// fades in over the poster once it is actually playing. Portrait screens get the portrait cut when
// there is one. Reduced motion and data saver keep the poster.
export default function HeroVideo({ landscape, portrait: portraitSrc, poster, posterPortrait, active, className = "" }) {
  const reduce = useReducedMotion();
  const portrait = usePortrait();
  const loaded = usePageLoaded();
  const ref = useRef(null);
  const [playing, setPlaying] = useState("");

  const src = sanitizeImageUrl(portrait && portraitSrc ? portraitSrc : landscape);
  const still = sanitizeImageUrl(portrait && posterPortrait ? posterPortrait : poster);
  const allowed = Boolean(src) && !reduce && !lightMode();
  const mounted = allowed && loaded;

  useEffect(() => {
    const video = ref.current;
    if (!video || !mounted) return undefined;
    const sync = () => {
      if (active && !document.hidden) video.play().catch(() => {});
      else video.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [active, mounted, src]);

  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true">
      {still && <img src={still} alt="" loading="eager" decoding="async" fetchpriority="high" className="absolute inset-0 h-full w-full object-cover" />}
      {mounted && (
        <video
          key={src}
          ref={ref}
          poster={still || undefined}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={() => setPlaying(src)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing === src ? "opacity-100" : "opacity-0"}`}
        >
          {sourcesFor(src).map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}
    </div>
  );
}
