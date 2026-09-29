import { media } from "./media";

/**
 * PLACEHOLDER portfolio locations (not a record of travel).
 * lat/lon in degrees — used to place globe markers.
 */
export interface Country {
  id: string;
  nameEn: string;
  nameAr: string;
  cityEn: string;
  cityAr: string;
  lat: number;
  lon: number;
  cover: string;
  photoCount: number;
  campaignCount: number;
  tagsEn: string[];
  tagsAr: string[];
}

export const countries: Country[] = [
  {
    id: "ye",
    nameEn: "Yemen",
    nameAr: "اليمن",
    cityEn: "Sana'a",
    cityAr: "صنعاء",
    lat: 15.36,
    lon: 44.19,
    cover: media.hero,
    photoCount: 42,
    campaignCount: 6,
    tagsEn: ["Photography", "Advertising"],
    tagsAr: ["تصوير", "إعلانات"],
  },
  {
    id: "sa",
    nameEn: "Saudi Arabia",
    nameAr: "السعودية",
    cityEn: "Riyadh",
    cityAr: "الرياض",
    lat: 24.71,
    lon: 46.67,
    cover: media.travel1,
    photoCount: 28,
    campaignCount: 4,
    tagsEn: ["Travel", "Campaigns"],
    tagsAr: ["سفر", "حملات"],
  },
  {
    id: "ae",
    nameEn: "United Arab Emirates",
    nameAr: "الإمارات",
    cityEn: "Dubai",
    cityAr: "دبي",
    lat: 25.2,
    lon: 55.27,
    cover: media.arch1,
    photoCount: 34,
    campaignCount: 8,
    tagsEn: ["Commercial", "Architecture"],
    tagsAr: ["تجاري", "عمارة"],
  },
  {
    id: "eg",
    nameEn: "Egypt",
    nameAr: "مصر",
    cityEn: "Cairo",
    cityAr: "القاهرة",
    lat: 30.04,
    lon: 31.24,
    cover: media.travel2,
    photoCount: 19,
    campaignCount: 2,
    tagsEn: ["Street", "Portraits"],
    tagsAr: ["شارع", "بورتريه"],
  },
];

export const countryById = (id: string) => countries.find((c) => c.id === id)!;
