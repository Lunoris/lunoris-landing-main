"use client";

/**
 * One IntersectionObserver for every animated text root on the page. Observed
 * elements get `is-in-view` while within 80px of the viewport; CSS hangs the
 * infinite letter animations off that class so off-screen text costs nothing.
 */

type InViewCallback = (inView: boolean) => void;

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, InViewCallback | null>();

function getObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible = entry.isIntersecting;
          entry.target.classList.toggle("is-in-view", visible);
          callbacks.get(entry.target)?.(visible);
        }
      },
      { rootMargin: "80px 0px" }
    );
  }
  return sharedObserver;
}

/** Starts toggling `is-in-view` on `el`. Returns the matching unobserve. */
export function observeInView(
  el: Element,
  onChange?: InViewCallback
): () => void {
  const observer = getObserver();
  if (!observer) {
    // No IntersectionObserver: keep animations running rather than frozen.
    el.classList.add("is-in-view");
    onChange?.(true);
    return () => {};
  }
  callbacks.set(el, onChange ?? null);
  observer.observe(el);
  return () => {
    observer.unobserve(el);
    callbacks.delete(el);
  };
}
