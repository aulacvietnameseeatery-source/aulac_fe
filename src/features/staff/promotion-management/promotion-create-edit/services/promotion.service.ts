import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { DishDto, CategoryDto, PromotionDto, PromotionDetailDto } from "../types/promotion.types";

export const promotionService = {
  getDishes: async (): Promise<DishDto[]> => {
    const res = await api.get<ApiResponse<DishDto[]>>('/api/dishes?active=true');
    return res.data;
  },

  getCategories: async (): Promise<CategoryDto[]> => {
    const res = await api.get<ApiResponse<CategoryDto[]>>('/api/dishes/all-categories');
    return res.data;
  },

  getPromotionById: async (id: number): Promise<PromotionDto> => {
    const res = await api.get<ApiResponse<PromotionDto>>(`/api/promotions/${id}`);
    return res.data;
  },

  createPromotion: async (data: Partial<PromotionDto>): Promise<PromotionDto> => {
    console.log(data);
    const res = await api.post<ApiResponse<PromotionDto>>('/api/promotions', data);
    return res.data;
  },

  updatePromotion: async (id: number, data: Partial<PromotionDto>): Promise<PromotionDto> => {
    const res = await api.put<ApiResponse<PromotionDto>>(`/api/promotions/${id}`, data);
    return res.data;
  },

  getPromotionDetail: async (id: number): Promise<PromotionDetailDto> => {
    const res = await api.get<ApiResponse<PromotionDetailDto>>(`/api/promotions/detail/${id}`);
    return res.data;
  },
};