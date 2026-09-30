import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLang, pick } from "@/lib/i18n";
import type { DbCountry, DbPhoto, DbCampaign } from "@/lib/database.types";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { Globe } from "@/components/globe/Globe";
import { useIsTouch, useMounted } from "@/hooks/useMotionPrefs";
import { X, Camera, Megaphone, ChevronLeft, ChevronRight, Eye, Sparkles, ArrowRight } from "lucide-react";
import { formatImgUrl } from "@/lib/utils";

/* ══════════════════════════════════════════
   COUNTRY DETAIL PANEL
══════════════════════════════════════════ */
function CountryPanel({
  country,
  onClose,
}: {
  country: DbCountry;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<"photos" | "campaigns">("photos");
  const [viewIdx, setViewIdx] = useState<number | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<DbCampaign | null>(null);

  // Fetch photos
  const { data: allPhotos = [] } = useQuery<DbPhoto[]>({
    queryKey: ["photos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as DbPhoto[]) || [];
    },
  });

  // Fetch campaigns
  const { data: allCampaigns = [] } = useQuery<DbCampaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as DbCampaign[]) || [];
    },
  });

  // Filter country-specific photos or fallback to curated list so drawer is always rich
  const countryPhotos = allPhotos.filter((p) => p.country === country.id);
  const displayPhotos = countryPhotos.length > 0 ? countryPhotos : allPhotos;
  const displayCampaigns = allCampaigns;

  const cityName = pick(lang, country.city_en, country.city_ar);
  const countryName = pick(lang, country.name_en, country.name_ar);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[190] bg-background/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel Drawer */}
      <div
        className="fixed end-0 top-0 bottom-0 z-[195] flex w-full max-w-lg flex-col bg-surface border-s border-border shadow-2xl overflow-y-auto"
        style={{ animation: "slide-in-right .45s var(--ease-cine) forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-surface/95 backdrop-blur-md px-6 py-5">
          <div>
            <p className="type-meta text-accent flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              {cityName}
            </p>
            <h3 className="font-display text-2xl text-foreground mt-1">
              {countryName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors mt-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cover image banner */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={formatImgUrl(country.cover_url)}
            alt={countryName}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
          <div className="absolute bottom-3 start-6 end-6 flex items-center justify-between">
            <span className="type-meta text-xs text-foreground/80 bg-background/70 backdrop-blur-md px-2.5 py-1 rounded-sm border border-border/60">
              {country.lat.toFixed(2)}° N · {country.lon.toFixed(2)}° E
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(lang === "ar" ? country.tags_ar || [] : country.tags_en || []).slice(0, 2).map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-sm bg-accent/15 border border-accent/30 px-2 py-0.5 type-meta text-accent text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Tabs: Photos & Campaigns */}
        <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`flex flex-col items-start px-6 py-3.5 transition-all text-start relative ${
              activeTab === "photos"
                ? "bg-surface text-accent"
                : "bg-surface/50 text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2 type-meta text-xs font-semibold mb-1">
              <Camera className="h-3.5 w-3.5" />
              <span>{t.world.photos}</span>
            </div>
            <p className="font-display text-2xl text-foreground">
              {displayPhotos.length || country.photo_count}
            </p>
            {activeTab === "photos" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-accent" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("campaigns")}
            className={`flex flex-col items-start px-6 py-3.5 transition-all text-start relative ${
              activeTab === "campaigns"
                ? "bg-surface text-accent"
                : "bg-surface/50 text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2 type-meta text-xs font-semibold mb-1">
              <Megaphone className="h-3.5 w-3.5" />
              <span>{t.world.campaigns}</span>
            </div>
            <p className="font-display text-2xl text-foreground">
              {displayCampaigns.length || country.campaign_count}
            </p>
            {activeTab === "campaigns" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>

        {/* Tab Content: Photos Gallery */}
        {activeTab === "photos" && (
          <div className="flex-1 px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="type-meta text-xs text-muted-foreground uppercase tracking-wider">
                {lang === "ar" ? "معرض الأعمال في هذه المنطقة" : "Portfolio Works in this Location"}
              </p>
              <span className="type-meta text-xs text-accent">
                {displayPhotos.length} {lang === "ar" ? "أعمال" : "items"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {displayPhotos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setViewIdx(i)}
                  className="group relative aspect-square overflow-hidden rounded-sm border border-border/80 bg-surface hover:border-accent/60 transition-all text-start"
                >
                  <img
                    src={formatImgUrl(p.image_url)}
                    alt={pick(lang, p.title_en, p.title_ar)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                    <p className="font-display text-xs text-white line-clamp-1">
                      {pick(lang, p.title_en, p.title_ar)}
                    </p>
                    <p className="type-meta text-[10px] text-accent mt-0.5">
                      {pick(lang, p.category_en, p.category_ar)}
                    </p>
                  </div>
                  <div className="absolute top-1.5 end-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                      <Eye className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Campaigns List */}
        {activeTab === "campaigns" && (
          <div className="flex-1 px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="type-meta text-xs text-muted-foreground uppercase tracking-wider">
                {lang === "ar" ? "الحملات التجارية والمشاريع" : "Commercial Campaigns & Projects"}
              </p>
              <span className="type-meta text-xs text-accent">
                {displayCampaigns.length} {lang === "ar" ? "حملات" : "campaigns"}
              </span>
            </div>

            <div className="space-y-4">
              {displayCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaign(camp)}
                  className="group relative cursor-pointer overflow-hidden rounded-sm border border-border bg-surface hover:border-accent/60 transition-all p-3"
                >
                  <div className="flex gap-4">
                    <div className="relative h-24 w-28 flex-none overflow-hidden rounded-sm border border-border/80">
                      <img
                        src={formatImgUrl(camp.cover_url)}
                        alt={pick(lang, camp.title_en, camp.title_ar)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-1 start-1 rounded bg-black/70 px-1.5 py-0.5 type-meta text-[9px] text-accent font-semibold backdrop-blur-sm">
                        {camp.no}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="type-meta text-[11px] text-accent font-medium truncate">
                            {camp.client}
                          </span>
                          <span className="type-meta text-[10px] text-muted-foreground/60 flex-none">
                            {camp.year}
                          </span>
                        </div>
                        <h4 className="font-display text-sm text-foreground group-hover:text-accent transition-colors truncate mt-0.5">
                          {pick(lang, camp.title_en, camp.title_ar)}
                        </h4>
                        <p className="type-meta text-xs text-muted-foreground line-clamp-2 mt-1">
                          {pick(lang, camp.description_en, camp.description_ar)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-2">
                        <span className="type-meta text-[11px] text-muted-foreground">
                          {pick(lang, camp.category_en, camp.category_ar)}
                        </span>
                        <span className="flex items-center gap-1 type-meta text-xs text-accent font-medium">
                          {lang === "ar" ? "عرض التفاصيل" : "View"}
                          <ArrowRight className={`h-3 w-3 ${lang === "ar" ? "rotate-180" : ""}`} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-border bg-surface/80 flex items-center justify-between text-xs text-muted-foreground/60">
          <span>ALABAD Portfolio Collection</span>
          <span>{countryName}</span>
        </div>
      </div>

      {/* Lightbox for Photos */}
      {viewIdx !== null && displayPhotos[viewIdx] && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-background/95 backdrop-blur-lg p-4"
          onClick={() => setViewIdx(null)}
        >
          <div
            className="relative flex max-w-4xl w-full flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewIdx(null)}
              className="absolute end-0 -top-12 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground bg-surface/80 backdrop-blur-md"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-sm border border-border bg-black/40">
              <img
                key={viewIdx}
                src={formatImgUrl(displayPhotos[viewIdx].image_url)}
                alt={pick(lang, displayPhotos[viewIdx].title_en, displayPhotos[viewIdx].title_ar)}
                className="max-h-[72vh] max-w-full object-contain"
                style={{ animation: "fade-in .25s ease" }}
              />
            </div>
            <div className="flex items-center justify-between w-full px-2">
              <button
                onClick={() =>
                  setViewIdx(
                    (i) => ((i ?? 0) - 1 + displayPhotos.length) % displayPhotos.length
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-accent hover:border-accent/40 bg-surface/80 backdrop-blur-md transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="font-display text-lg text-foreground">
                  {pick(
                    lang,
                    displayPhotos[viewIdx].title_en,
                    displayPhotos[viewIdx].title_ar
                  )}
                </p>
                <p className="type-meta text-muted-foreground mt-0.5 text-xs">
                  {pick(lang, displayPhotos[viewIdx].category_en, displayPhotos[viewIdx].category_ar)} · {displayPhotos[viewIdx].year}
                </p>
              </div>
              <button
                onClick={() =>
                  setViewIdx((i) => ((i ?? 0) + 1) % displayPhotos.length)
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-accent hover:border-accent/40 bg-surface/80 backdrop-blur-md transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-[310] flex items-center justify-center bg-background/95 backdrop-blur-lg p-4 md:p-8 overflow-y-auto"
          onClick={() => setSelectedCampaign(null)}
        >
          <div
            className="relative w-full max-w-3xl my-auto bg-surface border border-border rounded-sm shadow-2xl p-6 md:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fade-in .25s ease" }}
          >
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="type-meta text-xs text-accent font-semibold tracking-wider uppercase">
                  {selectedCampaign.no} · {selectedCampaign.client}
                </span>
                <h3 className="font-display text-2xl md:text-3xl text-foreground mt-1">
                  {pick(lang, selectedCampaign.title_en, selectedCampaign.title_ar)}
                </h3>
                <p className="type-meta text-xs text-muted-foreground mt-1">
                  {pick(lang, selectedCampaign.category_en, selectedCampaign.category_ar)} · {selectedCampaign.year}
                </p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Campaign Description */}
            <p className="text-foreground/90 font-sans leading-relaxed text-sm md:text-base">
              {pick(lang, selectedCampaign.description_en, selectedCampaign.description_ar)}
            </p>

            {/* Main Cover & Gallery */}
            <div className="space-y-3">
              <p className="type-meta text-xs text-accent font-semibold tracking-wider">
                {lang === "ar" ? "معرض صور الحملة" : "Campaign Gallery"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[selectedCampaign.cover_url, ...(selectedCampaign.gallery_urls || [])].map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-[4/3] rounded-sm overflow-hidden border border-border/80 group relative bg-black/30"
                  >
                    <img
                      src={formatImgUrl(url)}
                      alt="Gallery"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Behind the scenes if available */}
            {selectedCampaign.bts_urls && selectedCampaign.bts_urls.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="type-meta text-xs text-muted-foreground font-semibold tracking-wider">
                  {lang === "ar" ? "كواليس العمل (Behind The Scenes)" : "Behind The Scenes"}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedCampaign.bts_urls.map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-sm overflow-hidden border border-border/60 bg-black/30"
                    >
                      <img
                        src={formatImgUrl(url)}
                        alt="BTS"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   MOBILE CARD FALLBACK
══════════════════════════════════════════ */
function CountryCards({
  onSelect,
  countries,
}: {
  onSelect: (c: DbCountry) => void;
  countries: DbCountry[];
}) {
  const { lang } = useLang();
  return (
    <div className="grid grid-cols-2 gap-3">
      {countries.map((country, i) => (
        <Reveal key={country.id} delay={i * 80}>
          <div
            onClick={() => onSelect(country)}
            className="frame-photo group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-sm"
          >
            <img
              src={formatImgUrl(country.cover_url)}
              alt={pick(lang, country.name_en, country.name_ar)}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-3">
              <p className="font-display text-sm text-foreground">
                {pick(lang, country.city_en, country.city_ar)}
              </p>
              <p className="type-meta text-accent mt-0.5 text-xs">
                {pick(lang, country.name_en, country.name_ar)}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN WORLD SECTION
══════════════════════════════════════════ */
export function WorldSection() {
  const { t } = useLang();
  const isTouch = useIsTouch();
  const mounted = useMounted();

  const { data: countries = [] } = useQuery<DbCountry[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("countries")
        .select("*")
        .order("name_en");
      return (data as DbCountry[]) || [];
    },
  });

  const [activeCountry, setActiveCountry] = useState<DbCountry | null>(null);

  return (
    <section id="world" className="relative py-28 md:py-36 overflow-hidden">
      <div className="mx-auto max-w-[1800px] px-6 md:px-14">
        <Reveal>
          <SectionLabel>{t.world.label}</SectionLabel>
        </Reveal>

        <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Reveal>
            <h2 className="font-display type-section text-foreground">
              {t.world.title}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="type-meta text-muted-foreground/60 max-w-xs">
              {t.world.hint}
            </p>
          </Reveal>
        </div>

        {/* Interactive 3D Globe on all devices (Mobile & Desktop) */}
        <div className="mt-12">
          {mounted ? (
            <div className="relative h-[480px] sm:h-[580px] md:h-[680px] w-full rounded-sm overflow-hidden border border-border/50 bg-background/50 shadow-2xl">
              <Globe
                countries={countries}
                onSelectCountry={(c) => setActiveCountry(c)}
                height="100%"
              />
            </div>
          ) : (
            <div className="h-[480px] w-full bg-surface/30 animate-pulse rounded-sm" />
          )}
        </div>
      </div>

      {activeCountry && (
        <CountryPanel
          country={activeCountry}
          onClose={() => setActiveCountry(null)}
        />
      )}
    </section>
  );
}
