import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLang, pick } from "@/lib/i18n";
import { photos as localPhotos } from "@/data/portfolio";
import type { DbPhoto } from "@/lib/database.types";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatImgUrl } from "@/lib/utils";

function Lightbox({
  photos: list,
  idx,
  onClose,
  onNav,
}: {
  photos: DbPhoto[];
  idx: number;
  onClose: () => void;
  onNav: (dir: 1 | -1) => void;
}) {
  const { t, lang } = useLang();
  const photo = list[idx];
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/96 backdrop-blur-lg"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <img
          key={idx}
          src={formatImgUrl(photo.image_url || (photo as any).image)}
          alt={pick(lang, photo.title_en, photo.title_ar)}
          className="max-h-[78vh] max-w-full object-contain rounded-sm"
          style={{ animation: "fade-in .25s ease" }}
        />

        {/* Bottom bar */}
        <div className="mt-5 flex w-full max-w-xl items-center justify-between">
          <button
            onClick={() => onNav(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="font-display text-base text-foreground">
              {pick(lang, photo.title_en, photo.title_ar)}
            </p>
            <p className="type-meta text-muted-foreground mt-1">
              {pick(lang, photo.city_en, photo.city_ar)} · {photo.year} ·{" "}
              {pick(lang, photo.category_en, photo.category_ar)}
            </p>
          </div>
          <button
            onClick={() => onNav(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-accent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 type-meta text-muted-foreground/40">
          {idx + 1} / {list.length}
        </p>
      </div>
    </div>
  );
}

export function ArchiveSection() {
  const { t, lang } = useLang();

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

  const [lightbox, setLightbox] = useState<number | null>(null);

  const open = (idx: number) => setLightbox(idx);
  const close = () => setLightbox(null);
  const nav = (dir: 1 | -1) =>
    setLightbox((i) =>
      i !== null ? (i + dir + photos.length) % photos.length : null
    );

  // Split into 3 columns for masonry
  const col1 = photos.filter((_: any, i: number) => i % 3 === 0);
  const col2 = photos.filter((_: any, i: number) => i % 3 === 1);
  const col3 = photos.filter((_: any, i: number) => i % 3 === 2);

  const getIdx = (photo: any) => photos.findIndex((p: any) => p.id === photo.id);

  return (
    <section id="archive" className="py-28 md:py-36 bg-surface/20">
      <div className="mx-auto max-w-[1800px] px-6 md:px-14">
        <Reveal>
          <SectionLabel>{t.wall.label}</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-10 font-display type-section text-foreground">
            {t.wall.title}
          </h2>
        </Reveal>

        {/* Masonry Grid */}
        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
          {[col1, col2, col3].map((col, ci) => (
            <div key={ci} className="flex flex-col gap-3 lg:gap-4">
              {col.map((photo: any, i: number) => (
                <Reveal key={photo.id} delay={i * 60}>
                  <div
                    data-cursor="view"
                    onClick={() => open(getIdx(photo))}
                    className={`frame-photo group relative cursor-pointer overflow-hidden rounded-sm ${
                      photo.orientation === "portrait"
                        ? "aspect-[3/4]"
                        : "aspect-[4/3]"
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
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors duration-500" />
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="font-display text-sm text-foreground">
                        {pick(
                          lang,
                          photo.title_en || photo.titleEn,
                          photo.title_ar || photo.titleAr
                        )}
                      </p>
                      <p className="type-meta text-accent mt-0.5">{photo.year}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox photos={photos} idx={lightbox} onClose={close} onNav={nav} />
      )}
    </section>
  );
}
