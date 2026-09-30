import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLang, pick } from "@/lib/i18n";
import { photos as localPhotos } from "@/data/portfolio";
import type { DbPhoto } from "@/lib/database.types";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatImgUrl } from "@/lib/utils";

/* ─── Lightbox ─────────────────────────────────────────────── */
function Lightbox({
  photo,
  onPrev,
  onNext,
  onClose,
}: {
  photo: DbPhoto;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") (lang === "ar" ? onNext : onPrev)();
      if (e.key === "ArrowRight") (lang === "ar" ? onPrev : onNext)();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, lang]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md"
      onClick={onClose}
      aria-modal
      role="dialog"
    >
      <div
        className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute end-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t.viewer.close}
        >
          <X className="h-4 w-4" />
        </button>

        <img
          src={formatImgUrl(photo.image_url)}
          alt={pick(lang, photo.title_en, photo.title_ar)}
          className="max-h-[80vh] max-w-full object-contain rounded-sm"
          style={{ animation: "fade-in .3s ease" }}
        />

        <div className="mt-4 flex w-full items-center justify-between px-2">
          <button
            onClick={onPrev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t.viewer.prev}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="font-display text-lg text-foreground">
              {pick(lang, photo.title_en, photo.title_ar)}
            </p>
            <p className="type-meta mt-1 text-muted-foreground">
              {pick(lang, photo.city_en, photo.city_ar)} · {photo.year}
            </p>
          </div>
          <button
            onClick={onNext}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t.viewer.next}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Work Section ──────────────────────────────────────────── */
export function WorkSection() {
  const { t, lang } = useLang();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    direction: lang === "ar" ? "rtl" : "ltr",
  });

  const { data: photos = localPhotos as any } = useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as DbPhoto[]) || [];
    },
  });

  const [activeFilter, setActiveFilter] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const categories = [
    lang === "ar" ? "الكل" : "All",
    ...Array.from(
      new Set<string>(
        photos.map((p: any) =>
          pick(lang, p.category_en || p.categoryEn, p.category_ar || p.categoryAr)
        )
      )
    ),
  ];

  const filtered =
    activeFilter === "All" || activeFilter === "الكل"
      ? photos
      : photos.filter(
          (p: any) =>
            pick(
              lang,
              p.category_en || p.categoryEn,
              p.category_ar || p.categoryAr
            ) === activeFilter
        );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const openAt = (idx: number) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);
  const goPrev = () =>
    setLightbox((i) =>
      i !== null ? (i - 1 + filtered.length) % filtered.length : null
    );
  const goNext = () =>
    setLightbox((i) => (i !== null ? (i + 1) % filtered.length : null));

  return (
    <section id="work" className="py-28 md:py-36 overflow-hidden">
      <div className="mx-auto max-w-[1800px] px-6 md:px-14">
        <Reveal>
          <SectionLabel>{t.work.label}</SectionLabel>
        </Reveal>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="font-display type-section text-foreground">
              {t.work.title}
            </h2>
          </Reveal>

          {/* Filter pills */}
          <Reveal delay={100}>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`rounded-sm border px-4 py-1.5 type-meta transition-colors ${
                    activeFilter === cat
                      ? "border-accent bg-accent text-background"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Hint */}
        <p className="mt-4 type-meta text-muted-foreground/50">{t.work.hint}</p>
      </div>

      {/* Carousel */}
      <div className="mt-8 relative">
        <div
          ref={emblaRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing"
        >
          <div className="flex gap-5 px-6 md:px-14">
            {filtered.map((photo: any, idx: number) => (
              <div
                key={photo.id}
                data-cursor="view"
                onClick={() => openAt(idx)}
                className={`frame-photo relative flex-none overflow-hidden rounded-sm cursor-pointer ${
                  photo.orientation === "portrait"
                    ? "w-[260px] md:w-[320px] aspect-[3/4]"
                    : "w-[380px] md:w-[520px] aspect-[16/10]"
                }`}
              >
                <img
                  src={formatImgUrl(photo.image_url || photo.image)}
                  alt={pick(
                    lang,
                    photo.title_en || photo.titleEn,
                    photo.title_ar || photo.titleAr
                  )}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Caption on bottom */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <p className="font-display text-sm text-foreground">
                    {pick(
                      lang,
                      photo.title_en || photo.titleEn,
                      photo.title_ar || photo.titleAr
                    )}
                  </p>
                  <p className="type-meta text-accent mt-0.5 text-xs">
                    {pick(
                      lang,
                      photo.city_en || photo.cityEn,
                      photo.city_ar || photo.cityAr
                    )}{" "}
                    · {photo.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3 px-6 md:px-14 mt-6 justify-end">
          <button
            onClick={scrollPrev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            aria-label={t.viewer.prev}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            aria-label={t.viewer.next}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <Lightbox
          photo={filtered[lightbox]}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </section>
  );
}
