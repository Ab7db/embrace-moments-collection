import { useEffect, useRef } from "react";
import { useIsTouch, useReducedMotion } from "@/hooks/useMotionPrefs";

/**
 * Subtle Golden Spotlight & Lens Glow.
 * A smooth, cinematic golden amber ambient light that drifts behind cards and imagery,
 * dynamically tracking cursor on desktop and gently breathing on mobile/idle for deep 3D atmosphere.
 */
export function AmbientSpotlight() {
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const lightRef = useRef<HTMLDivElement>(null);
  const secondaryLightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;

    let rafId: number;
    const mouse = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.4,
      targetX: window.innerWidth * 0.5,
      targetY: window.innerHeight * 0.4,
    };

    let time = 0;
    let isIdle = true;
    let idleTimer: ReturnType<typeof setTimeout>;

    const handlePointerMove = (e: PointerEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      isIdle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isIdle = true;
      }, 2500);
    };

    const animate = () => {
      time += 0.014;

      if (isIdle || isTouch) {
        // Subtle organic drifting motion when idle or on mobile
        const orbitRadiusX = window.innerWidth * 0.22;
        const orbitRadiusY = window.innerHeight * 0.16;
        const centerX = window.innerWidth * 0.5;
        const centerY = window.innerHeight * 0.45;

        mouse.targetX =
          centerX + Math.cos(time * 0.6) * orbitRadiusX + Math.sin(time * 0.25) * 35;
        mouse.targetY =
          centerY + Math.sin(time * 0.75) * orbitRadiusY + Math.cos(time * 0.35) * 25;
      }

      // Smooth physics-based easing (lerp)
      mouse.x += (mouse.targetX - mouse.x) * 0.055;
      mouse.y += (mouse.targetY - mouse.y) * 0.055;

      if (lightRef.current) {
        lightRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
      }

      if (secondaryLightRef.current) {
        const secX = mouse.x + Math.sin(time * 0.5) * 100;
        const secY = mouse.y + Math.cos(time * 0.5) * 70;
        secondaryLightRef.current.style.transform = `translate3d(${secX}px, ${secY}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      clearTimeout(idleTimer);
    };
  }, [isTouch, reduced]);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      style={{ mixBlendMode: "screen" }}
    >
      {/* Primary Subtle Golden Amber Optical Spotlight */}
      <div
        ref={lightRef}
        className="absolute left-0 top-0 h-[650px] w-[650px] md:h-[800px] md:w-[800px] rounded-full will-change-transform opacity-90"
        style={{
          background:
            "radial-gradient(circle, rgba(232, 184, 75, 0.08) 0%, rgba(196, 154, 69, 0.04) 35%, rgba(180, 130, 40, 0.012) 60%, transparent 75%)",
          filter: "blur(50px)",
        }}
      />

      {/* Secondary Warm Lens Refraction */}
      <div
        ref={secondaryLightRef}
        className="absolute left-0 top-0 h-[450px] w-[450px] md:h-[550px] md:w-[550px] rounded-full will-change-transform opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 205, 110, 0.05) 0%, rgba(196, 154, 69, 0.018) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
