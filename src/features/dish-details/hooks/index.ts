import { useQuery } from "@tanstack/react-query";
import { dishService } from "../services";

export const useDishDetail = (dishId: number) => {
  return useQuery({
    queryKey: ["dish", dishId],
    queryFn: () => dishService.getDishById(dishId),
    enabled: !!dishId && dishId > 0,
  });
};
