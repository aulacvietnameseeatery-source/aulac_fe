import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { dishFormSchema, DishFormValues } from "@/features/create-dish/types/schema";

export function useDishForm() {
  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishFormSchema),
    mode: "onBlur",
    defaultValues: {
      i18n: { en: {}, vi: {}, fr: {} },
      dishStatusLvId: 1,
      price: 0,
      isOnline: false,
      chefRecommended: false,
      displayOrder: 0,
    }
  });

  return form;
}
