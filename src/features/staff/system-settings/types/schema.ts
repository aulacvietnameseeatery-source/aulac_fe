import { z } from "zod";

export const LOCALES = ["en", "vi", "fr"] as const;
export type SupportedLocale = typeof LOCALES[number];

// --- STORE PROFILE ---
const storeProfileI18nSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  streetAddress: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),
  openingHours: z.string().trim().optional().default(""),
});

export const storeProfileFormSchema = z.object({
  i18n: z.object({
    en: storeProfileI18nSchema,
    vi: storeProfileI18nSchema,
    fr: storeProfileI18nSchema,
  }),
  logoUrl: z.string().trim().optional().default(""),
  postalCode: z.string().trim().optional().default(""),
  email: z.string().trim().email("Invalid email").or(z.literal("")),
  phone: z.string().trim().optional().default(""),
  facebookLink: z.string().trim().url("Invalid URL").or(z.literal("")),
  instagramLink: z.string().trim().url("Invalid URL").or(z.literal("")),
  tiktokLink: z.string().trim().url("Invalid URL").or(z.literal("")),
});

export type StoreProfileFormValues = z.input<typeof storeProfileFormSchema>;

export function mapStoreSettingsToFormValues(settings: Record<string, string>): StoreProfileFormValues {
  const getI18nVals = (locale: string) => ({
    name: settings[`name_${locale}`] || "",
    streetAddress: settings[`streetAddress_${locale}`] || "",
    city: settings[`city_${locale}`] || "",
    country: settings[`country_${locale}`] || "",
    openingHours: settings[`openingHours_${locale}`] || "",
  });

  return {
    i18n: { en: getI18nVals("en"), vi: getI18nVals("vi"), fr: getI18nVals("fr") },
    logoUrl: settings["logoUrl"] || "",
    postalCode: settings["postalCode"] || "",
    email: settings["email"] || "",
    phone: settings["phone"] || "",
    facebookLink: settings["facebookLink"] || "",
    instagramLink: settings["instagramLink"] || "",
    tiktokLink: settings["tiktokLink"] || "",
  };
}

export function mapFormValuesToStoreSettings(values: StoreProfileFormValues): Record<string, string> {
  const settings: Record<string, string> = {};
  LOCALES.forEach(loc => {
    const vals = values.i18n[loc];
    settings[`name_${loc}`] = vals.name;
    settings[`streetAddress_${loc}`] = vals.streetAddress;
    settings[`city_${loc}`] = vals.city;
    settings[`country_${loc}`] = vals.country;
    settings[`openingHours_${loc}`] = vals.openingHours || "";
  });
  settings["logoUrl"] = values.logoUrl || "";
  settings["postalCode"] = values.postalCode || "";
  settings["email"] = values.email || "";
  settings["phone"] = values.phone || "";
  settings["facebookLink"] = values.facebookLink || "";
  settings["instagramLink"] = values.instagramLink || "";
  settings["tiktokLink"] = values.tiktokLink || "";
  return settings;
}

// --- ABOUT US ---
const aboutUsI18nSchema = z.object({
  "about_subtitle": z.string().trim().optional().default(""),
  "about_paragraph_1": z.string().trim().optional().default(""),
  "about_paragraph_2": z.string().trim().optional().default(""),
  "about_paragraph_3": z.string().trim().optional().default(""),
  "about_closing_quote": z.string().trim().optional().default(""),
});

export const aboutUsFormSchema = z.object({
  i18n: z.object({
    en: aboutUsI18nSchema,
    vi: aboutUsI18nSchema,
    fr: aboutUsI18nSchema,
  }),
});

export type AboutUsFormValues = z.input<typeof aboutUsFormSchema>;

const ABOUT_US_TEXT_KEYS = Object.keys(aboutUsI18nSchema.shape);

export function mapAboutUsSettingsToFormValues(settings: Record<string, string>): AboutUsFormValues {
  const getI18nVals = (locale: string) => {
    const vals: Record<string, string> = {};
    ABOUT_US_TEXT_KEYS.forEach(k => {
      const backendKey = k.replace(/_/g, '.');
      vals[k] = settings[`${backendKey}_${locale}`] || "";
    });
    return vals as z.infer<typeof aboutUsI18nSchema>;
  };

  return {
    i18n: { en: getI18nVals("en"), vi: getI18nVals("vi"), fr: getI18nVals("fr") }
  } as AboutUsFormValues;
}

export function mapFormValuesToAboutUsSettings(values: AboutUsFormValues): Record<string, string> {
  const settings: Record<string, string> = {};
  LOCALES.forEach(loc => {
    ABOUT_US_TEXT_KEYS.forEach(k => {
      const backendKey = k.replace(/_/g, '.');
      // @ts-ignore
      settings[`${backendKey}_${loc}`] = values.i18n[loc][k] || "";
    });
  });
  return settings;
}


// --- INTRODUCTION ---
const introI18nSchema = z.object({
  "intro_hero_title": z.string().trim().optional().default(""),
  "intro_hero_quote": z.string().trim().optional().default(""),
  "intro_virtualTour_label": z.string().trim().optional().default(""),
  "intro_virtualTour_title": z.string().trim().optional().default(""),
  "intro_virtualTour_desc": z.string().trim().optional().default(""),
  "intro_collection_label": z.string().trim().optional().default(""),
  "intro_collection_title": z.string().trim().optional().default(""),
  "intro_collection_dish1_mainTitle": z.string().trim().optional().default(""),
  "intro_collection_dish1_cardCategory": z.string().trim().optional().default(""),
  "intro_collection_dish1_cardTitle": z.string().trim().optional().default(""),
  "intro_collection_dish2_mainTitle": z.string().trim().optional().default(""),
  "intro_collection_dish2_cardCategory": z.string().trim().optional().default(""),
  "intro_collection_dish2_cardTitle": z.string().trim().optional().default(""),
  "intro_collection_dish3_mainTitle": z.string().trim().optional().default(""),
  "intro_collection_dish3_cardCategory": z.string().trim().optional().default(""),
  "intro_collection_dish3_cardTitle": z.string().trim().optional().default(""),
});

export const introFormSchema = z.object({
  i18n: z.object({
    en: introI18nSchema,
    vi: introI18nSchema,
    fr: introI18nSchema,
  }),
  "intro_hero_image": z.string().trim().optional().default(""),
  "intro_virtualTour_videoUrl": z.string().trim().optional().default(""),
  "intro_collection_dish1_image": z.string().trim().optional().default(""),
  "intro_collection_dish2_image": z.string().trim().optional().default(""),
  "intro_collection_dish3_image": z.string().trim().optional().default(""),
});

export type IntroFormValues = z.input<typeof introFormSchema>;

const INTRO_TEXT_KEYS = Object.keys(introI18nSchema.shape);
const INTRO_MEDIA_KEYS = Object.keys(introFormSchema.shape).filter(k => k !== 'i18n');

export function mapIntroSettingsToFormValues(settings: Record<string, string>): IntroFormValues {
  const getI18nVals = (locale: string) => {
    const vals: Record<string, string> = {};
    INTRO_TEXT_KEYS.forEach(k => {
      const backendKey = k.replace(/_/g, '.');
      vals[k] = settings[`${backendKey}_${locale}`] || "";
    });
    return vals as z.infer<typeof introI18nSchema>;
  };

  const mediaVals: Record<string, string> = {};
  INTRO_MEDIA_KEYS.forEach(k => {
    const backendKey = k.replace(/_/g, '.');
    mediaVals[k] = settings[backendKey] || "";
  });

  return {
    i18n: { en: getI18nVals("en"), vi: getI18nVals("vi"), fr: getI18nVals("fr") },
    ...mediaVals
  } as IntroFormValues;
}

export function mapFormValuesToIntroSettings(values: IntroFormValues): Record<string, string> {
  const settings: Record<string, string> = {};
  LOCALES.forEach(loc => {
    INTRO_TEXT_KEYS.forEach(k => {
      const backendKey = k.replace(/_/g, '.');
      // @ts-ignore
      settings[`${backendKey}_${loc}`] = values.i18n[loc][k] || "";
    });
  });
  INTRO_MEDIA_KEYS.forEach(k => {
    const backendKey = k.replace(/_/g, '.');
    // @ts-ignore
    settings[backendKey] = values[k] || "";
  });
  return settings;
}
