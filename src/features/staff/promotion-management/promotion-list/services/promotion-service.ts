import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { PromotionListDTO, GetPromotionsParams, AvailablePromotionDTO } from "../types/promotion-types";
import { api } from "@/lib/http";

export const staffPromotionService = {
    getPromotions: async (params: GetPromotionsParams): Promise<PagedResult<PromotionListDTO>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        if (params.search) query.append("search", params.search);
        if (params.promotionStatus && params.promotionStatus !== "All") query.append("promotionStatus", params.promotionStatus);
        if (params.type && params.type !== "All") query.append("type", params.type);
        if (params.fromDate) query.append("fromDate", params.fromDate);
        if (params.toDate) query.append("toDate", params.toDate);

        const response = await api.get<ApiResponse<PagedResult<PromotionListDTO>>>(`/api/promotions?${query.toString()}`);
        return response.data;
    },

    getCoupons: async (): Promise<PromotionListDTO[]> => {
        const response = await api.get<ApiResponse<PromotionListDTO[]>>('/api/coupons');
        return response.data ?? [];
    },

    activatePromotion: async (promotionId: number): Promise<void> => {
        await api.put(`/api/promotions/${promotionId}/activate`, promotionId);
    },

    disablePromotion: async (promotionId: number): Promise<void> => {
        await api.put(`/api/promotions/${promotionId}/disable`, promotionId);
    },

    getAvailablePromotions: async (orderId: number): Promise<AvailablePromotionDTO[]> => {
        const response = await api.get<ApiResponse<AvailablePromotionDTO[]>>(`/api/promotions/available/${orderId}`);
        return response.data; 
    },

    deletePromotion: async (promotionId: number): Promise<void> => {
        await api.delete(`/api/promotions/${promotionId}`);
    },
};