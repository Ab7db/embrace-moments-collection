import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";
import { social as localSocial, reels } from "@/data/social";
import type { DbSiteProfile, DbSocialPost } from "@/lib/database.types";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { Instagram } from "lucide-react";
import { formatImgUrl } from "@/lib/utils";

export function SocialSection() {
  const { t, lang } = useLang();

  const { data: profile } = useQuery({
    queryKey: ["site_profile"],
    queryFn: async () => {
      const { data } = await supabase.from("site_profile").select("*").single();
      return (data as DbSiteProfile) || null;
    },
  });

  const { data: posts = [] } = useQuery<DbSocialPost[]>({
    queryKey: ["social_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("display_order", { ascending: true });
      if (error || !data || data.length === 0) {
        return reels.map((r, i) => ({
          id: r.id,
          image_url: r.image,
          caption_en: r.captionEn,
          caption_ar: r.captionAr,
          post_url: localSocial.instagram,
          display_order: i + 1,
          created_at: new Date().toISOString(),
        }));
      }
      return data as DbSocialPost[];
    },
    initialData: reels.map((r, i) => ({
      id: r.id,
      image_url: r.image,
      caption_en: r.captionEn,
      caption_ar: r.captionAr,
      post_url: localSocial.instagram,
      display_order: i + 1,
      created_at: new Date().toISOString(),
    })),
  });

  const ig = profile?.instagram || localSocial.instagram;
  const handle = profile?.instagram?.split("/").filter(Boolean).pop()
    ? `@${profile.instagram.split("/").filter(Boolean).pop()}`
    : localSocial.handle;

  return (
    <section id="social" className="py-28 md:py-36 bg-surface/30 overflow-hidden border-b border-border/30">
      <div className="mx-auto max-w-[1800px] px-6 md:px-14">
        <Reveal>
          <SectionLabel>{t.social.label}</SectionLabel>
        </Reveal>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="font-display type-section text-foreground">{t.social.title}</h2>
          </Reveal>
          <Reveal delay={80}>
            <a
              href={ig}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-sm border border-accent/60 px-6 py-3 type-meta text-accent hover:bg-accent hover:text-background transition-all duration-400 font-medium"
            >
              <Instagram className="h-4 w-4" />
              {t.social.cta}
            </a>
          </Reveal>
        </div>

        {/* Reels / Social Grid */}
        <div className="mt-12 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-5">
          {posts.map((post, i) => {
            const caption =
              lang === "ar"
                ? post.caption_ar || post.caption_en || "منشور إنستغرام"
                : post.caption_en || post.caption_ar || "Instagram Reel";
            const postUrl = post.post_url || ig;
            const imgSrc = formatImgUrl(post.image_url);

            return (
              <Reveal key={post.id || i} delay={i * 70}>
                <a
                  href={postUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="view"
                  className="frame-photo group relative aspect-[9/16] overflow-hidden rounded-sm block bg-surface"
                >
                  <img
                    src={imgSrc}
                    alt={caption}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  
                  {/* Center Instagram Icon Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/40 bg-background/50 backdrop-blur-md text-accent group-hover:scale-110 transition-transform">
                      <Instagram className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Caption on Bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <p className="type-meta text-xs text-foreground font-medium line-clamp-2">
                      {caption}
                    </p>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>

        {/* Handle link */}
        <Reveal delay={200}>
          <div className="mt-8 flex items-center gap-3">
            <Instagram className="h-4 w-4 text-accent" />
            <a
              href={ig}
              target="_blank"
              rel="noreferrer"
              className="type-meta text-muted-foreground hover:text-accent transition-colors text-sm font-mono"
            >
              {handle}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
