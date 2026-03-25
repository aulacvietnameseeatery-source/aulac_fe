import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aboutUsFormSchema, AboutUsFormValues, LOCALES, SupportedLocale } from "../types/schema";

export function useAboutUsForm(defaultValues?: Partial<AboutUsFormValues>) {
  const defaultI18n = () => ({
    "about_subtitle": "",
    "about_paragraph_1": "",
    "about_paragraph_2": "",
    "about_paragraph_3": "",
    "about_closing_quote": "",
  });

  return useForm<AboutUsFormValues>({
    resolver: zodResolver(aboutUsFormSchema),
    mode: "onBlur",
    defaultValues: {
      i18n: {
        en: defaultI18n(),
        vi: defaultI18n(),
        fr: defaultI18n(),
      },
      ...defaultValues,
    },
  });
}
