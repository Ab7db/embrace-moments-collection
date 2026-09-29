import { media } from "./media";

export type Orientation = "portrait" | "landscape";

export interface Photo {
  id: string;
  titleEn: string;
  titleAr: string;
  country: string; // country id
  cityEn: string;
  cityAr: string;
  year: string;
  categoryEn: string;
  categoryAr: string;
  image: string;
  orientation: Orientation;
  coords?: string;
}

/** PLACEHOLDER photography data — replace with real projects. */
export const photos: Photo[] = [
  {
    id: "p1",
    titleEn: "Old City Light",
    titleAr: "ضوء المدينة القديمة",
    country: "ye",
    cityEn: "Sana'a",
    cityAr: "صنعاء",
    year: "2025",
    categoryEn: "Travel",
    categoryAr: "سفر",
    image: media.hero,
    orientation: "landscape",
    coords: "15.3694° N",
  },
  {
    id: "p2",
    titleEn: "Keeper of the Alley",
    titleAr: "حارس الحارة",
    country: "ye",
    cityEn: "Sana'a",
    cityAr: "صنعاء",
    year: "2025",
    categoryEn: "Portraits",
    categoryAr: "بورتريه",
    image: media.portrait1,
    orientation: "portrait",
    coords: "15.3547° N",
  },
  {
    id: "p3",
    titleEn: "Spice Hour",
    titleAr: "ساعة البهار",
    country: "ye",
    cityEn: "Aden",
    cityAr: "عدن",
    year: "2024",
    categoryEn: "Street",
    categoryAr: "شارع",
    image: media.street1,
    orientation: "portrait",
    coords: "12.7855° N",
  },
  {
    id: "p4",
    titleEn: "Caravan Line",
    titleAr: "خط القافلة",
    country: "sa",
    cityEn: "AlUla",
    cityAr: "العُلا",
    year: "2025",
    categoryEn: "Travel",
    categoryAr: "سفر",
    image: media.travel1,
    orientation: "landscape",
    coords: "26.6167° N",
  },
  {
    id: "p5",
    titleEn: "Concrete Arch",
    titleAr: "القوس الخرساني",
    country: "ae",
    cityEn: "Dubai",
    cityAr: "دبي",
    year: "2026",
    categoryEn: "Architecture",
    categoryAr: "عمارة",
    image: media.arch1,
    orientation: "landscape",
    coords: "25.2048° N",
  },
  {
    id: "p6",
    titleEn: "Amber Still",
    titleAr: "سكون العنبر",
    country: "ae",
    cityEn: "Dubai",
    cityAr: "دبي",
    year: "2026",
    categoryEn: "Commercial",
    categoryAr: "تجاري",
    image: media.commercial1,
    orientation: "portrait",
    coords: "25.0762° N",
  },
  {
    id: "p7",
    titleEn: "Cardamom Ritual",
    titleAr: "طقس الهيل",
    country: "sa",
    cityEn: "Jeddah",
    cityAr: "جدة",
    year: "2024",
    categoryEn: "Lifestyle",
    categoryAr: "لايف ستايل",
    image: media.lifestyle1,
    orientation: "landscape",
    coords: "21.4858° N",
  },
  {
    id: "p8",
    titleEn: "Desert Silence",
    titleAr: "صمت الصحراء",
    country: "eg",
    cityEn: "Cairo",
    cityAr: "القاهرة",
    year: "2025",
    categoryEn: "Travel",
    categoryAr: "سفر",
    image: media.travel2,
    orientation: "landscape",
    coords: "30.0444° N",
  },
  {
    id: "p9",
    titleEn: "Studio Gaze",
    titleAr: "نظرة الاستوديو",
    country: "eg",
    cityEn: "Cairo",
    cityAr: "القاهرة",
    year: "2026",
    categoryEn: "Portraits",
    categoryAr: "بورتريه",
    image: media.portrait2,
    orientation: "portrait",
    coords: "30.0330° N",
  },
  {
    id: "p10",
    titleEn: "Campaign Frame",
    titleAr: "إطار الحملة",
    country: "sa",
    cityEn: "Riyadh",
    cityAr: "الرياض",
    year: "2026",
    categoryEn: "Advertising",
    categoryAr: "إعلانات",
    image: media.campaign1,
    orientation: "portrait",
    coords: "24.7136° N",
  },
  {
    id: "p11",
    titleEn: "Night Product",
    titleAr: "منتج الليل",
    country: "ae",
    cityEn: "Abu Dhabi",
    cityAr: "أبوظبي",
    year: "2026",
    categoryEn: "Advertising",
    categoryAr: "إعلانات",
    image: media.campaign2,
    orientation: "landscape",
    coords: "24.4539° N",
  },
];

/** SELECTED WORK rail — numbered editorial chapters. */
export const selectedWork = [
  { no: "01", key: "Portraits", keyAr: "بورتريه", photoId: "p2" },
  { no: "02", key: "Street", keyAr: "شارع", photoId: "p3" },
  { no: "03", key: "Travel", keyAr: "سفر", photoId: "p4" },
  { no: "04", key: "Commercial", keyAr: "تجاري", photoId: "p6" },
  { no: "05", key: "Advertising", keyAr: "إعلانات", photoId: "p10" },
];

export const photoById = (id: string) => photos.find((p) => p.id === id)!;
