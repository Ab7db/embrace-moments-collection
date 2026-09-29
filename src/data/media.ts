/**
 * Centralized placeholder media references.
 * Replace the imported files in src/assets with the real photographs and
 * every section of the site updates automatically.
 */
import portraitAlabad from "@/assets/alabad-portrait.jpg.asset.json";
import phHero from "@/assets/ph-hero.jpg";
import phPortrait1 from "@/assets/ph-portrait-1.jpg";
import phPortrait2 from "@/assets/ph-portrait-2.jpg";
import phStreet1 from "@/assets/ph-street-1.jpg";
import phTravel1 from "@/assets/ph-travel-1.jpg";
import phTravel2 from "@/assets/ph-travel-2.jpg";
import phArch1 from "@/assets/ph-arch-1.jpg";
import phCommercial1 from "@/assets/ph-commercial-1.jpg";
import phLifestyle1 from "@/assets/ph-lifestyle-1.jpg";
import phCampaign1 from "@/assets/ph-campaign-1.jpg";
import phCampaign2 from "@/assets/ph-campaign-2.jpg";

export const media = {
  hero: phHero,
  alabad: portraitAlabad.url,
  portrait1: phPortrait1,
  portrait2: phPortrait2,
  street1: phStreet1,
  travel1: phTravel1,
  travel2: phTravel2,
  arch1: phArch1,
  commercial1: phCommercial1,
  lifestyle1: phLifestyle1,
  campaign1: phCampaign1,
  campaign2: phCampaign2,
} as const;

export type MediaKey = keyof typeof media;
