import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { usePointerParallax, useReducedMotion } from "@/hooks/useMotionPrefs";
import { media } from "@/data/media";
import { social } from "@/data/social";

export function HeroSection() {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const pos = usePointerParallax(!reduced);
  const [loaded, setLoaded] = useState(false);
  const [roleIdx, setRoleIdx] = useState(0);
  const rolesLen = t.hero.roles.length;

  useEffect(() => {
    const id = setInterval(() => setRoleIdx((i) => (i + 1) % rolesLen), 2800);
    return () => clearInterval(id);
  }, [rolesLen]);

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 film-grain"
        style={{
          transform: reduced
            ? undefined
            : `translate3d(${pos.x * -18}px, ${pos.y * -14}px, 0) scale(1.08)`,
          transition: "transform .12s linear",
        }}
      >
        <img
          src={media.hero}
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
              {t.hero.roles[roleIdx]}
            </p>
          </div>

          {/* Main statement */}
          <h1
            className="type-mega font-display text-foreground"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(40px)",
              transition: "opacity 1.2s var(--ease-cine) .2s, transform 1.4s var(--ease-cine) .2s",
            }}
          >
            {t.hero.statement.map((line, i) => (
              <span key={i} className="block">
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
