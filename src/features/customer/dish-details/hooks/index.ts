import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { dishService } from "../services";

export const useDishDetail = (dishId: number) => {
  const locale = useLocale();

  return useQuery({
    queryKey: ["dish", dishId, locale],
    queryFn: () => dishService.getDishById(dishId, locale),
    enabled: !!dishId && dishId > 0,
  });
};
