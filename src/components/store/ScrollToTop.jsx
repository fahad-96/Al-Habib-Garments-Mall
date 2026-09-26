import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { scrollBehavior } from "../../lib/motion";

// Scroll management for client-side navigation.
// - New page (push / replace to another path): start at the top, instantly, or at the #hash target.
// - Back / forward: return to where the shopper left that page. The browser cannot do this on its
//   own because lazy pages and images arrive after it tries, so we keep our own map of
//   history-entry key -> scrollY and retry until the page is tall enough.
// - Query-only changes (filters, sort, "load more") keep the position, unless the navigation
//   asks for the top with `state.scrollTop` (a new search).

const STORE_KEY = "ahgm-scroll";
const MAX_ENTRIES = 60;
const RESTORE_FOR_MS = 1500;

const readStore = () => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeStore = (positions) => {
  try {
    const keys = Object.keys(positions);
    const trimmed = keys.length > MAX_ENTRIES ? Object.fromEntries(keys.slice(-MAX_ENTRIES).map((k) => [k, positions[k]])) : positions;
    sessionStorage.setItem(STORE_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage full or blocked: positions still work for this page view */
  }
};

// html may carry `scroll-behavior: smooth`; a page change must never animate.
const jump = (fn) => {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  fn();
  root.style.scrollBehavior = previous;
};
const jumpTo = (y) => jump(() => window.scrollTo(0, y));

const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

// Keep trying `attempt` every frame until it reports success, the time runs out, or the shopper
// takes over (wheel, touch, key, pointer).
const retry = (attempt) => {
  const started = performance.now();
  let frame = 0;
  const stop = () => {
    window.cancelAnimationFrame(frame);
    INTERRUPTS.forEach((type) => window.removeEventListener(type, stop, true));
  };
  const tick = () => {
    if (attempt() || performance.now() - started > RESTORE_FOR_MS) stop();
    else frame = window.requestAnimationFrame(tick);
  };
  INTERRUPTS.forEach((type) => window.addEventListener(type, stop, { capture: true, passive: true }));
  tick();
  return stop;
};
const INTERRUPTS = ["wheel", "touchstart", "keydown", "pointerdown"];

const restoreTo = (y) =>
  retry(() => {
    const reachable = maxScroll() >= y - 1;
    jumpTo(Math.min(y, maxScroll()));
    return reachable && Math.abs(window.scrollY - y) <= 1;
  });

const scrollToHash = (hash, smooth) => {
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    /* keep the raw id */
  }
  return retry(() => {
    const el = document.getElementById(id);
    if (!el) return false;
    if (smooth) el.scrollIntoView({ block: "start", behavior: scrollBehavior() });
    else jump(() => el.scrollIntoView({ block: "start" }));
    return true;
  });
};

// Only the very first page of the tab can inherit a saved position, and only on reload or back/forward.
const initialLoadRestores = () => {
  try {
    const [entry] = performance.getEntriesByType("navigation");
    return entry?.type === "reload" || entry?.type === "back_forward";
  } catch {
    return false;
  }
};

// A new page moves keyboard and screen reader focus to its content, without scrolling.
const focusMain = () => {
  const main = document.getElementById("main");
  if (main && main.hasAttribute("tabindex")) main.focus({ preventScroll: true });
};

// History entries the router did not create (the first page of the tab, a plain #fragment link)
// all share the key "default"; tell them apart by URL.
const entryKeyOf = ({ key, pathname, search, hash }) => (key === "default" ? `default:${pathname}${search}${hash}` : key);

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const entryKey = entryKeyOf(location);
  const positions = useRef(null);
  const current = useRef({ key: entryKey, path: location.pathname + location.search });
  const previous = useRef(null);

  // Take over from the browser and remember positions per history entry.
  useEffect(() => {
    positions.current = positions.current || readStore();
    const history = window.history;
    const hadRestoration = "scrollRestoration" in history ? history.scrollRestoration : null;
    if (hadRestoration) history.scrollRestoration = "manual";

    let saveTimer = 0;
    const persist = () => {
      window.clearTimeout(saveTimer);
      saveTimer = 0;
      writeStore(positions.current);
    };
    const onScroll = () => {
      // The entry on screen, not window.location: the URL changes before a lazy page renders.
      const { key, path } = current.current;
      // Re-insert so the most recently used entries survive trimming.
      delete positions.current[key];
      positions.current[key] = { y: Math.round(window.scrollY), path };
      if (!saveTimer) saveTimer = window.setTimeout(persist, 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", persist);
    return () => {
      persist();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", persist);
      if (hadRestoration) history.scrollRestoration = hadRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    positions.current = positions.current || readStore();
    const { pathname, search, hash, state } = location;
    // StrictMode re-runs this effect for the same entry: treat that as the first run again.
    const prev = previous.current && previous.current.key !== entryKey ? previous.current : null;
    previous.current = { key: entryKey, pathname, hash };
    current.current = { key: entryKey, path: pathname + search };
    const newPage = !prev || prev.pathname !== pathname;

    if (navigationType === "POP") {
      const saved = positions.current[entryKey];
      const matches = saved && saved.path === pathname + search && Number.isFinite(saved.y);
      if (matches && (prev || initialLoadRestores())) {
        if (prev && newPage) focusMain();
        return restoreTo(saved.y);
      }
      if (hash) return scrollToHash(hash, false);
      if (prev && newPage) {
        jumpTo(0);
        focusMain();
      }
      return undefined;
    }

    // PUSH or REPLACE
    if (hash && (newPage || prev.hash !== hash)) {
      if (prev && newPage) focusMain();
      return scrollToHash(hash, !newPage);
    }
    if (newPage || state?.scrollTop) {
      jumpTo(0);
      if (prev) focusMain();
    }
    return undefined;
    // Runs once per history entry; everything else is read from that same location.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryKey]);

  return null;
}
