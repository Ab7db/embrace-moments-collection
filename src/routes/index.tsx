import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLang, LanguageProvider } from "@/lib/i18n";

import { Navigation } from "@/components/Navigation";
import { Intro } from "@/components/Intro";
import { CustomCursor } from "@/components/CustomCursor";
import { ScrollProgress } from "@/components/ScrollProgress";

import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { WorkSection } from "@/components/sections/WorkSection";
import { WorldSection } from "@/components/sections/WorldSection";
import { CommercialSection } from "@/components/sections/CommercialSection";
import { ArchiveSection } from "@/components/sections/ArchiveSection";
import { SocialSection } from "@/components/sections/SocialSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { StatsSection, Footer } from "@/components/sections/FooterSection";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function SiteHead() {
  const { lang, t } = useLang();
  useEffect(() => {
    document.title = "ALABAD — " + (lang === "ar" ? "مصوّر وصانع بصري" : "Photographer & Visual Creator");
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // Meta description
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content =
      lang === "ar"
        ? "عبدالكريم فيصل — مصوّر وصانع محتوى بصري. بورتريه، شارع، سفر، وإعلانات."
        : "AbdulKareem Faisal — Photographer & Visual Creator. Portraits, Street, Travel, Advertising.";

    // OG title
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = "ALABAD — Photographer & Visual Creator";
  }, [lang, t]);

  return null;
}

function IndexPage() {
  return (
    <LanguageProvider>
      <SiteHead />
      <CustomCursor />
      <ScrollProgress />
      <Intro />
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <WorkSection />
        <WorldSection />
        <CommercialSection />
        <ArchiveSection />
        <SocialSection />
        <StatsSection />
        <ContactSection />
      </main>
      <Footer />
    </LanguageProvider>
  );
}
