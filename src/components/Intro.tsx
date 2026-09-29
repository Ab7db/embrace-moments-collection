import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/useMotionPrefs";

const KEY = "alabad-intro-seen";

/** Short aperture-style intro. Runs once per browser session. */
export function Intro() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const [state, setState] = useState<"pending" | "playing" | "done">("pending");

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
    }, 2100);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  if (state !== "playing") return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-background"
      style={{ animation: "fade-out .5s var(--ease-cine) 1.6s forwards" }}
      aria-hidden
    >
      <div className="relative overflow-hidden px-6 text-center">
        <div className="animate-aperture">
          <h1 className="type-display tracking-[0.2em] text-foreground">
            {t.intro.name}
          </h1>
          <p className="type-meta mt-4 text-accent">{t.intro.tagline}</p>
        </div>
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
