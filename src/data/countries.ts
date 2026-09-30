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
    tagsEn: ["Photography", "Heritage"],
    tagsAr: ["تصوير", "تراث"],
  },
  {
    id: "nl",
    nameEn: "Netherlands",
    nameAr: "هولندا",
    cityEn: "Giethoorn",
    cityAr: "خيثهورن",
    lat: 52.74,
    lon: 6.08,
    cover: media.travel1,
    photoCount: 35,
    campaignCount: 3,
    tagsEn: ["Nature", "Waterways"],
    tagsAr: ["طبيعة", "قنوات مائية"],
  },
  {
    id: "jp",
    nameEn: "Japan",
    nameAr: "اليابان",
    cityEn: "Tokyo",
    cityAr: "طوكيو",
    lat: 35.68,
    lon: 139.75,
    cover: media.portrait1,
    photoCount: 28,
    campaignCount: 4,
    tagsEn: ["Street", "Night Lights"],
    tagsAr: ["شارع", "أضواء ليلية"],
  },
  {
    id: "us",
    nameEn: "United States",
    nameAr: "أمريكا",
    cityEn: "New York",
    cityAr: "نيويورك",
    lat: 40.71,
    lon: -74.00,
    cover: media.arch1,
    photoCount: 31,
    campaignCount: 5,
    tagsEn: ["Architecture", "Commercial"],
    tagsAr: ["عمارة", "إعلانات"],
  },
  {
    id: "au",
    nameEn: "Australia",
    nameAr: "أستراليا",
    cityEn: "Sydney",
    cityAr: "سيدني",
    lat: -33.86,
    lon: 151.20,
    cover: media.travel2,
    photoCount: 24,
    campaignCount: 3,
    tagsEn: ["Travel", "Ocean"],
    tagsAr: ["سفر", "شواطئ"],
  },
];

export const countryById = (id: string) => countries.find((c) => c.id === id)!;
