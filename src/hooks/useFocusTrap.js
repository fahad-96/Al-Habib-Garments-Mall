import { useEffect, useEffectEvent } from "react";

// Keyboard behaviour shared by every modal surface (Drawer, Modal, SearchOverlay):
// focus moves in on open, Tab / Shift+Tab stay inside, Escape closes, and focus
// returns to the control that opened it. Only the top-most open surface reacts.

const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]",
].join(",");

const isVisible = (el) => el.getClientRects().length > 0 && window.getComputedStyle(el).visibility !== "hidden";

export const focusableIn = (root) =>
  root ? Array.from(root.querySelectorAll(FOCUSABLE)).filter((el) => el.tabIndex >= 0 && !el.closest("[inert]") && isVisible(el)) : [];

// A native radio group is a single Tab stop, so any radio in the group stands for the whole group.
const sameRadioGroup = (a, b) => a?.type === "radio" && b?.type === "radio" && Boolean(a.name) && a.name === b.name && a.form === b.form;
const isStop = (current, stop) => current === stop || sameRadioGroup(current, stop);
// Entering a radio group lands on its checked radio, as the browser's own Tab would.
const entryFor = (el, root) => {
  if (el?.type !== "radio" || !el.name) return el;
  const checked = Array.from(root.querySelectorAll("input[type='radio']")).find((r) => r.checked && sameRadioGroup(r, el));
  return checked || el;
};

// Open surfaces, oldest first. Keyboard handling belongs to the last one.
const stack = [];

/**
 * @param {boolean} active  whether the surface is open
 * @param {{ current: HTMLElement | null }} ref  the dialog panel
 * @param {{ onEscape?: () => void, initialFocus?: (root: HTMLElement) => HTMLElement | null | undefined }} [options]
 */
export function useFocusTrap(active, ref, { onEscape, initialFocus } = {}) {
  const escape = useEffectEvent(() => onEscape?.());
  const pickInitial = useEffectEvent((root) => initialFocus?.(root));

  useEffect(() => {
    if (!active) return undefined;
    const token = {};
    stack.push(token);
    const opener = document.activeElement;
    const root = ref.current;

    // Focus the preferred control, else the first focusable one, else the panel itself.
    const frame = window.requestAnimationFrame(() => {
      const panel = ref.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const target = pickInitial(panel) || focusableIn(panel)[0] || panel;
      if (target === panel && !panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });

    const onKeyDown = (e) => {
      if (stack[stack.length - 1] !== token || e.defaultPrevented) return;
      if (e.key === "Escape") {
        e.preventDefault();
        escape();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = ref.current;
      if (!panel) return;
      const items = focusableIn(panel);
      if (!items.length) {
        e.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!panel.contains(current)) {
        e.preventDefault();
        entryFor(e.shiftKey ? last : first, panel).focus();
      } else if (e.shiftKey && (isStop(current, first) || current === panel)) {
        e.preventDefault();
        entryFor(last, panel).focus();
      } else if (!e.shiftKey && isStop(current, last)) {
        e.preventDefault();
        entryFor(first, panel).focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      const i = stack.indexOf(token);
      if (i !== -1) stack.splice(i, 1);
      // Hand focus back to the opener, unless something else (a route change, another
      // surface) has already taken it somewhere meaningful.
      const current = document.activeElement;
      const focusWasInside = !current || current === document.body || (root && root.contains(current));
      if (focusWasInside && opener instanceof HTMLElement && opener !== document.body && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [active, ref]);
}
