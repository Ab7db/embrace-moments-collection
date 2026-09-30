import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLang, pick } from "@/lib/i18n";
import { campaigns as localCampaigns } from "@/data/campaigns";
import type { DbCampaign } from "@/lib/database.types";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatImgUrl } from "@/lib/utils";

function CampaignModal({
  campaign,
  onClose,
}: {
  campaign: DbCampaign;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<"gallery" | "bts">("gallery");
  const [imgIdx, setImgIdx] = useState(0);
  const images =
    tab === "gallery"
      ? campaign.gallery_urls || []
      : campaign.bts_urls || [];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/90 backdrop-blur-lg" />
      <div
        className="relative z-10 flex h-full w-full max-w-4xl flex-col bg-surface border-x border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "fade-in .4s var(--ease-cine)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5 sticky top-0 bg-surface/90 backdrop-blur-md z-10">
          <div>
            <p className="type-meta text-accent">{campaign.no}</p>
            <h3 className="font-display text-xl text-foreground mt-0.5">
              {pick(lang, campaign.title_en, campaign.title_ar)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 p-6 md:p-10 space-y-8">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 border border-border rounded-sm p-5">
            <div>
              <p className="type-meta text-muted-foreground">{t.commercial.client}</p>
              <p className="mt-1 text-foreground">{campaign.client}</p>
            </div>
            <div>
              <p className="type-meta text-muted-foreground">{t.commercial.year}</p>
              <p className="mt-1 text-foreground">{campaign.year}</p>
            </div>
            <div>
              <p className="type-meta text-muted-foreground">
                {t.commercial.client === "Client" ? "Category" : "التصنيف"}
              </p>
              <p className="mt-1 text-foreground text-sm">
                {pick(lang, campaign.category_en, campaign.category_ar)}
              </p>
            </div>
          </div>

          {/* Brief */}
          {(campaign.description_en || campaign.description_ar) && (
            <div>
              <p className="type-meta text-muted-foreground mb-3">{t.commercial.brief}</p>
              <p className="text-muted-foreground leading-relaxed">
                {pick(lang, campaign.description_en, campaign.description_ar)}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div>
            <div className="flex gap-4 border-b border-border mb-6">
              {(["gallery", "bts"] as const).map((tb) => (
                <button
                  key={tb}
                  onClick={() => {
                    setTab(tb);
                    setImgIdx(0);
                  }}
                  className={`pb-3 type-meta transition-colors ${
                    tab === tb
                      ? "text-accent border-b border-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tb === "gallery" ? t.commercial.gallery : t.commercial.bts}
                </button>
              ))}
            </div>

            {/* Image viewer */}
            <div className="relative aspect-video overflow-hidden rounded-sm bg-surface-2 border border-border">
              {images[imgIdx] && (
                <img
                  key={images[imgIdx]}
                  src={formatImgUrl(images[imgIdx])}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ animation: "fade-in .4s ease" }}
                />
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setImgIdx((i) => (i - 1 + images.length) % images.length)
                    }
                    className="absolute start-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/60 text-foreground hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setImgIdx((i) => (i + 1) % images.length)
                    }
                    className="absolute end-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/60 text-foreground hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === imgIdx ? "w-6 bg-accent" : "w-2 bg-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommercialSection() {
  const { t, lang } = useLang();

  const { data: campaigns = localCampaigns as any } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as DbCampaign[]) || [];
    },
  });

  const [open, setOpen] = useState<string | null>(null);
  const openCampaign = campaigns.find((c: any) => c.id === open);

  return (
    <section id="commercial" className="py-28 md:py-36">
      <div className="mx-auto max-w-[1800px] px-6 md:px-14">
        <Reveal>
          <SectionLabel>{t.commercial.label}</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-10 font-display type-section text-foreground">
            {t.commercial.title}
          </h2>
        </Reveal>

        {/* Campaign cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {campaigns.map((c: any, i: number) => (
            <Reveal key={c.id} delay={i * 100}>
              <div
                data-cursor="view"
                onClick={() => setOpen(c.id)}
                className="frame-photo group relative cursor-pointer overflow-hidden rounded-sm bg-surface"
              >
                {/* Cover */}
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={formatImgUrl(c.cover_url || c.cover)}
                    alt={pick(lang, c.title_en, c.title_ar)}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Gradient + info */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 space-y-1">
                  <p className="type-meta text-accent">{c.no}</p>
                  <h3 className="font-display text-xl text-foreground">
                    {pick(lang, c.title_en, c.title_ar)}
                  </h3>
                  <p className="type-meta text-muted-foreground">
                    {pick(lang, c.category_en, c.category_ar)} · {c.year}
                  </p>
                  <button className="mt-3 type-meta text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center gap-1">
                    {t.commercial.open} →
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {openCampaign && (
        <CampaignModal campaign={openCampaign} onClose={() => setOpen(null)} />
      )}
    </section>
  );
}
