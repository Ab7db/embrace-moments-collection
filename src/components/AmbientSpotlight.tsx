import { useReducedMotion } from "@/hooks/useMotionPrefs";

/**
 * Ambient Golden Waves (Right-to-Left Undulating Glow).
 * Generates soft, radiant golden amber waves undulating continuously from right to left,
 * enriching the background with luxury optical warmth while maintaining buttery smooth performance.
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
      {/* Wave Tier 1: Upper Band (Right to Left) */}
      <div
        className="absolute -top-[12%] end-0 h-[600px] w-[700px] sm:h-[800px] sm:w-[950px] lg:h-[950px] lg:w-[1100px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 50%, rgba(232, 184, 75, 0.085) 0%, rgba(196, 154, 69, 0.045) 40%, rgba(160, 110, 30, 0.012) 65%, transparent 78%)",
          animation: "wave-rtl-1 22s ease-in-out infinite alternate",
        }}
      />

      {/* Wave Tier 2: Middle Band (Right to Left with Phase Offset) */}
      <div
        className="absolute top-[35%] end-[5%] h-[550px] w-[650px] sm:h-[750px] sm:w-[900px] lg:h-[900px] lg:w-[1050px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(245, 205, 110, 0.075) 0%, rgba(196, 154, 69, 0.038) 42%, rgba(160, 110, 30, 0.01) 68%, transparent 75%)",
          animation: "wave-rtl-2 26s ease-in-out infinite alternate",
        }}
      />

      {/* Wave Tier 3: Lower Band (Right to Left Deep Nebula) */}
      <div
        className="absolute top-[68%] end-[10%] h-[500px] w-[600px] sm:h-[700px] sm:w-[850px] lg:h-[850px] lg:w-[1000px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 50%, rgba(212, 160, 50, 0.07) 0%, rgba(180, 130, 40, 0.03) 40%, transparent 70%)",
          animation: "wave-rtl-3 30s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
