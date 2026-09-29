import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { social } from "@/data/social";

const sections = [
  { id: "home", key: "home" },
  { id: "about", key: "about" },
  { id: "work", key: "work" },
  { id: "world", key: "world" },
  { id: "commercial", key: "commercial" },
  { id: "contact", key: "contact" },
] as const;

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`flex items-center gap-1 ${compact ? "text-sm" : "type-meta"}`}
    >
      {(["en", "ar"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i === 1 && <span className="text-muted-foreground/50">/</span>}
          <button
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`px-1 py-1 transition-colors ${
              lang === l
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

export function Navigation() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-colors duration-500 ${
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto grid max-w-[1800px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 md:px-10">
          <button
            onClick={() => go("home")}
            className="min-w-0 text-start"
            aria-label="ALABAD — home"
          >
            <span className="font-display text-xl tracking-[0.3em] text-foreground md:text-2xl">
              ALABAD
            </span>
          </button>

          <div className="flex items-center gap-6">
            <ul className="hidden items-center gap-7 lg:flex">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => go(s.id)}
                    className="group relative type-meta text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span
                      className={active === s.id ? "text-foreground" : undefined}
                    >
                      {t.nav[s.key]}
                    </span>
                    <span
                      className="absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-500"
                      style={{ width: active === s.id ? "100%" : "0%" }}
                    />
                  </button>
                </li>
              ))}
            </ul>

            <span className="hidden h-4 w-px bg-border lg:block" />
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            <button
              onClick={() => setOpen(true)}
              className="type-meta flex h-11 items-center gap-2 text-foreground lg:hidden"
              aria-label={t.nav.menu}
            >
              {t.nav.menu}
              <span className="flex flex-col gap-1">
                <span className="block h-px w-6 bg-foreground" />
                <span className="block h-px w-4 bg-accent" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Fullscreen mobile menu */}
      <div
        className={`fixed inset-0 z-[80] flex flex-col bg-background transition-[opacity,clip-path] duration-700 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{
          clipPath: open ? "circle(140% at 50% 0%)" : "circle(0% at 90% 0%)",
          transitionTimingFunction: "var(--ease-cine)",
        }}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <span className="font-display text-xl tracking-[0.3em]">ALABAD</span>
          <button
            onClick={() => setOpen(false)}
            className="type-meta h-11 px-2 text-accent"
          >
            {t.nav.close}
          </button>
        </div>

        <ul className="flex flex-1 flex-col justify-center gap-2 px-6">
          {sections.map((s, i) => (
            <li key={s.id}>
              <button
                onClick={() => go(s.id)}
                className="block w-full py-3 text-start"
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? "none" : "translateY(18px)",
                  transition: `all .6s var(--ease-cine) ${120 + i * 60}ms`,
                }}
              >
                <span className="font-display type-section text-foreground">
                  {t.nav[s.key]}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-border px-6 py-6">
          <LanguageSwitcher compact />
          <a
            href={social.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="type-meta flex items-center gap-2 text-muted-foreground"
          >
            <Instagram className="h-4 w-4" aria-hidden />
            {social.handle}
          </a>
        </div>
      </div>
    </>
  );
}

export { LanguageSwitcher };
