import { useReducedMotion } from "@/hooks/useMotionPrefs";

/**
 * Ambient Golden Waves & Undulating Fluid Glow (Performance Optimized).
 * Soft, elegant, and low-opacity golden amber waves that drift gently across the background
 * without mouse tracking or expensive filter repaints, ensuring 100% silky 60fps scrolling.
 */
export function AmbientSpotlight() {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden select-none"
      style={{ contain: "paint layout" }}
    >
      {/* Wave Orb 1: Upper Right to Center Harmonic Drift */}
      <div
        className="absolute -top-[10%] -end-[10%] h-[550px] w-[550px] sm:h-[750px] sm:w-[750px] lg:h-[900px] lg:w-[900px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(232, 184, 75, 0.035) 0%, rgba(196, 154, 69, 0.018) 38%, rgba(160, 110, 30, 0.005) 60%, transparent 75%)",
          animation: "ambient-wave-1 28s ease-in-out infinite alternate",
        }}
      />

      {/* Wave Orb 2: Mid-Left Counter-Current Undulating Wave */}
      <div
        className="absolute top-[32%] -start-[15%] h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] lg:h-[850px] lg:w-[850px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(245, 205, 110, 0.028) 0%, rgba(196, 154, 69, 0.014) 42%, transparent 70%)",
          animation: "ambient-wave-2 34s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Wave Orb 3: Lower Floating Amber Nebula */}
      <div
        className="absolute top-[62%] end-[12%] h-[450px] w-[450px] sm:h-[650px] sm:w-[650px] lg:h-[800px] lg:w-[800px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(212, 160, 50, 0.025) 0%, rgba(180, 130, 40, 0.01) 40%, transparent 68%)",
          animation: "ambient-wave-3 40s ease-in-out infinite alternate",
        }}
      />

      {/* Wave Orb 4: Center-Bottom Slow Morphing Caustic */}
      <div
        className="absolute top-[48%] start-[28%] h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] lg:h-[750px] lg:w-[750px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(250, 215, 120, 0.022) 0%, rgba(196, 154, 69, 0.008) 48%, transparent 72%)",
          animation: "ambient-wave-4 46s ease-in-out infinite alternate-reverse",
        }}
      />
    </div>
  );
}
