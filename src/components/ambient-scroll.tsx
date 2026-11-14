import { useEffect } from "react";

/*
 * Soft entrances · rebranding 2026.
 * Information boxes (project cards, plans, process steps, contact cards) settle in once, gently,
 * as they enter the screen while scrolling down. Boxes already on screen show at once, so nothing
 * flashes on load. Reduced motion: everything is simply visible.
 */

const FLOATING = [
  "[data-float]",
  ".project-card",
  ".process-step",
  ".contact-card",
  ".service-guide-card",
].join(", ");

export function AmbientDriver() {
  useEffect(() => {
    const boxes = Array.from(document.querySelectorAll<HTMLElement>(FLOATING));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    boxes.forEach((el) => {
      el.setAttribute("data-float", "");
      // A small stagger between siblings, so a group arrives one after another.
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [el];
      const order = Math.max(0, siblings.indexOf(el)) % 3;
      el.style.setProperty("--float-delay", `${order * 90}ms`);
    });
    document.documentElement.classList.add("ambient-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    boxes.forEach((el) => {
      if (reduced || el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        el.classList.add("is-in");
      } else {
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);
  return null;
}
