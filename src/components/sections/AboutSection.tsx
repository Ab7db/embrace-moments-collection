import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { stats as fallbackStats } from "@/data/stats";
import { media } from "@/data/media";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { formatImgUrl } from "@/lib/utils";
import type { DbSiteProfile, DbStat } from "@/lib/database.types";
import { Camera, MapPin } from "lucide-react";

function useCounter(target: number, active: boolean, duration = 2400) {
  const [val, setVal] = useState<number>(0);

  useEffect(() => {
    const targetNum = Number(target) || 0;
    if (!active) {
      setVal(0);
      return;
    }
    if (targetNum <= 0) {
      setVal(0);
      return;
    }

    let startTimestamp: number | null = null;

    const frame = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth luxury easeOut curve (easeOutCubic)
      const ease = 1 - Math.pow(1 - progress, 3.2);
      const current = Math.round(ease * targetNum);
      setVal(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setVal(targetNum);
      }
    };

    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [target, active, duration]);

  return val;
}

function StatCard({
  stat,
  active,
  lang,
  index = 0,
}: {
  stat: DbStat | any;
  active: boolean;
  lang: "en" | "ar";
  index?: number;
}) {
  const rawValue = typeof stat.value === "number" ? stat.value : parseInt(stat.value) || 0;
  const count = useCounter(rawValue, active, 2200 + index * 180);
  const label =
    lang === "ar"
      ? stat.label_ar || stat.labelAr || "إحصائية"
      : stat.label_en || stat.labelEn || "Stat";

  return (
    <div className="flex flex-col gap-2 border-s border-border ps-6 py-1">
      <span className="font-display text-4xl text-foreground md:text-5xl tabular-nums">
        {count}
        <span className="text-accent">{stat.suffix || ""}</span>
      </span>
      <span className="type-meta text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export function AboutSection() {
  const { t, lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const { data: profile } = useQuery<DbSiteProfile | null>({
    queryKey: ["site_profile"],
    queryFn: async () => {
      const { data } = await supabase.from("site_profile").select("*").eq("id", 1).single();
      return (data as DbSiteProfile) || null;
    },
  });

  const { data: stats } = useQuery<DbStat[]>({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await supabase.from("stats").select("*").order("id");
      if (data && data.length > 0) return data as DbStat[];
      return fallbackStats as any;
    },
    initialData: fallbackStats as any,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -30px 0px" }
    );

    io.observe(el);

    return () => {
      io.disconnect();
    };
  }, []);

  const portraitUrl = formatImgUrl(profile?.profile_image_url, media.alabad);
  const realName = profile
    ? (lang === "ar" ? profile.real_name_ar : profile.real_name_en) || profile.real_name_en || t.about.realName
    : t.about.realName;
  const roleName = profile
    ? (lang === "ar" ? profile.role_ar : profile.role_en) || profile.role_en || t.footer.role
    : t.footer.role;
  const bioText = profile
    ? (lang === "ar" ? profile.bio_ar : profile.bio_en) || profile.bio_en || t.about.bio
    : t.about.bio;
  const bio2Text = profile
    ? (lang === "ar" ? profile.bio2_ar : profile.bio2_en) || profile.bio2_en || t.about.bio2
    : t.about.bio2;
  const locationText = profile
    ? (lang === "ar" ? profile.location_ar : profile.location_en) || "Sana'a, Yemen"
    : "Sana'a, Yemen";
  const gearText = profile
    ? (lang === "ar" ? profile.gear_ar : profile.gear_en)
    : null;

  return (
    <section id="about" className="py-28 md:py-36 border-b border-border/40">
      <div className="mx-auto max-w-[1800px] px-6 md:px-14">
        <Reveal>
          <SectionLabel>{t.about.label}</SectionLabel>
        </Reveal>

        <div className="mt-14 grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24 xl:grid-cols-[1.1fr_1.2fr]">
          {/* Left: photo + name card */}
          <Reveal>
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div
                data-cursor="view"
                className="frame-photo relative aspect-[3/4] w-full overflow-hidden rounded-sm shadow-2xl bg-surface"
              >
                <img
                  src={portraitUrl}
                  alt={realName}
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 vignette pointer-events-none" />
              </div>

              {/* Floating name badge */}
              <div className="absolute -bottom-6 -end-4 bg-surface/95 backdrop-blur-md border border-border px-6 py-4 md:px-8 md:py-5 shadow-xl rounded-sm">
                <p className="font-display text-xl text-foreground font-medium">
                  {realName}
                </p>
                <p className="type-meta mt-1 text-accent text-xs">
                  {roleName}
                </p>
                <div className="flex items-center gap-1.5 mt-2 type-meta text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3 text-accent" />
                  <span>{locationText}</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: bio + gear + stats */}
          <div className="flex flex-col justify-center gap-8 pt-10 lg:pt-0">
            <Reveal>
              <h2 className="font-display type-section text-foreground leading-tight">
                {t.about.title}
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-light">
                {bioText}
              </p>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-light">
                {bio2Text}
              </p>
            </Reveal>

            {/* Gear info if present */}
            {gearText && (
              <Reveal delay={220}>
                <div className="flex items-center gap-2.5 p-3 rounded-sm bg-surface/50 border border-border/80 type-meta text-xs text-muted-foreground">
                  <Camera className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>{gearText}</span>
                </div>
              </Reveal>
            )}

            {/* Specialties/Categories */}
            <Reveal delay={250}>
              <div className="flex flex-wrap gap-2">
                {t.about.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-sm border border-border/80 bg-surface/30 px-3.5 py-1.5 type-meta text-xs text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Stats (Projects, Cities, Campaigns, Community) */}
            <div ref={ref} className="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-4 pt-6 border-t border-border/60">
              {stats.map((s: any, i: number) => (
                <Reveal key={s.id || s.label_en || s.labelEn} delay={i * 70}>
                  <StatCard stat={s} active={active} lang={lang} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
