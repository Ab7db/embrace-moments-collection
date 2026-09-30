import { useEffect, useRef } from "react";

/**
 * Ultra-lightweight, zero-re-render scroll progress indicator.
 * Updates DOM style directly via RAF without triggering React state re-renders.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const h = document.documentElement.scrollHeight - window.innerHeight;
          const p = h > 0 ? window.scrollY / h : 0;
          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${p})`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[70] h-px bg-transparent">
      <div
        ref={barRef}
        className="h-px bg-accent/80 origin-left will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
