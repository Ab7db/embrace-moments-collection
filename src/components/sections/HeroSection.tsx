import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/useMotionPrefs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { DbSiteProfile } from "@/lib/database.types";
import { media } from "@/data/media";
import { social } from "@/data/social";
import { formatImgUrl } from "@/lib/utils";

export function HeroSection() {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [roleIdx, setRoleIdx] = useState(0);
  const bgRef = useRef<HTMLDivElement>(null);

  // Fetch live site profile for hero customization
  const { data: profile } = useQuery<DbSiteProfile | null>({
    queryKey: ["site_profile"],
    queryFn: async () => {
      const { data } = await supabase.from("site_profile").select("*").limit(1).maybeSingle();
      return (data as DbSiteProfile) || null;
    },
  });

  // Dynamic roles
  const customRoles =
    lang === "ar"
      ? profile?.hero_roles_ar && profile.hero_roles_ar.length > 0
        ? profile.hero_roles_ar
        : t.hero.roles
      : profile?.hero_roles_en && profile.hero_roles_en.length > 0
      ? profile.hero_roles_en
      : t.hero.roles;

  const rolesLen = customRoles.length;

  useEffect(() => {
    const id = setInterval(() => setRoleIdx((i) => (i + 1) % rolesLen), 2800);
    return () => clearInterval(id);
  }, [rolesLen]);

  // Motion Settings
  const motionEnabled = profile?.hero_motion_enabled ?? true;
  const intensity = profile?.hero_motion_intensity ?? 18;
  const motionStyle = profile?.hero_motion_style || "parallax";
  const heroImageSrc = formatImgUrl(profile?.hero_image_url) || media.hero;

  // Zero-rerender smoothed parallax, mobile phone gyroscope tilt, and ambient drift via RAF
  useEffect(() => {
    if (reduced || !motionEnabled || motionStyle === "static") {
      if (bgRef.current) {
        bgRef.current.style.transform = motionStyle === "zoom-slow" ? "scale(1.10)" : "none";
      }
      return;
    }

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasGyro = false;
    let isTouchDevice = false;

    // Desktop pointer move
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // Touch handled by gyro/touch
      targetX = (e.clientX / window.innerWidth - 0.5) * -intensity;
      targetY = (e.clientY / window.innerHeight - 0.5) * -(intensity * 0.75);
    };

    // Mobile Phone Orientation / Gyroscope tilt
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      hasGyro = true;
      // gamma: left-to-right tilt in degrees [-90, 90]
      // beta: front-to-back tilt in degrees [-180, 180], phone normally held at ~45-55 deg
      const clampedGamma = Math.max(-35, Math.min(35, e.gamma));
      const normalizedGamma = clampedGamma / 35; // [-1, 1]

      const relativeBeta = e.beta - 50; // Calibrate for comfortable hand-held angle (~50 deg)
      const clampedBeta = Math.max(-30, Math.min(30, relativeBeta));
      const normalizedBeta = clampedBeta / 30; // [-1, 1]

      targetX = -normalizedGamma * intensity;
      targetY = -normalizedBeta * (intensity * 0.85);
    };

    // Mobile touch move parallax as responsive fallback
    const onTouchMove = (e: TouchEvent) => {
      if (hasGyro || !e.touches[0]) return;
      isTouchDevice = true;
      const touch = e.touches[0];
      targetX = (touch.clientX / window.innerWidth - 0.5) * -intensity;
      targetY = (touch.clientY / window.innerHeight - 0.5) * -(intensity * 0.75);
    };

    // Request iOS Gyroscope permission on first user tap if required by iOS 13+
    const requestIosPermission = () => {
      const anyDeviceOrientation = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      if (typeof anyDeviceOrientation?.requestPermission === "function") {
        anyDeviceOrientation
          .requestPermission()
          .then((permission) => {
            if (permission === "granted") {
              window.addEventListener("deviceorientation", onOrientation, { passive: true });
            }
          })
          .catch(() => {});
      }
    };

    // Start RAF loop with subtle organic ambient floating drift
    const startTime = performance.now();
    const loop = (timestamp: number) => {
      const elapsed = timestamp - startTime;

      // Organic subtle drift (breathing wave motion)
      let ambientX = 0;
      let ambientY = 0;
      if (motionStyle === "drift" || motionStyle === "parallax") {
        const driftFactor = motionStyle === "drift" ? 0.9 : 0.25;
        ambientX = Math.sin(elapsed * 0.0009) * (intensity * driftFactor);
        ambientY = Math.cos(elapsed * 0.0007) * (intensity * 0.7 * driftFactor);
      }

      const totalTargetX = targetX + ambientX;
      const totalTargetY = targetY + ambientY;

      // Smooth interpolation (lerp)
      currentX += (totalTargetX - currentX) * 0.07;
      currentY += (totalTargetY - currentY) * 0.07;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(1.08)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", requestIosPermission, { once: true, passive: true });

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", requestIosPermission);
    };
  }, [reduced, motionEnabled, motionStyle, intensity]);

  // Main headline statement
  const headline =
    lang === "ar"
      ? profile?.hero_title_ar
        ? [profile.hero_title_ar]
        : t.hero.statement
      : profile?.hero_title_en
      ? [profile.hero_title_en]
      : t.hero.statement;

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col overflow-hidden"
    >
      {/* Background image */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
        style={{
          transition: motionStyle === "zoom-slow" ? "transform 8s ease-out" : "none",
        }}
      >
        <img
          key={heroImageSrc}
          src={heroImageSrc}
          alt="Hero"
          className="h-full w-full object-cover"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 1.8s ease" }}
          onLoad={() => setLoaded(true)}
        />
        {/* gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
        <div className="absolute inset-0 vignette" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-end pb-24 pt-32">
        <div className="mx-auto w-full max-w-[1800px] px-6 md:px-14">
          {/* Rotating role */}
          <div
            className="mb-6 overflow-hidden"
            style={{
              opacity: loaded ? 1 : 0,
              transition: "opacity 1s ease .4s",
            }}
          >
            <p
              key={roleIdx}
              className="type-meta text-accent"
              style={{
                animation: "fade-up .6s var(--ease-cine) forwards",
              }}
            >
              {customRoles[roleIdx]}
            </p>
          </div>

          {/* Main statement */}
          <h1
            className="type-mega font-display text-foreground flex flex-col gap-2 md:gap-4"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(40px)",
              transition: "opacity 1.2s var(--ease-cine) .2s, transform 1.4s var(--ease-cine) .2s",
            }}
          >
            {headline.map((line, i) => (
              <span key={i} className="block leading-[1.12] md:leading-[1.08]">
                {line}
              </span>
            ))}
          </h1>

          {/* Based + CTA */}
          <div
            className="mt-10 flex flex-wrap items-center gap-8"
            style={{
              opacity: loaded ? 1 : 0,
              transition: "opacity 1s ease .8s",
            }}
          >
            <div>
              <p className="type-meta text-muted-foreground">{t.hero.based}</p>
              <p className="mt-1 text-sm text-muted-foreground/70">{t.hero.basedSub}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                data-cursor="explore"
                onClick={() =>
                  document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })
                }
                className="group relative overflow-hidden rounded-sm bg-accent px-7 py-3 type-meta text-background transition-all duration-500 hover:bg-foreground"
              >
                {t.hero.cta}
              </button>
              <a
                href={social.instagram}
                target="_blank"
                rel="noreferrer"
                className="type-meta text-muted-foreground underline-offset-4 hover:text-accent hover:underline transition-colors"
              >
                {social.handle}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 1s ease 1.4s" }}
        aria-hidden
      >
        <span className="type-meta text-muted-foreground/50">{t.hero.scroll}</span>
        <span
          className="animate-scroll-hint block h-8 w-px bg-accent/60"
          style={{ transformOrigin: "top" }}
        />
      </div>

      {/* Side label */}
      <div
        className="absolute bottom-12 end-8 hidden lg:block"
        style={{
          writingMode: lang === "ar" ? "horizontal-tb" : "vertical-rl",
          opacity: loaded ? 0.4 : 0,
          transition: "opacity 1.2s ease 1.6s",
        }}
        aria-hidden
      >
        <span className="type-meta text-muted-foreground tracking-[0.3em]">
          ALABAD · 2024–2026
        </span>
      </div>
    </section>
  );
}
