import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { social as localSocial } from "@/data/social";
import { stats as fallbackStats } from "@/data/stats";
import type { DbSiteProfile, DbStat } from "@/lib/database.types";
import { Reveal, SectionLabel } from "@/components/Reveal";

export function StatsSection() {
  const { t, lang } = useLang();

  const { data: stats = fallbackStats as any } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await supabase.from("stats").select("*").order("id");
      return data && data.length > 0 ? (data as DbStat[]) : fallbackStats;
    },
    initialData: fallbackStats,
  });

  return (
    <section className="py-20 md:py-28 border-y border-border">
      <div className="mx-auto max-w-[1800px] px-6 md:px-14">
        <Reveal>
          <SectionLabel>{t.stats.label}</SectionLabel>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s: any, i: number) => (
            <Reveal key={s.id || s.label_en || s.labelEn || i} delay={i * 80}>
              <div className="text-center">
                <p className="font-display text-5xl text-foreground md:text-6xl">
                  {s.value}
                  <span className="text-accent">{s.suffix}</span>
                </p>
                <p className="type-meta mt-2 text-muted-foreground">
                  {lang === "ar"
                    ? s.label_ar || s.labelAr
                    : s.label_en || s.labelEn}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <p className="mt-6 type-meta text-center text-muted-foreground/40">
            {t.stats.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const { t, lang } = useLang();
  const year = new Date().getFullYear();

  const { data: profile } = useQuery({
    queryKey: ["site_profile"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_profile")
        .select("*")
        .single();
      return (data as DbSiteProfile) || null;
    },
  });

  const ig = profile?.instagram || localSocial.instagram;
  const email = profile?.email || localSocial.email;
  const wa = profile?.whatsapp || localSocial.whatsapp;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1800px] px-6 md:px-14">
        {/* Top footer */}
        <div className="flex flex-wrap items-center justify-between gap-6 py-10">
          <div>
            <span className="font-display text-2xl tracking-[0.3em] text-foreground">
              ALABAD
            </span>
            <p className="type-meta mt-1 text-muted-foreground">
              {profile
                ? lang === "ar"
                  ? profile.role_ar
                  : profile.role_en
                : t.footer.role}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={ig}
              target="_blank"
              rel="noreferrer"
              className="type-meta text-muted-foreground hover:text-accent transition-colors"
            >
              Instagram
            </a>
            <a
              href={`mailto:${email}`}
              className="type-meta text-muted-foreground hover:text-accent transition-colors"
            >
              Email
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="type-meta text-muted-foreground hover:text-accent transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-6 type-meta text-muted-foreground/50">
          <p>
            © {year} ALABAD. {t.footer.rights}
          </p>
          <div className="flex items-center gap-6">
            <span>{lang === "ar" ? "صُنع برؤية سينمائية" : "Crafted with cinematic vision"}</span>
            <span>·</span>
            <span>{profile ? (lang === "ar" ? profile.location_ar : profile.location_en) : "Sana'a, Yemen"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
