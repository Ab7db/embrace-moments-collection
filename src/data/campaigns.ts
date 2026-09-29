import { media } from "./media";

/** PLACEHOLDER commercial campaigns. Clients are mock names. */
export interface Campaign {
  id: string;
  no: string;
  titleEn: string;
  titleAr: string;
  client: string;
  year: string;
  categoryEn: string;
  categoryAr: string;
  cover: string;
  descriptionEn: string;
  descriptionAr: string;
  gallery: string[];
  bts: string[];
}

export const campaigns: Campaign[] = [
  {
    id: "c1",
    no: "Campaign 01",
    titleEn: "Amber Hours",
    titleAr: "ساعات العنبر",
    client: "Client Placeholder",
    year: "2026",
    categoryEn: "Commercial Photography · Creative Direction",
    categoryAr: "تصوير تجاري · إدارة إبداعية",
    cover: media.commercial1,
    descriptionEn:
      "Placeholder case study. A single-light product story built around warm amber glass and deep shadow.",
    descriptionAr:
      "نص مؤقت لدراسة الحالة. قصة منتج بضوء واحد تعتمد على الزجاج العنبري الدافئ والظل العميق.",
    gallery: [media.commercial1, media.campaign2, media.lifestyle1],
    bts: [media.street1, media.arch1],
  },
  {
    id: "c2",
    no: "Campaign 02",
    titleEn: "Desert Route",
    titleAr: "طريق الصحراء",
    client: "Client Placeholder",
    year: "2025",
    categoryEn: "Advertising · Travel Film Stills",
    categoryAr: "إعلانات · لقطات فيلم سفر",
    cover: media.campaign1,
    descriptionEn:
      "Placeholder case study. A travel campaign shot across dunes at last light, built for outdoor and social formats.",
    descriptionAr:
      "نص مؤقت لدراسة الحالة. حملة سفر تم تصويرها على الكثبان عند الضوء الأخير، لصيغ الطرق ووسائل التواصل.",
    gallery: [media.campaign1, media.travel1, media.travel2],
    bts: [media.lifestyle1, media.portrait1],
  },
  {
    id: "c3",
    no: "Campaign 03",
    titleEn: "City Volumes",
    titleAr: "كتل المدينة",
    client: "Client Placeholder",
    year: "2026",
    categoryEn: "Architecture · Brand Film",
    categoryAr: "عمارة · فيلم علامة",
    cover: media.arch1,
    descriptionEn:
      "Placeholder case study. Architectural brand work exploring shadow geometry at midday.",
    descriptionAr:
      "نص مؤقت لدراسة الحالة. عمل معماري لعلامة تجارية يستكشف هندسة الظل في منتصف النهار.",
    gallery: [media.arch1, media.campaign2, media.hero],
    bts: [media.travel1, media.portrait2],
  },
];
