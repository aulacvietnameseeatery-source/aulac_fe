import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { introFormSchema, IntroFormValues } from "../types/schema";

export function useIntroductionSettingsForm(defaultValues?: Partial<IntroFormValues>) {
  const defaultI18n = () => ({
    "intro_hero_title": "", "intro_hero_quote": "",
    "intro_virtualTour_label": "", "intro_virtualTour_title": "", "intro_virtualTour_desc": "",
    "intro_collection_label": "", "intro_collection_title": "",
    "intro_collection_dish1_mainTitle": "", "intro_collection_dish1_cardCategory": "", "intro_collection_dish1_cardTitle": "",
    "intro_collection_dish2_mainTitle": "", "intro_collection_dish2_cardCategory": "", "intro_collection_dish2_cardTitle": "",
    "intro_collection_dish3_mainTitle": "", "intro_collection_dish3_cardCategory": "", "intro_collection_dish3_cardTitle": "",
  });

  return useForm<IntroFormValues>({
    resolver: zodResolver(introFormSchema),
    mode: "onBlur",
    defaultValues: {
      i18n: {
        en: defaultI18n(),
        vi: defaultI18n(),
        fr: defaultI18n(),
      },
      "intro_hero_image": "",
      "intro_virtualTour_videoUrl": "",
      "intro_collection_dish1_image": "",
      "intro_collection_dish2_image": "",
      "intro_collection_dish3_image": "",
      ...defaultValues,
    },
  });
}
