import { useEffect, useRef, useState } from "react";
import { useIsTouch, useReducedMotion } from "@/hooks/useMotionPrefs";

/**
 * Minimal desktop cursor. Elements opt in with data-cursor="view|explore|play|drag".
 */
export function CustomCursor() {
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (touch || reduced) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      setVisible(true);
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      setLabel(el ? (el as HTMLElement).dataset["cursor"] || null : null);
    };
    const leave = () => setVisible(false);

    const loop = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [touch, reduced]);

  if (touch || reduced) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden md:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .3s" }}
    >
      <div
        className="grid place-items-center rounded-full border border-accent/70 text-[9px] tracking-[0.2em] text-accent uppercase backdrop-blur-[2px]"
        style={{
          width: label ? 78 : 12,
          height: label ? 78 : 12,
          background: label ? "oklch(0.145 0 0 / 0.35)" : "transparent",
          transition: "width .45s var(--ease-cine), height .45s var(--ease-cine)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
