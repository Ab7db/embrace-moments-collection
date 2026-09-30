import { useEffect, useState } from "react";
import { useLang, pick } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/useMotionPrefs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { DbSiteProfile } from "@/lib/database.types";
import { media } from "@/data/media";
import { formatImgUrl } from "@/lib/utils";

const KEY = "alabad-intro-seen";

/** Aperture-style intro with photographer profile image and name on website launch. */
export function Intro() {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const [state, setState] = useState<"pending" | "playing" | "done">("pending");

  // Fetch live site profile
  const { data: profile } = useQuery<DbSiteProfile | null>({
    queryKey: ["site_profile_intro"],
    queryFn: async () => {
      const { data } = await supabase.from("site_profile").select("*").limit(1).maybeSingle();
      return (data as DbSiteProfile) || null;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const seen = window.sessionStorage.getItem(KEY);
    if (seen || reduced) {
      setState("done");
      return;
    }
    setState("playing");
    window.sessionStorage.setItem(KEY, "1");
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      setState("done");
      document.body.style.overflow = "";
    }, 2500);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  if (state !== "playing") return null;

  const profileImg = formatImgUrl(profile?.profile_image_url) || media.alabad;
  const photographerName =
    lang === "ar"
      ? profile?.real_name_ar || "العباد ALABAD"
      : profile?.real_name_en || "ALABAD";
  const photographerRole =
    pick(lang, profile?.role_en, profile?.role_ar) || t.intro.tagline;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-background/98 backdrop-blur-xl"
      style={{ animation: "fade-out .6s var(--ease-cine) 2.0s forwards" }}
      aria-hidden
    >
      <div className="relative flex flex-col items-center justify-center px-6 text-center max-w-sm">
        {/* Profile photo with glowing cinematic lens ring */}
        <div className="relative mb-6">
          <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden border-2 border-accent/60 shadow-[0_0_30px_rgba(196,154,69,0.35)] animate-aperture p-1 bg-gradient-to-tr from-accent/40 via-background to-accent/20">
            <img
              src={profileImg}
              alt="ALABAD"
              className="h-full w-full object-cover rounded-full filter brightness-95 contrast-105"
            />
          </div>
          {/* Subtle pulsating gold ring */}
          <div className="absolute -inset-1.5 rounded-full border border-accent/30 animate-ping opacity-25 pointer-events-none" />
        </div>

        {/* Name and Tagline */}
        <div className="animate-aperture space-y-2">
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-[0.25em] text-foreground uppercase">
            {photographerName}
          </h1>
          <p className="type-meta text-xs md:text-sm text-accent tracking-widest uppercase mt-1">
            {photographerRole}
          </p>
        </div>

        {/* Light sweep lens flare */}
        <span
          className="animate-light-sweep pointer-events-none absolute inset-y-0 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.78 0.065 78 / .35), transparent)",
          }}
        />
      </div>
    </div>
  );
}
