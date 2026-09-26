import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Lazy-loaded pages may not have rendered the target yet: retry briefly.
      let tries = 0;
      let frame = 0;
      const attempt = () => {
        const el = document.getElementById(hash.slice(1));
        if (el) {
          el.scrollIntoView({ block: "start" });
          return;
        }
        if (tries++ < 40) frame = requestAnimationFrame(attempt);
      };
      attempt();
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return undefined;
  }, [pathname, hash]);
  return null;
}
