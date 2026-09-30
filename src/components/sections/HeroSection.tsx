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

  // Zero-rerender smoothed parallax via RAF and direct DOM ref
  useEffect(() => {
    if (reduced || !motionEnabled || motionStyle !== "parallax") {
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

    const onMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * -intensity;
      targetY = (e.clientY / window.innerHeight - 0.5) * -(intensity * 0.75);
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(1.06)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
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
