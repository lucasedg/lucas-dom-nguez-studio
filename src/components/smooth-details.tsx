import { useRef, type ReactNode } from "react";

/*
 * <details> that opens and closes with a soft, liquid height animation instead of
 * snapping. Keeps the native element (keyboard, find-in-page, no-JS fallback).
 */
export function SmoothDetails({
  className = "",
  summary,
  children,
}: {
  className?: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const running = useRef<Animation | null>(null);

  const toggle = (event: React.MouseEvent<HTMLElement>) => {
    const details = ref.current;
    if (!details) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !details.animate) return; // native snap is fine here
    event.preventDefault();

    const summaryEl = details.querySelector("summary");
    const closedHeight = summaryEl ? summaryEl.offsetHeight : 0;
    const from = details.offsetHeight;
    running.current?.cancel();

    const opening = !details.open || details.dataset["closing"] === "true";
    if (opening) {
      delete details.dataset["closing"];
      details.open = true;
      details.dataset["state"] = "open";
      const to = details.offsetHeight;
      running.current = details.animate(
        { height: [`${from}px`, `${to}px`] },
        { duration: 560, easing: "cubic-bezier(0.22, 1.2, 0.36, 1)" },
      );
    } else {
      details.dataset["closing"] = "true";
      details.dataset["state"] = "closed";
      const animation = details.animate(
        { height: [`${from}px`, `${closedHeight}px`] },
        { duration: 380, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      );
      running.current = animation;
      animation.onfinish = () => {
        if (details.dataset["closing"] === "true") {
          details.open = false;
          delete details.dataset["closing"];
        }
      };
    }
  };

  return (
    <details ref={ref} className={`smooth-details ${className}`}>
      <summary onClick={toggle}>{summary}</summary>
      <div className="smooth-details-body">{children}</div>
    </details>
  );
}
