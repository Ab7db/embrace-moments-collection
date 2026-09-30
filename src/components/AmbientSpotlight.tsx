import { useReducedMotion } from "@/hooks/useMotionPrefs";

/**
 * Ambient Golden Waves & Undulating Fluid Glow.
 * Generates continuous, organic, wavy ambient amber lighting across the background
 * without any mouse tracking, creating a deep cinematic, living atmosphere.
 */
export function AmbientSpotlight() {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden select-none"
      style={{ mixBlendMode: "screen" }}
    >
      {/* Wave Orb 1: Upper Right to Center Harmonic Drift */}
      <div
        className="absolute -top-[10%] -end-[10%] h-[550px] w-[550px] sm:h-[750px] sm:w-[750px] lg:h-[900px] lg:w-[900px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232, 184, 75, 0.085) 0%, rgba(196, 154, 69, 0.04) 40%, rgba(160, 110, 30, 0.01) 65%, transparent 75%)",
          filter: "blur(70px)",
          animation: "ambient-wave-1 26s ease-in-out infinite alternate",
        }}
      />

      {/* Wave Orb 2: Mid-Left Counter-Current Undulating Wave */}
      <div
        className="absolute top-[32%] -start-[15%] h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] lg:h-[850px] lg:w-[850px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245, 205, 110, 0.07) 0%, rgba(196, 154, 69, 0.035) 45%, transparent 70%)",
          filter: "blur(80px)",
          animation: "ambient-wave-2 32s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Wave Orb 3: Lower Floating Amber Nebula */}
      <div
        className="absolute top-[62%] end-[12%] h-[450px] w-[450px] sm:h-[650px] sm:w-[650px] lg:h-[800px] lg:w-[800px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, rgba(212, 160, 50, 0.065) 0%, rgba(180, 130, 40, 0.025) 40%, transparent 68%)",
          filter: "blur(85px)",
          animation: "ambient-wave-3 38s ease-in-out infinite alternate",
        }}
      />

      {/* Wave Orb 4: Center-Bottom Slow Morphing Caustic */}
      <div
        className="absolute top-[48%] start-[28%] h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] lg:h-[750px] lg:w-[750px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, rgba(250, 215, 120, 0.055) 0%, rgba(196, 154, 69, 0.02) 50%, transparent 72%)",
          filter: "blur(90px)",
          animation: "ambient-wave-4 44s ease-in-out infinite alternate-reverse",
        }}
      />
    </div>
  );
}
