import { ApiResponse } from "@/types/api-response.types";
import { api } from "@/lib/http";
import { DishDetailResponse } from "../types/dish-detail.types";

export async function getDishDetailById(dishId : number) {
  const res =  api.get<ApiResponse<DishDetailResponse>>(`/api/dishes/${dishId}`);
  return (await res).data;
}