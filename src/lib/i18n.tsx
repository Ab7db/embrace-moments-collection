import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ar";

/** All interface copy. Edit these strings to change the site wording. */
export const translations = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      work: "Photography",
      world: "World",
      commercial: "Commercial",
      contact: "Contact",
      menu: "Menu",
      close: "Close",
    },
    intro: { name: "ALABAD", tagline: "Visual Stories" },
    hero: {
      roles: ["Photographer", "Visual Creator", "Advertising"],
      statement: ["EVERY PLACE", "HAS A STORY."],
      based: "Based in Yemen",
      basedSub: "Capturing stories around the world.",
      cta: "Explore my world",
      scroll: "Scroll to explore",
    },
    about: {
      label: "01 — About",
      title: "ABOUT ALABAD",
      realName: "AbdulKareem Faisal",
      bio: "I capture moments, places and stories through photography and visual storytelling. Placeholder biography — the final text will be provided.",
      bio2: "My work moves between portraiture, street, travel and commercial campaigns, always looking for the frame where light and story meet.",
      categories: ["Photography", "Advertising", "Travel", "Visual Storytelling"],
    },
    work: {
      label: "02 — Selected Work",
      title: "SELECTED WORK",
      hint: "Drag or scroll sideways",
      view: "View",
    },
    world: {
      label: "03 — World",
      title: "PLACES I'VE CAPTURED",
      hint: "Drag the globe. Tap a marker to open a place.",
      photos: "Photos",
      campaigns: "Campaigns",
      back: "Back to world",
      loading: "Loading the world",
      placeholderNote: "Placeholder portfolio locations.",
    },
    lens: { title: ["SEE THE WORLD", "THROUGH MY LENS"] },
    commercial: {
      label: "04 — Commercial",
      title: "COMMERCIAL STORIES",
      client: "Client",
      year: "Year",
      open: "Open case study",
      brief: "Brief",
      gallery: "Campaign gallery",
      bts: "Behind the scenes",
    },
    wall: { label: "05 — Archive", title: "MOMENTS I'VE CAPTURED" },
    stats: { label: "06 — Numbers", note: "Placeholder figures." },
    social: {
      label: "07 — Social",
      title: "FOLLOW THE JOURNEY",
      cta: "Follow on Instagram",
    },
    contact: {
      label: "08 — Contact",
      title: ["LET'S CREATE", "SOMETHING", "MEMORABLE."],
      categories: ["Photography", "Advertising", "Collaborations"],
      cta: "Start a project",
      email: "Email",
      instagram: "Instagram",
      whatsapp: "WhatsApp",
    },
    footer: {
      role: "Photographer & Visual Creator",
      rights: "All rights reserved.",
      top: "Back to top",
    },
    viewer: { prev: "Previous", next: "Next", close: "Close" },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      about: "نبذة",
      work: "التصوير",
      world: "العالم",
      commercial: "الإعلانات",
      contact: "تواصل",
      menu: "القائمة",
      close: "إغلاق",
    },
    intro: { name: "العباد", tagline: "حكايات بصرية" },
    hero: {
      roles: ["مصوّر", "صانع بصري", "إعلانات"],
      statement: ["لكل مكان", "حكاية."],
      based: "مقيم في اليمن",
      basedSub: "ألتقط الحكايات حول العالم.",
      cta: "اكتشف عالمي",
      scroll: "اسحب للأسفل",
    },
    about: {
      label: "٠١ — نبذة",
      title: "عن العباد",
      realName: "عبدالكريم فيصل",
      bio: "ألتقط اللحظات والأماكن والحكايات من خلال التصوير والسرد البصري. نص مؤقت — سيتم استبداله بالنص النهائي.",
      bio2: "يتنقل عملي بين البورتريه وتصوير الشارع والسفر والحملات الإعلانية، باحثًا دائمًا عن اللقطة التي يلتقي فيها الضوء بالحكاية.",
      categories: ["التصوير", "الإعلانات", "السفر", "السرد البصري"],
    },
    work: {
      label: "٠٢ — أعمال مختارة",
      title: "أعمال مختارة",
      hint: "اسحب أو مرّر جانبيًا",
      view: "عرض",
    },
    world: {
      label: "٠٣ — العالم",
      title: "أماكن التقطتها بعدستي",
      hint: "اسحب الكرة الأرضية، واضغط على أي علامة.",
      photos: "صورة",
      campaigns: "حملة",
      back: "العودة إلى العالم",
      loading: "يتم تحميل العالم",
      placeholderNote: "مواقع مؤقتة للعرض.",
    },
    lens: { title: ["شاهد العالم", "من خلال عدستي"] },
    commercial: {
      label: "٠٤ — الإعلانات",
      title: "أعمال إعلانية",
      client: "العميل",
      year: "السنة",
      open: "فتح العمل",
      brief: "الفكرة",
      gallery: "معرض الحملة",
      bts: "من كواليس التصوير",
    },
    wall: { label: "٠٥ — الأرشيف", title: "لحظات التقطتها" },
    stats: { label: "٠٦ — أرقام", note: "أرقام مؤقتة." },
    social: {
      label: "٠٧ — تواصل اجتماعي",
      title: "تابع الرحلة",
      cta: "تابعني على إنستغرام",
    },
    contact: {
      label: "٠٨ — تواصل",
      title: ["لنصنع شيئًا", "يبقى", "في الذاكرة."],
      categories: ["التصوير", "الإعلانات", "التعاونات"],
      cta: "ابدأ مشروعك",
      email: "البريد",
      instagram: "إنستغرام",
      whatsapp: "واتساب",
    },
    footer: {
      role: "مصوّر وصانع محتوى بصري",
      rights: "جميع الحقوق محفوظة.",
      top: "إلى الأعلى",
    },
    viewer: { prev: "السابق", next: "التالي", close: "إغلاق" },
  },
} as const;

type Dict = (typeof translations)["en"];

const LangContext = createContext<{
  lang: Lang;
  dir: "ltr" | "rtl";
  t: Dict;
  setLang: (l: Lang) => void;
  toggle: () => void;
}>({
  lang: "en",
  dir: "ltr",
  t: translations.en,
  setLang: () => {},
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("alabad-lang");
    if (stored === "ar" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("alabad-lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(
    () => setLangState((p) => (p === "en" ? "ar" : "en")),
    [],
  );

  const value = useMemo(
    () => ({
      lang,
      dir: (lang === "ar" ? "rtl" : "ltr") as "ltr" | "rtl",
      t: translations[lang] as unknown as Dict,
      setLang,
      toggle,
    }),
    [lang, setLang, toggle],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Pick the localized field of a data object (titleEn / titleAr style). */
export function pick<T>(lang: Lang, en: T, ar: T): T {
  return lang === "ar" ? ar : en;
}
