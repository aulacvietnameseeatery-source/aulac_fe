import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeProfileFormSchema, StoreProfileFormValues } from "../types/schema";

export function useStoreProfileForm(defaultValues?: Partial<StoreProfileFormValues>) {
  return useForm<StoreProfileFormValues>({
    resolver: zodResolver(storeProfileFormSchema),
    mode: "onBlur",
    defaultValues: {
      i18n: {
        en: { name: "", streetAddress: "", city: "", country: "", openingHours: "" },
        vi: { name: "", streetAddress: "", city: "", country: "", openingHours: "" },
        fr: { name: "", streetAddress: "", city: "", country: "", openingHours: "" },
      },
      logoUrl: "",
      postalCode: "",
      email: "",
      phone: "",
      facebookLink: "",
      instagramLink: "",
      tiktokLink: "",
      ...defaultValues,
    },
  });
}
