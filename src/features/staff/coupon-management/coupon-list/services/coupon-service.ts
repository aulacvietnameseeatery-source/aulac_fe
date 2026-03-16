import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { CouponDTO } from "../types/coupon.types";

export const staffCouponService = {
    getCoupons: async (): Promise<CouponDTO[]> => {
        const response = await api.get<ApiResponse<CouponDTO[]>>("/api/coupons");
        return response.data ?? [];
    },
};
