import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { LoyaltyCouponHistoryDto, LoyaltyExchangeRequest, LoyaltyExchangeResultDto } from "../types/loyalty-types";

export const loyaltyService = {
    exchangePointsToCoupon: async (request: LoyaltyExchangeRequest): Promise<LoyaltyExchangeResultDto> => {
        const response = await api.post<ApiResponse<LoyaltyExchangeResultDto>, LoyaltyExchangeRequest>(
            "/api/loyalty/exchange",
            request
        );

        return response.data;
    },

    getCustomerCoupons: async (customerId: number): Promise<LoyaltyCouponHistoryDto[]> => {
        const response = await api.get<ApiResponse<LoyaltyCouponHistoryDto[]>>(
            `/api/loyalty/customer/${customerId}/coupons`
        );

        return response.data;
    },
};